#!/usr/bin/env python3
"""Localize the existing artifact-tool workbook builder without changing its model.

The copy file is editorial input. Both editions execute the canonical builder's
existing formulas and native-feature repair; only exact strings, sheet routing,
the prescribed date display and the localized Google Sheets app link change.
"""

from __future__ import annotations

import argparse
import copy as copy_module
import csv
import hashlib
import importlib.util
import json
import subprocess
import tempfile
from zipfile import ZipFile, ZIP_DEFLATED
import xml.etree.ElementTree as ET
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
RUNTIME = Path.home() / ".cache/codex-runtimes/codex-primary-runtime/dependencies"
BUILDER = ROOT / "scripts/build-roommate-expense-tracker-workbook.mjs"
GENERATOR = ROOT / "scripts/generate-roommate-expense-tracker-assets.py"
APP_ROUTES = {
    "es": "https://you-owe-me.com/es/soluciones/app-para-registrar-dinero-adeudado/",
    "de": "https://you-owe-me.com/de/loesungen/app-fuer-geldforderungen/",
    "ar": "https://you-owe-me.com/ar/solutions/app-to-track-money-owed/",
    "fr": "https://you-owe-me.com/fr/solutions/application-suivi-argent-du/",
}


def js_string(value: str) -> str:
    return json.dumps(value, ensure_ascii=False)


def localized_builder_source(copy: dict, edition: str = "excel") -> str:
    source = BUILDER.read_text()
    mappings = {**copy["strings"], **copy["sheet_names"]}
    # Source operands are exact quoted literals, including the double-quoted
    # operands inside formula templates. No free-text substring replacement.
    for original, translated in sorted(mappings.items(), key=lambda item: -len(item[0])):
        if any(character in translated for character in ('"', "`", "\\")):
            raise ValueError(f"Copy requires explicit source escaping: {original}")
        source = source.replace(js_string(original), js_string(translated))
        for quote in ("'",):
            source = source.replace(f"{quote}{original}{quote}", f"{quote}{translated}{quote}")
    # Derive the canonical six-slot labels from exact reviewed copy. Keep the
    # Spanish emitted source identical while admitting the German labels.
    slot = mappings["Roommate 1"].replace("1", "${index + 1}")
    name_slot = mappings["Roommate 1 name"].replace("1", "${index + 1}")
    for index in range(1, 7):
        assert mappings[f"Roommate {index}"] == slot.replace("${index + 1}", str(index))
        assert mappings[f"Roommate {index} name"] == name_slot.replace("${index + 1}", str(index))
    source = source.replace("`Roommate ${index + 1} name`", "`" + name_slot + "`")
    source = source.replace('"Roommate ${index + 1}"', '"' + slot + '"')
    source = source.replace('const dateFormat = "yyyy-mm-dd";', f'const dateFormat = {js_string(copy["date_format"])};')
    source = source.replace("https://you-owe-me.com/solutions/roommate-expense-tracker/", APP_ROUTES[copy["locale"]])
    # Current artifact-tool requires the explicit enum for the existing Sheets
    # hyperlink's single underline. This retains the canonical visual intent.
    source = source.replace("underline: true", 'underline: "single"')
    if edition == "google-sheets":
        # Google Sheets drops artifact-tool's ISO `t="d"` date cells on import.
        # Standard numeric Excel date serials retain the exact source dates and
        # the reviewed date display. The public Excel edition is unchanged.
        for original, serial in [("2026-05-01", 46143), ("2026-05-05", 46147), ("2026-05-12", 46154), ("2026-05-20", 46162)]:
            token = f'new Date("{original}T00:00:00Z")'
            assert source.count(token) == 1
            source = source.replace(token, str(serial))
    for original, translated in copy["sheet_names"].items():
        source = source.replace(f"  {original}: ", f"  {js_string(translated)}: ")
    if copy["locale"] == "ar":
        # One approved Arabic-only list expansion; keep every original ISO code.
        assert copy["currency_list_addition"]["code"] == "SAR"
        old = '"THB", ' + js_string(mappings["Other"]) + ']'
        assert source.count(old) == 1
        source = source.replace(old, '"THB", "SAR", ' + js_string(mappings["Other"]) + ']')
        assert source.count('const settingsRows = Array.from({ length: 11 }') == 1
        source = source.replace('const settingsRows = Array.from({ length: 11 }', 'const settingsRows = Array.from({ length: 12 }')
        source = source.replace('settings.getRange("A5:D15")', 'settings.getRange("A5:D16")')
        source = source.replace('"$D$5:$D$15"', '"$D$5:$D$16"')
        source = source.replace(js_string(copy["sheet_names"]["Settings"]) + ': "A1:D15"', js_string(copy["sheet_names"]["Settings"]) + ': "A1:D16"')
    override_lines = []
    variables = {"Settings": "settings"}
    for address, value in copy["cell_overrides"].items():
        sheet, cell = address.split("!")
        override_lines.append(f'{variables[sheet]}.getRange({js_string(cell)}).values = [[{js_string(value)}]];')
    if copy.get("direction") == "rtl":
        # Supported formatting makes Arabic cell text read naturally; sheet-view
        # direction is restored separately because the renderer has no view API.
        start_range = "A1:H24" if edition == "google-sheets" else "A1:H22"
        settings_range = "A1:G16" if edition == "google-sheets" else "A1:D16"
        for variable, address in [("start", start_range), ("setup", "A1:F22"), ("expenses", "A1:Z204"), ("repayments", "A1:F204"), ("summary", "A1:S30"), ("example", "A1:G26"), ("settings", settings_range)]:
            override_lines.append(f'{variable}.getRange({js_string(address)}).format.horizontalAlignment = "right";')
    source = source.replace("const sheetPreviewRanges = {", "\n".join(override_lines) + "\n\nworkbook.recalculate();\n\nconst sheetPreviewRanges = {")
    return source


