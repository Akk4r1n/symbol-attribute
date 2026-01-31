import type { PlacedSymbol, FieldRelevance, Stromkreis } from '../../types';
import { useAppStore } from '../../store/useAppStore';
import { findDevice } from '../../data/dinRailCatalog';

export function ElektrischeSection({ symbol, relevance }: { symbol: PlacedSymbol; relevance: FieldRelevance }) {
  const stromkreise = useAppStore((s) => s.stromkreise);
  const assignSymbolToStromkreis = useAppStore((s) => s.assignSymbolToStromkreis);

  const formatStromkreis = (sk: Stromkreis) => {
    const deviceLabels = sk.devices.map(d => findDevice(d.deviceId)?.label ?? d.deviceId).join(' + ');
    return `${sk.name} (${sk.verteilerId}: ${deviceLabels})`;
  };

  return (
    <fieldset className="mb-3">
      <legend className={`text-xs font-semibold uppercase tracking-wide mb-1 ${relevance === 'required' ? 'text-blue-600' : 'text-gray-500'}`}>
        Stromkreis{relevance === 'required' && <span className="text-blue-500 ml-0.5">*</span>}
      </legend>
      <select
        value={symbol.stromkreisId ?? ''}
        onChange={(e) => assignSymbolToStromkreis(symbol.id, e.target.value || null)}
        className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:border-blue-500"
      >
        <option value="">-- Kein Stromkreis --</option>
        {stromkreise.map((sk) => (
          <option key={sk.id} value={sk.id}>
            {formatStromkreis(sk)}
          </option>
        ))}
      </select>
      {symbol.stromkreisId && (() => {
        const sk = stromkreise.find(s => s.id === symbol.stromkreisId);
        if (!sk) return null;
        return (
          <div className="mt-1.5 text-xs text-gray-500 space-y-0.5">
            <div>Verteiler: <span className="text-gray-700 font-medium">{sk.verteilerId}</span></div>
            {sk.devices.map((d, i) => {
              const device = findDevice(d.deviceId);
              return (
                <div key={i} className="flex items-center gap-1">
                  <span className="text-gray-400">{d.role.toUpperCase()}:</span>
                  <span className="text-gray-700">{device?.label ?? d.deviceId}</span>
                  {device && <span className="text-gray-400">({device.teWidth} TE)</span>}
                </div>
              );
            })}
          </div>
        );
      })()}
    </fieldset>
  );
}
