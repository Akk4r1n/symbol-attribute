# Agent: Stromlaufplan

## Was macht dieses Feature?
Der Stromlaufplan zeigt die elektrische Verschaltung aller Stromkreise als Einlinien-Schema. Er ist das zentrale Dokument fuer die Elektrofachkraft und wird fuer die Anmeldung beim Netzbetreiber und die Abnahme benoetigt.

### Nutzersicht
- Elektrofachkraft sieht auf einen Blick: Welche Sicherungen schuetzen welche Verbraucher?
- Pro Stromkreis wird die Schutzkette dargestellt: Sammelschiene (L1) -> RCD -> MCB -> Verbraucher
- Spezial-Stromkreise (Herd, Wallbox) sind sofort erkennbar durch eigene Spalten
- Der Plan wird automatisch aus den platzierten Symbolen und deren Schutzgeraeten generiert
- Nutzer muss keinen Stromlaufplan manuell zeichnen - er entsteht aus der Installationsplanung

### Was der Nutzer sieht
- Horizontale Sammelschiene (L1) oben
- Pro Stromkreis eine Spalte mit:
  - Schutzgeraete-Kette (farbcodiert: RCD=gelb, AFDD=pink, MCB=blau)
  - Stromkreis-Name und Verteiler-ID
  - Liste der angeschlossenen Verbraucher (Symbole)
- Leere Stromkreise (ohne Geraete) werden ausgeblendet

### Zusammenhang mit Core-Workflow
**Schritt 4**: Die App erkennt, welche Sicherungen und Verbraucher im Stromlaufplan dargestellt werden muessen. Der Nutzer kann dies pruefen und bei Bedarf Schutzgeraete in der ElektrischeSection anpassen - der Stromlaufplan aktualisiert sich automatisch.

## Owned Files
- `src/components/views/Stromlaufplan.tsx`

## Technische Details

### Rendering
- react-konva Stage/Layer (Canvas-basiert, kein DOM)
- Datenquelle: `useStromkreise()` (Kompatibilitaets-Bridge: DerivedCircuit[] -> Stromkreis-Form, Fallback auf Legacy)
- Layout: horizontale Spalten (COL_W=200px), eine pro Stromkreis

### Farb-Coding
| Geraete-Rolle | Farbe | Hex |
|---------------|-------|-----|
| RCD / RCBO | Gelb | #fef3c7 |
| AFDD | Pink | #fce7f3 |
| MCB | Blau | #dbeafe |

### Aufbau pro Spalte
```
Sammelschiene (L1) ────────────────
        |
  [RCD 40A/30mA]     <- Schutzgeraet (gelb)
        |
  [MCB B16]           <- Schutzgeraet (blau)
        |
  SK1 Steckdosen      <- Stromkreis-Label
  Wohnzimmer
        |
  ├─ Steckdose 1      <- Verbraucher
  ├─ Steckdose 2
  └─ Steckdose 3
```

### Datenfluss
- `useStromkreise()` liefert Stromkreise mit `devices[]` und `verteilerId`
- `useAllSymbols()` liefert alle platzierten Symbole
- `findDevice(deviceId)` aus cabinetCatalog fuer Geraete-Labels
- Gebaeude-Struktur fuer Raumnamen
