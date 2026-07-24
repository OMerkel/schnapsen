"""Generate a traditional-style 52-card French SVG deck."""

# ruff: noqa: E501
# flake8: noqa: E501
# pylint: disable=line-too-long,duplicate-code

from __future__ import annotations

import argparse
from dataclasses import dataclass
from datetime import date
from pathlib import Path


CARD_WIDTH = 750
CARD_HEIGHT = 1200
CENTER_X = CARD_WIDTH / 2
CENTER_Y = CARD_HEIGHT / 2
FRONT_FRAME_PADDING = 60
FRONT_FRAME_WIDTH = CARD_WIDTH - 2 * FRONT_FRAME_PADDING
FRONT_FRAME_HEIGHT = CARD_HEIGHT - 2 * FRONT_FRAME_PADDING
FRONT_FRAME_X = FRONT_FRAME_PADDING
FRONT_FRAME_Y = FRONT_FRAME_PADDING
FRONT_FRAME_RX = 28
FRONT_FRAME_STROKE_WIDTH = 8
COURT_EMOJI_FONT_SIZE = 450
COURT_EMOJI_BASELINE_Y = 650
SHEET_COLUMNS = 13
SHEET_THUMB_WIDTH = 180
SHEET_THUMB_HEIGHT = 288
SHEET_HEIGHT = 2920
SHEET_MARGIN_X = 76
SHEET_MARGIN_Y = 96
SHEET_GAP_X = 24
SHEET_GAP_Y = 19
SHEET_LABEL_Y_OFFSET = 14
SHEET_WIDTH = (
    (2 * SHEET_MARGIN_X)
    + (SHEET_COLUMNS * SHEET_THUMB_WIDTH)
    + ((SHEET_COLUMNS - 1) * SHEET_GAP_X)
)
CUTLINE_X = 13
CUTLINE_Y = 13
CUTLINE_WIDTH = 724
CUTLINE_HEIGHT = 1174
CUTLINE_RX = 36
CUTLINE_STROKE_WIDTH = 5
ROMAN_DEFAULT_X = CENTER_X
ROMAN_DEFAULT_Y = 148
ROMAN_DEFAULT_FONT_SIZE = 96
ROMAN_FILL = "#2a241c"
ROMAN_NUMERIC_RANKS = (2, 3, 4, 5, 6, 7, 8, 9, 10)
AUTHOR_INFO = "Oliver Merkel, Merkel(dot)Oliver(at)web(dot)de"
LICENSE_URL = "http://creativecommons.org/licenses/by-nc-sa/4.0/"
LICENSE_NAME = (
    "Creative Commons Attribution-NonCommercial-ShareAlike "
    "4.0 International License"
)
LANGUAGE_TAG = "en-GB"
CURRENT_DATE = date.today().isoformat()
CURRENT_YEAR = date.today().year
FRENCH_SUIT_FILES = {
    "clubs": "clubs.svg",
    "diamonds": "diamonds.svg",
    "hearts": "hearts.svg",
    "spades": "spades.svg",
}


@dataclass(frozen=True)
# pylint: disable=too-many-instance-attributes
class Suit:
    """Color and naming metadata for one French deck suit."""

    key: str
    name: str
    file: str
    accent: str
    dark: str
    soft: str
    banner: str
    figure: str


@dataclass(frozen=True)
class Rank:
    """Display and gameplay metadata for one card rank."""

    key: str
    label: str
    name: str
    value: int
    face: bool


@dataclass(frozen=True)
class NumberOverlayConfig:
    """Configuration for Roman-number overlays on numeric card faces."""

    x: float = ROMAN_DEFAULT_X
    y: float = ROMAN_DEFAULT_Y
    font_size: float = ROMAN_DEFAULT_FONT_SIZE


def default_roman_overlay_by_rank() -> dict[int, NumberOverlayConfig]:
    """Return default Roman overlay config keyed by numeric rank."""

    return {
        rank: NumberOverlayConfig(
            x=ROMAN_DEFAULT_X,
            y=ROMAN_DEFAULT_Y,
            font_size=ROMAN_DEFAULT_FONT_SIZE,
        )
        for rank in ROMAN_NUMERIC_RANKS
    }


