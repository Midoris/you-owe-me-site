#!/usr/bin/env python3
"""Generate the roommate workbook, CSV fallback, and authentic hero preview."""

from __future__ import annotations

import csv
import os
import shutil
import subprocess
import sys
import tempfile
import xml.etree.ElementTree as ET
from pathlib import Path
from zipfile import ZIP_DEFLATED, ZipFile


try:
    from PIL import Image, ImageDraw
except ModuleNotFoundError:
    bundled_python = (
        Path.home()
        / ".cache"
        / "codex-runtimes"
        / "codex-primary-runtime"
        / "dependencies"
        / "python"
        / "bin"
        / "python3"
    )
    if bundled_python.is_file() and Path(sys.executable).resolve() != bundled_python.resolve():
        os.execv(str(bundled_python), [str(bundled_python), *sys.argv])
    raise


ROOT = Path(__file__).resolve().parents[1]
DOWNLOADS = ROOT / "downloads"
IMAGE_DIR = ROOT / "images" / "tools" / "roommate-expense-tracker-template"
WORKBOOK_PATH = DOWNLOADS / "roommate-expense-tracker-template.xlsx"
CSV_PATH = DOWNLOADS / "roommate-expense-tracker-template.csv"
HERO_PATH = IMAGE_DIR / "roommate-expense-tracker-spreadsheet-hero.webp"
BUILDER_PATH = ROOT / "scripts" / "build-roommate-expense-tracker-workbook.mjs"


CSV_HEADERS = [
    "Date",
    "Entry type",
    "Expense or repayment",
    "Category",
    "Amount",
    "Paid by or From",
    "To",
    "Split method",
    "Included roommates",
    "Agreed shares",
    "Notes",
]

CSV_ROWS = [
    [
        "2026-05-01",
        "Expense",
        "Rent",
        "Rent",
        "1800.00",
        "Maya",
        "",
        "Equal among included roommates",
        "Maya, Alex, Sam",
        "Maya 600.00; Alex 600.00; Sam 600.00",
        "Example row—replace with your own entry. This CSV does not calculate balances.",
    ],
    [
        "2026-05-05",
        "Expense",
        "Internet",
        "Internet",
        "60.00",
        "Alex",
        "",
        "Equal among included roommates",
        "Maya, Alex, Sam",
        "Maya 20.00; Alex 20.00; Sam 20.00",
        "Example expense; replace or remove.",
    ],
    [
        "2026-05-20",
        "Repayment",
        "Repayment to Maya",
        "",
        "200.00",
        "Alex",
        "Maya",
        "",
        "",
        "",
        "Example repayment recorded separately; replace or remove.",
    ],
]


def runtime_paths() -> tuple[Path, Path]:
    runtime_root = (
        Path.home()
        / ".cache"
        / "codex-runtimes"
        / "codex-primary-runtime"
        / "dependencies"
    )
    node = runtime_root / "node" / "bin" / "node"
    node_modules = runtime_root / "node" / "node_modules"
    if not node.is_file() or not node_modules.is_dir():
        raise RuntimeError(
            "The configured Codex spreadsheet runtime is unavailable. "
            "Load the workspace dependencies before regenerating this workbook."
        )
    return node, node_modules


def build_workbook(preview_dir: Path) -> None:
    node, node_modules = runtime_paths()
    with tempfile.TemporaryDirectory(prefix="roommate-workbook-builder-") as temp_name:
        temp_dir = Path(temp_name)
        (temp_dir / "node_modules").symlink_to(node_modules, target_is_directory=True)
        temp_builder = temp_dir / BUILDER_PATH.name
        shutil.copy2(BUILDER_PATH, temp_builder)
        result = subprocess.run(
            [str(node), str(temp_builder), str(WORKBOOK_PATH), str(preview_dir)],
            cwd=temp_dir,
            check=False,
            capture_output=True,
            text=True,
        )
        if result.returncode:
            raw = f"STDOUT:\n{result.stdout}\nSTDERR:\n{result.stderr}"
            lines = raw.splitlines()
            diagnostic = "\n".join(
                line if len(line) <= 1200 else f"{line[:250]} … {line[-750:]}"
                for line in lines[-30:]
            )
            raise RuntimeError(f"Workbook builder failed:\n{diagnostic}")
        if result.stdout.strip():
            print(result.stdout.strip())


