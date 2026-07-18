# Schnapsen (Two Players) - Traditional Rules

Schnapsen is a trick-taking card game for two players. The goal in each hand is to build enough card points through tricks and marriages (a suited pair of **King + Ober**) and then actively claim the win by declaring **66** while on lead and with the win condition fulfilled.

Terminology note: In this repository, **Atout** is the preferred term for the suit with beating priority (instead of **trump** or **Trumpf**).

## 1. Cards and Card Values

Use a 20-card deck (German or equivalent):

- Ace (Ass) = 11 points
- Ten (Zehn) = 10 points
- King (König) = 4 points
- Ober = 3 points
- Unter = 2 points

These span four card suits: Acorn ("Eichel"), Leaf ("Blatt"), Heart ("Herz"), Bell ("Schellen").

Total trick-card value in the deck: 120 points.

### Variant: 24 Cards (Including 9s)

In this variant, a **9** is added in each suit (24 cards total).

- The 9 is worth **0 points**.
- Rank order becomes (high to low): **Ace, Ten, King, Ober, Unter, 9**.
- The target remains **66 points**.

Even in the 24-card variant, the total value of counting trick cards remains 120 points.

## 2. Objective

Win the hand by declaring **66** as the active leader once you have at least **66 points** (from tricks and marriages).

Definition: The **active leader** (or "on lead") is the player whose turn it is to play the first card to the next trick.

## 3. Deal and Atout

1. Determine the dealer randomly.
2. Deal 5 cards to each player.
3. Place the remaining cards face down as the talon (stock).
4. Turn the top talon card face up; its suit is Atout.
   The talon is laid crosswise over the open Atout card so that the card remains half visible.
   Visual state while open: the face-down talon partly covers the open Atout card.
5. The non-dealer leads the first trick.

## 4. How Tricks Work

### While the talon is still open

- The leader may play any card.
- The second player may play any card (no suit-follow obligation).
- A trick is won by the higher card of the led suit, unless an Atout is played; any Atout beats any non-Atout.
- If both cards are Atout cards, the higher Atout rank wins.

After each trick (while talon is open):

1. The trick winner takes the trick cards face down in front of them. These card points are added to the winner's score.
2. The trick winner draws the top face-down card from the talon.
3. The other player draws next.
4. If this draw takes the last two cards: the trick winner takes the last face-down talon card, the other player takes the face-up Atout card.
5. The trick winner is now the active leader for the next trick.

Between winning a trick and leading the next card, the active leader may (in any order, as applicable):

- Declare 66 (see Section 7).
- Swap the lowest Atout card (see below).
- Close the talon (see Section 6).
- Announce a marriage (see Section 5).

All of these actions happen **before** leading a card to the next trick.

Edge-case clarification: This order is intentionally flexible. If all preconditions are met,
both of these workflow families are legal:

- `swap-atout -> close-talon -> announce-marriage -> declare-66`
- `swap-atout -> announce-marriage -> close-talon -> (lead announced King/Ober or declare-66)`

After `announce-marriage`, the marriage lead restriction still applies (you must lead
the announced King or Ober) unless a legal `declare-66` ends the hand first.

### Swapping the Lowest Atout Card

If the active leader holds the lowest-ranking Atout card (Unter in 20-card mode; 9 in 24-card mode), they may swap it with the face-up Atout card under the talon before leading.

Restrictions:

- The talon must be open (not closed and not exhausted).
- More than two cards must remain in the talon (i.e., the face-up Atout card plus at least two face-down cards). When only the face-up Atout card and one face-down card remain, no swap is allowed.

The swap does not end the turn; the player still leads a card afterward.

### When the talon is exhausted or closed

Once the talon is exhausted (all cards drawn) or has been closed (see Section 6), strict play rules apply for the remainder of the hand:

1. You must follow suit if possible.
2. If following suit, you must head the trick (play a higher card of that suit than any already played) if you can.
3. If you cannot follow suit, you must play an Atout card if possible.
4. If you can neither follow suit nor play Atout, you may play any card.

Failure to follow these rules in tournament play typically results in the offender losing the hand as if they had made a false 66 declaration.

## 5. Marriage (King + Ober)

A marriage is a matching pair of King and Ober in the same suit.

A marriage can only be announced by the active leader, before leading a card to the next trick. If you are not on lead, you must wait until you next win a trick and become the leader.

How to announce:

- Show both cards (King and Ober of the same suit) to the opponent.
- Then lead one of the two cards (King or Ober) as your trick card. You must play one of the marriage cards as your lead; announcing without playing one of the two cards is not allowed.
- Only one marriage can be announced per lead/trick, because one lead consists of exactly one played card.

Scoring:

- Marriage in a non-Atout suit: **20 points**.
- Marriage in the Atout suit: **40 points**.
- Marriage points are awarded **only** if the player explicitly announces the marriage before leading. Leading a King or Ober without announcing scores no marriage points.

When marriage points take effect:

- If the announcing player has already won at least one trick, marriage points are added to their score **immediately** upon announcement.
- If the announcing player has not yet won a trick, the marriage points are recorded but only added once that player wins their first trick.
- Applied marriage points count toward a 66 declaration.
- If you already have at least one trick and announcing a marriage pushes your total to 66 or more, you may declare 66 **immediately** after the announcement and before the trick is played out. The hand ends at that point.

Additional notes:

- Each suit's marriage can be scored at most once per hand.
- A player may score marriages in multiple suits across different leads.
- If two marriageable suits are held simultaneously, the player must announce one marriage on the current lead, win that trick to lead again, and then announce the second marriage on a later lead.
- Marriages may still be announced after the talon is closed or exhausted, provided the player is on lead and holds the required pair. The same trick-requirement for points applies.

## 6. Closing the Talon (Optional Tactical Action)

If you are the active leader and the talon is still open, you may close it before leading a card (and before or after any swap, marriage, or 66 declaration you wish to make on that turn).

Clarification for pending marriage intent: closing the talon remains legal after
`announce-marriage` as long as no trick card has been led yet and talon-close
preconditions are met.

Effects of closing:

- No more cards are drawn from the talon.
- From this point on, strict play rules (follow suit, head trick, play Atout if unable to follow suit) apply immediately.
- The closer commits to reaching 66 points with the cards currently in both players' hands.
- Atout swap is no longer allowed once the talon is closed.
- Visual state while closed: Talon and Atout remain shown as an overlaid stack, but the Atout card is displayed face down and appears above the talon.

Consequences if the closer fails:

- If the closer reaches 66 and declares it correctly while on lead, they win normally (see Section 8 for scoring).
- If the closer does not reach 66 and neither player declares 66 before cards run out, the closer **loses** the hand. The opponent scores game points based on the closer's trick status at that moment (see Section 8).

When the talon is exhausted (all cards drawn without closing):

- The talon and Atout card stack are hidden.
- The Atout suit indicator remains visible and valid until the hand ends.
- Strict play rules apply for the remaining tricks.
- Only the remaining hand cards are used to finish the hand.
- If neither player declares 66, the winner of the final trick wins the hand (see Section 7).

## 7. Ending the Hand

A hand can end in the following ways:

### 1. Correct declaration of 66

The active leader declares **66** before leading a card to the next trick. If the declarer's total (trick points plus applied marriage points) is 66 or more, they win the hand immediately. Play stops.

### 2. False declaration of 66

The active leader declares **66**, but their total is less than 66. The declarer **loses** the hand immediately. Play stops. The opponent scores game points (see Section 8).

### 3. Failed talon close

The closer did not declare 66 before all remaining cards were played out. The closer loses the hand. The opponent scores game points (see Section 8).

### 4. No declaration — cards run out (talon not closed by either player)

If neither player declares 66 and all cards are played out:

- The winner of the **final trick** wins the hand.
- The winner receives **exactly 1 game point**, regardless of either player's card-point total.

### Timing of 66 declarations

- Declaring 66 is only allowed when you are the active leader, **before** you lead a card to the next trick.
- You may declare 66 after announcing a marriage (if the marriage points bring you to 66 or more).
- Points from a trick that is currently in progress (not yet resolved) do not count toward a 66 declaration. Only points from completed tricks and applied marriages count.

## 8. Hand Scoring (Game Points)

After each hand, the winner receives game points as follows.

### Correct 66 declaration (or successful close)

Game points are determined by the **opponent's** status at the moment the hand ends:

| Opponent's status | Game points for winner |
| --- | --- |
| Opponent has won at least one trick | **2 game points** |
| Opponent has won no tricks (Schwarz) | **3 game points** |

### False 66 declaration or failed talon close

The non-faulting opponent wins the hand. Game points are determined by the **opponent's** (non-faulting player's) status at the moment the hand ends:

| Non-faulting player's status | Game points for non-faulting player |
| --- | --- |
| Non-faulting player has won at least one trick | **2 game points** |
| Non-faulting player has won no tricks | **3 game points** |

In other words: the penalty mirrors the normal scoring — the non-faulting player is scored as if they had made a correct 66 declaration against the faulting player.

### No declaration — final trick decides

- Winner of the final trick receives **1 game point**.

## 9. Match Scoring

Several hands form a match.

- Standard: the first player to reach **7 game points** wins the match.

The loser of the match "gets a Bummerl." In Austrian usage, a Bummerl refers to the loss of a complete match — colloquially associated with bad luck or losing.

The dealer alternates each hand. The player who did not deal leads the first trick.

## 10. Turn Presentation in UI

For this implementation, the board uses fixed seats:

- **Player South** always stays in the south hand area.
- **Player North** always stays in the north hand area.
- Seat perspective never swaps; only card face visibility changes by turn.
- Active player's hand cards are shown face-up.
- Inactive player's hand cards are shown as backfaces.
- Action panel buttons and card-play interaction always apply to the currently active player.

---

This rules text follows common traditional two-player Schnapsen with Marriage (King–Ober pairs) and 20 or 24 cards.
