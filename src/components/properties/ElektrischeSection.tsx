import { useState } from 'react';
import type { PlacedSymbol, FieldRelevance, ProtectionRequirement, ElectricalPropertyType } from '../../types';
import { ELECTRICAL_PROPERTY_LABELS } from '../../types';
import { useAppStore, useDerivedCircuits, useAllSymbols } from '../../store/useAppStore';
import { useShallow } from 'zustand/react/shallow';
import { symbolCatalog } from '../../data/mockSymbols';
import { findDevice } from '../../data/cabinetCatalog';

export function ElektrischeSection({ symbol, relevance }: { symbol: PlacedSymbol; relevance: FieldRelevance }) {
  const setSymbolVerteiler = useAppStore((s) => s.setSymbolVerteiler);
  const setProtectionOverride = useAppStore((s) => s.setProtectionOverride);
  const moveSymbolToGroup = useAppStore((s) => s.moveSymbolToGroup);
  const allSymbols = useAllSymbols();
  const derivedCircuits = useDerivedCircuits();

  const def = symbolCatalog.find((s) => s.key === symbol.symbolKey);
  const profileReqs = def?.protectionProfile.requirements ?? [];
  const effectiveReqs = symbol.protectionOverrides ?? profileReqs;
  const hasOverrides = !!symbol.protectionOverrides && symbol.protectionOverrides.length > 0;

  // Store verteiler (first-class entities)
  const storeVerteiler = useAppStore(useShallow((s) => s.verteiler));

  // Find distributors (placed symbols that are distributors)
  const distributors = allSymbols.filter((s) => {
    const d = symbolCatalog.find((c) => c.key === s.symbolKey);
    return d?.isDistributor;
  });

  // Find derived circuit this symbol belongs to
  const assignedCircuit = derivedCircuits.find((c) => c.symbolIds.includes(symbol.id));

  return (
    <fieldset className="mb-3">
      <legend className={`text-xs font-semibold uppercase tracking-wide mb-1 ${relevance === 'required' ? 'text-blue-600' : 'text-gray-500'}`}>
        Stromkreis &amp; Schutz{relevance === 'required' && <span className="text-blue-500 ml-0.5">*</span>}
      </legend>

      {/* Verteiler-Auswahl */}
      <div className="mb-2">
        <label className="block text-xs text-gray-500 mb-0.5">Verteiler</label>
        <select
          value={symbol.verteilerId ?? ''}
          onChange={(e) => setSymbolVerteiler(symbol.id, e.target.value || null)}
          className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:border-blue-500"
        >
          <option value="">-- Standard (HV-EG) --</option>
          {storeVerteiler
            .filter((v) => v.id !== 'HV-EG')
            .map((v) => (
              <option key={v.id} value={v.id}>
                {v.name}
              </option>
            ))}
          {distributors.map((d) => {
            const dDef = symbolCatalog.find((c) => c.key === d.symbolKey);
            return (
              <option key={d.id} value={d.id}>
                {dDef?.label ?? d.symbolKey} ({d.id.slice(0, 6)})
              </option>
            );
          })}
        </select>
      </div>

      {/* Schutzgeräte-Specs */}
      {effectiveReqs.length > 0 && (
        <div className="mb-2">
          <div className="flex items-center justify-between mb-0.5">
            <span className="text-xs text-gray-500">Schutzgeräte</span>
            {hasOverrides && (
              <button
                onClick={() => setProtectionOverride(symbol.id, undefined)}
                className="text-xs text-blue-500 hover:text-blue-700"
                title="Zurück auf Standard"
              >
                Reset
              </button>
            )}
          </div>
          <div className="space-y-1">
            {effectiveReqs.map((req, i) => (
              <ProtectionRow
                key={`${req.role}-${i}`}
                req={req}
                isOverride={hasOverrides}
                onEdit={(updated) => {
                  const newReqs = [...effectiveReqs];
                  newReqs[i] = updated;
                  setProtectionOverride(symbol.id, newReqs);
                }}
              />
            ))}
          </div>
        </div>
      )}

      {/* Abgeleiteter Stromkreis */}
      {assignedCircuit && (
        <div className="mt-2 p-1.5 bg-gray-50 rounded border border-gray-200">
          <div className="text-xs text-gray-500 mb-0.5">Abgeleiteter Stromkreis</div>
          <div className="text-xs font-medium text-gray-800">{assignedCircuit.name}</div>
          <div className="text-xs text-gray-400 mt-0.5">Verteiler: {assignedCircuit.verteilerId}</div>
          {assignedCircuit.resolvedDevices.length > 0 && (
            <div className="mt-1 space-y-0.5">
              {assignedCircuit.resolvedDevices.map((d, i) => {
                const device = findDevice(d.deviceId);
                return (
                  <div key={i} className="flex items-center gap-1 text-xs">
                    <span className="text-gray-400">{ELECTRICAL_PROPERTY_LABELS[d.role] ?? d.role}:</span>
                    <span className="text-gray-700">{device?.label ?? d.deviceId}</span>
                    {device && <span className="text-gray-400">({device.teWidth} TE)</span>}
                  </div>
                );
              })}
            </div>
          )}
          <div className="text-xs text-gray-400 mt-0.5">
            {assignedCircuit.symbolIds.length} Symbol{assignedCircuit.symbolIds.length !== 1 ? 'e' : ''} im Kreis
          </div>
        </div>
      )}

      {!assignedCircuit && effectiveReqs.length > 0 && (
        <div className="mt-2 p-1.5 bg-yellow-50 rounded border border-yellow-200 text-xs text-yellow-700">
          Kein Stromkreis abgeleitet
        </div>
      )}

      {/* Eigener Stromkreis toggle */}
      {effectiveReqs.length > 0 && (
        <label className="flex items-center gap-1.5 mt-2 text-xs text-gray-600 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={!!symbol.circuitGroupOverride}
            onChange={(e) => {
              moveSymbolToGroup(symbol.id, e.target.checked ? `custom::${symbol.id}` : null);
            }}
            className="rounded border-gray-300 text-blue-500 focus:ring-blue-400"
          />
          Eigener Stromkreis
        </label>
      )}
    </fieldset>
  );
}

