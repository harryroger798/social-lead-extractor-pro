"""PDF Lead Report Generator — 100% free, no external APIs.
Uses fpdf2 for generating branded PDF reports of extracted leads.
"""
import io
import logging
from datetime import datetime
from typing import Optional

logger = logging.getLogger(__name__)


def generate_lead_report(
    leads: list[dict],
    title: str = "SnapLeads Report",
    subtitle: str = "",
    branding: Optional[dict] = None,
) -> bytes:
    """
    Generate a branded PDF report from leads data.
    branding: optional dict with keys 'company_name', 'logo_path', 'primary_color', 'secondary_color'
    Returns PDF bytes.
    """
    try:
        from fpdf import FPDF
    except ImportError:
        logger.warning("fpdf2 not installed, returning empty PDF")
        return b""

    branding = branding or {}
    company_name = branding.get("company_name", "SnapLeads")
    primary_color = _hex_to_rgb(branding.get("primary_color", "#6366f1"))
    secondary_color = _hex_to_rgb(branding.get("secondary_color", "#a855f7"))
    accent_color = _hex_to_rgb(branding.get("accent_color", "#22c55e"))

    pdf = FPDF()
    pdf.set_auto_page_break(auto=True, margin=20)
    pdf.add_page()

    # Header
    pdf.set_fill_color(*primary_color)
    pdf.rect(0, 0, 210, 40, "F")
    pdf.set_text_color(255, 255, 255)
    pdf.set_font("Helvetica", "B", 22)
    pdf.set_xy(15, 10)
    pdf.cell(0, 12, company_name, new_x="LMARGIN", new_y="NEXT")
    pdf.set_font("Helvetica", "", 11)
    pdf.set_xy(15, 22)
    pdf.cell(0, 8, title, new_x="LMARGIN", new_y="NEXT")

    # Report info bar
    pdf.set_xy(0, 40)
    pdf.set_fill_color(*secondary_color)
    pdf.rect(0, 40, 210, 10, "F")
    pdf.set_text_color(255, 255, 255)
    pdf.set_font("Helvetica", "", 9)
    pdf.set_xy(15, 41)
    now = datetime.now().strftime("%B %d, %Y at %I:%M %p")
    pdf.cell(0, 8, f"Generated: {now}  |  Total Leads: {len(leads)}  |  {subtitle}", new_x="LMARGIN", new_y="NEXT")

    # Summary stats
    pdf.set_xy(15, 58)
    pdf.set_text_color(40, 40, 40)

    total = len(leads)
    emails = sum(1 for l in leads if l.get("email"))
    phones = sum(1 for l in leads if l.get("phone"))
    verified = sum(1 for l in leads if l.get("verified"))
    hot = sum(1 for l in leads if l.get("quality_score", 0) >= 80)
    warm = sum(1 for l in leads if 50 <= l.get("quality_score", 0) < 80)
    cold = sum(1 for l in leads if l.get("quality_score", 0) < 50)

    # Stats boxes
    stats = [
        ("Total Leads", str(total)),
        ("Emails", str(emails)),
        ("Phones", str(phones)),
        ("Verified", str(verified)),
        ("Hot Leads", str(hot)),
        ("Warm Leads", str(warm)),
    ]

    box_w = 28
    start_x = 15
    for i, (label, value) in enumerate(stats):
        x = start_x + i * (box_w + 3)
        pdf.set_fill_color(245, 245, 250)
        pdf.rect(x, 55, box_w, 20, "F")
        pdf.set_font("Helvetica", "B", 14)
        pdf.set_text_color(*primary_color)
        pdf.set_xy(x, 56)
        pdf.cell(box_w, 10, value, align="C", new_x="LMARGIN", new_y="NEXT")
        pdf.set_font("Helvetica", "", 7)
        pdf.set_text_color(120, 120, 120)
        pdf.set_xy(x, 65)
        pdf.cell(box_w, 6, label, align="C", new_x="LMARGIN", new_y="NEXT")

    # Platform breakdown
    platforms: dict[str, int] = {}
    for l in leads:
        p = l.get("platform", "unknown")
        platforms[p] = platforms.get(p, 0) + 1

    pdf.set_xy(15, 82)
    pdf.set_font("Helvetica", "B", 12)
    pdf.set_text_color(40, 40, 40)
    pdf.cell(0, 8, "Platform Breakdown", new_x="LMARGIN", new_y="NEXT")

    y = 92
    for platform, count in sorted(platforms.items(), key=lambda x: -x[1]):
        if y > 275:
            pdf.add_page()
            y = 20
        pdf.set_xy(15, y)
        pdf.set_font("Helvetica", "", 9)
        pdf.set_text_color(60, 60, 60)
        pct = round(count / total * 100, 1) if total > 0 else 0
        pdf.cell(40, 6, platform.replace("_", " ").title(), new_x="LMARGIN", new_y="NEXT")
        # Bar
        bar_width = min(pct * 1.2, 120)
        pdf.set_fill_color(*accent_color)
        pdf.rect(55, y + 1, bar_width, 4, "F")
        pdf.set_xy(55 + bar_width + 3, y)
        pdf.cell(30, 6, f"{count} ({pct}%)", new_x="LMARGIN", new_y="NEXT")
        y += 8

    # Leads table
    y += 5
    if y > 250:
        pdf.add_page()
        y = 20

    pdf.set_xy(15, y)
    pdf.set_font("Helvetica", "B", 12)
    pdf.set_text_color(40, 40, 40)
    pdf.cell(0, 8, "Lead Details", new_x="LMARGIN", new_y="NEXT")
    y += 10

    # Table header
    col_widths = [55, 35, 30, 25, 20, 15]
    headers = ["Email", "Phone", "Name", "Platform", "Score", "V"]

    pdf.set_fill_color(*primary_color)
    pdf.set_text_color(255, 255, 255)
    pdf.set_font("Helvetica", "B", 8)
    pdf.set_xy(15, y)
    for i, h in enumerate(headers):
        pdf.cell(col_widths[i], 7, h, border=1, fill=True, new_x="RIGHT")
    pdf.ln()
    y += 7

    # Table rows
    pdf.set_font("Helvetica", "", 7)
    pdf.set_text_color(50, 50, 50)

    for lead in leads[:500]:  # Cap at 500 leads per report
        if y > 275:
            pdf.add_page()
            y = 20
            # Repeat header
            pdf.set_fill_color(*primary_color)
            pdf.set_text_color(255, 255, 255)
            pdf.set_font("Helvetica", "B", 8)
            pdf.set_xy(15, y)
            for i, h in enumerate(headers):
                pdf.cell(col_widths[i], 7, h, border=1, fill=True, new_x="RIGHT")
            pdf.ln()
            y += 7
            pdf.set_font("Helvetica", "", 7)
            pdf.set_text_color(50, 50, 50)

        pdf.set_xy(15, y)
        row = [
            (lead.get("email", ""))[:30],
            (lead.get("phone", ""))[:18],
            (lead.get("name", ""))[:18],
            (lead.get("platform", ""))[:14],
            str(lead.get("quality_score", 0)),
            "Y" if lead.get("verified") else "N",
        ]
        for i, val in enumerate(row):
            pdf.cell(col_widths[i], 6, val, border=1, new_x="RIGHT")
        pdf.ln()
        y += 6

    # Footer
    pdf.set_xy(15, 280)
    pdf.set_font("Helvetica", "I", 8)
    pdf.set_text_color(150, 150, 150)
    pdf.cell(0, 5, f"Report generated by {company_name} on {now}", align="C")

    return bytes(pdf.output())


def _hex_to_rgb(hex_color: str) -> tuple[int, int, int]:
    """Convert hex color to RGB tuple."""
    hex_color = hex_color.lstrip("#")
    if len(hex_color) != 6:
        return (99, 102, 241)  # default indigo
    return (
        int(hex_color[0:2], 16),
        int(hex_color[2:4], 16),
        int(hex_color[4:6], 16),
    )