def postprocess_workbook() -> None:
    """Repair portable Excel features not emitted by the artifact exporter."""
    namespace = "http://schemas.openxmlformats.org/spreadsheetml/2006/main"
    ET.register_namespace("", namespace)
    sheet_freezes = {
        "xl/worksheets/sheet1.xml": (2, "A3"),
        "xl/worksheets/sheet2.xml": (8, "A9"),
        "xl/worksheets/sheet3.xml": (4, "A5"),
        "xl/worksheets/sheet4.xml": (4, "A5"),
        "xl/worksheets/sheet5.xml": (4, "A5"),
        "xl/worksheets/sheet6.xml": (5, "A6"),
        "xl/worksheets/sheet7.xml": (4, "A5"),
    }
    validation_names = {
        "'Settings'!$D$5:$D$15": "CurrenciesList",
        "'Settings'!$A$5:$A$12": "CategoriesList",
        "'Settings'!$B$5:$B$6": "SplitMethodsList",
        "'Settings'!$C$5:$C$6": "YesNoList",
        "'Setup'!$B$9:$B$14": "RoommateNames",
    }
    defined_names = [
        ("CategoriesList", "'Settings'!$A$5:$A$12"),
        ("SplitMethodsList", "'Settings'!$B$5:$B$6"),
        ("YesNoList", "'Settings'!$C$5:$C$6"),
        ("CurrenciesList", "'Settings'!$D$5:$D$15"),
        ("RoommateNames", "'Setup'!$B$9:$B$14"),
    ]

    with tempfile.TemporaryDirectory(prefix="roommate-xlsx-repair-") as temp_name:
        temp_path = Path(temp_name) / WORKBOOK_PATH.name
        with ZipFile(WORKBOOK_PATH, "r") as source, ZipFile(temp_path, "w", ZIP_DEFLATED) as target:
            for member in source.infolist():
                data = source.read(member.filename)
                if member.filename == "xl/workbook.xml":
                    root = ET.fromstring(data)
                    existing = root.find(f"{{{namespace}}}definedNames")
                    if existing is not None:
                        root.remove(existing)
                    defined = ET.Element(f"{{{namespace}}}definedNames")
                    for name, formula in defined_names:
                        node = ET.SubElement(defined, f"{{{namespace}}}definedName", {"name": name})
                        node.text = formula
                    sheets = root.find(f"{{{namespace}}}sheets")
                    root.insert(list(root).index(sheets) + 1, defined)
                    data = ET.tostring(root, encoding="utf-8", xml_declaration=True)
                elif member.filename in sheet_freezes:
                    root = ET.fromstring(data)
                    rows, top_left = sheet_freezes[member.filename]
                    view = root.find(f".//{{{namespace}}}sheetView")
                    for pane in list(view.findall(f"{{{namespace}}}pane")):
                        view.remove(pane)
                    pane = ET.Element(
                        f"{{{namespace}}}pane",
                        {
                            "ySplit": str(rows),
                            "topLeftCell": top_left,
                            "activePane": "bottomLeft",
                            "state": "frozen",
                        },
                    )
                    view.insert(0, pane)
                    for formula in root.findall(f".//{{{namespace}}}dataValidation/{{{namespace}}}formula1"):
                        formula.text = validation_names.get(formula.text, formula.text)
                    if member.filename == "xl/worksheets/sheet5.xml":
                        for column in root.findall(f".//{{{namespace}}}cols/{{{namespace}}}col"):
                            if int(column.attrib["min"]) >= 10 and int(column.attrib["max"]) <= 19:
                                column.set("hidden", "1")
                    if member.filename == "xl/worksheets/sheet3.xml" and root.find(f"{{{namespace}}}autoFilter") is None:
                        auto_filter = ET.Element(f"{{{namespace}}}autoFilter", {"ref": "A4:Z204"})
                        sheet_data = root.find(f"{{{namespace}}}sheetData")
                        root.insert(list(root).index(sheet_data) + 1, auto_filter)
                    data = ET.tostring(root, encoding="utf-8", xml_declaration=True)
                target.writestr(member, data)
        shutil.copy2(temp_path, WORKBOOK_PATH)

    inspect_sidecar = WORKBOOK_PATH.with_suffix(WORKBOOK_PATH.suffix + ".inspect.ndjson")
    inspect_sidecar.unlink(missing_ok=True)


def build_csv() -> None:
    with CSV_PATH.open("w", encoding="utf-8", newline="") as handle:
        writer = csv.writer(handle, lineterminator="\n")
        writer.writerow(CSV_HEADERS)
        writer.writerows(CSV_ROWS)


def contain_size(source: tuple[int, int], bounds: tuple[int, int]) -> tuple[int, int]:
    scale = min(bounds[0] / source[0], bounds[1] / source[1])
    return max(1, round(source[0] * scale)), max(1, round(source[1] * scale))


def build_hero(example_preview: Path) -> None:
    canvas = Image.new("RGB", (1536, 1024), "#F8FAF6")
    draw = ImageDraw.Draw(canvas)

    # Calm editorial frame around the workbook's actual rendered Example sheet.
    draw.ellipse((-220, -240, 600, 580), fill="#EAF7DF")
    draw.ellipse((1110, 620, 1740, 1250), fill="#DFEAF4")
    draw.rounded_rectangle((124, 54, 438, 132), radius=24, fill="#AFE67E")
    draw.rounded_rectangle((1080, 34, 1408, 124), radius=24, fill="#DFEAF4")
    draw.rounded_rectangle((64, 82, 1472, 960), radius=34, fill="#D7DEE5")
    draw.rounded_rectangle((72, 72, 1464, 948), radius=34, fill="#FFFFFF")

    preview = Image.open(example_preview).convert("RGB")
    new_size = contain_size(preview.size, (1304, 806))
    preview = preview.resize(new_size, Image.Resampling.LANCZOS)
    x = (1536 - new_size[0]) // 2
    y = 104 + (816 - new_size[1]) // 2
    canvas.paste(preview, (x, y))

    # A fine inset line keeps the screenshot legible against the frame.
    draw.rounded_rectangle((88, 92, 1448, 928), radius=24, outline="#D8E2E8", width=3)
    canvas.save(HERO_PATH, "WEBP", quality=90, method=6, lossless=False)


def main() -> None:
    DOWNLOADS.mkdir(parents=True, exist_ok=True)
    IMAGE_DIR.mkdir(parents=True, exist_ok=True)
    if len(sys.argv) > 1:
        preview_dir = Path(sys.argv[1]).resolve()
        preview_dir.mkdir(parents=True, exist_ok=True)
        build_workbook(preview_dir)
        postprocess_workbook()
        build_hero(preview_dir / "example.png")
    else:
        with tempfile.TemporaryDirectory(prefix="roommate-workbook-previews-") as preview_name:
            preview_dir = Path(preview_name)
            build_workbook(preview_dir)
            postprocess_workbook()
            build_hero(preview_dir / "example.png")
    build_csv()
    print(f"generated {WORKBOOK_PATH.relative_to(ROOT)}")
    print(f"generated {CSV_PATH.relative_to(ROOT)}")
    print(f"generated {HERO_PATH.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