// ---------------------------------------------------------------------------
// Protection requirement row with inline edit
// ---------------------------------------------------------------------------

const CHARACTERISTICS = ['B', 'C', 'D'];
const RATED_CURRENTS = [6, 10, 13, 16, 20, 25, 32, 40, 50, 63];
const FAULT_CURRENTS = [30, 100, 300];
const RCD_TYPES: Array<'A' | 'B' | 'F'> = ['A', 'B', 'F'];
const POLES = [1, 2, 3, 4];
const ROLES: ElectricalPropertyType[] = ['mcb', 'rcd', 'rcbo', 'afdd', 'rcd_type_b'];

function ProtectionRow({
  req,
  isOverride,
  onEdit,
}: {
  req: ProtectionRequirement;
  isOverride: boolean;
  onEdit: (updated: ProtectionRequirement) => void;
}) {
  const [editing, setEditing] = useState(false);
  const label = ELECTRICAL_PROPERTY_LABELS[req.role] ?? req.role;

  const specParts: string[] = [];
  if (req.characteristic) specParts.push(req.characteristic);
  if (req.ratedCurrent) specParts.push(`${req.ratedCurrent}A`);
  if (req.faultCurrent) specParts.push(`${req.faultCurrent}mA`);
  if (req.rcdType) specParts.push(`Typ ${req.rcdType}`);
  if (req.poles) specParts.push(`${req.poles}P`);

  if (!editing) {
    return (
      <div
        className={`flex items-center justify-between px-1.5 py-0.5 rounded text-xs cursor-pointer hover:bg-gray-100 ${isOverride ? 'bg-blue-50 border border-blue-200' : 'bg-gray-50 border border-gray-200'}`}
        onClick={() => setEditing(true)}
        title="Klicken zum Bearbeiten"
      >
        <span className="font-medium text-gray-700">{label}</span>
        <span className="text-gray-500">{specParts.join(' / ')}</span>
      </div>
    );
  }

  const isRcd = req.role === 'rcd' || req.role === 'rcbo' || req.role === 'rcd_type_b';

  return (
    <div className="p-1.5 bg-blue-50 rounded border border-blue-300 space-y-1">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-blue-700">{label} bearbeiten</span>
        <button onClick={() => setEditing(false)} className="text-xs text-gray-400 hover:text-gray-600">OK</button>
      </div>
      <div className="grid grid-cols-2 gap-1">
        <MiniSelect label="Typ" value={req.role} options={ROLES.map((r) => ({ value: r, label: ELECTRICAL_PROPERTY_LABELS[r] }))}
          onChange={(v) => onEdit({ ...req, role: v as ElectricalPropertyType })} />
        {req.characteristic !== undefined && (
          <MiniSelect label="Char." value={req.characteristic} options={CHARACTERISTICS.map((c) => ({ value: c, label: c }))}
            onChange={(v) => onEdit({ ...req, characteristic: v })} />
        )}
        {req.ratedCurrent !== undefined && (
          <MiniSelect label="Strom" value={String(req.ratedCurrent)} options={RATED_CURRENTS.map((c) => ({ value: String(c), label: `${c}A` }))}
            onChange={(v) => onEdit({ ...req, ratedCurrent: Number(v) })} />
        )}
        {isRcd && req.faultCurrent !== undefined && (
          <MiniSelect label="Fehlerstrom" value={String(req.faultCurrent)} options={FAULT_CURRENTS.map((c) => ({ value: String(c), label: `${c}mA` }))}
            onChange={(v) => onEdit({ ...req, faultCurrent: Number(v) })} />
        )}
        {isRcd && req.rcdType !== undefined && (
          <MiniSelect label="RCD-Typ" value={req.rcdType} options={RCD_TYPES.map((t) => ({ value: t, label: `Typ ${t}` }))}
            onChange={(v) => onEdit({ ...req, rcdType: v as 'A' | 'B' | 'F' })} />
        )}
        <MiniSelect label="Pole" value={String(req.poles ?? 1)} options={POLES.map((p) => ({ value: String(p), label: `${p}P` }))}
          onChange={(v) => onEdit({ ...req, poles: Number(v) })} />
      </div>
    </div>
  );
}

function MiniSelect({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <label className="block text-[10px] text-gray-400">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-1 py-0.5 text-xs border border-gray-300 rounded focus:outline-none focus:border-blue-500"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </div>
  );
}
