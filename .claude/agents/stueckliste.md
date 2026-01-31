# Agent: Stueckliste & Bestellliste

## Was macht dieses Feature?
Stueckliste und Bestellliste generieren automatisch die Material- und Kostenaufstellung aus allen platzierten Symbolen. Der Elektrofachkraft wird damit die manuelle Materialerfassung abgenommen.

### Nutzersicht

#### Stueckliste (Bill of Materials)
- Zeigt alle benoetigten Materialien und Dienstleistungen ueber alle Raeume hinweg
- **Symbol-Zusammenfassung**: Wie viele Steckdosen, Schalter, Leuchten, ... insgesamt?
- **Material-Tabelle**: Bezeichnung, Menge, Einheit, Einzelpreis, Gesamtpreis
- **Dienstleistungen**: z.B. Montage, Anschluss (blau hervorgehoben)
- **Gesamtkosten**: Summe aller Material- und Dienstleistungspositionen
- Identische Positionen werden automatisch zusammengefasst (z.B. 10x "Schalterdose UP" statt 10 Einzelzeilen)

#### Bestellliste (Einkaufsliste)
- Vereinfachte Material-Liste nur fuer den Einkauf
- Nur Materialien, keine Dienstleistungen, keine Preise
- Format: Bezeichnung + Menge + Einheit
- Alphabetisch sortiert

### Zusammenhang mit Core-Workflow
Die Stueckliste ist ein **Output-Layer**: Sie konsumiert alle `PlacedSymbol.artikel` aus allen Raeumen. Jedes Mal wenn ein Symbol platziert oder entfernt wird, aktualisiert sich die Liste automatisch.

### Noch nicht implementiert
- DIN-Rail-Geraete (MCB, RCD, ...) aus den abgeleiteten Stromkreisen fehlen noch in der Stueckliste
- Export als CSV oder PDF

## Owned Files
- `src/components/views/Stueckliste.tsx` - Aggregierte Material-/Kostenliste
- `src/components/views/Bestellliste.tsx` - Material-only Einkaufsliste
- `src/components/properties/ArtikelSection.tsx` - Artikel-Anzeige pro Symbol (read-only)

## Technische Details

### ArtikelPosition (pro PlacedSymbol)
```ts
{ bezeichnung: string, typ: 'material' | 'service', menge: number, einheit: string, einzelpreis: number }
```

### Aggregation
- **Stueckliste**: Gruppierung nach `bezeichnung|typ|einheit|einzelpreis` -> Mengen summieren
- **Bestellliste**: Nur `typ === 'material'`, Gruppierung nach `bezeichnung|einheit`
- Default-Artikel kommen aus `SymbolDefinition.defaultArtikel`

### Datenfluss
- `useAllSymbols()` -> alle PlacedSymbols -> flatMap `.artikel` -> aggregieren