def native_repair_module(copy: dict, temp: Path):
    # Reuse the precise existing OOXML preservation routine. It restores named
    # validations, freezes, the hidden settlement engine and the expense filter.
    source = GENERATOR.read_text()
    for original, translated in copy["sheet_names"].items():
        source = source.replace(f"'{original}'!", f"'{translated}'!")
    if copy["locale"] == "ar":
        source = source.replace("$D$5:$D$15", "$D$5:$D$16")
    target = temp / "native_repair.py"
    target.write_text(source)
    spec = importlib.util.spec_from_file_location("localized_native_repair", target)
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


def apply_rtl_views(workbook_path: Path) -> dict:
    """Restore Arabic view/text-formula direction without reversing any cells."""
    namespace = "http://schemas.openxmlformats.org/spreadsheetml/2006/main"
    ET.register_namespace("", namespace)
    q = lambda tag: f"{{{namespace}}}{tag}"
    text_formulas = {
        1: {"A23"},  # Sheets-only localized hyperlink.
        2: {"A17"},
        3: {f"{column}4" for column in "GHIJKLMNOPQRTUVWXY"}
           | {f"Z{row}" for row in range(5, 205)},
        4: {f"F{row}" for row in range(5, 205)},
        5: {f"{column}{row}" for column in "AH" for row in range(5, 11)}
           | {"B17", "A29"}
           | {f"{column}{row}" for column in "AB" for row in range(23, 28)}
           | {f"{column}{row}" for column in "KL" for row in range(22, 27)},
        6: set(),
        7: {"G5"},  # Sheets-only readiness message.
    }
    with tempfile.TemporaryDirectory(prefix="roommate-rtl-view-") as folder:
        target_path = Path(folder) / workbook_path.name
        count = 0
        changed = []
        data_equality = []
        with ZipFile(workbook_path, "r") as source, ZipFile(target_path, "w", ZIP_DEFLATED) as target:
            styles = ET.fromstring(source.read("xl/styles.xml"))
            xfs = styles.find(q("cellXfs"))
            assert xfs is not None
            original_xfs = list(xfs)
            cloned_styles = {}
            rewritten = {}
            for member in source.infolist():
                data = source.read(member.filename)
                if member.filename.startswith("xl/worksheets/sheet") and member.filename.endswith(".xml"):
                    root = ET.fromstring(data)
                    sheet_number = int(member.filename.rsplit("sheet", 1)[1].split(".")[0])
                    cells = root.findall(f".//{q('sheetData')}/{q('row')}/{q('c')}")
                    def cell_data(cell):
                        return {"attributes": {key: value for key, value in cell.attrib.items() if key != "s"},
                                "children": [ET.tostring(child, encoding="unicode") for child in cell]}
                    before_data = [cell_data(cell) for cell in cells]
                    before_styles = {cell.get("r"): cell.get("s", "0") for cell in cells}
                    view = root.find(f".//{q('sheetView')}")
                    assert view is not None
                    view.set("rightToLeft", "1")
                    changed_addresses = set()
                    for cell in cells:
                        if cell.get("r") not in text_formulas[sheet_number] or cell.find(q("f")) is None:
                            continue
                        old_style = int(cell.get("s", "0"))
                        original = original_xfs[old_style]
                        # The enumerated ranges return names/statuses/text only.
                        # Numeric/date formulas retain their original style IDs.
                        assert original.get("numFmtId", "0") == "0"
                        if old_style not in cloned_styles:
                            clone = copy_module.deepcopy(original)
                            alignment = clone.find(q("alignment"))
                            if alignment is None:
                                alignment = ET.SubElement(clone, q("alignment"))
                            alignment.set("readingOrder", "2")
                            clone.set("applyAlignment", "1")
                            cloned_styles[old_style] = len(xfs)
                            xfs.append(clone)
                        cell.set("s", str(cloned_styles[old_style]))
                        changed_addresses.add(cell.get("r"))
                        changed.append({"sheet": sheet_number, "cell": cell.get("r"),
                                        "oldStyle": old_style, "newStyle": cloned_styles[old_style],
                                        "readingOrder": 2, "formulaUnchanged": True,
                                        "numberFormatIdUnchanged": 0})
                    assert before_data == [cell_data(cell) for cell in cells]
                    assert all(cell.get("s", "0") == before_styles[cell.get("r")]
                               for cell in cells if cell.get("r") not in changed_addresses)
                    data_equality.append({"sheet": sheet_number, "cells": len(cells),
                                          "beforeAndAfterDataSha256": hashlib.sha256(json.dumps(before_data, sort_keys=True).encode()).hexdigest(),
                                          "unaffectedCellStyleIdsUnchanged": len(cells) - len(changed_addresses)})
                    rewritten[member.filename] = ET.tostring(root, encoding="utf-8", xml_declaration=True)
                    count += 1
            xfs.set("count", str(len(xfs)))
            rewritten["xl/styles.xml"] = ET.tostring(styles, encoding="utf-8", xml_declaration=True)
            for member in source.infolist():
                target.writestr(member, rewritten.get(member.filename, source.read(member.filename)))
        assert count == 7
        assert len(changed) in (453, 455)
        workbook_path.write_bytes(target_path.read_bytes())
    return {"rtlViews": count, "textFormulaReadingOrderChanges": changed,
            "verifiedDataAndStyleEquality": data_equality,
            "numericAndDateStyleIdsUnchanged": True, "formulasAndValuesUnchanged": True}


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("copy_file", type=Path)
    parser.add_argument("output", type=Path)
    parser.add_argument("preview_dir", type=Path)
    parser.add_argument("--edition", choices=("excel", "google-sheets"), default="excel")
    parser.add_argument("--csv", type=Path)
    parser.add_argument("--hero", type=Path)
    parser.add_argument("--hero-source", type=Path, help="Verified native localized worksheet-only render")
    args = parser.parse_args()
    copy = json.loads(args.copy_file.read_text())
    if copy["locale"] not in APP_ROUTES:
        raise ValueError("Only the reviewed Spanish, German, Arabic and French copies are implemented")
    if args.output.resolve() == (ROOT / "downloads/roommate-expense-tracker-template.xlsx").resolve():
        raise ValueError("The English workbook must not be overwritten")
    if args.csv and any(len(row) != 11 for row in copy["csv"]):
        raise ValueError("All CSV records must match the eleven-column header")
    if args.hero and not args.hero_source:
        raise ValueError("Localized hero requires a verified native locale worksheet render; artifact preview has English numeric separators")
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.preview_dir.mkdir(parents=True, exist_ok=True)
    with tempfile.TemporaryDirectory(prefix="localized-roommate-builder-") as temporary:
        temp = Path(temporary)
        (temp / "node_modules").symlink_to(RUNTIME / "node/node_modules", target_is_directory=True)
        localized = temp / BUILDER.name
        localized.write_text(localized_builder_source(copy, args.edition))
        subprocess.run([str(RUNTIME / "node/bin/node"), str(localized), str(args.output.resolve()), str(args.preview_dir.resolve()), f"--edition={args.edition}"], check=True)
        repair = native_repair_module(copy, temp)
        repair.postprocess_workbook(args.output)
        if copy.get("direction") == "rtl":
            rtl_report = apply_rtl_views(args.output)
            (args.preview_dir / "rtl-preservation.json").write_text(json.dumps(rtl_report, ensure_ascii=False, indent=2) + "\n")
        if args.hero:
            args.hero.parent.mkdir(parents=True, exist_ok=True)
            repair.HERO_PATH = args.hero
            repair.build_hero(args.hero_source)
    if args.csv:
        args.csv.parent.mkdir(parents=True, exist_ok=True)
        with args.csv.open("w", encoding="utf-8", newline="") as handle:
            csv.writer(handle, lineterminator="\n").writerows(copy["csv"])


if __name__ == "__main__":
    main()
