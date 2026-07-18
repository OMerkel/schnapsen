# Schnapsen (2 Spieler) - Traditionelle Regeln

Schnapsen ist ein Stichkartenspiel für zwei Spieler. Ziel jeder Hand ist es, durch Stiche und Paaransagen (gleichfarbiger **König + Ober**) genügend Augen aufzubauen und den Handgewinn dann aktiv durch **66-Ansage** als Ausspieler mit erfüllter Gewinnbedingung zu beanspruchen.

Hinweis zur Terminologie: In diesem Repository wird die stechende Farbe als **Atout** bezeichnet. Der Begriff **Trumpf** wird hier bewusst durch **Atout** ersetzt.

## 1. Karten und Kartenwerte

Gespielt wird mit einem 20er Blatt (deutsches Blatt oder entsprechendes Pendant):

- Ass = 11 Augen
- Zehn = 10 Augen
- König = 4 Augen
- Ober = 3 Augen
- Unter = 2 Augen

Diese haben vier Kartenfarben: Eichel, Blatt, Herz, Schellen

Gesamtwert aller Stichkarten im Blatt: 120 Augen.

### Variante: 24 Karten (mit 9)

In dieser Variante wird pro Farbe die **9** hinzugefügt (insgesamt 24 Karten).

- Die 9 zählt **0 Augen**.
- Die Rangfolge lautet dann (hoch nach niedrig): **Ass, Zehn, König, Ober, Unter, 9**.
- Der Zielwert bleibt **66 Augen**.

Auch in der 24-Karten-Variante bleibt der Gesamtwert der zählenden Stichkarten 120 Augen.

## 2. Spielziel

Eine Hand gewinnt, wer als aktiver Ausspieler **66 ansagt**, sobald er aus Stichen und Paaransagen **mindestens 66 Augen** hat.

## 3. Geben und Atout

1. Der Geber wird zufällig bestimmt.
2. Jeder Spieler erhält 5 Karten.
3. Die restlichen Karten bilden verdeckt den Talon.
4. Die oberste Talonkarte wird aufgedeckt; ihre Farbe ist Atout.
   Der Talon wird quer über die offene Atout-Karte gelegt, sodass diese halbsichtbar bleibt.
   Visualer Zustand bei offenem Talon: der verdeckte Talon liegt teilweise auf der offenen Atout-Karte.
5. Vorhand (Nicht-Geber) spielt zum ersten Stich aus.

## 4. Stichregeln

### Solange der Talon offen ist

- Der Ausspieler darf eine beliebige seiner Karten spielen.
- Der zweite Spieler darf ebenfalls jede Karte zugeben (kein Farbzwang).
- Den Stich gewinnt die höhere Karte der ausgespielten Farbe, außer es wird Atout gespielt; jedes Atout sticht jede Nicht-Atoutkarte.
- Bei zwei Atouts gewinnt das höhere Atout.
- Hat der aktive Ausspieler die niedrigste Atout-Karte auf der Hand, darf er sie vor dem Ausspiel mit der offenen Atout-Karte unter dem Talon tauschen.
   Im 24er Blatt ist die niedrigste Atout die 9, im 20er Blatt der Unter.

Rangfolge im 20er Blatt (hoch nach niedrig): **Ass, Zehn, König, Ober, Unter**.

Nach jedem Stich:

1. Der Stichgewinner nimmt die beiden Stichkarten verdeckt vor sich ab. Ihre Augen werden seinem Punktestand zugerechnet.
2. Der Stichgewinner zieht zuerst die oberste verdeckte Talonkarte.
3. Danach zieht der andere Spieler.
4. Werden dabei die letzten zwei Talonkarten gezogen, nimmt der Stichgewinner die letzte verdeckte Talonkarte und der andere Spieler die offene Atout-Karte.
5. Der Stichgewinner ist aktiver Ausspieler für den nächsten Stich.

Zwischen Stichgewinn und dem nächsten Ausspiel darf der aktive Ausspieler (in beliebiger Reihenfolge, soweit anwendbar):

- 66 ansagen (siehe Abschnitt 7).
- Die niedrigste Atout-Karte tauschen (siehe unten).
- Den Talon schließen (siehe Abschnitt 6).
- Eine Marriage ansagen (siehe Abschnitt 5).

Alle diese Aktionen passieren **vor** dem Ausspielen der nächsten Stichkarte.

Edge-Case-Klarstellung: Die Reihenfolge ist absichtlich flexibel. Wenn alle
Voraussetzungen erfüllt sind, sind beide Workflow-Familien legal:

- `swap-atout -> close-talon -> announce-marriage -> declare-66`
- `swap-atout -> announce-marriage -> close-talon -> (angesagten König/Ober ausspielen oder 66 ansagen)`

