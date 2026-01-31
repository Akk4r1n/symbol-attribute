# Agent: Aufbauplan

## Was macht dieses Feature?
Der Aufbauplan zeigt den physischen Aufbau der Verteilerschraenke (Schaltschraenke). Er zeigt, wie die Schutzgeraete auf DIN-Hutschienen angeordnet werden und wieviel Platz jeder Verteiler benoetigt.

### Nutzersicht
- Elektrofachkraft sieht, wie der Verteilerschrank bestuckt wird
- Pro Verteiler werden alle benoetigten Schaltschrank-Geraete auf Hutschienen dargestellt
- Die Breite jedes Geraets wird in TE (Teilungseinheiten, 18mm) angegeben
- Wenn eine Hutschiene voll ist (12 TE), wird automatisch eine neue Reihe begonnen
- Farbcodierung zeigt sofort die Art des Geraets (RCD, MCB, AFDD, ...)
- Pro Stromkreis wird angezeigt, wie viele Verbraucher angeschlossen sind

### Zusammenhang mit Core-Workflow
**Schritt 4 (parallel zum Stromlaufplan)**: Waehrend der Stromlaufplan die logische Verschaltung zeigt, zeigt der Aufbauplan die physische Anordnung im Schaltschrank. Beide Views aktualisieren sich automatisch, wenn Symbole platziert oder Schutzgeraete geaendert werden.

### Geplante Erweiterung: Schaltschrankfelder
In Types existieren bereits die Schaltschrank-Feldzonen (NAR, APZ, ZF, ARR, RfZ, VF), die bisher noch nicht als visuelle Sektionen dargestellt werden:
| Feld | Bedeutung |
|------|-----------|
| NAR | Netzanschlussraum |
| APZ | Allg. Pruef-/Zaehlraum |
| ZF | Zaehlerfeld |
| ARR | Anlagenseitiger Anschlussraum |
| RfZ | Raum fuer Zusatzanwendungen |
| VF | Verteilerfeld |

## Owned Files
- `src/components/views/Aufbauplan.tsx`

## Technische Details

### Rendering
- react-konva Stage/Layer
- Gruppierung: Stromkreise nach `verteilerId`, Geraete dedupliziert pro Verteiler

### Layout-Konstanten
- `TE_PER_ROW = 12` (max. Teilungseinheiten pro Hutschiene)
- `TE_PX = 30` (Pixel pro TE)
- `ROW_H = 50`, `HEADER_H = 35`
- Row-Wrapping: wenn `totalTE + device.teWidth > 12` -> neue Reihe

### Farb-Coding
Identisch zum Stromlaufplan (RCD=gelb, AFDD=pink, MCB=blau).

### Datenfluss
- `useStromkreise()` -> Stromkreise gruppiert nach verteilerId
- `findDevice()` -> CabinetDevice mit teWidth, label, category
- `useAllSymbols()` -> Verbraucher-Count pro Stromkreis
