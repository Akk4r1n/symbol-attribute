import { useMemo } from 'react';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { useShallow } from 'zustand/react/shallow';
import type {
  PlacedSymbol,
  ViewType,
  Gebaeude,
  CircuitGroupOverride,
  ProtectionRequirement,
  DerivedCircuit,
} from '../types';
import { symbolCatalog } from '../data/mockSymbols';
import { mockGebaeude } from '../data/mockProject';
import { deriveCircuits } from '../logic/circuitDerivation';

interface AppState {
  gebaeude: Gebaeude;
  activeRaumId: string;
  placedSymbols: PlacedSymbol[];
  circuitGroupOverrides: CircuitGroupOverride[];
  selectedSymbolId: string | null;
  activeView: ViewType;

  addSymbol: (symbolKey: string, raumId: string, x: number, y: number) => void;
  updateSymbol: (id: string, patch: Partial<PlacedSymbol>) => void;
  moveSymbol: (id: string, x: number, y: number) => void;
  removeSymbol: (id: string) => void;
  selectSymbol: (id: string | null) => void;
  setActiveRaum: (raumId: string) => void;
  setActiveView: (view: ViewType) => void;

  setSymbolVerteiler: (symbolId: string, verteilerId: string | null) => void;
  setProtectionOverride: (symbolId: string, overrides: ProtectionRequirement[] | undefined) => void;
  setCircuitGroupOverride: (groupId: string, patch: Partial<CircuitGroupOverride>) => void;
  removeCircuitGroupOverride: (groupId: string) => void;
  moveSymbolToGroup: (symbolId: string, targetGroupId: string | null) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      gebaeude: mockGebaeude,
      activeRaumId: 'r-wohn',
      placedSymbols: [],
      circuitGroupOverrides: [],
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
          verteilerId: null,
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

      setSymbolVerteiler: (symbolId, verteilerId) =>
        set((s) => ({
          placedSymbols: s.placedSymbols.map((sym) =>
            sym.id === symbolId ? { ...sym, verteilerId } : sym
          ),
        })),

      setProtectionOverride: (symbolId, overrides) =>
        set((s) => ({
          placedSymbols: s.placedSymbols.map((sym) =>
            sym.id === symbolId ? { ...sym, protectionOverrides: overrides } : sym
          ),
        })),

      setCircuitGroupOverride: (groupId, patch) =>
        set((s) => {
          const existing = s.circuitGroupOverrides.find((o) => o.groupId === groupId);
          if (existing) {
            return {
              circuitGroupOverrides: s.circuitGroupOverrides.map((o) =>
                o.groupId === groupId ? { ...o, ...patch } : o
              ),
            };
          }
          return {
            circuitGroupOverrides: [
              ...s.circuitGroupOverrides,
              { groupId, locked: false, ...patch },
            ],
          };
        }),

      removeCircuitGroupOverride: (groupId) =>
        set((s) => ({
          circuitGroupOverrides: s.circuitGroupOverrides.filter((o) => o.groupId !== groupId),
        })),

      moveSymbolToGroup: (symbolId, targetGroupId) =>
        set((s) => ({
          placedSymbols: s.placedSymbols.map((sym) =>
            sym.id === symbolId ? { ...sym, circuitGroupOverride: targetGroupId } : sym
          ),
        })),
    }),
    {
      name: 'symbol-attribute-store',
      version: 3,
      migrate: (persisted: unknown, version: number) => {
        const state = persisted as Record<string, unknown>;

        if (version === 0) {
          // v0: clean verteiler from attribute, add verteilerId
          const symbols = (state.placedSymbols as Array<Record<string, unknown>>) ?? [];
          state.placedSymbols = symbols.map((sym) => {
            const attr = sym.attribute as Record<string, unknown> | undefined;
            if (attr) {
              // eslint-disable-next-line @typescript-eslint/no-unused-vars
              const { verteiler: _v, ...restAttr } = attr;
              return { ...sym, attribute: restAttr, verteilerId: null };
            }
            return { ...sym, verteilerId: null };
          });
          state.circuitGroupOverrides = [];
        }

        if (version <= 1) {
          // v1: ensure verteilerId + circuitGroupOverrides
          const symbols = (state.placedSymbols as Array<Record<string, unknown>>) ?? [];
          state.placedSymbols = symbols.map((sym) => ({
            ...sym,
            verteilerId: sym.verteilerId ?? null,
          }));
          state.circuitGroupOverrides = state.circuitGroupOverrides ?? [];
        }

        // v3: strip legacy stromkreise + stromkreisId
        {
          const symbols = (state.placedSymbols as Array<Record<string, unknown>>) ?? [];
          state.placedSymbols = symbols.map((sym) => {
            delete sym.stromkreisId;
            return sym;
          });
          delete state.stromkreise;
        }

        return state;
      },
    }
  )
);

// ---------------------------------------------------------------------------
// Selectors
// ---------------------------------------------------------------------------

export const useSymbolsForActiveRaum = () =>
  useAppStore(
    useShallow((s) => s.placedSymbols.filter((sym) => sym.raumId === s.activeRaumId))
  );

export const useSelectedSymbol = () =>
  useAppStore(
    useShallow((s) => s.placedSymbols.find((sym) => sym.id === s.selectedSymbolId) ?? null)
  );

export const useAllSymbols = () => useAppStore((s) => s.placedSymbols);

/**
 * Derive circuits from placed symbols (bottom-up).
 * Uses useMemo to avoid infinite re-render (deriveCircuits returns new refs).
 */
export const useDerivedCircuits = (): DerivedCircuit[] => {
  const placedSymbols = useAppStore((s) => s.placedSymbols);
  const gebaeude = useAppStore((s) => s.gebaeude);
  const circuitGroupOverrides = useAppStore((s) => s.circuitGroupOverrides);

  return useMemo(
    () => deriveCircuits({ placedSymbols, symbolCatalog, gebaeude, circuitGroupOverrides }),
    [placedSymbols, gebaeude, circuitGroupOverrides],
  );
};

export const useActiveRaumName = () =>
  useAppStore((s) => {
    for (const sw of s.gebaeude.stockwerke) {
      const raum = sw.raeume.find((r) => r.id === s.activeRaumId);
      if (raum) return `${sw.name} / ${raum.name}`;
    }
    return '';
  });