Nach `announce-marriage` bleibt die Marriage-Führungsbindung aktiv (es muss der
angesagte König oder Ober ausgespielt werden), außer eine zulässige `declare-66`
Ansage beendet die Hand vorher.

### Niedrigste Atout-Karte tauschen

Hält der aktive Ausspieler die niedrigste Atout-Karte (Unter im 20er Blatt, 9 im 24er Blatt), darf er sie vor dem Ausspiel mit der offenen Atout-Karte unter dem Talon tauschen.

Einschränkungen:

- Der Talon muss offen sein (nicht geschlossen und nicht erschöpft).
- Es müssen mehr als zwei Karten im Talonbereich vorhanden sein (die offene Atout-Karte plus mindestens zwei verdeckte Talonkarten). Sind nur noch die offene Atout-Karte und eine verdeckte Talonkarte vorhanden, ist kein Tausch erlaubt.

Der Tausch beendet den Zug nicht; danach wird normal ausgespielt.

### Wenn der Talon aufgebraucht oder geschlossen ist

Es gelten strenge Zugregeln:

1. Farbe muss bedient werden, wenn möglich.
2. Beim Bedienen muss gestochen werden, wenn möglich.
3. Kann nicht bedient werden, muss Atout gespielt werden, wenn möglich.
4. Nur wenn beides nicht möglich ist, darf beliebig abgeworfen werden.

## 5. Marriage (König + Ober)

Eine Marriage (ein Paar aus passendem König und Ober) darf nur vom aktiven Ausspieler angesagt werden.
Die Ansage gilt also nur und kann nur gemacht werden, wenn man als Ausspieler auch gerade an der Reihe ist. Ansonsten muss man warten, bis man wieder an der Reihe ist.

- Ein Marriage wird angesagt, indem beim Ausspiel entweder der König oder der Ober einer Farbe gelegt wird und die passende Partnerkarte auf der Hand ist. Man zeigt beide vor, spielt aber nur eine aus.
- Pro Ausspiel/Stich kann nur eine Marriage angesagt werden, da pro Stichbeginn genau eine Karte ausgespielt wird.
- Marriage in Nicht-Atout hat einen Wert von **20 Augen**.
- Atout-Marriage hat einen Wert von **40 Augen**.
- Marriage-Augen werden nur gewertet, wenn die Ansage vor dem Ausspiel von König/Ober dieser Farbe aktiv gemacht wird.
- Wird ohne Ansage ausgespielt, gibt es für diesen Stich keine Marriage-Augen.

Wichtig:

- Augen einer Marriage zählen nur, wenn der ansagende Spieler in dieser Hand mindestens einen Stich macht.
- Hat er bereits einen Stich, werden die Augen sofort gutgeschrieben.
- Sonst werden sie vorgemerkt und erst beim ersten eigenen Stich gewertet.
- Gewertete Marriage-Augen zählen für eine 66-Ansage.
- Hat der Ausspieler bereits mindestens einen Stich und bringt ihn die Marriage-Ansage auf 66 oder mehr, darf er sofort nach der Ansage 66 ansagen (noch vor dem Ausspiel einer Marriage-Karte).
- Hält ein Spieler gleichzeitig zwei marriage-fähige Farben, muss er die zweite Marriage auf ein späteres Ausspiel verschieben und dafür zuvor wieder den Stich gewinnen.

## 6. Talon schließen (optionale taktische Aktion)

Wer am Zug ist und ausspielt, kann den offenen Talon vor dem Ausspiel schließen.

Klarstellung bei vorgemerkter Marriage: Talon-Schließen bleibt nach
`announce-marriage` zulässig, solange noch keine Stichkarte ausgespielt wurde
und die Talon-Schließen-Voraussetzungen erfüllt sind.

Folgen des Schließens:

- Es wird nicht mehr vom Talon gezogen.
- Ab dann gelten sofort die strengen Zugregeln (Farbzwang, Stichzwang, Atout-Zwang).
- Der Schließer verpflichtet sich, mit den aktuell verbleibenden Handkarten 66 Augen zu erreichen und korrekt anzusagen.
- Visualer Zustand bei geschlossenem Talon: Talon und Atout bleiben als überlagerter Stapel sichtbar, Atout wird jedoch als Kartenrückseite dargestellt und liegt oberhalb des Talons.
- Ab geschlossenem Talon ist ein Atout-Tausch nicht mehr erlaubt.

Folgen bei gescheitertem Schließen:

- Erreicht der Schließer 66 Augen und sagt korrekt 66 an (als Ausspieler), gewinnt er normal (Wertung siehe Abschnitt 8).
- Erreicht der Schließer keine 66 Augen und sagt niemand 66 an, bevor die restlichen Karten ausgespielt sind, verliert der Schließer die Hand. Der Gegner erhält Spielpunkte nach Stichstatus des Schließers (siehe Abschnitt 8).

Wenn der Talon erschöpft ist:

- Talon- und Atout-Kartenstapel werden ausgeblendet.
- Das Atout-Symbol bleibt sichtbar und bis zum Handende gültig.
- Ab hier gelten strenge Zugregeln für die restlichen Stiche.
- Die Hand wird nur mit den verbleibenden Handkarten zu Ende gespielt.
- Wenn niemand 66 ansagt, gewinnt der Gewinner des letzten Stiches die Hand (siehe Abschnitt 7).

## 7. Ende der Hand

Eine Hand kann auf folgende Arten enden:

### 1. Korrekte 66-Ansage

Der aktive Ausspieler sagt **66** an, bevor er eine Karte zum nächsten Stich ausspielt. Hat der Ansagende zu diesem Zeitpunkt mindestens 66 Augen (Stichaugen plus bereits gewertete Marriage-Augen), gewinnt er die Hand sofort.

### 2. Falsche 66-Ansage

Der aktive Ausspieler sagt **66** an, hat aber weniger als 66 Augen. Er verliert die Hand sofort. Der Gegner erhält Spielpunkte (siehe Abschnitt 8).

### 3. Gescheitertes Talon-Schliessen

Der Schließer hat bis zum Ausspielen aller restlichen Karten keine korrekte 66-Ansage abgegeben. Der Schließer verliert die Hand. Der Gegner erhält Spielpunkte (siehe Abschnitt 8).

### 4. Keine Ansage bei nicht geschlossenem Talon

Wenn niemand 66 ansagt und alle Karten ausgespielt werden:

- Der Gewinner des **letzten Stiches** gewinnt die Hand.
- Der Gewinner erhält **genau 1 Spielpunkt**, unabhängig von den zuvor erreichten Augen.

### Zeitpunkt der 66-Ansage

- Das Ansagen von 66 ist nur beim Ausspiel erlaubt, bevor eine Stichkarte gelegt wurde.
- Nach einer Marriage-Ansage darf direkt danach 66 angesagt werden, wenn die gewerteten Marriage-Augen den Stand auf mindestens 66 bringen.
- Augen aus einem gerade laufenden (noch nicht abgeschlossenen) Stich zählen nicht für die Ansage; es zählen nur abgeschlossene Stiche und bereits gewertete Marriage-Augen.

## 8. Wertung der Hand (Spielpunkte)

### Korrekte 66-Ansage (oder erfolgreiches Schließen)

- Korrekte 66-Ansage bringt **2 Spielpunkte**, wenn der Gegner mindestens einen Stich hat.
- Korrekte 66-Ansage bringt **3 Spielpunkte**, wenn der Gegner keinen Stich gemacht hat (Schwarz).

### Falsche 66-Ansage oder gescheitertes Talon-Schließen

Für falsche 66-Ansage und gescheitertes Talon-Schließen gilt diese feste Strafwertung:

- Der Gegner erhält **2 Spielpunkte** als Standard.
- Der Gegner erhält **3 Spielpunkte**, wenn der fehlbare Spieler keinen Stich gemacht hat.

### Keine Ansage - letzter Stich entscheidet

- Gewinner des letzten Stiches erhält **1 Spielpunkt**.

## 9. Partiewertung

Mehrere Hände bilden eine Partie.

- Standard: Wer zuerst **7 Spielpunkte** erreicht, also 7 Bummerl holt, gewinnt die Partie.

Der Verlierer der Partie "bekommt ein Bummerl". In Österreich bedeutet ein Bummerl umgangssprachlich auch Pech zu haben oder zu verlieren.

Der Geber wechselt nach jeder Hand. Vorhand (Nicht-Geber) spielt zum ersten Stich aus.

## 10. Zugdarstellung in der UI

In dieser Umsetzung gibt es feste Sitzpositionen:

- **Player South** bleibt immer im unteren Handbereich.
- **Player North** bleibt immer im oberen Handbereich.
- Die Perspektive wechselt nie; nur die Sichtbarkeit der Karten wechselt je nach Zug.
- Die Hand des aktiven Spielers wird offen gezeigt.
- Die Hand des inaktiven Spielers wird als Kartenrückseiten gezeigt.
- Aktionsbuttons und Kartenklicks gelten immer für den aktuell aktiven Spieler.

---

Diese Fassung beschreibt die verbreiteten traditionellen Regeln für Schnapsen zu zweit mit Marriage (König-Ober-Paaren) und 20 oder 24 Karten.