# Rank-keyed Roman numeral placement/size config for number cards (2..10).
# Adjust x/y/font_size per rank as needed.
ROMAN_OVERLAY_BY_RANK: dict[int, NumberOverlayConfig] = {
    **default_roman_overlay_by_rank(),
    2: NumberOverlayConfig(x=160, y=180, font_size=144),
    3: NumberOverlayConfig(x=160, y=180, font_size=144),
    5: NumberOverlayConfig(x=375, y=180, font_size=136),
    6: NumberOverlayConfig(x=375, y=180, font_size=128),
    7: NumberOverlayConfig(x=160, y=180, font_size=128),
    9: NumberOverlayConfig(x=160, y=180, font_size=128),
    10: NumberOverlayConfig(x=375, y=180, font_size=128),
}


SUITS = (
    Suit(
        "clubs", "Clubs", "clubs", "#222222", "#111111",
        "#555555", "#1a1a1a", "#2b2b2b"
    ),
    Suit(
        "spades", "Spades", "spades", "#222222", "#111111",
        "#666666", "#1a1a1a", "#2e2e2e"
    ),
    Suit(
        "hearts", "Hearts", "hearts", "#c62839", "#8e1022",
        "#f1a1aa", "#a61d2a", "#d74a58"
    ),
    Suit(
        "diamonds", "Diamonds", "diamonds", "#d53345", "#8e1022",
        "#f06e7b", "#a61d2a", "#d74a58"
    ),
)


RANKS = (
    Rank("ass", "A", "Ass", 1, False),
    Rank("10", "10", "10", 10, False),
    Rank("könig", "K", "König", 13, True),
    Rank("ober", "O", "Ober", 12, True),
    Rank("unter", "U", "Unter", 11, True),
    Rank("9", "9", "9", 9, False),
    Rank("8", "8", "8", 8, False),
    Rank("7", "7", "7", 7, False),
    Rank("6", "6", "6", 6, False),
    Rank("5", "5", "5", 5, False),
    Rank("4", "4", "4", 4, False),
    Rank("3", "3", "3", 3, False),
    Rank("2", "2", "2", 2, False),
)


def format_number(value: float) -> str:
    """Format SVG numeric values without unnecessary trailing zeros."""

    if float(value).is_integer():
        return str(int(value))
    text = f"{value:.4f}".rstrip("0").rstrip(".")
    return text or "0"


def svg_license_comment() -> str:
    """Return a standardized license/copyright comment block."""

    return f'''<!--
Copyright (c) {CURRENT_YEAR}
@author {AUTHOR_INFO}.
All rights reserved.

This graphics is licensed under a
{LICENSE_URL}
{LICENSE_NAME}.
-->'''


def rdf_metadata(title: str) -> str:
    """Return RDF metadata block with copyright and CC BY-NC-SA terms."""

    return f'''  <metadata id="metadata7">
        <rdf:RDF>
            <cc:Work rdf:about="">
                <dc:format>image/svg+xml</dc:format>
                <dc:type rdf:resource="http://purl.org/dc/dcmitype/StillImage" />
                <dc:title>{title}</dc:title>
                <dc:date>{CURRENT_DATE}</dc:date>
                <dc:creator>
                    <cc:Agent>
                        <dc:title>{AUTHOR_INFO}</dc:title>
                    </cc:Agent>
                </dc:creator>
                <dc:rights>
                    <cc:Agent>
                        <dc:title>{AUTHOR_INFO}</dc:title>
                    </cc:Agent>
                </dc:rights>
                <dc:publisher>
                    <cc:Agent>
                        <dc:title>{AUTHOR_INFO}</dc:title>
                    </cc:Agent>
                </dc:publisher>
                <dc:language>{LANGUAGE_TAG}</dc:language>
                <cc:license rdf:resource="{LICENSE_URL}" />
            </cc:Work>
            <cc:License rdf:about="{LICENSE_URL}">
                <cc:permits rdf:resource="http://creativecommons.org/ns#Reproduction" />
                <cc:permits rdf:resource="http://creativecommons.org/ns#Distribution" />
                <cc:requires rdf:resource="http://creativecommons.org/ns#Notice" />
                <cc:requires rdf:resource="http://creativecommons.org/ns#Attribution" />
                <cc:prohibits rdf:resource="http://creativecommons.org/ns#CommercialUse" />
                <cc:permits rdf:resource="http://creativecommons.org/ns#DerivativeWorks" />
                <cc:requires rdf:resource="http://creativecommons.org/ns#ShareAlike" />
            </cc:License>
        </rdf:RDF>
    </metadata>'''


