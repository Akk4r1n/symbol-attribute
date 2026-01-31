import React, { useState, useMemo } from 'react';
import { symbolCatalog } from '../../data/mockSymbols';
import { propertyRegistry, PROPERTY_GROUP_LABELS } from '../../data/propertyRegistry';
import { cabinetCatalog, findDevice } from '../../data/cabinetCatalog';
import { useAppStore, useDerivedCircuits, useAllSymbols } from '../../store/useAppStore';
import {
  CATEGORY_LABELS,
  ELECTRICAL_PROPERTY_LABELS,
  CABINET_FIELD_LABELS,
  FEATURE_AREA_LABELS,
  GROUPING_HINT_LABELS,
  CABINET_CATEGORY_LABELS,
  type SymbolCategory,
  type SymbolDefinition,
  type ElectricalPropertyType,
  type FieldRelevance,
  type FeatureArea,
  type CabinetCategory,
  type DerivedCircuit,
} from '../../types';

type SubTab = 'durchgaengigkeit' | 'register' | 'cabinet' | 'stromkreise';

const SUB_TABS: { key: SubTab; label: string }[] = [
  { key: 'durchgaengigkeit', label: 'Durchgaengigkeit' },
  { key: 'register', label: 'Eigenschafts-Register' },
  { key: 'cabinet', label: 'Schaltschrank Geraete' },
  { key: 'stromkreise', label: 'Stromkreise' },
];

const ALL_ELECTRICAL: ElectricalPropertyType[] = ['mcb', 'rcd', 'rcbo', 'afdd', 'rcd_type_b'];

