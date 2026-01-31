# Agent: Installationsplan

## Was macht dieses Feature?
Der Installationsplan ist die zentrale Arbeitsflaeche des Elektroplaners. Hier plant der Nutzer die Elektroinstallation raumweise:

1. **Raum waehlen** - Nutzer navigiert im Gebaeudebaum (links) zum gewuenschten Raum
2. **Symbole platzieren** - Nutzer zieht Symbole (Steckdosen, Schalter, Leuchten, ...) aus der Bibliothek auf den Grundriss
3. **Symbole anordnen** - Nutzer verschiebt Symbole per Drag auf dem Canvas, um die reale Raumposition abzubilden
4. **Symbol auswaehlen** - Klick auf Symbol oeffnet das Eigenschaftenpanel (rechts), wo Kabeltyp, Verteiler, Sicherungen vergeben werden

Der Installationsplan ist Schritt 1 im Gesamt-Workflow. Alle nachfolgenden Ansichten (Stromlaufplan, Aufbauplan, Stueckliste) basieren auf den hier platzierten Symbolen und deren Attributen.

### Nutzersicht
- Elektrofachkraft / Planer sieht jeden Raum einzeln als Canvas
- Pro Raum werden alle relevanten Betriebsmittel (Steckdosen, Schalter, Leuchten, Sensoren, ...) platziert
- Nach Platzierung koennen sofort Attribute wie Kabeltyp und Verteiler-Zuweisung vergeben werden
- Der Plan zeigt visuell, wo im Raum welche Betriebsmittel sitzen

## Owned Files
- `src/components/canvas/InstallationCanvas.tsx` - Konva Stage, Grid, Drop-Handler, Zoom
- `src/components/canvas/CanvasSymbol.tsx` - Symbol-Rendering, Drag, Selection
- `src/components/sidebar/SymbolLibrary.tsx` - Kategorisierte Symbolliste, Suche
- `src/components/sidebar/SymbolCard.tsx` - Drag-Source (HTML5 dataTransfer)

## Technische Details

### Canvas
- react-konva: `Stage > Layer > Group`
- Grid-Layer (non-listening, GRID_SIZE=20px) + Symbols-Layer (interactive)
- Zoom via Mouse-Wheel: 0.2x - 3x, Pan via Stage-Drag
- SYMBOL_SIZE = 40px

### Drag-Drop Flow
```
SymbolCard.onDragStart -> dataTransfer.setData('symbolKey', key)
InstallationCanvas.onDrop -> screenCoords zu canvasCoords (via stage scale/position)
  -> store.addSymbol(symbolKey, activeRaumId, x, y)
    -> Erzeugt PlacedSymbol mit Katalog-Defaults (attribute, knx, artikel)
```

### Selection
- Click CanvasSymbol -> `selectSymbol(id)` -> PropertiesPanel erscheint
- Click Stage Background -> `selectSymbol(null)` -> Auswahl aufheben

### Store-Selektoren
- `useSymbolsForActiveRaum()` - Symbole im aktiven Raum
- `addSymbol()`, `moveSymbol()`, `selectSymbol()`, `removeSymbol()`
