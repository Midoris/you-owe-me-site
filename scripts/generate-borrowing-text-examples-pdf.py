#!/usr/bin/env python3
"""Regenerate the borrowing guide's text examples PDF (requires ReportLab)."""

from html import escape
from html.parser import HTMLParser
from pathlib import Path

from reportlab.lib.colors import HexColor
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import ParagraphStyle
from reportlab.pdfgen.canvas import Canvas
from reportlab.platypus import Paragraph


ROOT = Path(__file__).resolve().parents[1]
GUIDE = ROOT / "blog/how-to-ask-to-borrow-money-from-a-friend-without-making-it-awkward/index.html"
OUTPUT = ROOT / "downloads/borrowing-money-from-a-friend-text-examples.pdf"
TEMPLATE_IDS = (
    "short-ask",
    "clear-ask-with-repayment-plan",
    "cannot-promise-exact-date",
    "reply-after-yes",
)


class Guide(HTMLParser):
    def __init__(self):
        super().__init__()
        self.templates = {}
        self.template = None
        self.in_title = False
        self.example = {"figcaption": "", "blockquote": ""}
        self.in_example = False
        self.example_part = None
        self.app_url = None
        self.canonical = None

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if tag == "figure" and attrs.get("id") == "friend-borrow-worked-example":
            self.in_example = True
        if self.in_example and tag in self.example:
            self.example_part = tag
        if tag == "article" and attrs.get("data-template-id") in TEMPLATE_IDS:
            self.template = self.templates.setdefault(attrs["data-template-id"], {"title": ""})
        if self.template is not None:
            if tag == "h3":
                self.in_title = True
            if tag == "blockquote":
                self.template["message"] = attrs["data-template"]
        if tag == "link" and attrs.get("rel") == "canonical":
            self.canonical = attrs["href"]
        if tag == "a" and attrs.get("data-track-location") == "friend_borrow_post_copy_app_store_cta":
            self.app_url = attrs["href"]

    def handle_endtag(self, tag):
        if tag == self.example_part:
            self.example_part = None
        if tag == "figure":
            self.in_example = False
        if tag == "h3":
            self.in_title = False
        if tag == "article":
            self.template = None

    def handle_data(self, data):
        if self.example_part is not None:
            self.example[self.example_part] += data
        if self.in_title:
            self.template["title"] += data


INK = HexColor("#18212B")
SECONDARY = HexColor("#465461")
GREEN = HexColor("#355428")
ACCENT = HexColor("#AFE67E")
RULE = HexColor("#BEC7C3")


def build_pdf(guide):
    pdf = Canvas(str(OUTPUT), pagesize=letter, invariant=True, pageCompression=1)
    pdf.setTitle("How to Ask to Borrow Money From a Friend: Text Examples")
    pdf.setAuthor("You Owe Me")
    pdf.setCreator("You Owe Me")
    pdf.setSubject("A complete message and four templates for borrowing money from a friend")
    pdf.setCatalogEntry("Lang", "en")

    left, right = 54, 558
    body = ParagraphStyle("message", fontName="Helvetica", fontSize=13, leading=17, textColor=INK)

    def text(x, y, value, size, font="Helvetica", color=INK):
        pdf.setFont(font, size)
        pdf.setFillColor(color)
        pdf.drawString(x, y, value)

    def line(y):
        pdf.setStrokeColor(RULE)
        pdf.setLineWidth(0.65)
        pdf.line(left, y, right, y)

    def link(x, y, label, url, size):
        text(x, y, label, size, color=GREEN)
        width = pdf.stringWidth(label, "Helvetica", size)
        pdf.setStrokeColor(GREEN)
        pdf.setLineWidth(0.55)
        pdf.line(x, y - 2.5, x + width, y - 2.5)
        pdf.linkURL(url, (x - 4, y - 9, x + width + 4, y + 16), thickness=0)

    def draw_message(label, message, x, top, heading_color=INK):
        text(x, top, label, 14.5, "Helvetica-Bold", heading_color)
        paragraph = Paragraph(escape(message), body)
        _, height = paragraph.wrap(right - x - 15, 51)
        if height > 51:
            raise ValueError(f"The {label!r} message no longer fits on one page")
        paragraph.drawOn(pdf, x, top - 9 - height)

    pdf.setFillColor(ACCENT)
    pdf.roundRect(left, 739, 34, 4, 2, fill=1, stroke=0)
    text(left, 719, "TEXT EXAMPLES", 10, "Helvetica-Bold", GREEN)
    text(left, 683, "How to Ask to Borrow", 33, "Helvetica-Bold")
    text(left, 649, "Money From a Friend", 33, "Helvetica-Bold")
    text(left, 622, "Choose a template and replace the details in brackets before sending.", 12, color=SECONDARY)

    pdf.setFillColor(ACCENT)
    pdf.roundRect(left, 542, 3, 59, 1.5, fill=1, stroke=0)
    draw_message(guide.example["figcaption"].strip(), guide.example["blockquote"].strip(), left + 13, 586, GREEN)

    for i, template_id in enumerate(TEMPLATE_IDS):
        template = guide.templates[template_id]
        top = 526 - i * 88
        line(top)
        draw_message(template["title"], template["message"], left, top - 22)

    line(174)
    text(left, 151, "If you repay in parts", 13, "Helvetica-Bold")
    text(left, 133, "Write down the amount borrowed, each payment, and what you still owe.", 12, color=SECONDARY)
    link(left, 111, "See the guide’s example record", f"{guide.canonical}#simple-record", 11)

    link(left, 55, "By You Owe Me · View on the App Store", guide.app_url, 11)
    pdf.showPage()
    pdf.save()


if __name__ == "__main__":
    source = Guide()
    source.feed(GUIDE.read_text(encoding="utf-8"))
    if not source.canonical or not source.app_url:
        raise ValueError("The borrowing guide is missing its canonical or App Store URL")
    if not all(part.strip() for part in source.example.values()):
        raise ValueError("The borrowing guide is missing its worked example")
    build_pdf(source)
