import type { DinRailDevice, DinRailCategory } from '../types';

export const DIN_RAIL_SVG_BASE = 'C:/Users/marce/Desktop/myElectricPlan/symbol-library-electrical-diagram';
export const DIN_RAIL_TE_PER_ROW = 12;

export const dinRailCatalog: DinRailDevice[] = [
  // ===== MCB (Leitungsschutzschalter) =====
  // B-Charakteristik 1-polig
  { id: 'mcb-b6-1p',  category: 'mcb', label: 'LSS B6A 1-polig',  teWidth: 1, poles: 1, svgFile: 'ls-1pol.svg', ratedCurrent: 6,  characteristic: 'B' },
  { id: 'mcb-b10-1p', category: 'mcb', label: 'LSS B10A 1-polig', teWidth: 1, poles: 1, svgFile: 'ls-1pol.svg', ratedCurrent: 10, characteristic: 'B' },
  { id: 'mcb-b13-1p', category: 'mcb', label: 'LSS B13A 1-polig', teWidth: 1, poles: 1, svgFile: 'ls-1pol.svg', ratedCurrent: 13, characteristic: 'B' },
  { id: 'mcb-b16-1p', category: 'mcb', label: 'LSS B16A 1-polig', teWidth: 1, poles: 1, svgFile: 'ls-1pol.svg', ratedCurrent: 16, characteristic: 'B' },
  { id: 'mcb-b20-1p', category: 'mcb', label: 'LSS B20A 1-polig', teWidth: 1, poles: 1, svgFile: 'ls-1pol.svg', ratedCurrent: 20, characteristic: 'B' },
  { id: 'mcb-b25-1p', category: 'mcb', label: 'LSS B25A 1-polig', teWidth: 1, poles: 1, svgFile: 'ls-1pol.svg', ratedCurrent: 25, characteristic: 'B' },
  { id: 'mcb-b32-1p', category: 'mcb', label: 'LSS B32A 1-polig', teWidth: 1, poles: 1, svgFile: 'ls-1pol.svg', ratedCurrent: 32, characteristic: 'B' },
  // C-Charakteristik 1-polig
  { id: 'mcb-c10-1p', category: 'mcb', label: 'LSS C10A 1-polig', teWidth: 1, poles: 1, svgFile: 'ls-1pol.svg', ratedCurrent: 10, characteristic: 'C' },
  { id: 'mcb-c16-1p', category: 'mcb', label: 'LSS C16A 1-polig', teWidth: 1, poles: 1, svgFile: 'ls-1pol.svg', ratedCurrent: 16, characteristic: 'C' },
  { id: 'mcb-c20-1p', category: 'mcb', label: 'LSS C20A 1-polig', teWidth: 1, poles: 1, svgFile: 'ls-1pol.svg', ratedCurrent: 20, characteristic: 'C' },
  { id: 'mcb-c25-1p', category: 'mcb', label: 'LSS C25A 1-polig', teWidth: 1, poles: 1, svgFile: 'ls-1pol.svg', ratedCurrent: 25, characteristic: 'C' },
  { id: 'mcb-c32-1p', category: 'mcb', label: 'LSS C32A 1-polig', teWidth: 1, poles: 1, svgFile: 'ls-1pol.svg', ratedCurrent: 32, characteristic: 'C' },
  // 2-polig (1P+N)
  { id: 'mcb-b16-2p', category: 'mcb', label: 'LSS B16A 1P+N', teWidth: 2, poles: 2, svgFile: 'ls-2pol-n.svg', ratedCurrent: 16, characteristic: 'B' },
  { id: 'mcb-c16-2p', category: 'mcb', label: 'LSS C16A 1P+N', teWidth: 2, poles: 2, svgFile: 'ls-2pol-n.svg', ratedCurrent: 16, characteristic: 'C' },
  { id: 'mcb-c25-2p', category: 'mcb', label: 'LSS C25A 1P+N', teWidth: 2, poles: 2, svgFile: 'ls-2pol-n.svg', ratedCurrent: 25, characteristic: 'C' },
  { id: 'mcb-c32-2p', category: 'mcb', label: 'LSS C32A 1P+N', teWidth: 2, poles: 2, svgFile: 'ls-2pol-n.svg', ratedCurrent: 32, characteristic: 'C' },
  // 3-polig
  { id: 'mcb-b16-3p', category: 'mcb', label: 'LSS B16A 3-polig', teWidth: 3, poles: 3, svgFile: 'ls-3pol.svg', ratedCurrent: 16, characteristic: 'B' },
  { id: 'mcb-c16-3p', category: 'mcb', label: 'LSS C16A 3-polig', teWidth: 3, poles: 3, svgFile: 'ls-3pol.svg', ratedCurrent: 16, characteristic: 'C' },
  { id: 'mcb-c25-3p', category: 'mcb', label: 'LSS C25A 3-polig', teWidth: 3, poles: 3, svgFile: 'ls-3pol.svg', ratedCurrent: 25, characteristic: 'C' },
  { id: 'mcb-c32-3p', category: 'mcb', label: 'LSS C32A 3-polig', teWidth: 3, poles: 3, svgFile: 'ls-3pol.svg', ratedCurrent: 32, characteristic: 'C' },
  // 4-polig (3P+N)
  { id: 'mcb-c25-4p', category: 'mcb', label: 'LSS C25A 3P+N', teWidth: 4, poles: 4, svgFile: 'ls-4pol-n.svg', ratedCurrent: 25, characteristic: 'C' },
  { id: 'mcb-c32-4p', category: 'mcb', label: 'LSS C32A 3P+N', teWidth: 4, poles: 4, svgFile: 'ls-4pol-n.svg', ratedCurrent: 32, characteristic: 'C' },

  // ===== RCD (FI-Schutzschalter) =====
  // 2-polig
  { id: 'rcd-25a-30ma-2p',  category: 'rcd', label: 'FI 25A 30mA 2-polig',  teWidth: 2, poles: 2, svgFile: 'rcd-2pol.svg', ratedCurrent: 25, faultCurrent: 30,  rcdType: 'A' },
  { id: 'rcd-40a-30ma-2p',  category: 'rcd', label: 'FI 40A 30mA 2-polig',  teWidth: 2, poles: 2, svgFile: 'rcd-2pol.svg', ratedCurrent: 40, faultCurrent: 30,  rcdType: 'A' },
  { id: 'rcd-63a-30ma-2p',  category: 'rcd', label: 'FI 63A 30mA 2-polig',  teWidth: 2, poles: 2, svgFile: 'rcd-2pol.svg', ratedCurrent: 63, faultCurrent: 30,  rcdType: 'A' },
  // 4-polig
  { id: 'rcd-40a-30ma-4p',  category: 'rcd', label: 'FI 40A 30mA 4-polig',  teWidth: 4, poles: 4, svgFile: 'rcd-4pol.svg', ratedCurrent: 40, faultCurrent: 30,  rcdType: 'A' },
  { id: 'rcd-63a-30ma-4p',  category: 'rcd', label: 'FI 63A 30mA 4-polig',  teWidth: 4, poles: 4, svgFile: 'rcd-4pol.svg', ratedCurrent: 63, faultCurrent: 30,  rcdType: 'A' },
  { id: 'rcd-63a-100ma-4p', category: 'rcd', label: 'FI 63A 100mA 4-polig', teWidth: 4, poles: 4, svgFile: 'rcd-4pol.svg', ratedCurrent: 63, faultCurrent: 100, rcdType: 'A' },
  { id: 'rcd-63a-300ma-4p', category: 'rcd', label: 'FI 63A 300mA 4-polig', teWidth: 4, poles: 4, svgFile: 'rcd-4pol.svg', ratedCurrent: 63, faultCurrent: 300, rcdType: 'A' },
  // RCD Typ B (allstromsensitiv)
  { id: 'rcd-b-40a-30ma-2p', category: 'rcd', label: 'FI Typ B 40A 30mA 2-polig', teWidth: 2, poles: 2, svgFile: 'rcd-2pol.svg', ratedCurrent: 40, faultCurrent: 30, rcdType: 'B' },
  { id: 'rcd-b-63a-30ma-4p', category: 'rcd', label: 'FI Typ B 63A 30mA 4-polig', teWidth: 4, poles: 4, svgFile: 'rcd-4pol.svg', ratedCurrent: 63, faultCurrent: 30, rcdType: 'B' },

  // ===== RCBO (FI/LS-Kombination) =====
  { id: 'rcbo-b16-30ma-2p', category: 'rcbo', label: 'FI/LS B16A 30mA 1P+N', teWidth: 2, poles: 2, svgFile: 'rcd_ls-2pol.svg', ratedCurrent: 16, characteristic: 'B', faultCurrent: 30 },
  { id: 'rcbo-b20-30ma-2p', category: 'rcbo', label: 'FI/LS B20A 30mA 1P+N', teWidth: 2, poles: 2, svgFile: 'rcd_ls-2pol.svg', ratedCurrent: 20, characteristic: 'B', faultCurrent: 30 },
  { id: 'rcbo-b25-30ma-2p', category: 'rcbo', label: 'FI/LS B25A 30mA 1P+N', teWidth: 2, poles: 2, svgFile: 'rcd_ls-2pol.svg', ratedCurrent: 25, characteristic: 'B', faultCurrent: 30 },
  { id: 'rcbo-c16-30ma-2p', category: 'rcbo', label: 'FI/LS C16A 30mA 1P+N', teWidth: 2, poles: 2, svgFile: 'rcd_ls-2pol.svg', ratedCurrent: 16, characteristic: 'C', faultCurrent: 30 },
  { id: 'rcbo-c25-30ma-2p', category: 'rcbo', label: 'FI/LS C25A 30mA 1P+N', teWidth: 2, poles: 2, svgFile: 'rcd_ls-2pol.svg', ratedCurrent: 25, characteristic: 'C', faultCurrent: 30 },
  { id: 'rcbo-c32-30ma-4p', category: 'rcbo', label: 'FI/LS C32A 30mA 3P+N', teWidth: 4, poles: 4, svgFile: 'rcd_ls-4pol.svg', ratedCurrent: 32, characteristic: 'C', faultCurrent: 30 },

  // ===== AFDD (Brandschutzschalter) =====
  { id: 'afdd-b16-2p',  category: 'afdd', label: 'AFDD B16A 1P+N',  teWidth: 3, poles: 2, svgFile: 'ls-2pol-n-afdd.svg', ratedCurrent: 16, characteristic: 'B' },
  { id: 'afdd-c16-2p',  category: 'afdd', label: 'AFDD C16A 1P+N',  teWidth: 3, poles: 2, svgFile: 'ls-2pol-n-afdd.svg', ratedCurrent: 16, characteristic: 'C' },
  { id: 'afdd-rcbo-b16-30ma-2p', category: 'afdd', label: 'AFDD+FI/LS B16A 30mA', teWidth: 3, poles: 2, svgFile: 'rcd_ls-2pol-afdd.svg', ratedCurrent: 16, characteristic: 'B', faultCurrent: 30 },

  // ===== Schuetz (Contactor) =====
  { id: 'contactor-1p', category: 'contactor', label: 'Schütz 1-polig',  teWidth: 1, poles: 1, svgFile: 'schuetz-1pol.svg' },
  { id: 'contactor-2p', category: 'contactor', label: 'Schütz 2-polig',  teWidth: 2, poles: 2, svgFile: 'schuetz-2pol.svg' },
  { id: 'contactor-3p', category: 'contactor', label: 'Schütz 3-polig',  teWidth: 3, poles: 3, svgFile: 'schuetz-3pol.svg' },
  { id: 'contactor-4p', category: 'contactor', label: 'Schütz 4-polig',  teWidth: 4, poles: 4, svgFile: 'schuetz-4pol.svg' },

  // ===== Zaehler (Meter) =====
  { id: 'meter-2p',           category: 'meter', label: 'Zähler 1P+N',             teWidth: 4, poles: 2, svgFile: 'zaehler-2pol-n.svg' },
  { id: 'meter-4p',           category: 'meter', label: 'Zähler 3P+N',             teWidth: 8, poles: 4, svgFile: 'zaehler-4pol-n.svg' },
  { id: 'meter-feed',         category: 'meter', label: 'Einspeisezähler',         teWidth: 4, poles: 2, svgFile: 'zaehler-einspeisung.svg' },
  { id: 'meter-bidirectional', category: 'meter', label: 'Zweirichtungszähler',     teWidth: 8, poles: 4, svgFile: 'zaehler-zwei-richtung.svg' },

  // ===== SPD (Ueberspannungsschutz) =====
  { id: 'spd-1p',  category: 'spd', label: 'Überspannungsschutz 1P',   teWidth: 1, poles: 1, svgFile: 'ueberspannungsschutz.svg' },
  { id: 'spd-2p',  category: 'spd', label: 'Überspannungsschutz 1P+N', teWidth: 2, poles: 2, svgFile: 'ueberspannung-2pol-n.svg' },
  { id: 'spd-4p',  category: 'spd', label: 'Überspannungsschutz 3P+N', teWidth: 4, poles: 4, svgFile: 'ueberspannung-4pol-n.svg' },

  // ===== Motorschutz =====
  { id: 'motor-prot-3p', category: 'motor_protection', label: 'Motorschutz 3-polig', teWidth: 3, poles: 3, svgFile: 'motorschutz-3pol.svg' },

  // ===== Sicherung (Fuse) =====
  { id: 'fuse-1p',    category: 'fuse', label: 'Schmelzsicherung 1-polig', teWidth: 1, poles: 1, svgFile: 'sich-schmelz-1pol.svg' },
  { id: 'fuse-3p',    category: 'fuse', label: 'Schmelzsicherung 3-polig', teWidth: 3, poles: 3, svgFile: 'sich-schmelz-3pol.svg' },
  { id: 'fuse-d-d0',  category: 'fuse', label: 'D/D0-Sicherung',          teWidth: 1, poles: 1, svgFile: 'd-d0-sicherung.svg' },

  // ===== Trennschalter (Disconnect) =====
  { id: 'disconnect-load',  category: 'disconnect', label: 'Lasttrennschalter',          teWidth: 3, poles: 3, svgFile: 'last-trennschalter.svg' },
  { id: 'disconnect-fused', category: 'disconnect', label: 'Sicherungs-Lasttrennschalter', teWidth: 3, poles: 3, svgFile: 'sicherungs-last-trennschalter.svg' },
];

// --- Lookup helpers ---

const catalogMap = new Map(dinRailCatalog.map((d) => [d.id, d]));

export function findDevice(id: string): DinRailDevice | undefined {
  return catalogMap.get(id);
}

export function devicesByCategory(cat: DinRailCategory): DinRailDevice[] {
  return dinRailCatalog.filter((d) => d.category === cat);
}

export function getDinRailSvgPath(device: DinRailDevice): string {
  return `${DIN_RAIL_SVG_BASE}/${device.svgFile}`;
}

/** Map ElectricalPropertyType -> DinRailCategory for device selection filtering. */
export function dinRailCategoryForRole(role: string): DinRailCategory {
  switch (role) {
    case 'mcb': return 'mcb';
    case 'rcd': return 'rcd';
    case 'rcbo': return 'rcbo';
    case 'afdd': return 'afdd';
    case 'rcd_type_b': return 'rcd';
    default: return 'mcb';
  }
}

/** Filter devices for a given ElectricalPropertyType role. */
export function devicesForRole(role: string): DinRailDevice[] {
  if (role === 'rcd_type_b') {
    return dinRailCatalog.filter((d) => d.category === 'rcd' && d.rcdType === 'B');
  }
  return devicesByCategory(dinRailCategoryForRole(role));
}
