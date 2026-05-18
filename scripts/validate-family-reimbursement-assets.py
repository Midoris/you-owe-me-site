import csv
import re
from pathlib import Path

from openpyxl import load_workbook
from pypdf import PdfReader


ROOT = Path(__file__).resolve().parents[1]


def main():
    html = (ROOT / "tools/family-reimbursement-tracker-template/index.html").read_text(encoding="utf-8")
    workbook_path = ROOT / "downloads/family-reimbursement-tracker-template.xlsx"
    csv_path = ROOT / "downloads/family-reimbursement-tracker-template.csv"
    pdf_path = ROOT / "downloads/family-reimbursement-tracker-printable.pdf"

    wb = load_workbook(workbook_path, data_only=False)
    assert wb.sheetnames == ["Start Here", "Tracker", "Example Tracker", "Summary", "Monthly Review", "Settings"], wb.sheetnames

    tracker = wb["Tracker"]
    assert tracker["I2"].value == '=IF(C2="Expense paid for family",G2,IF(C2="Repayment received",-H2,IF(C2="Adjustment",G2-H2,"")))'
    assert tracker["J2"].value == '=IF(B2="","",SUMIFS($I$2:I2,$B$2:B2,B2))'
    assert tracker["I301"].value
    assert tracker["J301"].value
    assert tracker.freeze_panes == "A2"
    assert tracker.auto_filter.ref == "A1:N301"

    example = wb["Example Tracker"]
    assert example.max_row >= 12
    assert example["I12"].value
    assert example["J12"].value

    summary = wb["Summary"]
    assert summary["B2"].value == '=IF($A2="","",SUMIFS(Tracker!$G:$G,Tracker!$B:$B,$A2))'
    assert summary["C2"].value == '=IF($A2="","",SUMIFS(Tracker!$H:$H,Tracker!$B:$B,$A2))'
    assert summary["D2"].value == '=IF($A2="","",B2-C2)'
    assert summary["D33"].value == "=SUM(D2:D31)"

    monthly = wb["Monthly Review"]
    assert monthly["A7"].value == '=IF(Summary!A2="","",Summary!A2)'
    assert monthly["B7"].value == '=IF(A7="","",Summary!D2)'
    assert monthly["A41"].value == "Recurring bills added"
    assert monthly["A45"].value == "One clear summary prepared if needed"

    with csv_path.open(newline="", encoding="utf-8") as handle:
        headers = next(csv.reader(handle))
    assert headers == [
        "Date",
        "Family member",
        "Entry type",
        "Category",
        "What it was for",
        "Paid by",
        "Expense amount",
        "Repayment amount",
        "Balance change",
        "Running balance",
        "Status",
        "Review / due date",
        "Receipt / reference",
        "Notes",
    ]

    pdf = PdfReader(str(pdf_path))
    assert len(pdf.pages) == 3
    assert all((page.extract_text() or "").strip() for page in pdf.pages)

    for download in re.findall(r'href="../../downloads/([^"]+)', html):
        assert (ROOT / "downloads" / download).exists(), download

    assert "Open in Google Sheets" not in html
    assert "Family reimbursement tracker template shown as a calm spreadsheet workspace." in html
    assert "Monthly family reimbursement review with receipts and balance cards." in html

    print("validated workbook/csv/pdf/html downloads")


if __name__ == "__main__":
    main()