function RelevanceBadge({ value }: { value: FieldRelevance }) {
  const styles: Record<FieldRelevance, string> = {
    required: 'bg-green-100 text-green-700',
    optional: 'bg-yellow-100 text-yellow-700',
    hidden: 'bg-gray-100 text-gray-400',
  };
  const labels: Record<FieldRelevance, string> = {
    required: 'Pflicht',
    optional: 'Optional',
    hidden: 'Versteckt',
  };
  return (
    <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${styles[value]}`}>
      {labels[value]}
    </span>
  );
}

function Check({ active }: { active: boolean }) {
  return active ? (
    <span className="text-green-600 font-bold">&#10003;</span>
  ) : (
    <span className="text-gray-300">&mdash;</span>
  );
}

function SymbolIcon({ sym }: { sym: SymbolDefinition }) {
  return (
    <img
      src={sym.svgPath}
      alt={sym.label}
      className="w-6 h-6 inline-block"
      onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
    />
  );
}

const ALL_FEATURES: FeatureArea[] = ['stromlaufplan', 'aufbauplan', 'knx', 'pruefprotokoll', 'stueckliste'];

function PropertyRegisterTable() {
  const grouped = useMemo(() => {
    const groups = new Map<string, typeof propertyRegistry>();
    for (const prop of propertyRegistry) {
      const list = groups.get(prop.group) ?? [];
      list.push(prop);
      groups.set(prop.group, list);
    }
    return groups;
  }, []);

  return (
    <div>
      <p className="text-xs text-gray-500 mb-4">
        Alle verfuegbaren Eigenschaften -- unabhaengig von Symbolen.
        Die Feature-Logik (Stromlaufplan, Aufbauplan, KNX, etc.) haengt an diesen Eigenschaften, nicht am Symbol.
        Das Symbol ist nur ein &quot;Verbraucher&quot;-Label.
      </p>
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-200 text-gray-500 sticky top-0 bg-white z-10">
            <th className="text-left py-2 font-medium w-44">Eigenschaft</th>
            <th className="text-left py-2 font-medium w-24">Gruppe</th>
            <th className="text-left py-2 font-medium">Beschreibung</th>
            {ALL_FEATURES.map((f) => (
              <th key={f} className="text-center py-2 font-medium w-28">{FEATURE_AREA_LABELS[f]}</th>
            ))}
            <th className="text-left py-2 font-medium w-16">Typ</th>
          </tr>
        </thead>
        <tbody>
          {Array.from(grouped.entries()).map(([group, props]) => (
            <>
              <tr key={`group-${group}`} className="bg-gray-50">
                <td colSpan={3 + ALL_FEATURES.length + 1} className="py-1.5 px-2 font-semibold text-xs text-gray-600">
                  {PROPERTY_GROUP_LABELS[group as keyof typeof PROPERTY_GROUP_LABELS]}
                </td>
              </tr>
              {props.map((prop) => (
                <tr key={prop.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-1.5 font-medium text-gray-800">{prop.name}</td>
                  <td className="py-1.5 text-xs text-gray-500">{PROPERTY_GROUP_LABELS[prop.group]}</td>
                  <td className="py-1.5 text-xs text-gray-500">{prop.description}</td>
                  {ALL_FEATURES.map((f) => (
                    <td key={f} className="py-1.5 text-center">
                      <Check active={prop.usedBy.includes(f)} />
                    </td>
                  ))}
                  <td className="py-1.5">
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-gray-100 text-gray-600">
                      {prop.valueType}
                    </span>
                  </td>
                </tr>
              ))}
            </>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ── Durchgaengigkeit: Detail Cards ── */

function RelevanceDot({ value }: { value: FieldRelevance }) {
  const colors: Record<FieldRelevance, string> = {
    required: 'bg-green-500',
    optional: 'bg-yellow-400',
    hidden: 'bg-gray-300',
  };
  const tips: Record<FieldRelevance, string> = {
    required: 'Pflicht',
    optional: 'Optional',
    hidden: 'Versteckt',
  };
  return <span title={tips[value]} className={`inline-block w-2.5 h-2.5 rounded-full ${colors[value]}`} />;
}

function EigenschaftenCard({ sym }: { sym: SymbolDefinition }) {
  const fields: { label: string; value: FieldRelevance }[] = [
    { label: 'Farbe', value: sym.fieldConfig.attribute.farbe },
    { label: 'Hoehe', value: sym.fieldConfig.attribute.hoehe },
    { label: 'Kabel', value: sym.fieldConfig.kabel },
    { label: 'Stromkreis', value: sym.fieldConfig.stromkreis },
    { label: 'KNX', value: sym.fieldConfig.knx },
  ];
  return (
    <div className="bg-white rounded-lg p-3 border border-gray-200 border-t-2 border-t-blue-400">
      <h4 className="text-xs font-semibold text-blue-600 mb-2">Eigenschaften</h4>
      <div className="space-y-1.5">
        {fields.map((f) => (
          <div key={f.label} className="flex items-center justify-between text-xs">
            <span className="text-gray-600">{f.label}</span>
            <RelevanceBadge value={f.value} />
          </div>
        ))}
      </div>
    </div>
  );
}

function SchutzgeraeteCard({ sym }: { sym: SymbolDefinition }) {
  return (
    <div className="bg-white rounded-lg p-3 border border-gray-200 border-t-2 border-t-orange-400">
      <h4 className="text-xs font-semibold text-orange-600 mb-2">Schutzgeraete</h4>
      {sym.requiredElectricalProperties.length === 0 ? (
        <p className="text-xs text-gray-400">Keine Schutzgeraete erforderlich</p>
      ) : (
        <div className="space-y-1.5">
          {ALL_ELECTRICAL.map((ep) => (
            <div key={ep} className="flex items-center justify-between text-xs">
              <span className="text-gray-600">{ELECTRICAL_PROPERTY_LABELS[ep]}</span>
              <Check active={sym.requiredElectricalProperties.includes(ep)} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function SchaltschrankCard({ sym }: { sym: SymbolDefinition }) {
  return (
    <div className="bg-white rounded-lg p-3 border border-gray-200 border-t-2 border-t-purple-400">
      <h4 className="text-xs font-semibold text-purple-600 mb-2">Schaltschrank</h4>
      <div className="space-y-1.5 text-xs">
        <div className="flex items-center justify-between">
          <span className="text-gray-600">Verteiler</span>
          {sym.isDistributor ? (
            <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-blue-100 text-blue-700">Ja</span>
          ) : (
            <span className="text-gray-300">&mdash;</span>
          )}
        </div>
        <div className="flex items-center justify-between">
          <span className="text-gray-600">Zielfeld</span>
          {sym.cabinetMapping.targetField ? (
            <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-purple-100 text-purple-700">
              {sym.cabinetMapping.targetField} — {CABINET_FIELD_LABELS[sym.cabinetMapping.targetField]}
            </span>
          ) : (
            <span className="text-gray-300">&mdash;</span>
          )}
        </div>
        {sym.cabinetMapping.elementTypes.length > 0 && (
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Elemente</span>
            <span className="text-gray-800">
              {sym.cabinetMapping.elementTypes.map((et) => ELECTRICAL_PROPERTY_LABELS[et]).join(', ')}
            </span>
          </div>
        )}
        {sym.cabinetMapping.description && (
          <p className="text-gray-500 pt-1 border-t border-gray-100">{sym.cabinetMapping.description}</p>
        )}
      </div>
    </div>
  );
}

function PlanverwendungCard({ sym }: { sym: SymbolDefinition }) {
  const inStromlaufplan = sym.fieldConfig.stromkreis !== 'hidden';
  const inAufbauplan = sym.fieldConfig.stromkreis !== 'hidden';
  const plans: { label: string; active: boolean }[] = [
    { label: 'Installationsplan', active: true },
    { label: 'Stromlaufplan', active: inStromlaufplan },
    { label: 'Aufbauplan', active: inAufbauplan },
  ];
  return (
    <div className="bg-white rounded-lg p-3 border border-gray-200 border-t-2 border-t-green-400">
      <h4 className="text-xs font-semibold text-green-600 mb-2">Planverwendung</h4>
      <div className="space-y-1.5">
        {plans.map((p) => (
          <div key={p.label} className="flex items-center justify-between text-xs">
            <span className="text-gray-600">{p.label}</span>
            <Check active={p.active} />
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Durchgaengigkeit: Detail (expanded) ── */

function DurchgaengigkeitDetail({ sym }: { sym: SymbolDefinition }) {
  return (
    <div className="px-4 py-3 bg-gray-50 border-l-4 border-blue-200">
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr] gap-3 items-stretch">
        <EigenschaftenCard sym={sym} />
        <div className="hidden xl:flex items-center text-gray-300">
          <span className="text-lg">&rarr;</span>
        </div>
        <SchutzgeraeteCard sym={sym} />
        <div className="hidden xl:flex items-center text-gray-300">
          <span className="text-lg">&rarr;</span>
        </div>
        <SchaltschrankCard sym={sym} />
        <div className="hidden xl:flex items-center text-gray-300">
          <span className="text-lg">&rarr;</span>
        </div>
        <PlanverwendungCard sym={sym} />
      </div>
    </div>
  );
}

/* ── Durchgaengigkeit: Master Table ── */

function DurchgaengigkeitTable({ symbols }: { symbols: SymbolDefinition[] }) {
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  const toggleRow = (key: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const allExpanded = expanded.size === symbols.length && symbols.length > 0;
  const toggleAll = () => {
    if (allExpanded) {
      setExpanded(new Set());
    } else {
      setExpanded(new Set(symbols.map((s) => s.key)));
    }
  };

  return (
    <div>
      <div className="flex items-center gap-3 mb-3">
        <button
          onClick={toggleAll}
          className="text-xs px-3 py-1.5 rounded border border-gray-300 text-gray-600 hover:bg-gray-50 transition-colors"
        >
          {allExpanded ? 'Alle zuklappen' : 'Alle aufklappen'}
        </button>
        <span className="text-xs text-gray-400">
          {expanded.size} von {symbols.length} aufgeklappt
        </span>
      </div>
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-200 text-gray-500 sticky top-0 bg-white z-10">
            <th className="w-8 py-2"></th>
            <th className="text-left py-2 font-medium w-8"></th>
            <th className="text-left py-2 font-medium">Symbol</th>
            <th className="text-left py-2 font-medium w-24">Kategorie</th>
            <th className="text-center py-2 font-medium w-36">Eigenschaften</th>
            <th className="text-center py-2 font-medium w-36">Schutz</th>
            <th className="text-center py-2 font-medium w-20">Schrank</th>
            <th className="text-center py-2 font-medium w-28">Plaene</th>
          </tr>
        </thead>
        <tbody>
          {symbols.map((sym) => {
            const isExpanded = expanded.has(sym.key);
            const relevances: FieldRelevance[] = [
              sym.fieldConfig.attribute.farbe,
              sym.fieldConfig.attribute.hoehe,
              sym.fieldConfig.kabel,
              sym.fieldConfig.stromkreis,
              sym.fieldConfig.knx,
            ];
            const activeProtection = sym.requiredElectricalProperties;
            const inStromlaufplan = sym.fieldConfig.stromkreis !== 'hidden';
            return (
              <React.Fragment key={sym.key}>
                <tr
                  className={`border-b border-gray-100 cursor-pointer transition-colors ${
                    isExpanded ? 'bg-blue-50' : 'hover:bg-gray-50'
                  }`}
                  onClick={() => toggleRow(sym.key)}
                >
                  <td className="py-1.5 text-center text-gray-400 text-xs">
                    {isExpanded ? '\u25BC' : '\u25B6'}
                  </td>
                  <td className="py-1.5"><SymbolIcon sym={sym} /></td>
                  <td className="py-1.5 font-medium text-gray-800">{sym.label}</td>
                  <td className="py-1.5 text-gray-500 text-xs">{CATEGORY_LABELS[sym.category]}</td>
                  <td className="py-1.5 text-center">
                    <div className="flex gap-1 justify-center" title="Farbe / Hoehe / Kabel / SK / KNX">
                      {relevances.map((r, i) => (
                        <RelevanceDot key={i} value={r} />
                      ))}
                    </div>
                  </td>
                  <td className="py-1.5 text-center">
                    {activeProtection.length === 0 ? (
                      <span className="text-gray-300">&mdash;</span>
                    ) : (
                      <div className="flex gap-1 justify-center flex-wrap">
                        {activeProtection.map((ep) => (
                          <span
                            key={ep}
                            className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-orange-100 text-orange-700"
                          >
                            {ep === 'rcd_type_b' ? 'RCD-B' : ep.toUpperCase()}
                          </span>
                        ))}
                      </div>
                    )}
                  </td>
                  <td className="py-1.5 text-center">
                    {sym.cabinetMapping.targetField ? (
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-purple-100 text-purple-700">
                        {sym.cabinetMapping.targetField}
                      </span>
                    ) : (
                      <span className="text-gray-300">&mdash;</span>
                    )}
                  </td>
                  <td className="py-1.5 text-center">
                    <div className="flex gap-2 justify-center text-xs">
                      <span title="Installationsplan"><Check active /></span>
                      <span title="Stromlaufplan"><Check active={inStromlaufplan} /></span>
                      <span title="Aufbauplan"><Check active={inStromlaufplan} /></span>
                    </div>
                  </td>
                </tr>
                {isExpanded && (
                  <tr>
                    <td colSpan={8} className="p-0">
                      <DurchgaengigkeitDetail sym={sym} />
                    </td>
                  </tr>
                )}
              </React.Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function CabinetTable() {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<CabinetCategory | 'all'>('all');

  const filtered = useMemo(() => {
    return cabinetCatalog.filter((d) => {
      if (categoryFilter !== 'all' && d.category !== categoryFilter) return false;
      if (search) {
        return d.label.toLowerCase().includes(search.toLowerCase());
      }
      return true;
    });
  }, [search, categoryFilter]);

  const categories = Object.entries(CABINET_CATEGORY_LABELS) as [CabinetCategory, string][];

  return (
    <div>
      <div className="flex gap-3 mb-3 items-center">
        <input
          type="text"
          placeholder="Suche nach Geraet..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="text-sm border border-gray-300 rounded px-3 py-1.5 w-64 focus:outline-none focus:ring-1 focus:ring-blue-400"
        />
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value as CabinetCategory | 'all')}
          className="text-sm border border-gray-300 rounded px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-400"
        >
          <option value="all">Alle Kategorien</option>
          {categories.map(([key, label]) => (
            <option key={key} value={key}>{label}</option>
          ))}
        </select>
        <span className="text-xs text-gray-400">{filtered.length} Geraete</span>
      </div>
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-200 text-gray-500 sticky top-0 bg-white z-10">
            <th className="text-left py-2 font-medium">Label</th>
            <th className="text-left py-2 font-medium w-36">Kategorie</th>
            <th className="text-center py-2 font-medium w-20">TE-Breite</th>
            <th className="text-center py-2 font-medium w-16">Pole</th>
            <th className="text-center py-2 font-medium w-24">Nennstrom</th>
            <th className="text-center py-2 font-medium w-28">Charakteristik</th>
            <th className="text-left py-2 font-medium w-40">SVG-Datei</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((d) => (
            <tr key={d.id} className="border-b border-gray-100 hover:bg-gray-50">
              <td className="py-1.5 font-medium text-gray-800">{d.label}</td>
              <td className="py-1.5 text-xs text-gray-500">{CABINET_CATEGORY_LABELS[d.category]}</td>
              <td className="py-1.5 text-center">{d.teWidth}</td>
              <td className="py-1.5 text-center">{d.poles}</td>
              <td className="py-1.5 text-center">{d.ratedCurrent ? `${d.ratedCurrent}A` : '\u2014'}</td>
              <td className="py-1.5 text-center">{d.characteristic ?? '\u2014'}</td>
              <td className="py-1.5 text-xs text-gray-500">{d.svgFile}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function CircuitManager() {
  const derivedCircuits = useDerivedCircuits();
  const allSymbols = useAllSymbols();
  const setCircuitGroupOverride = useAppStore((s) => s.setCircuitGroupOverride);
  const moveSymbolToGroup = useAppStore((s) => s.moveSymbolToGroup);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [editingName, setEditingName] = useState<string | null>(null);
  const [nameInput, setNameInput] = useState('');
  const [movingSymbol, setMovingSymbol] = useState<{ symbolId: string; fromCircuitId: string } | null>(null);

  const toggleExpand = (id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const startRename = (circuit: DerivedCircuit) => {
    setEditingName(circuit.id);
    setNameInput(circuit.name);
  };

  const commitRename = (circuitId: string) => {
    if (nameInput.trim()) {
      setCircuitGroupOverride(circuitId, { customName: nameInput.trim() });
    }
    setEditingName(null);
  };

  const toggleLock = (circuit: DerivedCircuit) => {
    // Determine current lock state from overrides
    const overrides = useAppStore.getState().circuitGroupOverrides;
    const existing = overrides.find((o) => o.groupId === circuit.id);
    setCircuitGroupOverride(circuit.id, { locked: !existing?.locked });
  };

  const isLocked = (circuitId: string): boolean => {
    const overrides = useAppStore.getState().circuitGroupOverrides;
    return overrides.find((o) => o.groupId === circuitId)?.locked ?? false;
  };

  if (derivedCircuits.length === 0) {
    return (
      <div className="text-center py-8 text-gray-400 text-sm">
        Keine Stromkreise abgeleitet. Symbole im Installationsplan platzieren, um Stromkreise automatisch zu erzeugen.
      </div>
    );
  }

  return (
    <div>
      <p className="text-xs text-gray-500 mb-3">
        Stromkreise werden automatisch aus den platzierten Symbolen abgeleitet.
        Gruppierung nach Verteiler + Raum + Typ. Klicken um Details anzuzeigen.
      </p>
      <div className="space-y-2">
        {derivedCircuits.map((circuit) => {
          const isOpen = expanded.has(circuit.id);
          const locked = isLocked(circuit.id);
          const hintLabel = GROUPING_HINT_LABELS[circuit.groupingHint] ?? circuit.groupingHint;
          const deviceLabels = circuit.resolvedDevices
            .map((d) => findDevice(d.deviceId)?.label ?? d.deviceId)
            .join(' + ');
          const symbols = circuit.symbolIds
            .map((sid) => allSymbols.find((s) => s.id === sid))
            .filter(Boolean);

          return (
            <div key={circuit.id} className={`border rounded-lg ${locked ? 'border-yellow-300 bg-yellow-50/30' : 'border-gray-200'}`}>
              {/* Header */}
              <div
                className="flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-gray-50"
                onClick={() => toggleExpand(circuit.id)}
              >
                <span className="text-xs text-gray-400">{isOpen ? '\u25BC' : '\u25B6'}</span>

                {editingName === circuit.id ? (
                  <input
                    autoFocus
                    value={nameInput}
                    onChange={(e) => setNameInput(e.target.value)}
                    onBlur={() => commitRename(circuit.id)}
                    onKeyDown={(e) => { if (e.key === 'Enter') commitRename(circuit.id); if (e.key === 'Escape') setEditingName(null); }}
                    onClick={(e) => e.stopPropagation()}
                    className="text-sm font-medium text-gray-800 border border-blue-300 rounded px-1 py-0.5 focus:outline-none focus:ring-1 focus:ring-blue-400"
                  />
                ) : (
                  <span className="text-sm font-medium text-gray-800 flex-1">{circuit.name}</span>
                )}

                <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-blue-100 text-blue-700">{hintLabel}</span>
                <span className="text-xs text-gray-400">{circuit.verteilerId}</span>
                <span className="text-xs text-gray-500">{circuit.symbolIds.length} Symbole</span>
                {locked && <span className="text-xs text-yellow-600" title="Gesperrt">&#x1F512;</span>}
              </div>

              {/* Expanded detail */}
              {isOpen && (
                <div className="px-3 pb-3 border-t border-gray-100">
                  {/* Devices */}
                  <div className="mt-2 mb-2">
                    <span className="text-xs text-gray-500">Schutzgeraete: </span>
                    <span className="text-xs text-gray-700">{deviceLabels || '\u2014'}</span>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 mb-2">
                    <button
                      onClick={(e) => { e.stopPropagation(); startRename(circuit); }}
                      className="text-xs px-2 py-1 rounded border border-gray-300 text-gray-600 hover:bg-gray-50"
                    >
                      Umbenennen
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); toggleLock(circuit); }}
                      className={`text-xs px-2 py-1 rounded border ${locked ? 'border-yellow-400 text-yellow-700 bg-yellow-50 hover:bg-yellow-100' : 'border-gray-300 text-gray-600 hover:bg-gray-50'}`}
                    >
                      {locked ? 'Entsperren' : 'Sperren'}
                    </button>
                  </div>

                  {/* Symbol list */}
                  <div className="space-y-1">
                    <div className="text-xs text-gray-500 font-medium">Symbole im Stromkreis:</div>
                    {symbols.map((sym) => {
                      if (!sym) return null;
                      const symDef = symbolCatalog.find((c) => c.key === sym.symbolKey);
                      const isMoving = movingSymbol?.symbolId === sym.id;
                      return (
                        <div key={sym.id} className="flex items-center gap-2 text-xs py-0.5">
                          {symDef && <img src={symDef.svgPath} alt="" className="w-4 h-4" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />}
                          <span className="text-gray-700 flex-1">{symDef?.label ?? sym.symbolKey}</span>
                          <span className="text-gray-400">{sym.id.slice(0, 6)}</span>
                          {isMoving ? (
                            <div className="flex gap-1 items-center">
                              <select
                                autoFocus
                                className="text-xs border border-blue-300 rounded px-1 py-0.5"
                                defaultValue=""
                                onChange={(e) => {
                                  if (e.target.value) {
                                    moveSymbolToGroup(sym.id, e.target.value);
                                    setMovingSymbol(null);
                                  }
                                }}
                              >
                                <option value="">Ziel...</option>
                                {derivedCircuits.filter((c) => c.id !== circuit.id).map((c) => (
                                  <option key={c.id} value={c.id}>{c.name}</option>
                                ))}
                              </select>
                              <button onClick={() => setMovingSymbol(null)} className="text-gray-400 hover:text-gray-600">x</button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setMovingSymbol({ symbolId: sym.id, fromCircuitId: circuit.id })}
                              className="text-blue-500 hover:text-blue-700"
                              title="In anderen Stromkreis verschieben"
                            >
                              &#x2192;
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function Symboluebersicht() {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<SymbolCategory | 'all'>('all');
  const [activeTab, setActiveTab] = useState<SubTab>('durchgaengigkeit');

  const filtered = useMemo(() => {
    return symbolCatalog.filter((sym) => {
      if (categoryFilter !== 'all' && sym.category !== categoryFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        return sym.label.toLowerCase().includes(q) || sym.key.toLowerCase().includes(q);
      }
      return true;
    });
  }, [search, categoryFilter]);

  const categories = Object.entries(CATEGORY_LABELS) as [SymbolCategory, string][];

  return (
    <div className="p-6 overflow-auto h-full">
      <h2 className="text-lg font-semibold mb-4">
        Symboluebersicht
        <span className="text-sm font-normal text-gray-400 ml-2">
          {filtered.length} von {symbolCatalog.length} Symbolen
        </span>
      </h2>

      {/* Filter Bar */}
      <div className="flex gap-3 mb-4 items-center">
        <input
          type="text"
          placeholder="Suche nach Symbol..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="text-sm border border-gray-300 rounded px-3 py-1.5 w-64 focus:outline-none focus:ring-1 focus:ring-blue-400"
        />
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value as SymbolCategory | 'all')}
          className="text-sm border border-gray-300 rounded px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-400"
        >
          <option value="all">Alle Kategorien</option>
          {categories.map(([key, label]) => (
            <option key={key} value={key}>{label}</option>
          ))}
        </select>
      </div>

      {/* Sub-Tab Navigation */}
      <div className="flex gap-1 mb-4 border-b border-gray-200">
        {SUB_TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab.key
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Active Table */}
      <div className="overflow-x-auto">
        {activeTab === 'durchgaengigkeit' && <DurchgaengigkeitTable symbols={filtered} />}
        {activeTab === 'register' && <PropertyRegisterTable />}
        {activeTab === 'cabinet' && <CabinetTable />}
        {activeTab === 'stromkreise' && <CircuitManager />}
      </div>

      {/* Legend */}
      <div className="mt-6 p-3 bg-gray-50 rounded text-xs text-gray-500 space-y-1.5">
        <div>
          <span className="font-medium">Relevanz:</span>
          {' '}
          <span className="inline-block w-2.5 h-2.5 rounded-full bg-green-500 align-middle" /> Pflicht
          {' '}
          <span className="inline-block w-2.5 h-2.5 rounded-full bg-yellow-400 align-middle" /> Optional
          {' '}
          <span className="inline-block w-2.5 h-2.5 rounded-full bg-gray-300 align-middle" /> Versteckt
          {' | '}
          <span className="text-green-600 font-bold">&#10003;</span> = Aktiv
          {' '}
          <span className="text-gray-300">&mdash;</span> = Nicht relevant
        </div>
        <div>
          <span className="font-medium">Durchgaengigkeit:</span>
          {' '}
          <span className="inline-block w-3 h-1.5 bg-blue-400 rounded align-middle" /> Eigenschaften
          {' \u2192 '}
          <span className="inline-block w-3 h-1.5 bg-orange-400 rounded align-middle" /> Schutzgeraete
          {' \u2192 '}
          <span className="inline-block w-3 h-1.5 bg-purple-400 rounded align-middle" /> Schaltschrank
          {' \u2192 '}
          <span className="inline-block w-3 h-1.5 bg-green-400 rounded align-middle" /> Planverwendung
        </div>
        <div className="text-gray-400">
          Eigenschafts-Dots (Zusammenfassung): Farbe / Hoehe / Kabeltyp / Stromkreis / KNX
        </div>
      </div>
    </div>
  );
}
