"""Regression tests for deck SVG generator scripts."""

from __future__ import annotations

import importlib.util
import sys
import tempfile
import unittest
import xml.etree.ElementTree as ET
from pathlib import Path
from types import ModuleType
from typing import ClassVar

ROOT_DIR = Path(__file__).resolve().parents[5]
GERMAN_GENERATOR = (
    ROOT_DIR
    / "javascript"
    / "html5"
    / "src"
    / "img"
    / "deck"
    / "merkel_deutsch"
    / "generate_cards_german_double.py"
)
FRENCH_GENERATOR = (
    ROOT_DIR
    / "javascript"
    / "html5"
    / "src"
    / "img"
    / "deck"
    / "merkel_french"
    / "generate_cards_french_double.py"
)


def load_module(module_name: str, path: Path) -> ModuleType:
    """Load a Python module from a file path."""

    spec = importlib.util.spec_from_file_location(module_name, path)
    if spec is None or spec.loader is None:
        raise RuntimeError(f"Cannot create module spec for {path}")
    module = importlib.util.module_from_spec(spec)
    sys.modules[module_name] = module
    spec.loader.exec_module(module)
    return module


class DeckGeneratorRegressionTest(unittest.TestCase):
    """Protect against inlining regressions and title consistency issues."""

    german: ClassVar[ModuleType]
    french: ClassVar[ModuleType]

    @classmethod
    def setUpClass(cls) -> None:
        cls.german = load_module(
            "generate_cards_german_double",
            GERMAN_GENERATOR,
        )
        cls.french = load_module(
            "generate_cards_french_double",
            FRENCH_GENERATOR,
        )

    def test_inline_svg_fragment_handles_xml_preamble(self) -> None:
        """Ensure wrapper stripping starts from the real root <svg> tag."""

        sample = (
            "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n"
            "<!--header-->\n"
            "<svg xmlns=\"http://www.w3.org/2000/svg\" "
            "width=\"10\" height=\"10\">\n"
            "  <g id=\"a\"><rect x=\"1\" y=\"1\" "
            "width=\"2\" height=\"2\"/></g>\n"
            "</svg>\n"
        )

        german_inner = self.german.inline_svg_fragment(sample)
        french_inner = self.french.inline_svg_fragment(sample)

        self.assertIn('<g id="a">', german_inner)
        self.assertNotIn("<svg", german_inner)
        self.assertIn('<g id="a">', french_inner)
        self.assertNotIn("<svg", french_inner)

    def test_inline_svg_fragment_rejects_invalid_input(self) -> None:
        """Ensure invalid SVG wrapper content fails fast."""

        with self.assertRaises(ValueError):
            self.german.inline_svg_fragment("<g></g>")
        with self.assertRaises(ValueError):
            self.french.inline_svg_fragment("<g></g>")

    def test_generated_sheets_are_well_formed_xml(self) -> None:
        """Generate both decks and parse contact sheets as XML."""

        with tempfile.TemporaryDirectory() as tmp:
            temp_dir = Path(tmp)
            german_out = temp_dir / "german"
            french_out = temp_dir / "french"

            self.german.generate(german_out, self.german.ROMAN_OVERLAY_BY_RANK)
            self.french.generate(french_out, self.french.ROMAN_OVERLAY_BY_RANK)

            ET.parse(german_out / "carte_german_double_sheet.svg")
            ET.parse(french_out / "carte_french_double_sheet.svg")

    def test_french_title_connector_is_of(self) -> None:
        """Ensure mixed naming uses the English connector wording."""

        spades = next(s for s in self.french.SUITS if s.key == "spades")
        koenig = next(r for r in self.french.RANKS if r.key == "könig")

        card = self.french.card_svg(
            spades,
            koenig,
            self.french.ROMAN_OVERLAY_BY_RANK,
        )
        sheet = self.french.contact_sheet(
            self.french.SUITS,
            self.french.RANKS,
            self.french.ROMAN_OVERLAY_BY_RANK,
        )

        self.assertIn("König of Spades", card)
        self.assertNotIn("König de Spades", card)
        self.assertIn("König of Spades", sheet)
        self.assertNotIn("König de Spades", sheet)


if __name__ == "__main__":
    unittest.main()
