"""Generate a stakeholder-friendly .docx for Sarathi AI Personalization v2."""

from docx import Document
from docx.shared import Pt, RGBColor, Inches
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.oxml.ns import qn
from docx.oxml import OxmlElement

BLUE = RGBColor(0x25, 0x63, 0xEB)
ORANGE = RGBColor(0xF9, 0x73, 0x16)
GRAY_DARK = RGBColor(0x33, 0x33, 0x33)
GRAY_MID = RGBColor(0x66, 0x66, 0x66)

doc = Document()

# ---------- Default style ----------
style = doc.styles['Normal']
style.font.name = 'Calibri'
style.font.size = Pt(11)
style.font.color.rgb = GRAY_DARK

# ---------- Helpers ----------

def add_title(text, size=24, color=BLUE):
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.LEFT
    run = p.add_run(text)
    run.bold = True
    run.font.size = Pt(size)
    run.font.color.rgb = color
    return p


def add_subtitle(text):
    p = doc.add_paragraph()
    run = p.add_run(text)
    run.italic = True
    run.font.size = Pt(11)
    run.font.color.rgb = GRAY_MID
    return p


def add_h2(text):
    p = doc.add_paragraph()
    p.paragraph_format.space_before = Pt(14)
    p.paragraph_format.space_after = Pt(4)
    run = p.add_run(text)
    run.bold = True
    run.font.size = Pt(14)
    run.font.color.rgb = BLUE
    return p


def add_para(text, bold=False):
    p = doc.add_paragraph()
    p.paragraph_format.space_after = Pt(6)
    run = p.add_run(text)
    run.font.size = Pt(11)
    run.bold = bold
    return p


def add_bullet(text, bold_head=None):
    p = doc.add_paragraph(style='List Bullet')
    if bold_head:
        r1 = p.add_run(bold_head)
        r1.bold = True
        r2 = p.add_run(text)
    else:
        p.add_run(text)


def shade_cell(cell, hex_color):
    tc_pr = cell._tc.get_or_add_tcPr()
    shd = OxmlElement('w:shd')
    shd.set(qn('w:val'), 'clear')
    shd.set(qn('w:color'), 'auto')
    shd.set(qn('w:fill'), hex_color)
    tc_pr.append(shd)


# ---------- Header ----------
add_title('Sarathi AI Personalization v2', size=26)
add_subtitle('Project plan — prepared 15 April 2026')

# ---------- What we are building ----------
add_h2('What we are building')
add_para(
    'An upgrade to Savaari\'s Sarathi AI trip planner that tailors route recommendations '
    'to the kind of group the user is travelling with. Instead of one generic list of stops '
    'for everyone, the customer picks a persona (family, couple, friends, solo, business) and '
    'Sarathi rebuilds the trip around that choice, then lets the user refine it with pace and '
    'budget controls.'
)

# ---------- Why now ----------
add_h2('Why now')
add_bullet(
    'The current "one-size-fits-all" list shows the same stops to a family weekend and a '
    'business traveller. That\'s the single biggest product gap blocking premium positioning.',
    bold_head='Differentiation. ',
)
add_bullet(
    'Airbnb, Skyscanner and TripAdvisor have normalised persona-first flows. Matching that '
    'pattern removes a friction point and signals product maturity.',
    bold_head='Market parity. ',
)
add_bullet(
    'Personalised stops drive more detours, which directly lift trip distance and fare — the '
    'revenue model is already aligned with this change.',
    bold_head='Revenue. ',
)

# ---------- How it works ----------
add_h2('How it works (user flow)')
add_para(
    'Search → Listing (pick a car) → Persona Picker (new) → Planning Modal → Refinement Bar (new).',
    bold=True,
)
add_para(
    'Behind the scenes, Sarathi runs a two-stage pipeline: Stage A generates a broad pool of '
    '12–15 candidate stops for the route (cached for an hour). Stage B re-ranks that pool for '
    'the chosen persona and the selected pace / budget. The Refinement Bar sliders re-rank '
    'locally over the cached pool, so they feel instant and cost us nothing in AI credits.'
)

# ---------- Personas table ----------
add_h2('The five personas')

personas = [
    ('Family Weekend', 'Parents + kids', 'Kid-safe heritage, open-air parks, clean eateries'),
    ('Romantic Escape', 'Two adults', 'Scenic viewpoints, sunsets, intimate cafes'),
    ('Friends Adventure', '3–6 adults', 'Adventure activities, photo-ops, lively cafes'),
    ('Solo Explorer', '1 adult', 'Offbeat culture, museums, quiet viewpoints'),
    ('Business Quick', '1–2 adults', 'Zero-detour stops, clean restrooms, reliable food'),
]