def svg_document(body: str, title: str) -> str:
    """Wrap a card body fragment in the shared SVG document shell."""

    return f'''<?xml version="1.0" encoding="UTF-8" standalone="no"?>
{svg_license_comment()}
<svg version="1.1"
    xmlns:dc="http://purl.org/dc/elements/1.1/"
    xmlns:cc="http://creativecommons.org/ns#"
    xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"
    xmlns="http://www.w3.org/2000/svg"
    width="{CARD_WIDTH}px" height="{CARD_HEIGHT}px"
    viewBox="0 0 {CARD_WIDTH} {CARD_HEIGHT}" role="img" aria-labelledby="title desc">
  <title id="title">{title}</title>
{rdf_metadata(title)}
    <desc id="desc">Traditional-style 52-card French SVG deck.</desc>
  <defs>
    <linearGradient id="paperGradient" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#fffdf6"/>
      <stop offset="100%" stop-color="#f5eddc"/>
    </linearGradient>
    <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="6" stdDeviation="8" flood-color="#000000" flood-opacity="0.18"/>
    </filter>
{suit_defs()}
  </defs>
  {body}
    <rect x="{CUTLINE_X}" y="{CUTLINE_Y}" width="{CUTLINE_WIDTH}" height="{CUTLINE_HEIGHT}" rx="{CUTLINE_RX}" fill="none" stroke="#2a241c" stroke-opacity="0.32" stroke-width="{CUTLINE_STROKE_WIDTH}"/>
</svg>
'''


def card_frame() -> str:
    """Return a plain paper base aligned with the optical outer cutline."""

    return f'''  <rect x="{CUTLINE_X}" y="{CUTLINE_Y}" width="{CUTLINE_WIDTH}" height="{CUTLINE_HEIGHT}" rx="{CUTLINE_RX}" fill="url(#paperGradient)"/>'''


def front_suit_frame(suit: Suit) -> str:
    """Return a suit-accent frame and center divider for front card faces."""

    return f'''  <rect x="{format_number(FRONT_FRAME_X)}" y="{format_number(FRONT_FRAME_Y)}" width="{format_number(FRONT_FRAME_WIDTH)}" height="{format_number(FRONT_FRAME_HEIGHT)}" rx="{FRONT_FRAME_RX}" fill="none" stroke="{suit.accent}" stroke-width="{FRONT_FRAME_STROKE_WIDTH}"/>
    <line x1="{format_number(FRONT_FRAME_X)}" y1="{format_number(CENTER_Y)}" x2="{format_number(FRONT_FRAME_X + FRONT_FRAME_WIDTH)}" y2="{format_number(CENTER_Y)}" stroke="{suit.accent}" stroke-width="{format_number(FRONT_FRAME_STROKE_WIDTH)}"/>'''


def load_french_suit_shapes() -> dict[str, str]:
    """Load French suit <g> graphics from merkel_french/suits/*.svg files."""

    suits_dir = Path(__file__).resolve().parent / "suits"
    shapes: dict[str, str] = {}
    for suit_key, filename in FRENCH_SUIT_FILES.items():
        raw_svg = (suits_dir / filename).read_text(encoding="utf-8")
        start = raw_svg.find("<g")
        end = raw_svg.rfind("</g>")
        if start == -1 or end == -1 or end <= start:
            raise ValueError(f"Suit SVG has no usable <g> block: {filename}")
        shapes[suit_key] = raw_svg[start:end + 4]
    return shapes


FRENCH_SUIT_SHAPES = load_french_suit_shapes()


def suit_shape_svg(suit: Suit) -> str:
    """Return the full inline SVG shape for one French suit symbol."""

    try:
        return FRENCH_SUIT_SHAPES[suit.key]
    except KeyError as error:
        raise ValueError(f"Unknown suit: {suit.key}") from error


def suit_defs() -> str:
    """Return inline suit defs so symbols are self-contained per generated SVG."""

    parts = ["    <g id=\"suitSymbols\">"]
    for suit in SUITS:
        parts.append(f'      <g id="suit-{suit.key}">')
        parts.append("        " + suit_shape_svg(suit).replace("\n", "\n        "))
        parts.append("      </g>")
    parts.append("    </g>")
    return "\n".join(parts)


def suit_symbol(suit: Suit, x: float, y: float, scale: float = 1.0, rotate: float = 0) -> str:
    """Render a French suit symbol using the source SVG path geometry."""

    return f'''<g transform="translate({format_number(x)} {format_number(y)}) rotate({format_number(rotate)}) scale({format_number(scale)}) translate(-50 -50)">
  {suit_shape_svg(suit)}
</g>'''


