import type {
  PlacedSymbol,
  SymbolDefinition,
  DerivedCircuit,
  CircuitGroupOverride,
  ProtectionRequirement,
  CircuitGroupingHint,
  Gebaeude,
} from '../types';
import { GROUPING_HINT_LABELS } from '../types';
import { resolveDevices } from './deviceResolver';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Build a deterministic group key from verteilerId + raumId + groupingHint. */
function groupKey(verteilerId: string, raumId: string, hint: CircuitGroupingHint): string {
  return `${verteilerId}::${raumId}::${hint}`;
}

/** Deterministic circuit id from group key + index for dedicated circuits. */
function circuitId(key: string, index?: number): string {
  const base = `derived-${key}`;
  return index != null ? `${base}::${index}` : base;
}

/** Resolve room name from Gebaeude structure. */
function raumName(gebaeude: Gebaeude, raumId: string): string {
  for (const sw of gebaeude.stockwerke) {
    const raum = sw.raeume.find((r) => r.id === raumId);
    if (raum) return raum.name;
  }
  return raumId;
}

/**
 * Get the effective protection requirements for a placed symbol.
 * User overrides take precedence over catalog defaults.
 */
function effectiveRequirements(
  symbol: PlacedSymbol,
  def: SymbolDefinition,
): ProtectionRequirement[] {
  if (symbol.protectionOverrides && symbol.protectionOverrides.length > 0) {
    return symbol.protectionOverrides;
  }
  return def.protectionProfile.requirements;
}

/**
 * Merge requirements from multiple symbols in the same group.
 * For MCB: take the highest ratedCurrent.
 * For RCD/RCBO: take the highest ratedCurrent, keep faultCurrent/rcdType consistent.
 * For AFDD: take the highest ratedCurrent.
 */
function mergeRequirements(allReqs: ProtectionRequirement[][]): ProtectionRequirement[] {
  const byRole = new Map<string, ProtectionRequirement[]>();
  for (const reqs of allReqs) {
    for (const req of reqs) {
      const existing = byRole.get(req.role) ?? [];
      existing.push(req);
      byRole.set(req.role, existing);
    }
  }

  const merged: ProtectionRequirement[] = [];
  for (const [, reqs] of byRole) {
    if (reqs.length === 0) continue;
    // Start from first, then take max ratedCurrent
    const base = { ...reqs[0] };
    for (let i = 1; i < reqs.length; i++) {
      const r = reqs[i];
      if (r.ratedCurrent != null && (base.ratedCurrent == null || r.ratedCurrent > base.ratedCurrent)) {
        base.ratedCurrent = r.ratedCurrent;
      }
    }
    merged.push(base);
  }
  return merged;
}

// ---------------------------------------------------------------------------
// Main derivation function
// ---------------------------------------------------------------------------

export interface DeriveCircuitsInput {
  placedSymbols: PlacedSymbol[];
  symbolCatalog: SymbolDefinition[];
  gebaeude: Gebaeude;
  circuitGroupOverrides: CircuitGroupOverride[];
}

export function deriveCircuits(input: DeriveCircuitsInput): DerivedCircuit[] {
  const { placedSymbols, symbolCatalog, gebaeude, circuitGroupOverrides } = input;

  const catalogMap = new Map(symbolCatalog.map((s) => [s.key, s]));
  const overrideMap = new Map(circuitGroupOverrides.map((o) => [o.groupId, o]));

  // 1. Collect symbols that need protection
  type SymbolWithProfile = {
    symbol: PlacedSymbol;
    def: SymbolDefinition;
    requirements: ProtectionRequirement[];
    dedicatedCircuit: boolean;
    groupingHint: CircuitGroupingHint;
    verteilerId: string;
  };

  const eligible: SymbolWithProfile[] = [];
  for (const sym of placedSymbols) {
    const def = catalogMap.get(sym.symbolKey);
    if (!def) continue;

    const reqs = effectiveRequirements(sym, def);
    if (reqs.length === 0) continue;

    const verteilerId = sym.verteilerId ?? 'HV-EG'; // default Verteiler fallback

    eligible.push({
      symbol: sym,
      def,
      requirements: reqs,
      dedicatedCircuit: def.protectionProfile.dedicatedCircuit,
      groupingHint: def.protectionProfile.groupingHint,
      verteilerId,
    });
  }

  // 2. Group symbols
  // Symbols with manual circuitGroupOverride go to their specified group
  // Dedicated symbols get their own group
  // Others group by verteilerId + raumId + groupingHint

  const groups = new Map<string, SymbolWithProfile[]>();

  let dedicatedCounter = 0;
  for (const entry of eligible) {
    let key: string;

    if (entry.symbol.circuitGroupOverride) {
      // Manual override: use the specified group id
      key = entry.symbol.circuitGroupOverride;
    } else if (entry.dedicatedCircuit) {
      // Dedicated: each symbol gets its own circuit
      key = `dedicated::${entry.symbol.id}::${dedicatedCounter++}`;
    } else {
      // Auto-group by verteilerId + raumId + groupingHint
      key = groupKey(entry.verteilerId, entry.symbol.raumId, entry.groupingHint);
    }

    const group = groups.get(key) ?? [];
    group.push(entry);
    groups.set(key, group);
  }

  // 3. Build DerivedCircuits
  const circuits: DerivedCircuit[] = [];
  let skCounter = 1;

  // Sort groups deterministically (by key)
  const sortedKeys = [...groups.keys()].sort();

  for (const key of sortedKeys) {
    const members = groups.get(key)!;
    if (members.length === 0) continue;

    const override = overrideMap.get(key);
    const firstMember = members[0];

    // Merge requirements from all members
    const allReqs = members.map((m) => m.requirements);
    const merged = mergeRequirements(allReqs);

    // Resolve devices from merged requirements
    const resolvedDevices = override?.deviceOverrides ?? resolveDevices(merged);

    // Auto-name
    const hintLabel = GROUPING_HINT_LABELS[firstMember.groupingHint] ?? firstMember.groupingHint;
    const room = raumName(gebaeude, firstMember.symbol.raumId);
    const isDedicated = firstMember.dedicatedCircuit;
    const autoName = isDedicated
      ? `SK${skCounter} ${firstMember.def.label} ${room}`
      : `SK${skCounter} ${hintLabel} ${room}`;

    const circuit: DerivedCircuit = {
      id: circuitId(key),
      name: override?.customName ?? autoName,
      verteilerId: override?.verteilerId ?? firstMember.verteilerId,
      raumId: firstMember.symbol.raumId,
      groupingHint: firstMember.groupingHint,
      symbolIds: members.map((m) => m.symbol.id),
      resolvedDevices,
      mergedRequirements: merged,
    };

    circuits.push(circuit);
    skCounter++;
  }

  return circuits;
}
