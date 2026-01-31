# SymbolAttribute - Elektro-Installationsplanung

## What
React-App fuer Elektro-Installationsplanung. Symbole auf Canvas platzieren, Attribute vergeben, App leitet Stromkreise und Schutzgeraete automatisch ab.

## Stack
React 19 + Vite 7 + Zustand 5 + Konva 10 + Tailwind CSS 4, TypeScript 5.9 (strict)

## Core Workflow
1. Symbol aus SymbolLibrary in InstallationCanvas ziehen (Drag-Drop)
2. Attribute vergeben: Kabeltyp, Verteiler, Sicherungen (PropertiesPanel)
3. App erkennt benoetigte Sicherungen pro Verteiler via `circuitDerivation.ts` -> Nutzer kann ergaenzen
4. App erkennt Sicherungen + Verbraucher fuer Stromlaufplan/Aufbauplan -> Nutzer kann ergaenzen

## Data Flow
```
SymbolDefinition (Katalog, ~140 Symbole, 13 Kategorien)
  -> PlacedSymbol (pro Raum, Zustand-Store)
    -> deriveCircuits() gruppiert nach verteilerId + raumId + groupingHint
      -> mergeRequirements() -> hoechster ratedCurrent pro Rolle
        -> resolveDevices() -> kleinstes passendes CabinetDevice
          -> DerivedCircuit[]
            -> Views: Stromlaufplan | Aufbauplan | Stueckliste | Bestellliste
```

## File Structure
```
src/
  types/index.ts            # ALLE Typen (SymbolDefinition, PlacedSymbol, DerivedCircuit, CabinetDevice, ...)
  store/useAppStore.ts      # Zustand + persist v2 + Selektoren (useDerivedCircuits, useSymbolsForActiveRaum)
  logic/
    circuitDerivation.ts    # Bottom-up: PlacedSymbol[] -> DerivedCircuit[]
    deviceResolver.ts       # ProtectionRequirement -> CabinetDevice (smallest fit)
  data/
    mockSymbols.ts          # ~140 SymbolDefinitions, fieldConfigs, protectionProfiles, cabinetMappings
    cabinetCatalog.ts       # ~180 CabinetDevices (MCB, RCD, RCBO, AFDD, SLS, Schuetz, ...)
    mockProject.ts          # Gebaeude-Struktur + 8 Legacy-Stromkreise
    propertyRegistry.ts     # PropertyDefinition[] mit Feature-Area-Matrix
  components/
    layout/                 # AppShell.tsx, Toolbar.tsx (View-Switcher)
    canvas/                 # InstallationCanvas.tsx (Konva Stage), CanvasSymbol.tsx
    sidebar/                # SymbolLibrary.tsx (Kategorie-Liste), SymbolCard.tsx (Drag-Source)
    tree/                   # RoomTree.tsx (Gebaeude -> Stockwerk -> Raum)
    properties/             # PropertiesPanel.tsx + AttributeSection, ElektrischeSection, KnxSection, ArtikelSection
    views/                  # Symboluebersicht, Stromlaufplan, Aufbauplan, Stueckliste, Bestellliste
```

## Key Patterns
- Single type barrel: `src/types/index.ts`
- Zustand `persist` mit Version-Migration (aktuell v2)
- Selektoren via `useShallow()` gegen unnoetige Rerenders
- Legacy `Stromkreis[]` koexistiert mit `DerivedCircuit[]` (Bridge in `useStromkreise`)
- Canvas: react-konva Stage+Layer, HTML5 Drag von SymbolCard, Zoom/Pan
- SymbolDefinition traegt: `fieldConfig`, `protectionProfile`, `cabinetMapping`
- Protection Overrides auf Symbol-Ebene, CircuitGroupOverrides auf Gruppen-Ebene
- Dedicated Symbols (Herd, Wallbox) bekommen eigenen Stromkreis
- Default-Verteiler Fallback: `'HV-EG'`

## Domain-Glossar
| Begriff | Bedeutung |
|---------|-----------|
| Verteiler | Verteilerschrank / Distribution Board |
| Stromkreis | Circuit |
| Sicherung / Schutzgeraet | MCB / RCD / RCBO / AFDD |
| Stromlaufplan | Schaltplan / Circuit Diagram |
| Aufbauplan | Schaltschrank-Layout / Cabinet Layout |
| Stueckliste | Bill of Materials |
| Bestellliste | Bestellliste (nur Material) |
| Raum / Stockwerk / Gebaeude | Room / Floor / Building |
| Kabeltyp | Cable Type (z.B. NYM-J 3x1.5) |
| TE | Teilungseinheit / DIN rail module width (18mm) |
| FieldRelevance | required / optional / hidden pro Kategorie |
| CabinetField | NAR, APZ, ZF, ARR, RfZ, VF |

## Commands
```
npm run dev       # Vite dev server
npm run build     # tsc -b && vite build
npm run lint      # eslint
npm run preview   # vite preview
```

## Conventions
- Deutsche Domain-Begriffe in Types/Labels, English in Code-Kommentaren
- Kleine fokussierte Diffs
- Strict TypeScript, keine ungetypten Public Functions
- Tailwind utility classes, kein CSS-in-JS
- Zustand: Actions im Store, Selektoren ausserhalb mit useShallow
- SVGs in `/public/symbols/` mit Prefix `simple-{category}-{key}.svg`
