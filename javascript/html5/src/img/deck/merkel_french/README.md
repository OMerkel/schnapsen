# German Cards with French Suits Doublefaced

Copyright 2026 Oliver Merkel, <merkel.oliver@web.de>

## Structure

52-card French deck with these four suits:

- Clubs
- Diamonds
- Hearts
- Spades

Each suit contains these ranks:

- Ass (Ace)
- 10
- König
- Ober
- Unter
- 9
- 8
- 7
- 6
- 5
- 4
- 3
- 2

## Assets

Run the generator to create the complete SVG deck in this folder:

```bash
python generate_cards_french_double.py
```

Or run the VS Code task `Generate Cards French Double Deck`.

Generated files:

- `clubs_ass.svg` through `clubs_2.svg`
- `diamonds_ass.svg` through `diamonds_2.svg`
- `hearts_ass.svg` through `hearts_2.svg`
- `spades_ass.svg` through `spades_2.svg`
- `carte_french_double_back.svg`
- `carte_french_double_sheet.svg`

The card faces use French suit graphics from `suits/clubs.svg`,
`suits/diamonds.svg`, `suits/hearts.svg`, and `suits/spades.svg`, and are
rendered as traditional-style vector artwork that remains lightweight and
editable.
