import { useState, useMemo } from 'react';
import { symbolCatalog } from '../../data/mockSymbols';
import { propertyRegistry, PROPERTY_GROUP_LABELS } from '../../data/propertyRegistry';
import { dinRailCatalog, findDevice } from '../../data/dinRailCatalog';
import { useStromkreise, useAllSymbols } from '../../store/useAppStore';
import {
  CATEGORY_LABELS,
  ELECTRICAL_PROPERTY_LABELS,
  CABINET_FIELD_LABELS,
  FEATURE_AREA_LABELS,
  DIN_RAIL_CATEGORY_LABELS,
  type SymbolCategory,
  type SymbolDefinition,
  type ElectricalPropertyType,
  type FieldRelevance,
  type FeatureArea,
  type DinRailCategory,
} from '../../types';

type SubTab = 'register' | 'eigenschaften' | 'elektrisch' | 'schaltschrank' | 'planverwendung' | 'dinrail' | 'stromkreise';

const SUB_TABS: { key: SubTab; label: string }[] = [
  { key: 'register', label: 'Eigenschafts-Register' },
  { key: 'eigenschaften', label: 'Eigenschaften' },
  { key: 'elektrisch', label: 'Elektrisch' },
  { key: 'schaltschrank', label: 'Schaltschrank' },
  { key: 'planverwendung', label: 'Planverwendung' },
  { key: 'dinrail', label: 'DIN-Rail Geraete' },
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

function EigenschaftenTable({ symbols }: { symbols: SymbolDefinition[] }) {
  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="border-b border-gray-200 text-gray-500 sticky top-0 bg-white z-10">
          <th className="text-left py-2 font-medium w-8"></th>
          <th className="text-left py-2 font-medium">Symbol</th>
          <th className="text-left py-2 font-medium w-24">Kategorie</th>
          <th className="text-center py-2 font-medium w-20">Farbe</th>
          <th className="text-center py-2 font-medium w-20">Hoehe</th>
          <th className="text-center py-2 font-medium w-20">Kabeltyp</th>
          <th className="text-center py-2 font-medium w-20">Stromkreis</th>
          <th className="text-center py-2 font-medium w-20">KNX</th>
        </tr>
      </thead>
      <tbody>
        {symbols.map((sym) => (
          <tr key={sym.key} className="border-b border-gray-100 hover:bg-gray-50">
            <td className="py-1.5"><SymbolIcon sym={sym} /></td>
            <td className="py-1.5 font-medium text-gray-800">{sym.label}</td>
            <td className="py-1.5 text-gray-500 text-xs">{CATEGORY_LABELS[sym.category]}</td>
            <td className="py-1.5 text-center"><RelevanceBadge value={sym.fieldConfig.attribute.farbe} /></td>
            <td className="py-1.5 text-center"><RelevanceBadge value={sym.fieldConfig.attribute.hoehe} /></td>
            <td className="py-1.5 text-center"><RelevanceBadge value={sym.fieldConfig.attribute.kabeltyp} /></td>
            <td className="py-1.5 text-center"><RelevanceBadge value={sym.fieldConfig.stromkreis} /></td>
            <td className="py-1.5 text-center"><RelevanceBadge value={sym.fieldConfig.knx} /></td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function ElektrischTable({ symbols }: { symbols: SymbolDefinition[] }) {
  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="border-b border-gray-200 text-gray-500 sticky top-0 bg-white z-10">
          <th className="text-left py-2 font-medium w-8"></th>
          <th className="text-left py-2 font-medium">Symbol</th>
          <th className="text-left py-2 font-medium w-24">Kategorie</th>
          {ALL_ELECTRICAL.map((ep) => (
            <th key={ep} className="text-center py-2 font-medium w-20">{ELECTRICAL_PROPERTY_LABELS[ep]}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {symbols.map((sym) => (
          <tr key={sym.key} className="border-b border-gray-100 hover:bg-gray-50">
            <td className="py-1.5"><SymbolIcon sym={sym} /></td>
            <td className="py-1.5 font-medium text-gray-800">{sym.label}</td>
            <td className="py-1.5 text-gray-500 text-xs">{CATEGORY_LABELS[sym.category]}</td>
            {ALL_ELECTRICAL.map((ep) => (
              <td key={ep} className="py-1.5 text-center">
                <Check active={sym.requiredElectricalProperties.includes(ep)} />
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function SchaltschrankTable({ symbols }: { symbols: SymbolDefinition[] }) {
  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="border-b border-gray-200 text-gray-500 sticky top-0 bg-white z-10">
          <th className="text-left py-2 font-medium w-8"></th>
          <th className="text-left py-2 font-medium">Symbol</th>
          <th className="text-left py-2 font-medium w-24">Kategorie</th>
          <th className="text-center py-2 font-medium w-20">Verteiler</th>
          <th className="text-left py-2 font-medium w-28">Zielfeld</th>
          <th className="text-left py-2 font-medium w-40">Elemente</th>
          <th className="text-left py-2 font-medium">Beschreibung</th>
        </tr>
      </thead>
      <tbody>
        {symbols.map((sym) => (
          <tr key={sym.key} className="border-b border-gray-100 hover:bg-gray-50">
            <td className="py-1.5"><SymbolIcon sym={sym} /></td>
            <td className="py-1.5 font-medium text-gray-800">{sym.label}</td>
            <td className="py-1.5 text-gray-500 text-xs">{CATEGORY_LABELS[sym.category]}</td>
            <td className="py-1.5 text-center">
              {sym.isDistributor ? (
                <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-blue-100 text-blue-700">Ja</span>
              ) : (
                <span className="text-gray-300">&mdash;</span>
              )}
            </td>
            <td className="py-1.5">
              {sym.cabinetMapping.targetField ? (
                <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-purple-100 text-purple-700">
                  {sym.cabinetMapping.targetField} — {CABINET_FIELD_LABELS[sym.cabinetMapping.targetField]}
                </span>
              ) : (
                <span className="text-gray-300">&mdash;</span>
              )}
            </td>
            <td className="py-1.5 text-xs text-gray-600">
              {sym.cabinetMapping.elementTypes.length > 0
                ? sym.cabinetMapping.elementTypes.map((et) => ELECTRICAL_PROPERTY_LABELS[et]).join(', ')
                : '—'}
            </td>
            <td className="py-1.5 text-xs text-gray-500">{sym.cabinetMapping.description}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function PlanverwendungTable({ symbols }: { symbols: SymbolDefinition[] }) {
  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="border-b border-gray-200 text-gray-500 sticky top-0 bg-white z-10">
          <th className="text-left py-2 font-medium w-8"></th>
          <th className="text-left py-2 font-medium">Symbol</th>
          <th className="text-left py-2 font-medium w-24">Kategorie</th>
          <th className="text-center py-2 font-medium w-32">Installationsplan</th>
          <th className="text-center py-2 font-medium w-32">Stromlaufplan</th>
          <th className="text-center py-2 font-medium w-32">Aufbauplan</th>
        </tr>
      </thead>
      <tbody>
        {symbols.map((sym) => {
          const inStromlaufplan = sym.fieldConfig.stromkreis !== 'hidden';
          const inAufbauplan = sym.fieldConfig.stromkreis !== 'hidden';
          return (
            <tr key={sym.key} className="border-b border-gray-100 hover:bg-gray-50">
              <td className="py-1.5"><SymbolIcon sym={sym} /></td>
              <td className="py-1.5 font-medium text-gray-800">{sym.label}</td>
              <td className="py-1.5 text-gray-500 text-xs">{CATEGORY_LABELS[sym.category]}</td>
              <td className="py-1.5 text-center"><Check active /></td>
              <td className="py-1.5 text-center"><Check active={inStromlaufplan} /></td>
              <td className="py-1.5 text-center"><Check active={inAufbauplan} /></td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

function DinRailTable() {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<DinRailCategory | 'all'>('all');

  const filtered = useMemo(() => {
    return dinRailCatalog.filter((d) => {
      if (categoryFilter !== 'all' && d.category !== categoryFilter) return false;
      if (search) {
        return d.label.toLowerCase().includes(search.toLowerCase());
      }
      return true;
    });
  }, [search, categoryFilter]);

  const categories = Object.entries(DIN_RAIL_CATEGORY_LABELS) as [DinRailCategory, string][];

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
          onChange={(e) => setCategoryFilter(e.target.value as DinRailCategory | 'all')}
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
              <td className="py-1.5 text-xs text-gray-500">{DIN_RAIL_CATEGORY_LABELS[d.category]}</td>
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

function StromkreiseTable() {
  const stromkreise = useStromkreise();
  const allSymbols = useAllSymbols();

  const rows = useMemo(() => {
    return stromkreise.map((sk) => {
      const deviceLabels = sk.devices
        .map((d) => findDevice(d.deviceId)?.label ?? d.deviceId)
        .join(', ');
      const assignedCount = allSymbols.filter((s) => s.stromkreisId === sk.id).length;
      return { ...sk, deviceLabels, assignedCount };
    });
  }, [stromkreise, allSymbols]);

  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="border-b border-gray-200 text-gray-500 sticky top-0 bg-white z-10">
          <th className="text-left py-2 font-medium">Name</th>
          <th className="text-left py-2 font-medium w-32">Verteiler</th>
          <th className="text-left py-2 font-medium">Geraete</th>
          <th className="text-center py-2 font-medium w-40">Zugeordnete Symbole</th>
        </tr>
      </thead>
      <tbody>
        {rows.length === 0 ? (
          <tr>
            <td colSpan={4} className="py-4 text-center text-gray-400">Keine Stromkreise vorhanden</td>
          </tr>
        ) : (
          rows.map((r) => (
            <tr key={r.id} className="border-b border-gray-100 hover:bg-gray-50">
              <td className="py-1.5 font-medium text-gray-800">{r.name}</td>
              <td className="py-1.5 text-xs text-gray-500">{r.verteilerId}</td>
              <td className="py-1.5 text-xs text-gray-600">{r.deviceLabels || '\u2014'}</td>
              <td className="py-1.5 text-center">{r.assignedCount}</td>
            </tr>
          ))
        )}
      </tbody>
    </table>
  );
}

export function Symboluebersicht() {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<SymbolCategory | 'all'>('all');
  const [activeTab, setActiveTab] = useState<SubTab>('register');

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
        {activeTab === 'register' && <PropertyRegisterTable />}
        {activeTab === 'eigenschaften' && <EigenschaftenTable symbols={filtered} />}
        {activeTab === 'elektrisch' && <ElektrischTable symbols={filtered} />}
        {activeTab === 'schaltschrank' && <SchaltschrankTable symbols={filtered} />}
        {activeTab === 'planverwendung' && <PlanverwendungTable symbols={filtered} />}
        {activeTab === 'dinrail' && <DinRailTable />}
        {activeTab === 'stromkreise' && <StromkreiseTable />}
      </div>

      {/* Legend */}
      <div className="mt-6 p-3 bg-gray-50 rounded text-xs text-gray-500">
        <span className="font-medium">Legende:</span>
        {' '}
        <span className="px-1.5 py-0.5 rounded bg-green-100 text-green-700 font-medium">Pflicht</span>
        {' '}
        <span className="px-1.5 py-0.5 rounded bg-yellow-100 text-yellow-700 font-medium">Optional</span>
        {' '}
        <span className="px-1.5 py-0.5 rounded bg-gray-100 text-gray-400 font-medium">Versteckt</span>
        {' | '}
        <span className="text-green-600 font-bold">&#10003;</span> = Relevant
        {' '}
        <span className="text-gray-300">&mdash;</span> = Nicht relevant
      </div>
    </div>
  );
}
