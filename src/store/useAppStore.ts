import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { useShallow } from 'zustand/react/shallow';
import type { PlacedSymbol, ViewType, Gebaeude, Stromkreis } from '../types';
import { symbolCatalog } from '../data/mockSymbols';
import { mockGebaeude, mockStromkreise } from '../data/mockProject';

interface AppState {
  gebaeude: Gebaeude;
  activeRaumId: string;
  placedSymbols: PlacedSymbol[];
  stromkreise: Stromkreis[];
  selectedSymbolId: string | null;
  activeView: ViewType;

  addSymbol: (symbolKey: string, raumId: string, x: number, y: number) => void;
  updateSymbol: (id: string, patch: Partial<PlacedSymbol>) => void;
  moveSymbol: (id: string, x: number, y: number) => void;
  removeSymbol: (id: string) => void;
  selectSymbol: (id: string | null) => void;
  setActiveRaum: (raumId: string) => void;
  setActiveView: (view: ViewType) => void;

  addStromkreis: (sk: Stromkreis) => void;
  updateStromkreis: (id: string, patch: Partial<Stromkreis>) => void;
  removeStromkreis: (id: string) => void;
  assignSymbolToStromkreis: (symbolId: string, stromkreisId: string | null) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      gebaeude: mockGebaeude,
      activeRaumId: 'r-wohn',
      placedSymbols: [],
      stromkreise: mockStromkreise,
      selectedSymbolId: null,
      activeView: 'installationsplan',

      addSymbol: (symbolKey, raumId, x, y) => {
        const def = symbolCatalog.find((s) => s.key === symbolKey);
        if (!def) return;
        const symbol: PlacedSymbol = {
          id: crypto.randomUUID(),
          symbolKey,
          raumId,
          x,
          y,
          rotation: 0,
          attribute: { ...def.defaultAttribute },
          stromkreisId: null,
          knx: { ...def.defaultKnx },
          artikel: def.defaultArtikel.map((a) => ({ ...a, id: crypto.randomUUID() })),
        };
        set((s) => ({ placedSymbols: [...s.placedSymbols, symbol], selectedSymbolId: symbol.id }));
      },

      updateSymbol: (id, patch) =>
        set((s) => ({
          placedSymbols: s.placedSymbols.map((sym) =>
            sym.id === id ? { ...sym, ...patch } : sym
          ),
        })),

      moveSymbol: (id, x, y) =>
        set((s) => ({
          placedSymbols: s.placedSymbols.map((sym) =>
            sym.id === id ? { ...sym, x, y } : sym
          ),
        })),

      removeSymbol: (id) =>
        set((s) => ({
          placedSymbols: s.placedSymbols.filter((sym) => sym.id !== id),
          selectedSymbolId: s.selectedSymbolId === id ? null : s.selectedSymbolId,
        })),

      selectSymbol: (id) => set({ selectedSymbolId: id }),
      setActiveRaum: (raumId) => set({ activeRaumId: raumId, selectedSymbolId: null }),
      setActiveView: (view) => set({ activeView: view }),

      addStromkreis: (sk) =>
        set((s) => ({ stromkreise: [...s.stromkreise, sk] })),

      updateStromkreis: (id, patch) =>
        set((s) => ({
          stromkreise: s.stromkreise.map((sk) =>
            sk.id === id ? { ...sk, ...patch } : sk
          ),
        })),

      removeStromkreis: (id) =>
        set((s) => ({
          stromkreise: s.stromkreise.filter((sk) => sk.id !== id),
          placedSymbols: s.placedSymbols.map((sym) =>
            sym.stromkreisId === id ? { ...sym, stromkreisId: null } : sym
          ),
        })),

      assignSymbolToStromkreis: (symbolId, stromkreisId) =>
        set((s) => ({
          placedSymbols: s.placedSymbols.map((sym) =>
            sym.id === symbolId ? { ...sym, stromkreisId } : sym
          ),
        })),
    }),
    {
      name: 'symbol-attribute-store',
      version: 1,
      migrate: (persisted: unknown, version: number) => {
        const state = persisted as Record<string, unknown>;
        if (version === 0) {
          const symbols = (state.placedSymbols as Array<Record<string, unknown>>) ?? [];
          state.placedSymbols = symbols.map((sym) => {
            const attr = sym.attribute as Record<string, unknown> | undefined;
            if (attr) {
              // eslint-disable-next-line @typescript-eslint/no-unused-vars
              const { verteiler: _v, ...restAttr } = attr;
              return { ...sym, attribute: restAttr, stromkreisId: null };
            }
            return { ...sym, stromkreisId: null };
          });
          state.stromkreise = mockStromkreise;
        }
        return state;
      },
    }
  )
);

export const useSymbolsForActiveRaum = () =>
  useAppStore(
    useShallow((s) => s.placedSymbols.filter((sym) => sym.raumId === s.activeRaumId))
  );

export const useSelectedSymbol = () =>
  useAppStore(
    useShallow((s) => s.placedSymbols.find((sym) => sym.id === s.selectedSymbolId) ?? null)
  );

export const useAllSymbols = () => useAppStore((s) => s.placedSymbols);
export const useStromkreise = () => useAppStore((s) => s.stromkreise);

export const useActiveRaumName = () =>
  useAppStore((s) => {
    for (const sw of s.gebaeude.stockwerke) {
      const raum = sw.raeume.find((r) => r.id === s.activeRaumId);
      if (raum) return `${sw.name} / ${raum.name}`;
    }
    return '';
  });