def pip_layout(count: int) -> list[dict[str, float]]:
    """Return pip coordinates for the numbered cards - simplified for small scale readability."""

    layouts: dict[int, list[dict[str, float]]] = {
        1: [{"X": 375, "Y": 600, "R": 10, "S": 5.0}],
        2: [
            {"X": 375, "Y": 210, "R": 0, "S": 2.6},
            {"X": 375, "Y": 460, "R": 0, "S": 2.6},
        ],
        3: [
            {"X": 375, "Y": 510, "R": 0, "S": 1.9},
            {"X": 375, "Y": 340, "R": 0, "S": 2.3},
            {"X": 375, "Y": 170, "R": 0, "S": 1.9},
        ],
        4: [
            {"X": 200, "Y": 470, "R": 0, "S": 2.9},
            {"X": 200, "Y": 210, "R": 0, "S": 2.9},
            {"X": 550, "Y": 470, "R": 0, "S": 2.9},
            {"X": 550, "Y": 210, "R": 0, "S": 2.9},
        ],
        5: [
            {"X": 200, "Y": 500, "R": 0, "S": 2.2},
            {"X": 200, "Y": 180, "R": 0, "S": 2.2},
            {"X": 550, "Y": 500, "R": 0, "S": 2.2},
            {"X": 550, "Y": 180, "R": 0, "S": 2.2},
            {"X": 375, "Y": 340, "R": 0, "S": 3.0},
        ],
        6: [
            {"X": 200, "Y": 500, "R": 0, "S": 2.2},
            {"X": 200, "Y": 345, "R": 0, "S": 2.2},
            {"X": 200, "Y": 190, "R": 0, "S": 2.2},
            {"X": 550, "Y": 500, "R": 0, "S": 2.2},
            {"X": 550, "Y": 345, "R": 0, "S": 2.2},
            {"X": 550, "Y": 190, "R": 0, "S": 2.2},
        ],
        7: [
            {"X": 200, "Y": 500, "R": 0, "S": 2.0},
            {"X": 200, "Y": 390, "R": 0, "S": 2.0},
            {"X": 200, "Y": 280, "R": 0, "S": 2.0},
            {"X": 375, "Y": 200, "R": 0, "S": 2.7},
            {"X": 550, "Y": 500, "R": 0, "S": 2.0},
            {"X": 550, "Y": 390, "R": 0, "S": 2.0},
            {"X": 550, "Y": 280, "R": 0, "S": 2.0},
        ],
        8: [
            {"X": 200, "Y": 510, "R": 0, "S": 2.0},
            {"X": 200, "Y": 400, "R": 0, "S": 2.0},
            {"X": 200, "Y": 290, "R": 0, "S": 2.0},
            {"X": 200, "Y": 180, "R": 0, "S": 2.0},
            {"X": 550, "Y": 510, "R": 0, "S": 2.0},
            {"X": 550, "Y": 400, "R": 0, "S": 2.0},
            {"X": 550, "Y": 290, "R": 0, "S": 2.0},
            {"X": 550, "Y": 180, "R": 0, "S": 2.0},
        ],
        9: [
            {"X": 200, "Y": 500, "R": 0, "S": 1.8},
            {"X": 200, "Y": 390, "R": 0, "S": 1.8},
            {"X": 200, "Y": 280, "R": 0, "S": 1.8},
            {"X": 375, "Y": 440, "R": 0, "S": 2.1},
            {"X": 375, "Y": 330, "R": 0, "S": 2.1},
            {"X": 375, "Y": 220, "R": 0, "S": 2.1},
            {"X": 550, "Y": 500, "R": 0, "S": 1.8},
            {"X": 550, "Y": 390, "R": 0, "S": 1.8},
            {"X": 550, "Y": 280, "R": 0, "S": 1.8},
        ],
        10: [
            {"X": 200, "Y": 450, "R": 0, "S": 1.9},
            {"X": 200, "Y": 360, "R": 0, "S": 1.9},
            {"X": 200, "Y": 270, "R": 0, "S": 1.9},
            {"X": 200, "Y": 180, "R": 0, "S": 1.9},
            {"X": 550, "Y": 450, "R": 0, "S": 1.9},
            {"X": 550, "Y": 360, "R": 0, "S": 1.9},
            {"X": 550, "Y": 270, "R": 0, "S": 1.9},
            {"X": 550, "Y": 180, "R": 0, "S": 1.9},
            {"X": 375, "Y": 500, "R": 0, "S": 2.2},
            {"X": 375, "Y": 330, "R": 0, "S": 2.2},
        ],
    }
    try:
        return layouts[count]
    except KeyError as error:
        raise ValueError(f"No pip layout defined for {count}") from error


