#!/usr/bin/env python3
"""Read-only preservation checks for the reviewed localized roommate files."""
import csv
import json
import sys
from pathlib import Path
from openpyxl import load_workbook

ROOT = Path(__file__).resolve().parents[1]
COPY = json.loads((ROOT / "content/roommate-workbooks/ja.json").read_text())
NAMES = COPY["sheet_names"]
STRINGS = COPY["strings"]
EXAMPLE_AMOUNTS = {"Example!D6": 180000, "Example!D7": 6000, "Example!D8": 12000, "Example!D12": 20000}
assert COPY["example_amount_scale"] == 100 and COPY["example_currency"] == "JPY"


def translated(value):
    if not isinstance(value, str):
        return value
    if value.startswith("="):
        for original, localized in sorted(STRINGS.items(), key=lambda item: -len(item[0])):
            value = value.replace('"' + original + '"', '"' + localized + '"')
        for original, localized in NAMES.items():
            value = value.replace("'" + original + "'!", "'" + localized + "'!")
        return value
    return STRINGS.get(value, value)


def validate_common(path):
    book = load_workbook(path, data_only=False)
    values = load_workbook(path, data_only=True)
    assert book.sheetnames == list(NAMES.values())
    assert "小数第2位" in values["設定"]["A2"].value and "円で端数" in values["設定"]["A2"].value
    assert all(values["設定"][cell].value in (None, "") for cell in ("B4", "B5", "B6"))
    assert all(not sheet.sheet_view.rightToLeft for sheet in book)
    assert [values["入力候補"].cell(row, 4).value for row in range(5, 16)] == ["USD", "EUR", "GBP", "CAD", "AUD", "NZD", "JPY", "CHF", "SGD", "THB", "その他"]
    assert all(values["設定"].cell(row, 2).value in (None, "") for row in range(9, 15))
    assert [values["設定"].cell(row, 3).value for row in range(9, 15)] == [0] * 6
    assert values["入力候補"]["D15"].value == "その他"
    assert [values["記入例"].cell(row, 1).value for row in range(16, 19)] == ["美咲", "悠太", "葵"]
    assert [values["記入例"].cell(row, 6).value for row in range(16, 19)] == [94000, -40000, -54000]
    assert values["記入例"]["B20"].value == 198000
    assert values["記入例"]["B21"].value == 66000
    assert [values["記入例"].cell(row, 3).value for row in (25, 26)] == [40000, 54000]
    assert values["記入例"]["F24"].value == 0
    for sheet_name in ("支出", "精算"):
        assert book[sheet_name].max_row == 204
        assert book[sheet_name]["A5"].number_format == "yyyy/mm/dd"
    for row in (6, 7, 8, 12):
        assert book["記入例"].cell(row, 1).number_format == "yyyy/mm/dd"
    for row, date in [(6, "2026-05-01"), (7, "2026-05-05"), (8, "2026-05-12"), (12, "2026-05-20")]:
        assert values["記入例"].cell(row, 1).value.date().isoformat() == date
    assert len(book.defined_names) == 5
    assert book["支出"].auto_filter.ref == "A4:Z204"
    for sheet in book:
        for row in sheet:
            for cell in row:
                assert cell.data_type != "e", (sheet.title, cell.coordinate, cell.value)
    return book, values


