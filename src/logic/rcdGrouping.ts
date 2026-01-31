import type { DerivedCircuit, ProtectionRequirement, StromkreisDevice } from '../types';
import { resolveDevices } from './deviceResolver';

export interface RcdGroup {
  id: string;
  verteilerId: string;
  sharedRcdRequirement: ProtectionRequirement;
  sharedRcdDevice: StromkreisDevice | null;
  circuitIds: string[];
}

/**
 * Identify RCD sharing opportunities across derived circuits.
 * Circuits with standalone RCD (not RCBO) in the same Verteiler
 * with compatible specs (faultCurrent, rcdType, poles) share one RCD.
 */
export function groupBySharedRcd(circuits: DerivedCircuit[]): RcdGroup[] {
  const candidates: { circuit: DerivedCircuit; rcdReq: ProtectionRequirement }[] = [];

  for (const circuit of circuits) {
    // RCBO has built-in RCD → not shareable
    if (circuit.mergedRequirements.some((r) => r.role === 'rcbo')) continue;

    const rcdReq = circuit.mergedRequirements.find(
      (r) => r.role === 'rcd' || r.role === 'rcd_type_b',
    );
    if (!rcdReq) continue;

    candidates.push({ circuit, rcdReq });
  }

  // Group by: verteilerId + faultCurrent + rcdType + poles
  const groups = new Map<string, typeof candidates>();
  for (const entry of candidates) {
    const key = [
      entry.circuit.verteilerId,
      entry.rcdReq.faultCurrent ?? 30,
      entry.rcdReq.rcdType ?? 'A',
      entry.rcdReq.poles ?? 2,
    ].join('::');
    const arr = groups.get(key) ?? [];
    arr.push(entry);
    groups.set(key, arr);
  }

  const result: RcdGroup[] = [];
  for (const [key, members] of groups) {
    if (members.length === 0) continue;

    // Shared RCD: max ratedCurrent across group
    const maxRated = Math.max(...members.map((m) => m.rcdReq.ratedCurrent ?? 40));
    const sharedReq: ProtectionRequirement = { ...members[0].rcdReq, ratedCurrent: maxRated };

    // Resolve the shared RCD device
    const resolved = resolveDevices([sharedReq]);
    const sharedDevice = resolved.length > 0 ? resolved[0] : null;

    result.push({
      id: `rcd-group-${key}`,
      verteilerId: members[0].circuit.verteilerId,
      sharedRcdRequirement: sharedReq,
      sharedRcdDevice: sharedDevice,
      circuitIds: members.map((m) => m.circuit.id),
    });
  }

  return result;
}

/**
 * Return a circuit's devices without the RCD (which is shared).
 */
export function circuitDevicesWithoutRcd(circuit: DerivedCircuit): StromkreisDevice[] {
  return circuit.resolvedDevices.filter(
    (d) => d.role !== 'rcd' && d.role !== 'rcd_type_b',
  );
}
