import type { ProtectionRequirement, StromkreisDevice, CabinetDevice } from '../types';
import { cabinetCatalog } from '../data/cabinetCatalog';

/**
 * Map ProtectionRequirement.role -> CabinetDevice.category for filtering.
 * rcd_type_b is a special case: same category 'rcd' but filtered by rcdType 'B'.
 */
function categoryForRole(role: string): string {
  if (role === 'rcd_type_b') return 'rcd';
  return role;
}

/**
 * Find the smallest matching CabinetDevice for a given ProtectionRequirement.
 * Returns undefined if no match found.
 */
export function resolveDevice(req: ProtectionRequirement): CabinetDevice | undefined {
  const cat = categoryForRole(req.role);

  const candidates = cabinetCatalog.filter((d) => {
    if (d.category !== cat) return false;

    // Poles: must match exactly if specified
    if (req.poles != null && d.poles !== req.poles) return false;

    // RCD type: must match if specified
    if (req.rcdType != null && d.rcdType !== req.rcdType) return false;

    // For rcd_type_b role: must be Type B
    if (req.role === 'rcd_type_b' && d.rcdType !== 'B') return false;

    // Characteristic: must match if specified
    if (req.characteristic != null && d.characteristic != null && d.characteristic !== req.characteristic) return false;

    // Rated current: device must be >= required
    if (req.ratedCurrent != null && d.ratedCurrent != null && d.ratedCurrent < req.ratedCurrent) return false;

    // Fault current: must match exactly (30mA is not interchangeable with 300mA)
    if (req.faultCurrent != null && d.faultCurrent != null && d.faultCurrent !== req.faultCurrent) return false;

    return true;
  });

  if (candidates.length === 0) return undefined;

  // Pick smallest matching device (prefer exact ratedCurrent, then smallest above)
  candidates.sort((a, b) => (a.ratedCurrent ?? 0) - (b.ratedCurrent ?? 0));
  return candidates[0];
}

/**
 * Resolve all ProtectionRequirements into StromkreisDevices.
 * Skips requirements that can't be resolved.
 */
export function resolveDevices(requirements: ProtectionRequirement[]): StromkreisDevice[] {
  const result: StromkreisDevice[] = [];
  for (const req of requirements) {
    const device = resolveDevice(req);
    if (device) {
      result.push({ role: req.role, deviceId: device.id });
    }
  }
  return result;
}