def corner_suit_layout(rank_key: str) -> list[dict[str, float]]:
    """Return decorative corner-suit placements for court-card front artwork."""

    layouts: dict[str, list[dict[str, float]]] = {
        "könig": [{"X": 150, "Y": 430, "R": -30, "S": 2.4}],
        "ober": [{"X": 120, "Y": 400, "R": -30, "S": 2.0}],
        "unter": [{"X": 150, "Y": 760, "R": -30, "S": 2.4}],
    }
    try:
        return layouts[rank_key]
    except KeyError as error:
        raise ValueError(f"No corner suit layout defined for {rank_key}") from error


def roman_numeral_for_rank(rank: Rank) -> str:
    """Return the Roman numeral for numeric ranks 2..10, or empty for non-numeric ranks."""

    numerals = {
        2: "II",
        3: "III",
        4: "IV",
        5: "V",
        6: "VI",
        7: "VII",
        8: "VIII",
        9: "IX",
        10: "X",
    }
    return numerals.get(rank.value, "")


def number_overlay(rank: Rank, config_by_rank: dict[int, NumberOverlayConfig]) -> str:
    """Return Roman numeral overlay SVG for numeric front faces."""

    numeral = roman_numeral_for_rank(rank)
    if not numeral:
        return ""
    config = config_by_rank.get(rank.value)
    if config is None:
        return ""
    return (
        f'''<text x="{format_number(config.x)}" y="{format_number(config.y)}" text-anchor="middle" '''
        f'''font-size="{format_number(config.font_size)}" font-family="Times New Roman, serif" '''
        f'''font-weight="700" fill="{ROMAN_FILL}">{numeral}</text>'''
    )


def number_body(suit: Suit, rank: Rank, overlay_config_by_rank: dict[int, NumberOverlayConfig]) -> str:
    """Build the interior artwork for a numbered card - simplified for readability."""

    layout = pip_layout(rank.value)
    symbols = "\n".join(
        suit_symbol(suit, pip["X"], pip["Y"], pip["S"], pip["R"])
        for pip in layout
    )
    overlay = number_overlay(rank, overlay_config_by_rank)
    top_content = f"{symbols}\n  {overlay}" if overlay else symbols
    mirrored_transform = (
        f"translate({format_number(CENTER_X)} {format_number(CENTER_Y)}) "
        f"rotate(180) translate(-{format_number(CENTER_X)} -{format_number(CENTER_Y)})"
    )
    return f'''{top_content}
  <g transform="{mirrored_transform}">
    {top_content}
  </g>'''


def figure_top(suit: Suit, rank: Rank) -> str:
    """Build one mirrored half of a court-card illustration - simplified for small sizes."""

    if rank.key == "unter":
        title = "UNTER"
        crown = f'''    <path d="M -48 -124 L -24 -92 L 0 -114 L 24 -92 L 48 -124 M -40 -100 L 40 -100" fill="none" stroke="{suit.banner}" stroke-width="3" stroke-linecap="round"/>'''
    elif rank.key == "ober":
        title = "OBER"
        crown = f'''    <path d="M -54 -118 L -18 -88 L 0 -108 L 18 -88 L 54 -118 M -44 -94 L 44 -94" fill="none" stroke="{suit.banner}" stroke-width="3" stroke-linecap="round"/>'''
    elif rank.key == "könig":
        title = "KÖNIG"
        crown = f'''    <path d="M -60 -120 L -30 -80 L 0 -110 L 30 -80 L 60 -120 M -50 -90 L 50 -90" fill="none" stroke="{suit.banner}" stroke-width="4" stroke-linecap="round"/>
    <circle cx="-30" cy="-106" r="4" fill="{suit.accent}"/>
    <circle cx="0" cy="-115" r="4" fill="{suit.accent}"/>
    <circle cx="30" cy="-106" r="4" fill="{suit.accent}"/>'''
    else:
        raise ValueError(f"Unsupported face rank: {rank.key}")

    suit_badge = suit_symbol(suit, 0, 60, 0.7, 0)
    return f'''  <g transform="translate(375 380)">
    <circle cx="0" cy="-110" r="72" fill="#efdcc2" stroke="{suit.dark}" stroke-width="4"/>
    {crown}
    <path d="M -80 50 Q -60 120, 0 140 Q 60 120, 80 50 Z" fill="{suit.figure}" stroke="{suit.dark}" stroke-width="4"/>
    <path d="M -60 50 Q -40 100, 0 110 Q 40 100, 60 50 Z" fill="#f2dfbf" stroke="{suit.dark}" stroke-width="3"/>
    <path d="M -40 50 L -40 140 M 40 50 L 40 140" fill="none" stroke="{suit.dark}" stroke-width="3"/>
    <path d="M -76 145 H 76" fill="none" stroke="{suit.banner}" stroke-width="3"/>
    {suit_badge}
    <text x="0" y="190" text-anchor="middle" font-size="44" font-family="Georgia, Times New Roman, serif" font-weight="700" fill="{suit.banner}">{title}</text>
  </g>'''


