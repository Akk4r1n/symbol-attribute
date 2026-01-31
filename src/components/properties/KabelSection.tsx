import type { PlacedSymbol } from '../../types';
import { useAppStore, useKabelForSymbol, useSelectedKabel } from '../../store/useAppStore';
import { symbolCatalog } from '../../data/mockSymbols';

/** Shows cable info when a Kabel is selected */
export function KabelPropertiesPanel() {
  const kabel = useSelectedKabel();
  const updateKabel = useAppStore((s) => s.updateKabel);
  const removeKabel = useAppStore((s) => s.removeKabel);
  const removeSymbolFromKabel = useAppStore((s) => s.removeSymbolFromKabel);
  const allSymbols = useAppStore((s) => s.placedSymbols);

  if (!kabel) return null;

  const connectedSymbols = kabel.connectedSymbolIds
    .map((id) => allSymbols.find((s) => s.id === id))
    .filter((s): s is PlacedSymbol => !!s);

  return (
    <div className="p-3 text-sm">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-8 h-8 rounded bg-gray-100 flex items-center justify-center text-gray-400">
          <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M4 12h16M8 8l-4 4 4 4M16 8l4 4-4 4" />
          </svg>
        </div>
        <div className="flex-1">
          <div className="font-semibold text-gray-800">Kabel</div>
          <div className="text-xs text-gray-400">ID: {kabel.id.slice(0, 8)}</div>
        </div>
        <button
          onClick={() => removeKabel(kabel.id)}
          className="text-red-500 hover:text-red-700 text-xs px-2 py-1 rounded hover:bg-red-50"
        >
          Entfernen
        </button>
      </div>

      <fieldset className="mb-3">
        <legend className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Kabeltyp</legend>
        <input
          type="text"
          value={kabel.kabeltyp}
          onChange={(e) => updateKabel(kabel.id, { kabeltyp: e.target.value })}
          className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:border-blue-500"
        />
      </fieldset>

      <fieldset className="mb-3">
        <legend className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
          Verbundene Symbole ({connectedSymbols.length})
        </legend>
        <div className="space-y-1">
          {connectedSymbols.map((sym) => {
            const def = symbolCatalog.find((d) => d.key === sym.symbolKey);
            return (
              <div key={sym.id} className="flex items-center gap-2 text-xs text-gray-600">
                {def && <img src={def.svgPath} alt="" className="w-4 h-4" />}
                <span className="flex-1">{def?.label ?? sym.symbolKey}</span>
                {connectedSymbols.length > 2 && (
                  <button
                    onClick={() => removeSymbolFromKabel(kabel.id, sym.id)}
                    className="text-red-400 hover:text-red-600"
                    title="Vom Kabel entfernen"
                  >
                    ×
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </fieldset>
    </div>
  );
}

/** Read-only cable info shown when a symbol is selected */
export function SymbolKabelInfo({ symbol }: { symbol: PlacedSymbol }) {
  const kabels = useKabelForSymbol(symbol.id);
  const setSelectedTarget = useAppStore((s) => s.setSelectedTarget);

  if (kabels.length === 0) return null;

  return (
    <fieldset className="mb-3">
      <legend className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
        Kabel
      </legend>
      <div className="space-y-1">
        {kabels.map((k) => (
          <button
            key={k.id}
            onClick={() => setSelectedTarget({ type: 'kabel', id: k.id })}
            className="flex items-center gap-2 text-xs text-blue-600 hover:underline w-full text-left"
          >
            <span>{k.kabeltyp}</span>
            <span className="text-gray-400">({k.connectedSymbolIds.length} Symbole)</span>
          </button>
        ))}
      </div>
    </fieldset>
  );
}