def validate_excel():
    path = ROOT / "downloads/ja/roommate-expense-tracker.xlsx"
    book, values = validate_common(path)
    original = load_workbook(ROOT / "downloads/roommate-expense-tracker-template.xlsx", data_only=False)
    compared_cells = compared_formulas = 0
    for old in original:
        current = book[NAMES[old.title]]
        assert current.max_row == old.max_row and current.max_column == old.max_column
        assert str(current.merged_cells) == str(old.merged_cells)
        assert current.freeze_panes == old.freeze_panes
        assert set(current.tables) == set(old.tables)
        assert len(current.data_validations.dataValidation) == len(old.data_validations.dataValidation)
        for before, after in zip(old.data_validations.dataValidation, current.data_validations.dataValidation):
            assert before.sqref == after.sqref
            assert before.type == after.type and before.formula1 == after.formula1
        for row in old:
            for cell in row:
                actual = current[cell.coordinate]
                address = f"{old.title}!{cell.coordinate}"
                expected = EXAMPLE_AMOUNTS.get(address, COPY["cell_overrides"].get(address, translated(cell.value)))
                assert actual.value == expected, (old.title, cell.coordinate, cell.value, expected, actual.value)
                compared_cells += 1
                compared_formulas += cell.data_type == "f"
                expected_format = "yyyy/mm/dd" if cell.number_format == "yyyy-mm-dd" else cell.number_format
                assert actual.number_format == expected_format
        for key, dimensions in old.column_dimensions.items():
            assert current.column_dimensions[key].hidden == dimensions.hidden
            assert current.column_dimensions[key].width == dimensions.width
        assert len(old.conditional_formatting) == len(current.conditional_formatting)
        for old_range, new_range in zip(old.conditional_formatting, current.conditional_formatting):
            assert old_range.sqref == new_range.sqref
            old_rules = old.conditional_formatting[old_range]
            new_rules = current.conditional_formatting[new_range]
            assert len(old_rules) == len(new_rules)
            for before, after in zip(old_rules, new_rules):
                assert after.type == before.type
                assert after.text == STRINGS.get(before.text, before.text)
                assert after.formula == [translated("=" + formula)[1:] for formula in before.formula]
    for name, definition in original.defined_names.items():
        expected = definition.attr_text
        for original_name, localized in NAMES.items():
            expected = expected.replace("'" + original_name + "'!", "'" + localized + "'!")
        assert book.defined_names[name].attr_text == expected
    with (ROOT / "downloads/ja/roommate-expense-tracker.csv").open(newline="", encoding="utf-8") as file:
        rows = list(csv.reader(file))
    assert rows == COPY["csv"] and all(len(row) == 11 for row in rows)
    return {"compared_cells": compared_cells, "compared_formulas": compared_formulas, "native_features_preserved": True, "csv_rows": len(rows)}


def validate_sheets(path):
    book, values = validate_common(path)
    assert not book["精算"].tables
    assert STRINGS["Roommate Expense Tracker — Google Sheets"] == values["使い方"]["A1"].value
    assert 'HYPERLINK("https://you-owe-me.com/ja/solutions/app-to-track-money-owed/","iPhoneで立て替えと残額を記録")' in book["使い方"]["A23"].value
    assert values["使い方"]["A24"].value == STRINGS["Start a separate record in You Owe Me; this spreadsheet is not imported."]
    setup = book["設定"]["A17"].value
    for fragment in ('TRIM', 'SUBSTITUTE(B9,"  "," ")', 'NOT(ISNUMBER(C9))', 'ROUND(C16,2)<>0', STRINGS["Ready: setup inputs are valid."]):
        assert fragment in setup
    for row in range(5, 205):
        share = book["支出"].cell(row, 20).value
        check = book["支出"].cell(row, 26).value
        assert f'QUOTIENT(ROUND($D{row}*100,0),COUNTIF($G{row}:$L{row},"はい"))' in share
        assert f'MOD(ROUND($D{row}*100,0),COUNTIF($G{row}:$L{row},"はい"))' in share
        assert "SUBSTITUTE" in check and "ISNUMBER" in check
        assert STRINGS["Custom shares must add up to the expense amount."] in check
        assert "SUBSTITUTE" in book["精算"].cell(row, 6).value
    assert "入力候補'!$G$5" in book["集計"]["B17"].value
    assert "入力候補'!$G$5" in book["集計"]["G5"].value
    assert "ROUND(G5,2)=0" in book["集計"]["H5"].value
    assert "<0" in book["集計"]["K22"].value
    assert "COUNTIFS('支出'" in book["入力候補"]["G5"].value
    return {"direct_range_edition": True, "readiness_gate": True, "integer_cent_allocation": True, "native_engine_pending": True, "preview_hyperlink_limitation": "Retained formula verified separately in native Google Sheets"}


if __name__ == "__main__":
    result = {"excel": validate_excel()}
    if len(sys.argv) == 2:
        result["sheets_intermediary"] = validate_sheets(Path(sys.argv[1]))
    print(json.dumps(result, ensure_ascii=False))