def face_body(suit: Suit, rank: Rank) -> str:
    """Build the full mirrored body for a court card - simplified."""

    upper_frame_center_y = FRONT_FRAME_Y + (FRONT_FRAME_HEIGHT / 4)
    court_art_offset_y = upper_frame_center_y - CENTER_Y
    mirrored_court_transform = (
        f"translate({format_number(CENTER_X)} {format_number(CENTER_Y)}) "
        f"rotate(180) translate(-{format_number(CENTER_X)} -{format_number(CENTER_Y)})"
    )
    corner_symbols = "\n".join(
        suit_symbol(suit, pip["X"], pip["Y"], pip["S"], pip["R"])
        for pip in corner_suit_layout(rank.key)
    ) if rank.key in {"könig", "ober", "unter"} else ""

    if rank.key == "könig":
        court_group = f'''  <g transform="translate(0 {format_number(court_art_offset_y)})">
    <ellipse cx="{format_number(CENTER_X)}" cy="{format_number(CENTER_Y)}" rx="160" ry="240" fill="#fbf6ec" stroke="{suit.banner}" stroke-width="4"/>
    <text x="{format_number(CENTER_X)}" y="{format_number(COURT_EMOJI_BASELINE_Y)}" text-anchor="middle" dominant-baseline="middle" font-size="{format_number(COURT_EMOJI_FONT_SIZE)}">&#x1FAC5;&#x1F3FB;</text>
    {corner_symbols}
  </g>'''
        return f'''{court_group}
    <g transform="{mirrored_court_transform}">
        {court_group}
    </g>'''

    if rank.key == "ober":
        court_group = f'''  <g transform="translate(0 {format_number(court_art_offset_y)})">
    <ellipse cx="{format_number(CENTER_X)}" cy="{format_number(CENTER_Y)}" rx="160" ry="240" fill="#fbf6ec" stroke="{suit.banner}" stroke-width="4"/>
    <text x="{format_number(CENTER_X)}" y="{format_number(COURT_EMOJI_BASELINE_Y)}" text-anchor="middle" dominant-baseline="middle" font-size="{format_number(COURT_EMOJI_FONT_SIZE)}">&#x1F3C7;</text>
    {corner_symbols}
  </g>'''
        return f'''{court_group}
    <g transform="{mirrored_court_transform}">
        {court_group}
    </g>'''

    if rank.key == "unter":
        court_group = f'''  <g transform="translate(0 {format_number(court_art_offset_y)})">
    <ellipse cx="{format_number(CENTER_X)}" cy="{format_number(CENTER_Y)}" rx="160" ry="240" fill="#fbf6ec" stroke="{suit.banner}" stroke-width="4"/>
    <text x="{format_number(CENTER_X)}" y="{format_number(COURT_EMOJI_BASELINE_Y)}" text-anchor="middle" dominant-baseline="middle" font-size="{format_number(COURT_EMOJI_FONT_SIZE)}">&#x1F472;</text>
    {corner_symbols}
  </g>'''
        return f'''{court_group}
    <g transform="{mirrored_court_transform}">
        {court_group}
    </g>'''

    top = figure_top(suit, rank)
    return f'''  <ellipse cx="{format_number(CENTER_X)}" cy="{format_number(CENTER_Y)}" rx="160" ry="240" fill="#fbf6ec" stroke="{suit.banner}" stroke-width="4"/>
  <path d="M188 600 H562" fill="none" stroke="{suit.banner}" stroke-width="3"/>
  {top}
  <g transform="translate(0 1200) scale(1 -1)">
    {top}
  </g>'''


