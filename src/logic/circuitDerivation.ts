import type {
  PlacedSymbol,
  SymbolDefinition,
  DerivedCircuit,
  CircuitGroupOverride,
  ProtectionRequirement,
  CircuitGroupingHint,
  Gebaeude,
  Kabel,
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
  kabel: Kabel[];
}

export function deriveCircuits(input: DeriveCircuitsInput): DerivedCircuit[] {
  const { placedSymbols, symbolCatalog, gebaeude, circuitGroupOverrides, kabel } = input;

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

    const verteilerId = sym.verteilerId ?? 'HV-EG';

    eligible.push({
      symbol: sym,
      def,
      requirements: reqs,
      dedicatedCircuit: def.protectionProfile.dedicatedCircuit,
      groupingHint: def.protectionProfile.groupingHint,
      verteilerId,
    });
  }

  // Pre-step: build cable-based grouping constraints
  // Cables with no coreAssignments -> all connected symbols share a group key
  const eligibleIds = new Set(eligible.map((e) => e.symbol.id));
  const cableGroupMap = new Map<string, string>(); // symbolId -> forced group key

  for (const cable of kabel) {
    if (cable.coreAssignments.length > 0) continue; // core-based grouping deferred
    // Find the first eligible non-dedicated symbol to anchor the group key
    const anchorEntry = eligible.find(
      (e) => cable.connectedSymbolIds.includes(e.symbol.id) && !e.dedicatedCircuit && !e.symbol.circuitGroupOverride
    );
    if (!anchorEntry) continue;

    const sharedKey = groupKey(anchorEntry.verteilerId, anchorEntry.symbol.raumId, anchorEntry.groupingHint);
    for (const sid of cable.connectedSymbolIds) {
      if (eligibleIds.has(sid) && !cableGroupMap.has(sid)) {
        cableGroupMap.set(sid, sharedKey);
      }
    }
  }

  // 2. Group symbols
  // Priority: circuitGroupOverride > cable-group > dedicatedCircuit > auto-group
  const groups = new Map<string, SymbolWithProfile[]>();

  let dedicatedCounter = 0;
  for (const entry of eligible) {
    let key: string;

    if (entry.symbol.circuitGroupOverride) {
      key = entry.symbol.circuitGroupOverride;
    } else if (cableGroupMap.has(entry.symbol.id) && !entry.dedicatedCircuit) {
      key = cableGroupMap.get(entry.symbol.id)!;
    } else if (entry.dedicatedCircuit) {
      key = `dedicated::${entry.symbol.id}::${dedicatedCounter++}`;
    } else {
      key = groupKey(entry.verteilerId, entry.symbol.raumId, entry.groupingHint);
    }

    const group = groups.get(key) ?? [];
    group.push(entry);
    groups.set(key, group);
  }

  // 3. Build DerivedCircuits
  const circuits: DerivedCircuit[] = [];
  let skCounter = 1;

  const sortedKeys = [...groups.keys()].sort();

  for (const key of sortedKeys) {
    const members = groups.get(key)!;
    if (members.length === 0) continue;

    const override = overrideMap.get(key);
    const firstMember = members[0];

    const allReqs = members.map((m) => m.requirements);
    const merged = mergeRequirements(allReqs);

    const resolvedDevices = override?.deviceOverrides ?? resolveDevices(merged);

    const hintLabel = GROUPING_HINT_LABELS[firstMember.groupingHint] ?? firstMember.groupingHint;
    const room = raumName(gebaeude, firstMember.symbol.raumId);
    const isDedicated = firstMember.dedicatedCircuit;
    const autoName = isDedicated
      ? `SK${skCounter} ${firstMember.def.label} ${room}`
      : `SK${skCounter} ${hintLabel} ${room}`;

    // Find cables that overlap with this circuit's symbols
    const symbolIdSet = new Set(members.map((m) => m.symbol.id));
    const kabelIds = kabel
      .filter((k) => k.connectedSymbolIds.some((sid) => symbolIdSet.has(sid)))
      .map((k) => k.id);

    const circuit: DerivedCircuit = {
      id: circuitId(key),
      name: override?.customName ?? autoName,
      verteilerId: override?.verteilerId ?? firstMember.verteilerId,
      raumId: firstMember.symbol.raumId,
      groupingHint: firstMember.groupingHint,
      symbolIds: members.map((m) => m.symbol.id),
      resolvedDevices,
      mergedRequirements: merged,
      kabelIds,
    };

    circuits.push(circuit);
    skCounter++;
  }

  return circuits;
}
