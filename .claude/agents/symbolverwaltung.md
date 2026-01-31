# Agent: Symbolverwaltung

## Was macht dieses Feature?
Die Symbolverwaltung pflegt den Katalog aller platzierbaren elektrotechnischen Symbole und zeigt in der Symboluebersicht eine Gesamtanalyse des Systems.

### Nutzersicht

#### Symbolkatalog
- ~140 Symbole in 13 Kategorien (Steckdosen, Schalter, Leuchten, Sensoren, Sicherheit, Smart Home, Netzwerk, Hausgeraete, Verteiler, Erdung, Sprechanlage, Sonstiges)
- Jedes Symbol bringt sinnvolle Defaults mit:
  - Standard-Kabeltyp (z.B. NYM-J 3x1.5 fuer Steckdosen)
  - Benoetigte Schutzgeraete (z.B. MCB B16 + RCD 40A/30mA)
  - Standard-Material mit Preisen (fuer Stueckliste)
  - Schaltschrank-Zuordnung (in welchem Feld des Schaltschranks landet das Geraet)
- Spezialverbraucher (Wallbox, Herd, PV-Wechselrichter) haben eigene Schutzprofile

#### Symboluebersicht (Diagnose-View)
4 Tabs fuer Planer und Entwickler:
1. **Durchgaengigkeit** - Zeigt pro Symbol: welche Eigenschaften relevant sind, welche Schutzgeraete noetig, wo im Schaltschrank, in welchen Plaenen verwendet
2. **Eigenschafts-Register** - Alle Eigenschaften unabhaengig von Symbolen, mit Feature-Area-Matrix (welches Feature nutzt welche Eigenschaft)
3. **DIN-Rail Geraete** - Kompletter Geraetekatalog mit Suche und Filter
4. **Stromkreise** - Abgeleitete Stromkreise verwalten (umbenennen, sperren, Symbole verschieben)

#### FieldConfig-System
Pro Symbolkategorie wird gesteuert, welche Eigenschaften der Nutzer sieht:
- **required** (Pflicht, blau markiert) - z.B. Kabeltyp bei Steckdosen
- **optional** (freiwillig) - z.B. KNX bei Schaltern
- **hidden** (ausgeblendet) - z.B. Stromkreis bei Sensoren

So sieht der Nutzer nur relevante Felder und wird nicht mit unnoetigen Eingaben belaestigt.

## Owned Files
- `src/data/mockSymbols.ts` - ~140 SymbolDefinitions mit fieldConfigs, protectionProfiles, cabinetMappings
- `src/data/propertyRegistry.ts` - PropertyDefinition[] mit Feature-Area-Matrix
- `src/components/views/Symboluebersicht.tsx` - 4-Tab Diagnose-View
- `src/types/index.ts` - SymbolDefinition, SymbolFieldConfig, FieldRelevance, SymbolCategory, ProtectionProfile, CabinetMappingInfo

## Technische Details

### Symbolkatalog-Aufbau (mockSymbols.ts)
- `rawSymbols[]` - Basis-Definitionen (key, label, category, svgPath, defaults)
- Per-Category Defaults: `CATEGORY_FIELD_CONFIGS`, `CATEGORY_ELECTRICAL_REQUIREMENTS`, `CATEGORY_PROTECTION_PROFILES`, `CATEGORY_CABINET_MAPPING`
- Per-Symbol Overrides: `SYMBOL_ELECTRICAL_OVERRIDES`, `SYMBOL_PROTECTION_OVERRIDES`, `SYMBOL_CABINET_OVERRIDES`
- Finale `symbolCatalog[]` = rawSymbols + category defaults + symbol overrides

### PropertyRegistry (propertyRegistry.ts)
- Globale Eigenschafts-Definitionen, unabhaengig von Symbolen
- Gruppen: attribute, stromkreis, knx, artikel
- `usedBy: FeatureArea[]` - welche Feature-Areas die Eigenschaft konsumieren
- Features: stromlaufplan, aufbauplan, knx, pruefprotokoll, stueckliste

### SVG-Konvention
Pfad: `/public/symbols/simple-{category}-{key}.svg`