def ace_body(suit: Suit) -> str:
    """Build the body for an Ace, showing a large centered suit symbol - simplified."""

    ace_pip = pip_layout(1)[0]
    large_symbol = suit_symbol(suit, ace_pip["X"], ace_pip["Y"], ace_pip["S"], ace_pip["R"])
    return f'''  <ellipse cx="{format_number(CENTER_X)}" cy="{format_number(CENTER_Y)}" rx="160" ry="240" fill="#fbf6ec" stroke="{suit.banner}" stroke-width="4"/>
  {large_symbol}'''


def card_svg(suit: Suit, rank: Rank, overlay_config_by_rank: dict[int, NumberOverlayConfig]) -> str:
    """Assemble a complete SVG document for one card face."""

    title = f"{rank.name} of {suit.name}"
    body = "\n".join(
        (
            card_frame(),
            front_suit_frame(suit),
            ace_body(suit) if rank.key == "ass" else (face_body(suit, rank) if rank.face else number_body(suit, rank, overlay_config_by_rank)),
        )
    )
    return svg_document(body, title)


def back_svg(title: str) -> str:
    """Build the shared card-back SVG document - simplified for readability."""

    body = f'''  <rect x="{CUTLINE_X}" y="{CUTLINE_Y}" width="{CUTLINE_WIDTH}" height="{CUTLINE_HEIGHT}" rx="{CUTLINE_RX}" fill="#efe4c8" stroke="#1f1b16" stroke-width="5" filter="url(#shadow)"/>
    <rect x="33" y="33" width="684" height="1134" rx="32" fill="#6f1f23" stroke="#ecd5a4" stroke-width="4"/>
    <rect x="59" y="59" width="632" height="1082" rx="26" fill="none" stroke="#f8eed6" stroke-width="2"/>
    <text x="375" y="280" text-anchor="middle" font-size="104" font-family="Georgia, Times New Roman, serif" letter-spacing="8" fill="#f8eed6" font-weight="700">KARTEN</text>
  <circle cx="375" cy="600" r="200" fill="none" stroke="#ecd5a4" stroke-width="6"/>
  <circle cx="375" cy="600" r="160" fill="none" stroke="#f8eed6" stroke-width="3" stroke-dasharray="12 14"/>
  <path d="M375 384 L425 524 L550 524 L450 594 L500 734 L375 664 L250 734 L300 594 L200 524 L325 524 Z" fill="#ecd5a4" stroke="#f8eed6" stroke-width="5"/>
    <text x="375" y="950" text-anchor="middle" font-size="92" font-family="Georgia, Times New Roman, serif" letter-spacing="6" fill="#f8eed6">FRANCAIS</text>'''
    return svg_document(body, title)


def inline_svg_fragment(svg_text: str) -> str:
    """Strip the outer SVG wrapper so content can be embedded inside a nested SVG."""

    svg_start = svg_text.find("<svg")
    if svg_start == -1:
        raise ValueError("Invalid SVG document for inlining")
    start = svg_text.find(">", svg_start)
    end = svg_text.rfind("</svg>")
    if start == -1 or end == -1 or end <= start:
        raise ValueError("Invalid SVG document for inlining")
    return svg_text[start + 1:end].strip()


def contact_sheet_item(index: int, label: str, svg_text: str) -> str:
    """Build one positioned thumbnail entry for the contact sheet."""

    column = index % SHEET_COLUMNS
    row = index // SHEET_COLUMNS
    x = SHEET_MARGIN_X + (column * (SHEET_THUMB_WIDTH + SHEET_GAP_X))
    y = SHEET_MARGIN_Y + (row * (SHEET_THUMB_HEIGHT + SHEET_GAP_Y))
    inline_svg = inline_svg_fragment(svg_text)
    return f'''  <g transform="translate({x} {y})">
    <svg x="0" y="0" width="{SHEET_THUMB_WIDTH}" height="{SHEET_THUMB_HEIGHT}" viewBox="0 0 {CARD_WIDTH} {CARD_HEIGHT}">
      {inline_svg}
    </svg>
        <text x="{round(SHEET_THUMB_WIDTH / 2)}" y="{round(SHEET_THUMB_HEIGHT + SHEET_LABEL_Y_OFFSET)}" text-anchor="middle" font-size="14" font-family="Georgia, Times New Roman, serif" fill="#3b3025">{label}</text>
  </g>'''


