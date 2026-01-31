# Agent: Elektrische Planung

## Was macht dieses Feature?
Die elektrische Planung ist das Herzstuck der App. Nachdem Symbole im Installationsplan platziert wurden, vergibt der Nutzer hier die elektrischen Eigenschaften:

1. **Verteiler zuweisen** - Nutzer waehlt fuer jedes Symbol, an welchem Verteiler (z.B. Hauptverteiler EG) es angeschlossen wird
2. **Schutzgeraete pruefen** - App zeigt automatisch die benoetigten Sicherungen (MCB, RCD, RCBO, AFDD) basierend auf dem Symboltyp
3. **Schutzgeraete anpassen** - Nutzer kann die vorgeschlagenen Schutzgeraete ueberschreiben (z.B. staerkere Sicherung)
4. **Stromkreise ableiten** - App gruppiert Symbole automatisch zu Stromkreisen (nach Verteiler + Raum + Typ)
5. **Stromkreise anpassen** - Nutzer kann Symbole zwischen Stromkreisen verschieben, Stromkreise umbenennen oder sperren

### Nutzersicht
- Elektrofachkraft weist jedem Verbraucher einen Verteiler zu
- App schlaegt automatisch vor, welche Sicherungen benoetigt werden (z.B. "Steckdose braucht MCB B16 + RCD 40A/30mA")
- App erkennt: "Diese 5 Steckdosen im Wohnzimmer gehoeren zum gleichen Stromkreis am HV-EG"
- Nutzer sieht sofort, wenn ein Verteiler viele Stromkreise hat und kann umverteilen
- Spezialverbraucher (Herd, Wallbox, Durchlauferhitzer) bekommen automatisch eigene Stromkreise

### Kernkonzept: Bottom-Up Derivation
Statt manuell Stromkreise anzulegen und Symbole zuzuweisen, leitet die App Stromkreise automatisch von unten nach oben ab:
```
Platzierte Symbole (mit Verteiler + Schutzprofil)
  -> Automatische Gruppierung (verteilerId + raumId + groupingHint)
    -> Anforderungen zusammenfuehren (hoechster Strom pro Schutzgeraete-Rolle)
      -> Passendes DIN-Rail-Geraet aus Katalog waehlen (kleinstes passendes)
        -> Fertiger Stromkreis mit allen Schutzgeraeten
```

## Owned Files
- `src/logic/circuitDerivation.ts` - PlacedSymbol[] -> DerivedCircuit[]
- `src/logic/deviceResolver.ts` - ProtectionRequirement -> DinRailDevice
- `src/data/dinRailCatalog.ts` - ~180 DinRailDevices (MCB, RCD, RCBO, AFDD, SLS, ...)
- `src/components/properties/ElektrischeSection.tsx` - Verteiler-Selector, Protection-Override-UI

## Technische Details

### Derivation Pipeline (`deriveCircuits`)
1. Filter: nur Symbole mit non-empty `protectionProfile.requirements`
2. Effective Requirements: `symbol.protectionOverrides ?? catalog.protectionProfile.requirements`
3. Gruppierung:
   - Manuell: `circuitGroupOverride` (vom Nutzer)
   - Dedicated: eigener SK (Herd, Wallbox, etc.)
   - Auto: `groupKey(verteilerId, raumId, groupingHint)`
4. Merge: pro Rolle hoechster `ratedCurrent`
5. Resolve: kleinstes passendes DinRailDevice pro Requirement
6. Name: `SK{n} {hintLabel} {raumName}` / `SK{n} {symbolLabel} {raumName}` (dedicated)

### Device Resolution (`resolveDevice`)
- `rcd_type_b` -> Kategorie 'rcd', gefiltert auf rcdType 'B'
- Match: category exakt, poles exakt, rcdType exakt, characteristic exakt, ratedCurrent >=, faultCurrent exakt
- Sortierung ascending ratedCurrent -> erstes = kleinstes passendes

### GroupingHints
| Hint | Verhalten | Beispiel |
|------|-----------|----------|
| socket | Gruppierbar | Steckdosen eines Raums |
| light | Gruppierbar | Beleuchtung eines Raums |
| dedicated | Eigener SK | Herd, Wallbox, Durchlauferhitzer |
| special | Gruppierbar (Fallback) | Sonstige |

### Store Actions
- `setSymbolVerteiler(symbolId, verteilerId)`
- `setProtectionOverride(symbolId, overrides[])`
- `setCircuitGroupOverride(groupId, patch)`
- `moveSymbolToGroup(symbolId, targetGroupId)`

### Default-Verteiler
Fallback `'HV-EG'` wenn kein Verteiler explizit zugewiesen.
