#!/usr/bin/env python3
"""Localize the existing artifact-tool workbook builder without changing its model.

The copy file is editorial input. Both editions execute the canonical builder's
existing formulas and native-feature repair; only exact strings, sheet routing,
the prescribed date display and the localized Google Sheets app link change.
"""

from __future__ import annotations

import argparse
import csv
import importlib.util
import json
import subprocess
import tempfile
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
RUNTIME = Path.home() / ".cache/codex-runtimes/codex-primary-runtime/dependencies"
BUILDER = ROOT / "scripts/build-roommate-expense-tracker-workbook.mjs"
GENERATOR = ROOT / "scripts/generate-roommate-expense-tracker-assets.py"
APP_ROUTES = {
    "es": "https://you-owe-me.com/es/soluciones/app-para-registrar-dinero-adeudado/",
    "de": "https://you-owe-me.com/de/loesungen/app-fuer-geldforderungen/",
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
    override_lines = []
    variables = {"Settings": "settings"}
    for address, value in copy["cell_overrides"].items():
        sheet, cell = address.split("!")
        override_lines.append(f'{variables[sheet]}.getRange({js_string(cell)}).values = [[{js_string(value)}]];')
    source = source.replace("const sheetPreviewRanges = {", "\n".join(override_lines) + "\n\nworkbook.recalculate();\n\nconst sheetPreviewRanges = {")
    return source


def native_repair_module(copy: dict, temp: Path):
    # Reuse the precise existing OOXML preservation routine. It restores named
    # validations, freezes, the hidden settlement engine and the expense filter.
    source = GENERATOR.read_text()
    for original, translated in copy["sheet_names"].items():
        source = source.replace(f"'{original}'!", f"'{translated}'!")
    target = temp / "native_repair.py"
    target.write_text(source)
    spec = importlib.util.spec_from_file_location("localized_native_repair", target)
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


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
        raise ValueError("Only the reviewed Spanish and German copies are implemented")
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