tbl = doc.add_table(rows=1, cols=3)
tbl.style = 'Light Grid Accent 1'
hdr = tbl.rows[0].cells
hdr[0].text = 'Persona'
hdr[1].text = 'Group'
hdr[2].text = 'What Sarathi emphasises'
for c in hdr:
    for p in c.paragraphs:
        for r in p.runs:
            r.bold = True
            r.font.color.rgb = RGBColor(0xFF, 0xFF, 0xFF)
    shade_cell(c, '2563EB')

for name, group, emphasis in personas:
    row = tbl.add_row().cells
    row[0].text = name
    row[1].text = group
    row[2].text = emphasis

# ---------- In v1 ----------
add_h2('What v1 includes')
add_bullet('5-persona picker shown right after the car is chosen.', bold_head='Persona selection. ')
add_bullet(
    'Prompts now include vehicle type, season, time of day, and total trip days — giving '
    'noticeably better Stage-A candidates.',
    bold_head='Context-aware prompts. ',
)
add_bullet(
    'Two-stage AI (broad generator → persona re-ranker) with separate caches at each stage.',
    bold_head='Two-stage pipeline. ',
)
add_bullet(
    'Sliders for Pace (relaxed / balanced / packed) and Budget (budget / standard / premium), '
    'with 400 ms debounced client-side re-rank — no new network round-trips.',
    bold_head='Refinement bar. ',
)
add_bullet(
    'Per-persona hardcoded data for the top Indian routes so the flow works even if '
    'OpenRouter is down.',
    bold_head='Graceful fallback. ',
)

# ---------- Out of scope ----------
add_h2('Out of scope for v1 (planned for later)')
add_bullet('Conversational "chat with Sarathi" refinement — edge-case heavy, revisit after usage data.')
add_bullet('Opening-hours-aware pacing — needs an extra data API.')
add_bullet('Dietary filters, trust badges, accessibility — needs usage data to prioritise properly.')
add_bullet('Memory across trips and collaborative planning — needs auth + backend, not in this phase.')
add_bullet('True SSE streaming of stops — deferred to v1.1; loading skeleton is good enough for v1.')

# ---------- Timeline ----------
add_h2('Timeline')
add_para('Estimated at 5–7 working days for a single developer.')

tl = doc.add_table(rows=1, cols=2)
tl.style = 'Light Grid Accent 1'
hdr = tl.rows[0].cells
hdr[0].text = 'Phase'
hdr[1].text = 'Effort'
for c in hdr:
    for p in c.paragraphs:
        for r in p.runs:
            r.bold = True
            r.font.color.rgb = RGBColor(0xFF, 0xFF, 0xFF)
    shade_cell(c, '2563EB')

phases = [
    ('1. AI layer split + prompt modules + types', '1.5 days'),
    ('2. Persona Picker UI', '1 day'),
    ('3. Two-stage orchestration in the trip-planning hook', '1.5 days'),
    ('4. Refinement Bar + client-side re-rank', '1 day'),
    ('5. Fallback data + full QA matrix', '1 day'),
]
for name, effort in phases:
    row = tl.add_row().cells
    row[0].text = name
    row[1].text = effort

# ---------- Success criteria ----------
add_h2('How we\'ll know it worked')
add_bullet('Same route + different persona returns visibly different stops in every test case.')
add_bullet('Pace / budget sliders update the list in under half a second with no network call.')
add_bullet('Vercel preview builds clean; no regression in the existing booking flow.')
add_bullet('Manual QA matrix across 3 routes × 5 personas × 3 pace/budget combos passes end-to-end.')

# ---------- Rollout ----------
add_h2('Rollout')
add_para(
    'Single feature branch off main, gated behind an in-code flag (ENABLE_PERSONAS) so we can '
    'disable it instantly if anything looks off on Vercel. No backend changes, no persistence — '
    'all state lives in sessionStorage alongside the existing search state.'
)

# ---------- Footer ----------
p = doc.add_paragraph()
p.paragraph_format.space_before = Pt(24)
run = p.add_run('Internal planning document — Savaari Sarathi AI')
run.italic = True
run.font.size = Pt(9)
run.font.color.rgb = GRAY_MID

import os
out = r'C:\Users\Pranav\.gemini\antigravity\scratch\savaari_Ai\docs\Sarathi_AI_Personalization_v2_Plan.docx'
doc.save(out)
print('Wrote', out, os.path.getsize(out), 'bytes')
