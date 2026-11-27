#!/usr/bin/env python3
"""Build Koussay's one-page CV PDF (reportlab). Content = verified facts only."""
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.lib.colors import HexColor
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.enums import TA_CENTER
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, HRFlowable
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont

pdfmetrics.registerFont(TTFont("DVS", "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"))
pdfmetrics.registerFont(TTFont("DVS-B", "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"))
pdfmetrics.registerFontFamily("DVS", normal="DVS", bold="DVS-B", italic="DVS")

ACCENT = HexColor("#1F4E79")
INK = HexColor("#1a1a1a")
DIM = HexColor("#555555")

name = ParagraphStyle("name", fontName="DVS-B", fontSize=19, leading=23, alignment=TA_CENTER, textColor=INK)
tag = ParagraphStyle("tag", fontName="DVS", fontSize=9.5, leading=13, alignment=TA_CENTER, textColor=DIM)
sec = ParagraphStyle("sec", fontName="DVS-B", fontSize=11, leading=14, textColor=ACCENT, spaceBefore=10, spaceAfter=2)
body = ParagraphStyle("body", fontName="DVS", fontSize=9.5, leading=13.5, textColor=INK)
bullet = ParagraphStyle("bullet", parent=body, leftIndent=10, bulletIndent=2, spaceAfter=2.5)

L = '<link href="%s" color="#1F4E79">%s</link>'

story = [
    Paragraph("Koussay Mehdouani", name),
    Paragraph("Applied AI &middot; Data Engineering &middot; Open Source &mdash; Tunis, Tunisia", tag),
    Paragraph(
        (L % ("mailto:koussaymehdouani@gmail.com", "koussaymehdouani@gmail.com"))
        + " &middot; " + (L % ("https://github.com/amkkoussay", "github.com/amkkoussay"))
        + " &middot; " + (L % ("https://www.linkedin.com/in/koussay-mehdouani-45560a389", "LinkedIn"))
        + " &middot; " + (L % ("https://orcid.org/0009-0003-5825-3692", "ORCID 0009-0003-5825-3692")), tag),
    Spacer(1, 4),
]

def section(title, items):
    story.append(Paragraph(title.upper(), sec))
    story.append(HRFlowable(width="100%", thickness=0.6, color=ACCENT, spaceAfter=4))
    for it in items:
        if it.startswith("- "):
            story.append(Paragraph(it[2:], bullet, bulletText="•"))
        else:
            story.append(Paragraph(it, body))

section("Education", [
    "Sciences de l'informatique (4SI), Tunisia &mdash; Baccalaur&eacute;at cycle 2027&ndash;2028.",
])
section("Selected Projects", [
    "- <b>MIRSAD</b> &mdash; shared memory for AI agents: MCP server published on PyPI (mirsad-mcp 0.3.0), live on Cloudflare Workers + D1; bi-temporal facts, first-class decisions, owner-resolved conflicts. OpenSSF Best Practices Passing.",
    "- <b>Rain2Risk</b> &mdash; relative flood-risk screening with a transparent weighted model (rainfall 40%, slope 20%, elevation 15%, built-up share 15%, distance to water 10%); a screening, never a forecast.",
    "- <b>CropGuide</b> &mdash; plant-disease guidance: Plant.id identification + Gemini Vision symptom extraction, checked against 18 crops and 184 source-verified disease records; abstains when the evidence is too thin.",
    "- <b>Clinique</b> &mdash; clinic management platform with role-based access, a FHIR-shaped REST API and a role-scoped AI assistant (Qwen), integrated with n8n workflows.",
])
section("Open-Source Contributions (merged)", [
    "- <b>pandas</b> &mdash; " + (L % ("https://github.com/pandas-dev/pandas/pull/71991", "PR #71991")) + ": fixed pd.to_numeric coercion on ArrowDtype strings, with regression tests.",
    "- <b>Wireshark</b> &mdash; " + (L % ("https://gitlab.com/wireshark/wireshark/-/merge_requests/28001", "MR !28001")) + ": gave asn2deb its .py extension; name listed in the official AUTHORS file.",
    "- <b>GitLab (gitlab-shell)</b> &mdash; " + (L % ("https://gitlab.com/gitlab-org/gitlab-shell/-/merge_requests/1664", "MR !1664")) + ": parse-failure errors now carry request context (closes #888).",
    "- <b>Microsoft azure-docs</b> &mdash; " + (L % ("https://github.com/MicrosoftDocs/azure-docs/pull/128901", "PR #128901")) + " and " + (L % ("https://github.com/MicrosoftDocs/azure-docs/pull/128902", "#128902")) + ": documentation fixes.",
])
section("Research", [
    "AI-Based Clinical Decision-Support System Robustness Under Unreliable Patient Data: A Narrative Review with Thematic Synthesis &mdash; sole author, Zenodo (2026), " + (L % ("https://doi.org/10.5281/zenodo.22883408", "DOI 10.5281/zenodo.22883408")) + ".",
])
section("Security Research", [
    "Credited on two GitHub Security Advisories: pydicom (" + (L % ("https://github.com/advisories/GHSA-2j9c-7f57-c9cw", "GHSA-2j9c-7f57-c9cw")) + ") and browser-use (" + (L % ("https://github.com/advisories/GHSA-pgp3-m7wh-g93p", "GHSA-pgp3-m7wh-g93p")) + ").",
])
section("Skills", [
    "Python &middot; JavaScript &middot; HTML/CSS &middot; SQL &middot; Flask &middot; SQLite &middot; MCP &middot; REST APIs &middot; Git/GitHub",
])
section("Languages", [
    "Arabic (native) &middot; French (fluent) &middot; English (intermediate)",
])

doc = SimpleDocTemplate("/home/hatch/workspace/portfolio-template-plus/cv.pdf", pagesize=A4,
                        leftMargin=16 * mm, rightMargin=16 * mm, topMargin=14 * mm, bottomMargin=12 * mm,
                        title="Koussay Mehdouani — CV", author="Koussay Mehdouani")
doc.build(story)
print("cv.pdf built")