def contact_sheet(suits: tuple[Suit, ...], ranks: tuple[Rank, ...], overlay_config_by_rank: dict[int, NumberOverlayConfig]) -> str:
    """Build a preview sheet that embeds all generated card faces."""

    cards = [
        (suit, rank, card_svg(suit, rank, overlay_config_by_rank))
        for suit in suits
        for rank in ranks
    ]
    card_rows = (len(cards) + SHEET_COLUMNS - 1) // SHEET_COLUMNS
    items = [
        contact_sheet_item(index, f"{rank.name} of {suit.name}", svg_text)
        for index, (suit, rank, svg_text) in enumerate(cards)
    ]

    # Add card back centered at the bottom
    back_x = round((SHEET_WIDTH - SHEET_THUMB_WIDTH) / 2)
    back_y = SHEET_MARGIN_Y + card_rows * (SHEET_THUMB_HEIGHT + SHEET_GAP_Y) + SHEET_GAP_Y
    inline_back_svg = inline_svg_fragment(back_svg("Cards French Double Card Back"))
    back_item = f'''  <g transform="translate({back_x} {back_y})">
        <svg x="0" y="0" width="{SHEET_THUMB_WIDTH}" height="{SHEET_THUMB_HEIGHT}" viewBox="0 0 {CARD_WIDTH} {CARD_HEIGHT}">
          {inline_back_svg}
        </svg>
        <text x="{round(SHEET_THUMB_WIDTH / 2)}" y="{round(SHEET_THUMB_HEIGHT + SHEET_LABEL_Y_OFFSET)}" text-anchor="middle" font-size="14" font-family="Georgia, Times New Roman, serif" fill="#3b3025">Card Back</text>
  </g>'''
    items.append(back_item)

    sheet_height = back_y + SHEET_THUMB_HEIGHT + SHEET_LABEL_Y_OFFSET + SHEET_MARGIN_Y

    title = "Cards French Double Contact Sheet"
    return f'''<?xml version="1.0" encoding="UTF-8" standalone="no"?>
{svg_license_comment()}
<svg version="1.1"
    xmlns:dc="http://purl.org/dc/elements/1.1/"
    xmlns:cc="http://creativecommons.org/ns#"
    xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"
    xmlns="http://www.w3.org/2000/svg"
    width="{SHEET_WIDTH}px" height="{sheet_height}px"
    viewBox="0 0 {SHEET_WIDTH} {sheet_height}">
        <title id="title">{title}</title>
{rdf_metadata(title)}
        <desc id="desc">Traditional-style 52-card French SVG deck preview.</desc>
    <rect width="{SHEET_WIDTH}" height="{sheet_height}" fill="#f6efdf"/>
    <text x="{round(SHEET_WIDTH / 2)}" y="52" text-anchor="middle" font-size="32" font-family="Georgia, Times New Roman, serif" letter-spacing="4" fill="#4e3723">CARTES FRANCAISES</text>
    <text x="{round(SHEET_WIDTH / 2)}" y="82" text-anchor="middle" font-size="15" font-family="Georgia, Times New Roman, serif" fill="#715740">Traditional-style 52-card French SVG deck preview</text>
{"\n".join(items)}
</svg>
'''


def write_text(path: Path, content: str) -> None:
    """Write UTF-8 text content to disk."""

    path.write_text(content, encoding="utf-8")


def generate(output_dir: Path, overlay_config_by_rank: dict[int, NumberOverlayConfig]) -> None:
    """Generate the full deck, back, and contact sheet into one folder."""

    output_dir.mkdir(parents=True, exist_ok=True)

    for suit in SUITS:
        for rank in RANKS:
            path = output_dir / f"{suit.file}_{rank.key}.svg"
            write_text(path, card_svg(suit, rank, overlay_config_by_rank))

    write_text(output_dir / "carte_french_double_back.svg", back_svg("Cards French Double Card Back"))
    write_text(output_dir / "carte_french_double_sheet.svg", contact_sheet(SUITS, RANKS, overlay_config_by_rank))


def parse_args() -> argparse.Namespace:
    """Parse the CLI arguments for the deck generator."""

    parser = argparse.ArgumentParser(
        description="Generate a traditional-style 52-card French SVG deck."
    )
    parser.add_argument(
        "output_dir",
        nargs="?",
        default=Path(__file__).resolve().parent,
        type=Path,
        help="Directory to write the generated SVG files into.",
    )
    return parser.parse_args()


def main() -> None:
    """Run the command-line generator."""

    args = parse_args()
    generate(args.output_dir, ROMAN_OVERLAY_BY_RANK)


if __name__ == "__main__":
    main()
