import type { SymbolDefinition, SymbolFieldConfig, SymbolCategory, ElectricalPropertyType, CabinetMappingInfo, ProtectionProfile } from '../types';

const s = (category: string, name: string) =>
  `/symbols/simple-${category}-${name}.svg`;

const FC: Record<SymbolCategory, SymbolFieldConfig> = {
  socket:      { attribute: { farbe: 'required', hoehe: 'optional', kabeltyp: 'required' }, stromkreis: 'required', knx: 'optional' },
  switch:      { attribute: { farbe: 'required', hoehe: 'required', kabeltyp: 'required' }, stromkreis: 'required', knx: 'optional' },
  light:       { attribute: { farbe: 'optional', hoehe: 'required', kabeltyp: 'required' }, stromkreis: 'required', knx: 'optional' },
  sensor:      { attribute: { farbe: 'optional', hoehe: 'optional', kabeltyp: 'required' }, stromkreis: 'optional', knx: 'optional' },
  safety:      { attribute: { farbe: 'hidden',   hoehe: 'optional', kabeltyp: 'required' }, stromkreis: 'hidden',   knx: 'optional' },
  smarthome:   { attribute: { farbe: 'optional', hoehe: 'optional', kabeltyp: 'required' }, stromkreis: 'hidden',   knx: 'required' },
  network:     { attribute: { farbe: 'optional', hoehe: 'optional', kabeltyp: 'required' }, stromkreis: 'hidden',   knx: 'hidden' },
  homedevice:  { attribute: { farbe: 'hidden',   hoehe: 'hidden',   kabeltyp: 'required' }, stromkreis: 'required', knx: 'optional' },
  distributor: { attribute: { farbe: 'hidden',   hoehe: 'optional', kabeltyp: 'required' }, stromkreis: 'hidden',   knx: 'hidden' },
  grounding:   { attribute: { farbe: 'hidden',   hoehe: 'hidden',   kabeltyp: 'required' }, stromkreis: 'hidden',   knx: 'hidden' },
  intercom:    { attribute: { farbe: 'optional', hoehe: 'optional', kabeltyp: 'required' }, stromkreis: 'hidden',   knx: 'optional' },
  others:      { attribute: { farbe: 'optional', hoehe: 'optional', kabeltyp: 'required' }, stromkreis: 'optional', knx: 'optional' },
};

type RawSymbol = Omit<SymbolDefinition, 'isDistributor' | 'requiredElectricalProperties' | 'protectionProfile' | 'cabinetMapping'>;

const CATEGORY_ELECTRICAL_REQUIREMENTS: Record<SymbolCategory, ElectricalPropertyType[]> = {
  socket:      ['mcb', 'rcd'],
  switch:      ['mcb', 'rcd'],
  light:       ['mcb', 'rcd'],
  sensor:      [],
  safety:      [],
  smarthome:   [],
  network:     [],
  homedevice:  ['mcb', 'rcd'],
  distributor: [],
  grounding:   [],
  intercom:    [],
  others:      ['mcb', 'rcd'],
};

const CATEGORY_CABINET_MAPPING: Record<SymbolCategory, CabinetMappingInfo> = {
  socket:      { targetField: 'VF', elementTypes: ['mcb', 'rcd'], description: 'MCB + RCD im Verteilerfeld' },
  switch:      { targetField: 'VF', elementTypes: ['mcb', 'rcd'], description: 'MCB + RCD im Verteilerfeld' },
  light:       { targetField: 'VF', elementTypes: ['mcb', 'rcd'], description: 'MCB + RCD im Verteilerfeld' },
  homedevice:  { targetField: 'VF', elementTypes: ['mcb', 'rcd'], description: 'Eigener Stromkreis im Verteilerfeld' },
  sensor:      { targetField: null, elementTypes: [], description: 'Kein Schaltschrankelement' },
  safety:      { targetField: null, elementTypes: [], description: 'Kein Schaltschrankelement' },
  smarthome:   { targetField: 'RfZ', elementTypes: [], description: 'KNX im Raum fuer Zusatzanwendungen' },
  network:     { targetField: null, elementTypes: [], description: 'Kein Schaltschrankelement' },
  distributor: { targetField: null, elementTypes: [], description: 'Ist selbst ein Verteiler' },
  grounding:   { targetField: 'NAR', elementTypes: [], description: 'Potentialausgleich im Netzanschlussraum' },
  intercom:    { targetField: null, elementTypes: [], description: 'Kein Schaltschrankelement' },
  others:      { targetField: 'VF', elementTypes: ['mcb', 'rcd'], description: 'Falls elektrisch: MCB + RCD im VF' },
};

/** Per-symbol overrides for electrical requirements (special cases) */
const SYMBOL_ELECTRICAL_OVERRIDES: Record<string, ElectricalPropertyType[]> = {
  high_voltage_socket: ['mcb', 'rcd', 'rcd_type_b'],
  charging_station: ['mcb', 'rcd', 'rcbo', 'afdd', 'rcd_type_b'],
  instant_water_heater: ['mcb', 'rcd', 'rcbo'],
  hot_water_storage_tank: ['mcb', 'rcd'],
  washing_machine: ['mcb', 'rcd', 'rcbo'],
  dishwasher: ['mcb', 'rcd', 'rcbo'],
  oven: ['mcb', 'rcd'],
  air_conditioning: ['mcb', 'rcd', 'afdd'],
  pv_inverter: ['mcb', 'rcd', 'rcd_type_b', 'afdd'],
  battery_storage: ['mcb', 'rcd', 'rcd_type_b', 'afdd'],
};

const SYMBOL_CABINET_OVERRIDES: Record<string, CabinetMappingInfo> = {
  high_voltage_socket: { targetField: 'VF', elementTypes: ['mcb', 'rcd', 'rcd_type_b'], description: 'CEE: MCB + RCD Typ B im VF' },
  charging_station: { targetField: 'VF', elementTypes: ['mcb', 'rcbo', 'afdd', 'rcd_type_b'], description: 'Wallbox: RCBO + AFDD + RCD Typ B im VF' },
  pv_inverter: { targetField: 'VF', elementTypes: ['mcb', 'rcd_type_b', 'afdd'], description: 'PV: MCB + RCD Typ B + AFDD im VF' },
  battery_storage: { targetField: 'VF', elementTypes: ['mcb', 'rcd_type_b', 'afdd'], description: 'Speicher: MCB + RCD Typ B + AFDD im VF' },
};

const NO_PROTECTION: ProtectionProfile = { requirements: [], dedicatedCircuit: false, groupingHint: 'special' };

const CATEGORY_PROTECTION_PROFILES: Record<SymbolCategory, ProtectionProfile> = {
  socket: {
    requirements: [
      { role: 'mcb', ratedCurrent: 16, characteristic: 'B', poles: 1 },
      { role: 'rcd', ratedCurrent: 40, faultCurrent: 30, rcdType: 'A', poles: 2 },
    ],
    dedicatedCircuit: false,
    groupingHint: 'socket',
  },
  switch: {
    requirements: [
      { role: 'mcb', ratedCurrent: 10, characteristic: 'B', poles: 1 },
      { role: 'rcd', ratedCurrent: 40, faultCurrent: 30, rcdType: 'A', poles: 2 },
    ],
    dedicatedCircuit: false,
    groupingHint: 'light',
  },
  light: {
    requirements: [
      { role: 'mcb', ratedCurrent: 10, characteristic: 'B', poles: 1 },
      { role: 'rcd', ratedCurrent: 40, faultCurrent: 30, rcdType: 'A', poles: 2 },
    ],
    dedicatedCircuit: false,
    groupingHint: 'light',
  },
  sensor:      NO_PROTECTION,
  safety:      NO_PROTECTION,
  smarthome:   NO_PROTECTION,
  network:     NO_PROTECTION,
  homedevice: {
    requirements: [
      { role: 'mcb', ratedCurrent: 16, characteristic: 'B', poles: 1 },
      { role: 'rcd', ratedCurrent: 40, faultCurrent: 30, rcdType: 'A', poles: 2 },
    ],
    dedicatedCircuit: true,
    groupingHint: 'dedicated',
  },
  distributor: NO_PROTECTION,
  grounding:   NO_PROTECTION,
  intercom:    NO_PROTECTION,
  others: {
    requirements: [
      { role: 'mcb', ratedCurrent: 16, characteristic: 'B', poles: 1 },
      { role: 'rcd', ratedCurrent: 40, faultCurrent: 30, rcdType: 'A', poles: 2 },
    ],
    dedicatedCircuit: false,
    groupingHint: 'socket',
  },
};

const SYMBOL_PROTECTION_OVERRIDES: Record<string, ProtectionProfile> = {
  high_voltage_socket: {
    requirements: [
      { role: 'mcb', ratedCurrent: 32, characteristic: 'C', poles: 3 },
      { role: 'rcd', ratedCurrent: 40, faultCurrent: 30, rcdType: 'B', poles: 4 },
    ],
    dedicatedCircuit: true,
    groupingHint: 'dedicated',
  },
  charging_station: {
    requirements: [
      { role: 'rcbo', ratedCurrent: 16, characteristic: 'C', faultCurrent: 30, poles: 2 },
      { role: 'afdd', ratedCurrent: 16, characteristic: 'C', poles: 2 },
      { role: 'rcd_type_b', ratedCurrent: 40, faultCurrent: 30, rcdType: 'B', poles: 2 },
    ],
    dedicatedCircuit: true,
    groupingHint: 'dedicated',
  },
  stove: {
    requirements: [
      { role: 'mcb', ratedCurrent: 25, characteristic: 'C', poles: 3 },
      { role: 'rcd', ratedCurrent: 40, faultCurrent: 30, rcdType: 'A', poles: 4 },
    ],
    dedicatedCircuit: true,
    groupingHint: 'dedicated',
  },
  oven: {
    requirements: [
      { role: 'mcb', ratedCurrent: 16, characteristic: 'B', poles: 1 },
      { role: 'rcd', ratedCurrent: 40, faultCurrent: 30, rcdType: 'A', poles: 2 },
    ],
    dedicatedCircuit: true,
    groupingHint: 'dedicated',
  },
  instant_water_heater: {
    requirements: [
      { role: 'rcbo', ratedCurrent: 32, characteristic: 'C', faultCurrent: 30, poles: 3 },
    ],
    dedicatedCircuit: true,
    groupingHint: 'dedicated',
  },
  washing_machine: {
    requirements: [
      { role: 'rcbo', ratedCurrent: 16, characteristic: 'B', faultCurrent: 30, poles: 2 },
    ],
    dedicatedCircuit: true,
    groupingHint: 'dedicated',
  },
  dishwasher: {
    requirements: [
      { role: 'rcbo', ratedCurrent: 16, characteristic: 'B', faultCurrent: 30, poles: 2 },
    ],
    dedicatedCircuit: true,
    groupingHint: 'dedicated',
  },
  air_conditioning: {
    requirements: [
      { role: 'mcb', ratedCurrent: 16, characteristic: 'C', poles: 1 },
      { role: 'rcd', ratedCurrent: 40, faultCurrent: 30, rcdType: 'A', poles: 2 },
      { role: 'afdd', ratedCurrent: 16, characteristic: 'C', poles: 1 },
    ],
    dedicatedCircuit: true,
    groupingHint: 'dedicated',
  },
  general_connection_32A: {
    requirements: [
      { role: 'mcb', ratedCurrent: 32, characteristic: 'C', poles: 3 },
      { role: 'rcd', ratedCurrent: 40, faultCurrent: 30, rcdType: 'A', poles: 4 },
    ],
    dedicatedCircuit: true,
    groupingHint: 'dedicated',
  },
  motor: {
    requirements: [
      { role: 'mcb', ratedCurrent: 16, characteristic: 'C', poles: 3 },
      { role: 'rcd', ratedCurrent: 40, faultCurrent: 30, rcdType: 'A', poles: 4 },
    ],
    dedicatedCircuit: true,
    groupingHint: 'dedicated',
  },
};

const DISTRIBUTOR_KEYS = new Set(['house_connection', 'meter_cabinet', 'sub_distributor', 'junction_box', 'heating_circuit_distributor']);

const rawCatalog: RawSymbol[] = [
  // ===== SOCKET =====
  { key: 'empty_junction_box', label: 'Leere Abzweigdose', category: 'socket', svgPath: s('socket', 'empty_junction_box'),
    defaultAttribute: { farbe: 'Reinweiss', hoehe: 30, kabeltyp: 'NYM-J 3x1,5' },
    defaultKnx: { geraetetyp: '', variante: 'Standard' },
    defaultArtikel: [
      { id: 's01-1', bezeichnung: 'UP-Dose', typ: 'material', menge: 1, einheit: 'Stk', einzelpreis: 0.85 },
      { id: 's01-2', bezeichnung: 'Blindabdeckung', typ: 'material', menge: 1, einheit: 'Stk', einzelpreis: 1.20 },
      { id: 's01-3', bezeichnung: 'Montage', typ: 'service', menge: 0.25, einheit: 'Std', einzelpreis: 45.0 },
    ], fieldConfig: { ...FC.socket, stromkreis: 'hidden', knx: 'hidden' } },
  { key: 'grounded_socket', label: 'Schutzkontaktsteckdose', category: 'socket', svgPath: s('socket', 'grounded_socket'),
    defaultAttribute: { farbe: 'Reinweiss', hoehe: 30, kabeltyp: 'NYM-J 3x2,5' },
    defaultKnx: { geraetetyp: 'Schaltaktor', variante: 'Standard' },
    defaultArtikel: [
      { id: 's02-1', bezeichnung: 'Steckdose Innenteil', typ: 'material', menge: 1, einheit: 'Stk', einzelpreis: 8.50 },
      { id: 's02-2', bezeichnung: 'Abdeckrahmen 1-fach', typ: 'material', menge: 1, einheit: 'Stk', einzelpreis: 3.20 },
      { id: 's02-3', bezeichnung: 'UP-Dose', typ: 'material', menge: 1, einheit: 'Stk', einzelpreis: 0.85 },
      { id: 's02-4', bezeichnung: 'Anschluss', typ: 'service', menge: 1, einheit: 'Std', einzelpreis: 45.0 },
    ], fieldConfig: FC.socket },
  { key: 'grounded_socket_switchable', label: 'Schutzkontaktsteckdose schaltbar', category: 'socket', svgPath: s('socket', 'grounded_socket_switchable'),
    defaultAttribute: { farbe: 'Reinweiss', hoehe: 30, kabeltyp: 'NYM-J 3x2,5' },
    defaultKnx: { geraetetyp: 'Schaltaktor', variante: 'Standard' },
    defaultArtikel: [
      { id: 's03-1', bezeichnung: 'Steckdose schaltbar', typ: 'material', menge: 1, einheit: 'Stk', einzelpreis: 14.50 },
      { id: 's03-2', bezeichnung: 'Abdeckrahmen 1-fach', typ: 'material', menge: 1, einheit: 'Stk', einzelpreis: 3.20 },
      { id: 's03-3', bezeichnung: 'UP-Dose', typ: 'material', menge: 1, einheit: 'Stk', einzelpreis: 0.85 },
      { id: 's03-4', bezeichnung: 'Anschluss', typ: 'service', menge: 1, einheit: 'Std', einzelpreis: 45.0 },
    ], fieldConfig: FC.socket },
  { key: 'grounded_socket_usb', label: 'Schutzkontaktsteckdose mit USB', category: 'socket', svgPath: s('socket', 'grounded_socket_usb'),
    defaultAttribute: { farbe: 'Reinweiss', hoehe: 30, kabeltyp: 'NYM-J 3x2,5' },
    defaultKnx: { geraetetyp: 'Schaltaktor', variante: 'Standard' },
    defaultArtikel: [
      { id: 's04-1', bezeichnung: 'USB-Steckdose 2-fach', typ: 'material', menge: 1, einheit: 'Stk', einzelpreis: 24.50 },
      { id: 's04-2', bezeichnung: 'Abdeckrahmen 1-fach', typ: 'material', menge: 1, einheit: 'Stk', einzelpreis: 3.20 },
      { id: 's04-3', bezeichnung: 'UP-Dose', typ: 'material', menge: 1, einheit: 'Stk', einzelpreis: 0.85 },
      { id: 's04-4', bezeichnung: 'Anschluss', typ: 'service', menge: 1, einheit: 'Std', einzelpreis: 45.0 },
    ], fieldConfig: FC.socket },
  { key: 'grounded_socket_with_lid', label: 'Schutzkontaktsteckdose mit Deckel', category: 'socket', svgPath: s('socket', 'grounded_socket_with_lid'),
    defaultAttribute: { farbe: 'Reinweiss', hoehe: 30, kabeltyp: 'NYM-J 3x2,5' },
    defaultKnx: { geraetetyp: 'Schaltaktor', variante: 'Standard' },
    defaultArtikel: [
      { id: 's05-1', bezeichnung: 'Steckdose mit Klappdeckel', typ: 'material', menge: 1, einheit: 'Stk', einzelpreis: 12.80 },
      { id: 's05-2', bezeichnung: 'UP-Dose', typ: 'material', menge: 1, einheit: 'Stk', einzelpreis: 0.85 },
      { id: 's05-3', bezeichnung: 'Anschluss', typ: 'service', menge: 1, einheit: 'Std', einzelpreis: 45.0 },
    ], fieldConfig: FC.socket },
  { key: 'grounded_surface_mounted_socket_with_lid', label: 'AP-Schutzkontaktsteckdose mit Deckel', category: 'socket', svgPath: s('socket', 'grounded_surface_mounted_socket_with_lid'),
    defaultAttribute: { farbe: 'Grau', hoehe: 30, kabeltyp: 'NYM-J 3x2,5' },
    defaultKnx: { geraetetyp: 'Schaltaktor', variante: 'Standard' },
    defaultArtikel: [
      { id: 's06-1', bezeichnung: 'AP-Steckdose mit Deckel IP44', typ: 'material', menge: 1, einheit: 'Stk', einzelpreis: 15.90 },
      { id: 's06-2', bezeichnung: 'Anschluss', typ: 'service', menge: 1, einheit: 'Std', einzelpreis: 45.0 },
    ], fieldConfig: FC.socket },
  { key: 'high_voltage_socket', label: 'Starkstromsteckdose', category: 'socket', svgPath: s('socket', 'high_voltage_socket'),
    defaultAttribute: { farbe: 'Rot', hoehe: 100, kabeltyp: 'NYM-J 5x6' },
    defaultKnx: { geraetetyp: '', variante: 'Standard' },
    defaultArtikel: [
      { id: 's07-1', bezeichnung: 'CEE-Steckdose 32A 5p', typ: 'material', menge: 1, einheit: 'Stk', einzelpreis: 28.50 },
      { id: 's07-2', bezeichnung: 'AP-Gehäuse', typ: 'material', menge: 1, einheit: 'Stk', einzelpreis: 8.90 },
      { id: 's07-3', bezeichnung: 'Anschluss', typ: 'service', menge: 1.5, einheit: 'Std', einzelpreis: 45.0 },
    ], fieldConfig: { ...FC.socket, knx: 'hidden' } },
  { key: 'socket_switchable', label: 'Steckdose schaltbar', category: 'socket', svgPath: s('socket', 'socket_switchable'),
    defaultAttribute: { farbe: 'Reinweiss', hoehe: 30, kabeltyp: 'NYM-J 3x2,5' },
    defaultKnx: { geraetetyp: 'Schaltaktor', variante: 'Standard' },
    defaultArtikel: [
      { id: 's08-1', bezeichnung: 'Steckdose schaltbar', typ: 'material', menge: 1, einheit: 'Stk', einzelpreis: 14.50 },
      { id: 's08-2', bezeichnung: 'UP-Dose', typ: 'material', menge: 1, einheit: 'Stk', einzelpreis: 0.85 },
      { id: 's08-3', bezeichnung: 'Anschluss', typ: 'service', menge: 1, einheit: 'Std', einzelpreis: 45.0 },
    ], fieldConfig: FC.socket },
  { key: 'socket_with_extra_touch_protection', label: 'Steckdose mit Berührungsschutz', category: 'socket', svgPath: s('socket', 'socket_with_extra_touch_protection'),
    defaultAttribute: { farbe: 'Reinweiss', hoehe: 30, kabeltyp: 'NYM-J 3x2,5' },
    defaultKnx: { geraetetyp: 'Schaltaktor', variante: 'Standard' },
    defaultArtikel: [
      { id: 's09-1', bezeichnung: 'Kinderschutz-Steckdose', typ: 'material', menge: 1, einheit: 'Stk', einzelpreis: 10.20 },
      { id: 's09-2', bezeichnung: 'UP-Dose', typ: 'material', menge: 1, einheit: 'Stk', einzelpreis: 0.85 },
      { id: 's09-3', bezeichnung: 'Anschluss', typ: 'service', menge: 1, einheit: 'Std', einzelpreis: 45.0 },
    ], fieldConfig: FC.socket },
  { key: 'surface_mounted_socket', label: 'AP-Steckdose', category: 'socket', svgPath: s('socket', 'surface_mounted_socket'),
    defaultAttribute: { farbe: 'Reinweiss', hoehe: 30, kabeltyp: 'NYM-J 3x2,5' },
    defaultKnx: { geraetetyp: 'Schaltaktor', variante: 'Standard' },
    defaultArtikel: [
      { id: 's10-1', bezeichnung: 'AP-Steckdose', typ: 'material', menge: 1, einheit: 'Stk', einzelpreis: 9.80 },
      { id: 's10-2', bezeichnung: 'Anschluss', typ: 'service', menge: 1, einheit: 'Std', einzelpreis: 45.0 },
    ], fieldConfig: FC.socket },
  { key: 'surface_mounted_socket_with_extra_touch_protection', label: 'AP-Steckdose mit Berührungsschutz', category: 'socket', svgPath: s('socket', 'surface_mounted_socket_with_extra_touch_protection'),
    defaultAttribute: { farbe: 'Reinweiss', hoehe: 30, kabeltyp: 'NYM-J 3x2,5' },
    defaultKnx: { geraetetyp: 'Schaltaktor', variante: 'Standard' },
    defaultArtikel: [
      { id: 's11-1', bezeichnung: 'AP-Kinderschutz-Steckdose', typ: 'material', menge: 1, einheit: 'Stk', einzelpreis: 11.50 },
      { id: 's11-2', bezeichnung: 'Anschluss', typ: 'service', menge: 1, einheit: 'Std', einzelpreis: 45.0 },
    ], fieldConfig: FC.socket },

  // ===== SWITCH =====
  { key: 'button', label: 'Taster', category: 'switch', svgPath: s('switch', 'button'),
    defaultAttribute: { farbe: 'Reinweiss', hoehe: 105, kabeltyp: 'NYM-J 3x1,5' },
    defaultKnx: { geraetetyp: 'Taster', variante: 'Standard' },
    defaultArtikel: [
      { id: 'sw01-1', bezeichnung: 'Taster-Einsatz', typ: 'material', menge: 1, einheit: 'Stk', einzelpreis: 7.20 },
      { id: 'sw01-2', bezeichnung: 'Wippe', typ: 'material', menge: 1, einheit: 'Stk', einzelpreis: 2.90 },
      { id: 'sw01-3', bezeichnung: 'Abdeckrahmen 1-fach', typ: 'material', menge: 1, einheit: 'Stk', einzelpreis: 3.20 },
      { id: 'sw01-4', bezeichnung: 'UP-Dose', typ: 'material', menge: 1, einheit: 'Stk', einzelpreis: 0.85 },
      { id: 'sw01-5', bezeichnung: 'Anschluss', typ: 'service', menge: 1, einheit: 'Std', einzelpreis: 45.0 },
    ], fieldConfig: FC.switch },
  { key: 'button_indicator_light', label: 'Taster mit Kontrollleuchte', category: 'switch', svgPath: s('switch', 'button_indicator_light'),
    defaultAttribute: { farbe: 'Reinweiss', hoehe: 105, kabeltyp: 'NYM-J 3x1,5' },
    defaultKnx: { geraetetyp: 'Taster', variante: 'Standard' },
    defaultArtikel: [
      { id: 'sw02-1', bezeichnung: 'Taster mit Kontrolllicht', typ: 'material', menge: 1, einheit: 'Stk', einzelpreis: 11.80 },
      { id: 'sw02-2', bezeichnung: 'Abdeckrahmen 1-fach', typ: 'material', menge: 1, einheit: 'Stk', einzelpreis: 3.20 },
      { id: 'sw02-3', bezeichnung: 'UP-Dose', typ: 'material', menge: 1, einheit: 'Stk', einzelpreis: 0.85 },
      { id: 'sw02-4', bezeichnung: 'Anschluss', typ: 'service', menge: 1, einheit: 'Std', einzelpreis: 45.0 },
    ], fieldConfig: FC.switch },
  { key: 'changeover_switch', label: 'Wechselschalter', category: 'switch', svgPath: s('switch', 'changeover_switch'),
    defaultAttribute: { farbe: 'Reinweiss', hoehe: 105, kabeltyp: 'NYM-J 3x1,5' },
    defaultKnx: { geraetetyp: 'Schaltaktor', variante: 'Standard' },
    defaultArtikel: [
      { id: 'sw03-1', bezeichnung: 'Wechselschalter-Einsatz', typ: 'material', menge: 1, einheit: 'Stk', einzelpreis: 6.80 },
      { id: 'sw03-2', bezeichnung: 'Wippe', typ: 'material', menge: 1, einheit: 'Stk', einzelpreis: 2.90 },
      { id: 'sw03-3', bezeichnung: 'Abdeckrahmen 1-fach', typ: 'material', menge: 1, einheit: 'Stk', einzelpreis: 3.20 },
      { id: 'sw03-4', bezeichnung: 'UP-Dose', typ: 'material', menge: 1, einheit: 'Stk', einzelpreis: 0.85 },
      { id: 'sw03-5', bezeichnung: 'Anschluss', typ: 'service', menge: 1, einheit: 'Std', einzelpreis: 45.0 },
    ], fieldConfig: FC.switch },
  { key: 'changeover_switch_double', label: 'Doppelwechselschalter', category: 'switch', svgPath: s('switch', 'changeover_switch_double'),
    defaultAttribute: { farbe: 'Reinweiss', hoehe: 105, kabeltyp: 'NYM-J 5x1,5' },
    defaultKnx: { geraetetyp: 'Schaltaktor', variante: 'Standard' },
    defaultArtikel: [
      { id: 'sw04-1', bezeichnung: 'Doppelwechselschalter-Einsatz', typ: 'material', menge: 1, einheit: 'Stk', einzelpreis: 12.40 },
      { id: 'sw04-2', bezeichnung: 'Doppelwippe', typ: 'material', menge: 1, einheit: 'Stk', einzelpreis: 4.50 },
      { id: 'sw04-3', bezeichnung: 'UP-Dose', typ: 'material', menge: 1, einheit: 'Stk', einzelpreis: 0.85 },
      { id: 'sw04-4', bezeichnung: 'Anschluss', typ: 'service', menge: 1, einheit: 'Std', einzelpreis: 45.0 },
    ], fieldConfig: FC.switch },
  { key: 'changeover_switch_indicator_light', label: 'Wechselschalter mit Kontrollleuchte', category: 'switch', svgPath: s('switch', 'changeover_switch_indicator_light'),
    defaultAttribute: { farbe: 'Reinweiss', hoehe: 105, kabeltyp: 'NYM-J 3x1,5' },
    defaultKnx: { geraetetyp: 'Schaltaktor', variante: 'Standard' },
    defaultArtikel: [
      { id: 'sw05-1', bezeichnung: 'Wechselschalter Kontrolllicht', typ: 'material', menge: 1, einheit: 'Stk', einzelpreis: 11.20 },
      { id: 'sw05-2', bezeichnung: 'UP-Dose', typ: 'material', menge: 1, einheit: 'Stk', einzelpreis: 0.85 },
      { id: 'sw05-3', bezeichnung: 'Anschluss', typ: 'service', menge: 1, einheit: 'Std', einzelpreis: 45.0 },
    ], fieldConfig: FC.switch },
  { key: 'cross_switch', label: 'Kreuzschalter', category: 'switch', svgPath: s('switch', 'cross_switch'),
    defaultAttribute: { farbe: 'Reinweiss', hoehe: 105, kabeltyp: 'NYM-J 5x1,5' },
    defaultKnx: { geraetetyp: 'Schaltaktor', variante: 'Standard' },
    defaultArtikel: [
      { id: 'sw06-1', bezeichnung: 'Kreuzschalter-Einsatz', typ: 'material', menge: 1, einheit: 'Stk', einzelpreis: 9.80 },
      { id: 'sw06-2', bezeichnung: 'Wippe', typ: 'material', menge: 1, einheit: 'Stk', einzelpreis: 2.90 },
      { id: 'sw06-3', bezeichnung: 'UP-Dose', typ: 'material', menge: 1, einheit: 'Stk', einzelpreis: 0.85 },
      { id: 'sw06-4', bezeichnung: 'Anschluss', typ: 'service', menge: 1, einheit: 'Std', einzelpreis: 45.0 },
    ], fieldConfig: FC.switch },
  { key: 'dimmer_button', label: 'Dimm-Taster', category: 'switch', svgPath: s('switch', 'dimmer_button'),
    defaultAttribute: { farbe: 'Reinweiss', hoehe: 105, kabeltyp: 'NYM-J 3x1,5' },
    defaultKnx: { geraetetyp: 'Dimmaktor', variante: 'Standard' },
    defaultArtikel: [
      { id: 'sw07-1', bezeichnung: 'Dimm-Taster-Einsatz', typ: 'material', menge: 1, einheit: 'Stk', einzelpreis: 28.50 },
      { id: 'sw07-2', bezeichnung: 'UP-Dose', typ: 'material', menge: 1, einheit: 'Stk', einzelpreis: 0.85 },
      { id: 'sw07-3', bezeichnung: 'Anschluss', typ: 'service', menge: 1, einheit: 'Std', einzelpreis: 45.0 },
    ], fieldConfig: FC.switch },
  { key: 'dimmer_switch', label: 'Dimmschalter', category: 'switch', svgPath: s('switch', 'dimmer_switch'),
    defaultAttribute: { farbe: 'Reinweiss', hoehe: 105, kabeltyp: 'NYM-J 3x1,5' },
    defaultKnx: { geraetetyp: 'Dimmaktor', variante: 'Standard' },
    defaultArtikel: [
      { id: 'sw08-1', bezeichnung: 'Dimmer-Einsatz', typ: 'material', menge: 1, einheit: 'Stk', einzelpreis: 32.50 },
      { id: 'sw08-2', bezeichnung: 'Dimmerscheibe', typ: 'material', menge: 1, einheit: 'Stk', einzelpreis: 8.40 },
      { id: 'sw08-3', bezeichnung: 'UP-Dose', typ: 'material', menge: 1, einheit: 'Stk', einzelpreis: 0.85 },
      { id: 'sw08-4', bezeichnung: 'Anschluss', typ: 'service', menge: 1, einheit: 'Std', einzelpreis: 45.0 },
    ], fieldConfig: FC.switch },
  { key: 'off_switch', label: 'Ausschalter', category: 'switch', svgPath: s('switch', 'off_switch'),
    defaultAttribute: { farbe: 'Reinweiss', hoehe: 105, kabeltyp: 'NYM-J 3x1,5' },
    defaultKnx: { geraetetyp: 'Schaltaktor', variante: 'Standard' },
    defaultArtikel: [
      { id: 'sw09-1', bezeichnung: 'Wippschalter-Einsatz', typ: 'material', menge: 1, einheit: 'Stk', einzelpreis: 6.80 },
      { id: 'sw09-2', bezeichnung: 'Wippe', typ: 'material', menge: 1, einheit: 'Stk', einzelpreis: 2.90 },
      { id: 'sw09-3', bezeichnung: 'UP-Dose', typ: 'material', menge: 1, einheit: 'Stk', einzelpreis: 0.85 },
      { id: 'sw09-4', bezeichnung: 'Anschluss', typ: 'service', menge: 1, einheit: 'Std', einzelpreis: 45.0 },
    ], fieldConfig: FC.switch },
  { key: 'off_switch_double', label: 'Doppelausschalter', category: 'switch', svgPath: s('switch', 'off_switch_double'),
    defaultAttribute: { farbe: 'Reinweiss', hoehe: 105, kabeltyp: 'NYM-J 5x1,5' },
    defaultKnx: { geraetetyp: 'Schaltaktor', variante: 'Standard' },
    defaultArtikel: [
      { id: 'sw10-1', bezeichnung: 'Doppelschalter-Einsatz', typ: 'material', menge: 1, einheit: 'Stk', einzelpreis: 10.50 },
      { id: 'sw10-2', bezeichnung: 'Doppelwippe', typ: 'material', menge: 1, einheit: 'Stk', einzelpreis: 4.50 },
      { id: 'sw10-3', bezeichnung: 'UP-Dose', typ: 'material', menge: 1, einheit: 'Stk', einzelpreis: 0.85 },
      { id: 'sw10-4', bezeichnung: 'Anschluss', typ: 'service', menge: 1, einheit: 'Std', einzelpreis: 45.0 },
    ], fieldConfig: FC.switch },
  { key: 'off_switch_indicator_light', label: 'Ausschalter mit Kontrollleuchte', category: 'switch', svgPath: s('switch', 'off_switch_indicator_light'),
    defaultAttribute: { farbe: 'Reinweiss', hoehe: 105, kabeltyp: 'NYM-J 3x1,5' },
    defaultKnx: { geraetetyp: 'Schaltaktor', variante: 'Standard' },
    defaultArtikel: [
      { id: 'sw11-1', bezeichnung: 'Schalter mit Kontrolllicht', typ: 'material', menge: 1, einheit: 'Stk', einzelpreis: 11.20 },
      { id: 'sw11-2', bezeichnung: 'UP-Dose', typ: 'material', menge: 1, einheit: 'Stk', einzelpreis: 0.85 },
      { id: 'sw11-3', bezeichnung: 'Anschluss', typ: 'service', menge: 1, einheit: 'Std', einzelpreis: 45.0 },
    ], fieldConfig: FC.switch },
  { key: 'roller_shutter_button', label: 'Jalousietaster', category: 'switch', svgPath: s('switch', 'roller_shutter_button'),
    defaultAttribute: { farbe: 'Reinweiss', hoehe: 105, kabeltyp: 'NYM-J 5x1,5' },
    defaultKnx: { geraetetyp: 'Jalousieaktor', variante: 'Standard' },
    defaultArtikel: [
      { id: 'sw12-1', bezeichnung: 'Jalousietaster-Einsatz', typ: 'material', menge: 1, einheit: 'Stk', einzelpreis: 12.50 },
      { id: 'sw12-2', bezeichnung: 'Wippe Jalousie', typ: 'material', menge: 1, einheit: 'Stk', einzelpreis: 4.10 },
      { id: 'sw12-3', bezeichnung: 'UP-Dose', typ: 'material', menge: 1, einheit: 'Stk', einzelpreis: 0.85 },
      { id: 'sw12-4', bezeichnung: 'Anschluss', typ: 'service', menge: 1, einheit: 'Std', einzelpreis: 45.0 },
    ], fieldConfig: FC.switch },
  { key: 'roller_shutter_switch', label: 'Jalousie-Schalter', category: 'switch', svgPath: s('switch', 'roller_shutter_switch'),
    defaultAttribute: { farbe: 'Reinweiss', hoehe: 105, kabeltyp: 'NYM-J 5x1,5' },
    defaultKnx: { geraetetyp: 'Jalousieaktor', variante: 'Standard' },
    defaultArtikel: [
      { id: 'sw13-1', bezeichnung: 'Jalousieschalter-Einsatz', typ: 'material', menge: 1, einheit: 'Stk', einzelpreis: 12.50 },
      { id: 'sw13-2', bezeichnung: 'UP-Dose', typ: 'material', menge: 1, einheit: 'Stk', einzelpreis: 0.85 },
      { id: 'sw13-3', bezeichnung: 'Anschluss', typ: 'service', menge: 1, einheit: 'Std', einzelpreis: 45.0 },
    ], fieldConfig: FC.switch },
  { key: 'series_button', label: 'Serientaster', category: 'switch', svgPath: s('switch', 'series_button'),
    defaultAttribute: { farbe: 'Reinweiss', hoehe: 105, kabeltyp: 'NYM-J 5x1,5' },
    defaultKnx: { geraetetyp: 'Taster', variante: 'Standard' },
    defaultArtikel: [
      { id: 'sw14-1', bezeichnung: 'Serientaster-Einsatz', typ: 'material', menge: 1, einheit: 'Stk', einzelpreis: 10.20 },
      { id: 'sw14-2', bezeichnung: 'UP-Dose', typ: 'material', menge: 1, einheit: 'Stk', einzelpreis: 0.85 },
      { id: 'sw14-3', bezeichnung: 'Anschluss', typ: 'service', menge: 1, einheit: 'Std', einzelpreis: 45.0 },
    ], fieldConfig: FC.switch },
  { key: 'series_switch', label: 'Serienschalter', category: 'switch', svgPath: s('switch', 'series_switch'),
    defaultAttribute: { farbe: 'Reinweiss', hoehe: 105, kabeltyp: 'NYM-J 5x1,5' },
    defaultKnx: { geraetetyp: 'Schaltaktor', variante: 'Standard' },
    defaultArtikel: [
      { id: 'sw15-1', bezeichnung: 'Serienschalter-Einsatz', typ: 'material', menge: 1, einheit: 'Stk', einzelpreis: 8.90 },
      { id: 'sw15-2', bezeichnung: 'UP-Dose', typ: 'material', menge: 1, einheit: 'Stk', einzelpreis: 0.85 },
      { id: 'sw15-3', bezeichnung: 'Anschluss', typ: 'service', menge: 1, einheit: 'Std', einzelpreis: 45.0 },
    ], fieldConfig: FC.switch },
  { key: 'series_switch_singlepole', label: 'Serienschalter einpolig', category: 'switch', svgPath: s('switch', 'series_switch_singlepole'),
    defaultAttribute: { farbe: 'Reinweiss', hoehe: 105, kabeltyp: 'NYM-J 3x1,5' },
    defaultKnx: { geraetetyp: 'Schaltaktor', variante: 'Standard' },
    defaultArtikel: [
      { id: 'sw16-1', bezeichnung: 'Serienschalter einpolig', typ: 'material', menge: 1, einheit: 'Stk', einzelpreis: 8.90 },
      { id: 'sw16-2', bezeichnung: 'UP-Dose', typ: 'material', menge: 1, einheit: 'Stk', einzelpreis: 0.85 },
      { id: 'sw16-3', bezeichnung: 'Anschluss', typ: 'service', menge: 1, einheit: 'Std', einzelpreis: 45.0 },
    ], fieldConfig: FC.switch },
  { key: 'switch_general', label: 'Schalter allgemein', category: 'switch', svgPath: s('switch', 'switch_general'),
    defaultAttribute: { farbe: 'Reinweiss', hoehe: 105, kabeltyp: 'NYM-J 3x1,5' },
    defaultKnx: { geraetetyp: 'Schaltaktor', variante: 'Standard' },
    defaultArtikel: [
      { id: 'sw17-1', bezeichnung: 'Schalter-Einsatz', typ: 'material', menge: 1, einheit: 'Stk', einzelpreis: 6.80 },
      { id: 'sw17-2', bezeichnung: 'UP-Dose', typ: 'material', menge: 1, einheit: 'Stk', einzelpreis: 0.85 },
      { id: 'sw17-3', bezeichnung: 'Anschluss', typ: 'service', menge: 1, einheit: 'Std', einzelpreis: 45.0 },
    ], fieldConfig: FC.switch },

  // ===== LIGHT =====
  { key: 'ceiling_light', label: 'Deckenleuchte', category: 'light', svgPath: s('light', 'ceiling_light'),
    defaultAttribute: { farbe: 'Reinweiss', hoehe: 250, kabeltyp: 'NYM-J 3x1,5' },
    defaultKnx: { geraetetyp: 'Dimmaktor', variante: 'Standard' },
    defaultArtikel: [
      { id: 'l01-1', bezeichnung: 'Deckendose', typ: 'material', menge: 1, einheit: 'Stk', einzelpreis: 1.20 },
      { id: 'l01-2', bezeichnung: 'Lüsterklemme', typ: 'material', menge: 1, einheit: 'Stk', einzelpreis: 0.45 },
      { id: 'l01-3', bezeichnung: 'Anschluss', typ: 'service', menge: 1, einheit: 'Std', einzelpreis: 45.0 },
    ], fieldConfig: FC.light },
  { key: 'fluorescent_lamp', label: 'Leuchtstofflampe', category: 'light', svgPath: s('light', 'fluorescent_lamp'),
    defaultAttribute: { farbe: 'Reinweiss', hoehe: 250, kabeltyp: 'NYM-J 3x1,5' },
    defaultKnx: { geraetetyp: 'Schaltaktor', variante: 'Standard' },
    defaultArtikel: [
      { id: 'l02-1', bezeichnung: 'Leuchtstofflampe T8', typ: 'material', menge: 1, einheit: 'Stk', einzelpreis: 18.50 },
      { id: 'l02-2', bezeichnung: 'Anschluss', typ: 'service', menge: 1, einheit: 'Std', einzelpreis: 45.0 },
    ], fieldConfig: FC.light },
  { key: 'LED', label: 'LED-Leuchte', category: 'light', svgPath: s('light', 'LED'),
    defaultAttribute: { farbe: 'Reinweiss', hoehe: 250, kabeltyp: 'NYM-J 3x1,5' },
    defaultKnx: { geraetetyp: 'Dimmaktor', variante: 'Standard' },
    defaultArtikel: [
      { id: 'l03-1', bezeichnung: 'LED-Panel', typ: 'material', menge: 1, einheit: 'Stk', einzelpreis: 35.0 },
      { id: 'l03-2', bezeichnung: 'LED-Treiber', typ: 'material', menge: 1, einheit: 'Stk', einzelpreis: 12.0 },
      { id: 'l03-3', bezeichnung: 'Anschluss', typ: 'service', menge: 1, einheit: 'Std', einzelpreis: 45.0 },
    ], fieldConfig: FC.light },
  { key: 'surface_mounted_wall_light', label: 'Wandleuchte AP', category: 'light', svgPath: s('light', 'surface_mounted_wall_light'),
    defaultAttribute: { farbe: 'Reinweiss', hoehe: 180, kabeltyp: 'NYM-J 3x1,5' },
    defaultKnx: { geraetetyp: 'Dimmaktor', variante: 'Standard' },
    defaultArtikel: [
      { id: 'l04-1', bezeichnung: 'Wandauslass', typ: 'material', menge: 1, einheit: 'Stk', einzelpreis: 2.50 },
      { id: 'l04-2', bezeichnung: 'Anschluss', typ: 'service', menge: 1, einheit: 'Std', einzelpreis: 45.0 },
    ], fieldConfig: FC.light },

  // ===== SENSOR =====
  { key: 'motion_detector', label: 'Bewegungsmelder', category: 'sensor', svgPath: s('sensor', 'motion_detector'),
    defaultAttribute: { farbe: 'Reinweiss', hoehe: 230, kabeltyp: 'NYM-J 3x1,5' },
    defaultKnx: { geraetetyp: 'Präsenzmelder', variante: 'Standard' },
    defaultArtikel: [
      { id: 'se01-1', bezeichnung: 'Bewegungsmelder', typ: 'material', menge: 1, einheit: 'Stk', einzelpreis: 42.0 },
      { id: 'se01-2', bezeichnung: 'UP-Dose', typ: 'material', menge: 1, einheit: 'Stk', einzelpreis: 0.85 },
      { id: 'se01-3', bezeichnung: 'Anschluss', typ: 'service', menge: 1, einheit: 'Std', einzelpreis: 45.0 },
    ], fieldConfig: FC.sensor },
  { key: 'motion_detector_ceiling', label: 'Bewegungsmelder Decke', category: 'sensor', svgPath: s('sensor', 'motion_detector_ceiling'),
    defaultAttribute: { farbe: 'Reinweiss', hoehe: 250, kabeltyp: 'NYM-J 3x1,5' },
    defaultKnx: { geraetetyp: 'Präsenzmelder', variante: 'Standard' },
    defaultArtikel: [
      { id: 'se02-1', bezeichnung: 'Decken-Bewegungsmelder', typ: 'material', menge: 1, einheit: 'Stk', einzelpreis: 55.0 },
      { id: 'se02-2', bezeichnung: 'Anschluss', typ: 'service', menge: 1, einheit: 'Std', einzelpreis: 45.0 },
    ], fieldConfig: FC.sensor },
  { key: 'motion_detector_wall_mounted', label: 'Bewegungsmelder Wand', category: 'sensor', svgPath: s('sensor', 'motion_detector_wall_mounted'),
    defaultAttribute: { farbe: 'Reinweiss', hoehe: 230, kabeltyp: 'NYM-J 3x1,5' },
    defaultKnx: { geraetetyp: 'Präsenzmelder', variante: 'Standard' },
    defaultArtikel: [
      { id: 'se03-1', bezeichnung: 'Wand-Bewegungsmelder', typ: 'material', menge: 1, einheit: 'Stk', einzelpreis: 48.0 },
      { id: 'se03-2', bezeichnung: 'UP-Dose', typ: 'material', menge: 1, einheit: 'Stk', einzelpreis: 0.85 },
      { id: 'se03-3', bezeichnung: 'Anschluss', typ: 'service', menge: 1, einheit: 'Std', einzelpreis: 45.0 },
    ], fieldConfig: FC.sensor },
  { key: 'outdoor_temperature_sensor', label: 'Außentemperaturfühler', category: 'sensor', svgPath: s('sensor', 'outdoor_temperature_sensor'),
    defaultAttribute: { farbe: 'Grau', hoehe: 200, kabeltyp: 'J-Y(St)Y 2x2x0,8' },
    defaultKnx: { geraetetyp: 'Temperatursensor', variante: 'Standard' },
    defaultArtikel: [
      { id: 'se04-1', bezeichnung: 'Außenfühler', typ: 'material', menge: 1, einheit: 'Stk', einzelpreis: 22.0 },
      { id: 'se04-2', bezeichnung: 'Montage', typ: 'service', menge: 0.5, einheit: 'Std', einzelpreis: 45.0 },
    ], fieldConfig: { ...FC.sensor, stromkreis: 'hidden' } },
  { key: 'room_thermostat_analog', label: 'Raumthermostat analog', category: 'sensor', svgPath: s('sensor', 'room_thermostat_analog'),
    defaultAttribute: { farbe: 'Reinweiss', hoehe: 150, kabeltyp: 'J-Y(St)Y 2x2x0,8' },
    defaultKnx: { geraetetyp: 'Raumtemperaturregler', variante: 'Standard' },
    defaultArtikel: [
      { id: 'se05-1', bezeichnung: 'Raumthermostat analog', typ: 'material', menge: 1, einheit: 'Stk', einzelpreis: 35.0 },
      { id: 'se05-2', bezeichnung: 'UP-Dose', typ: 'material', menge: 1, einheit: 'Stk', einzelpreis: 0.85 },
      { id: 'se05-3', bezeichnung: 'Anschluss', typ: 'service', menge: 0.5, einheit: 'Std', einzelpreis: 45.0 },
    ], fieldConfig: FC.sensor },
  { key: 'room_thermostat_digital', label: 'Raumthermostat digital', category: 'sensor', svgPath: s('sensor', 'room_thermostat_digital'),
    defaultAttribute: { farbe: 'Reinweiss', hoehe: 150, kabeltyp: 'J-Y(St)Y 2x2x0,8' },
    defaultKnx: { geraetetyp: 'Raumtemperaturregler', variante: 'Standard' },
    defaultArtikel: [
      { id: 'se06-1', bezeichnung: 'Raumthermostat digital', typ: 'material', menge: 1, einheit: 'Stk', einzelpreis: 65.0 },
      { id: 'se06-2', bezeichnung: 'UP-Dose', typ: 'material', menge: 1, einheit: 'Stk', einzelpreis: 0.85 },
      { id: 'se06-3', bezeichnung: 'Anschluss', typ: 'service', menge: 0.5, einheit: 'Std', einzelpreis: 45.0 },
      { id: 'se06-4', bezeichnung: 'Inbetriebnahme', typ: 'service', menge: 0.5, einheit: 'Std', einzelpreis: 55.0 },
    ], fieldConfig: FC.sensor },
  { key: 'smoke_detector', label: 'Rauchmelder', category: 'sensor', svgPath: s('sensor', 'smoke_detector'),
    defaultAttribute: { farbe: 'Reinweiss', hoehe: 250, kabeltyp: 'J-Y(St)Y 2x2x0,8' },
    defaultKnx: { geraetetyp: 'Rauchmelder', variante: 'Standard' },
    defaultArtikel: [
      { id: 'se07-1', bezeichnung: 'Rauchmelder', typ: 'material', menge: 1, einheit: 'Stk', einzelpreis: 28.0 },
      { id: 'se07-2', bezeichnung: 'Montageplatte', typ: 'material', menge: 1, einheit: 'Stk', einzelpreis: 3.50 },
      { id: 'se07-3', bezeichnung: 'Montage', typ: 'service', menge: 0.5, einheit: 'Std', einzelpreis: 45.0 },
    ], fieldConfig: { ...FC.sensor, stromkreis: 'hidden' } },
  { key: 'temperature_sensor', label: 'Temperaturfühler', category: 'sensor', svgPath: s('sensor', 'temperature_sensor'),
    defaultAttribute: { farbe: 'Reinweiss', hoehe: 150, kabeltyp: 'J-Y(St)Y 2x2x0,8' },
    defaultKnx: { geraetetyp: 'Temperatursensor', variante: 'Standard' },
    defaultArtikel: [
      { id: 'se08-1', bezeichnung: 'Temperaturfühler', typ: 'material', menge: 1, einheit: 'Stk', einzelpreis: 18.0 },
      { id: 'se08-2', bezeichnung: 'Montage', typ: 'service', menge: 0.25, einheit: 'Std', einzelpreis: 45.0 },
    ], fieldConfig: { ...FC.sensor, stromkreis: 'hidden' } },
  { key: 'twilight_switch', label: 'Dämmerungsschalter', category: 'sensor', svgPath: s('sensor', 'twilight_switch'),
    defaultAttribute: { farbe: 'Grau', hoehe: 200, kabeltyp: 'NYM-J 3x1,5' },
    defaultKnx: { geraetetyp: 'Lichtsensor', variante: 'Standard' },
    defaultArtikel: [
      { id: 'se09-1', bezeichnung: 'Dämmerungsschalter', typ: 'material', menge: 1, einheit: 'Stk', einzelpreis: 32.0 },
      { id: 'se09-2', bezeichnung: 'Montage', typ: 'service', menge: 0.5, einheit: 'Std', einzelpreis: 45.0 },
    ], fieldConfig: FC.sensor },
  { key: 'window_contact', label: 'Fensterkontakt', category: 'sensor', svgPath: s('sensor', 'window_contact'),
    defaultAttribute: { farbe: 'Reinweiss', hoehe: 150, kabeltyp: 'J-Y(St)Y 2x2x0,8' },
    defaultKnx: { geraetetyp: 'Binäreingang', variante: 'Standard' },
    defaultArtikel: [
      { id: 'se10-1', bezeichnung: 'Fensterkontakt', typ: 'material', menge: 1, einheit: 'Stk', einzelpreis: 12.0 },
      { id: 'se10-2', bezeichnung: 'Montage', typ: 'service', menge: 0.25, einheit: 'Std', einzelpreis: 45.0 },
    ], fieldConfig: { ...FC.sensor, stromkreis: 'hidden' } },

  // ===== SAFETY =====
  ...[
    ['alarm_module_unit_fire_alarm_system_BMA', 'BMA Alarmmodul', 85.0],
    ['camera', 'Kamera', 120.0],
    ['fire_alarm_control_panel', 'Brandmeldeanlage', 450.0],
    ['fire_department_control_panel', 'Feuerwehr-Bedienfeld', 280.0],
    ['fire_department_display_panel', 'Feuerwehr-Anzeigetableau', 320.0],
    ['fire_department_information_and_control_system', 'FIBS', 550.0],
    ['fire_department_key_depot', 'Feuerwehr-Schlüsseldepot', 180.0],
    ['horn', 'Signalhorn', 45.0],
    ['manual_call_point', 'Handfeuermelder', 38.0],
    ['optical_smoke_detector', 'Optischer Rauchmelder', 32.0],
    ['optical_smoke_detector_with_siren', 'Optischer Rauchmelder mit Sirene', 48.0],
    ['siren', 'Sirene', 55.0],
    ['smoke_and_heat_extraction_control_unit', 'RWA-Steuerung', 380.0],
  ].map(([name, label, price], i) => ({
    key: name as string, label: label as string, category: 'safety' as const,
    svgPath: s('safety', name as string),
    defaultAttribute: { farbe: 'Rot', hoehe: 150, kabeltyp: 'J-Y(St)Y 2x2x0,8' },
    defaultKnx: { geraetetyp: 'Sicherheit', variante: 'Standard' as const },
    defaultArtikel: [
      { id: `sa${i}-1`, bezeichnung: label as string, typ: 'material' as const, menge: 1, einheit: 'Stk', einzelpreis: price as number },
      { id: `sa${i}-2`, bezeichnung: 'Montage', typ: 'service' as const, menge: 1, einheit: 'Std', einzelpreis: 55.0 },
      { id: `sa${i}-3`, bezeichnung: 'Inbetriebnahme', typ: 'service' as const, menge: 0.5, einheit: 'Std', einzelpreis: 65.0 },
    ],
    fieldConfig: FC.safety,
  })),

  // ===== SMARTHOME =====
  ...[
    ['smart_actuator', 'Smart Aktor', 'Schaltaktor', 85.0],
    ['smart_button_1_channel', 'Smart Taster 1-Kanal', 'Taster', 65.0],
    ['smart_button_2_channel', 'Smart Taster 2-Kanal', 'Taster', 78.0],
    ['smart_button_4_channel', 'Smart Taster 4-Kanal', 'Taster', 110.0],
    ['smart_button_6_channel', 'Smart Taster 6-Kanal', 'Taster', 140.0],
    ['smart_button_8_channel', 'Smart Taster 8-Kanal', 'Taster', 165.0],
    ['smart_light_sensor', 'Smart Lichtsensor', 'Lichtsensor', 55.0],
    ['smart_motion_detector_ceiling', 'Smart Bewegungsmelder Decke', 'Präsenzmelder', 95.0],
    ['smart_motion_detector_wall', 'Smart Bewegungsmelder Wand', 'Präsenzmelder', 88.0],
    ['smart_room_controller_2_channel', 'Smart Raumregler 2-Kanal', 'Raumregler', 120.0],
    ['smart_room_controller_4_channel', 'Smart Raumregler 4-Kanal', 'Raumregler', 155.0],
    ['smart_room_controller_6_channel', 'Smart Raumregler 6-Kanal', 'Raumregler', 185.0],
    ['smart_room_controller_8_channel', 'Smart Raumregler 8-Kanal', 'Raumregler', 220.0],
    ['smart_sensor_general', 'Smart Sensor allgemein', 'Sensor', 45.0],
    ['smart_smoke_detector', 'Smart Rauchmelder', 'Rauchmelder', 72.0],
    ['smart_temperature_sensor', 'Smart Temperaturfühler', 'Temperatursensor', 48.0],
    ['smart_touch_surface', 'Smart Touch-Oberfläche', 'Taster', 195.0],
  ].map(([name, label, knx, price], i) => ({
    key: name as string, label: label as string, category: 'smarthome' as const,
    svgPath: s('smarthome', name as string),
    defaultAttribute: { farbe: 'Reinweiss', hoehe: 105, kabeltyp: 'J-Y(St)Y 2x2x0,8' },
    defaultKnx: { geraetetyp: knx as string, variante: 'Premium' as const },
    defaultArtikel: [
      { id: `sh${i}-1`, bezeichnung: label as string, typ: 'material' as const, menge: 1, einheit: 'Stk', einzelpreis: price as number },
      { id: `sh${i}-2`, bezeichnung: 'UP-Dose', typ: 'material' as const, menge: 1, einheit: 'Stk', einzelpreis: 0.85 },
      { id: `sh${i}-3`, bezeichnung: 'Anschluss', typ: 'service' as const, menge: 0.5, einheit: 'Std', einzelpreis: 45.0 },
      { id: `sh${i}-4`, bezeichnung: 'KNX-Programmierung', typ: 'service' as const, menge: 0.5, einheit: 'Std', einzelpreis: 75.0 },
    ],
    fieldConfig: FC.smarthome,
  })),

  // ===== NETWORK =====
  { key: 'antenna_cable_socket', label: 'Antennensteckdose', category: 'network', svgPath: s('network', 'antenna_cable_socket'),
    defaultAttribute: { farbe: 'Reinweiss', hoehe: 30, kabeltyp: 'Koaxial RG6' },
    defaultKnx: { geraetetyp: '', variante: 'Standard' },
    defaultArtikel: [
      { id: 'n01-1', bezeichnung: 'Antennendose 3-fach', typ: 'material', menge: 1, einheit: 'Stk', einzelpreis: 14.50 },
      { id: 'n01-2', bezeichnung: 'UP-Dose', typ: 'material', menge: 1, einheit: 'Stk', einzelpreis: 0.85 },
      { id: 'n01-3', bezeichnung: 'Anschluss', typ: 'service', menge: 0.5, einheit: 'Std', einzelpreis: 45.0 },
    ], fieldConfig: FC.network },
  { key: 'data_outlet_double', label: 'Datenanschluss doppelt', category: 'network', svgPath: s('network', 'data_outlet_double'),
    defaultAttribute: { farbe: 'Reinweiss', hoehe: 30, kabeltyp: 'Cat.7 S/FTP' },
    defaultKnx: { geraetetyp: '', variante: 'Standard' },
    defaultArtikel: [
      { id: 'n02-1', bezeichnung: 'Netzwerkdose 2-fach Cat.6A', typ: 'material', menge: 1, einheit: 'Stk', einzelpreis: 18.50 },
      { id: 'n02-2', bezeichnung: 'UP-Dose', typ: 'material', menge: 1, einheit: 'Stk', einzelpreis: 0.85 },
      { id: 'n02-3', bezeichnung: 'Anschluss', typ: 'service', menge: 1, einheit: 'Std', einzelpreis: 45.0 },
    ], fieldConfig: FC.network },
  { key: 'data_outlet_single', label: 'Datenanschluss einfach', category: 'network', svgPath: s('network', 'data_outlet_single'),
    defaultAttribute: { farbe: 'Reinweiss', hoehe: 30, kabeltyp: 'Cat.7 S/FTP' },
    defaultKnx: { geraetetyp: '', variante: 'Standard' },
    defaultArtikel: [
      { id: 'n03-1', bezeichnung: 'Netzwerkdose 1-fach Cat.6A', typ: 'material', menge: 1, einheit: 'Stk', einzelpreis: 12.50 },
      { id: 'n03-2', bezeichnung: 'UP-Dose', typ: 'material', menge: 1, einheit: 'Stk', einzelpreis: 0.85 },
      { id: 'n03-3', bezeichnung: 'Anschluss', typ: 'service', menge: 0.5, einheit: 'Std', einzelpreis: 45.0 },
    ], fieldConfig: FC.network },
  { key: 'server_cabinet', label: 'Serverschrank', category: 'network', svgPath: s('network', 'server_cabinet'),
    defaultAttribute: { farbe: 'Grau', hoehe: 0, kabeltyp: 'NYM-J 3x2,5' },
    defaultKnx: { geraetetyp: '', variante: 'Standard' },
    defaultArtikel: [
      { id: 'n04-1', bezeichnung: 'Netzwerkschrank 19" 12HE', typ: 'material', menge: 1, einheit: 'Stk', einzelpreis: 280.0 },
      { id: 'n04-2', bezeichnung: 'Patchpanel 24-Port', typ: 'material', menge: 1, einheit: 'Stk', einzelpreis: 45.0 },
      { id: 'n04-3', bezeichnung: 'Montage', typ: 'service', menge: 3, einheit: 'Std', einzelpreis: 55.0 },
    ], fieldConfig: { ...FC.network, stromkreis: 'required' } },
  { key: 'telephone_socket', label: 'Telefonsteckdose', category: 'network', svgPath: s('network', 'telephone_socket'),
    defaultAttribute: { farbe: 'Reinweiss', hoehe: 30, kabeltyp: 'J-Y(St)Y 2x2x0,8' },
    defaultKnx: { geraetetyp: '', variante: 'Standard' },
    defaultArtikel: [
      { id: 'n05-1', bezeichnung: 'TAE-Dose', typ: 'material', menge: 1, einheit: 'Stk', einzelpreis: 8.50 },
      { id: 'n05-2', bezeichnung: 'UP-Dose', typ: 'material', menge: 1, einheit: 'Stk', einzelpreis: 0.85 },
      { id: 'n05-3', bezeichnung: 'Anschluss', typ: 'service', menge: 0.5, einheit: 'Std', einzelpreis: 45.0 },
    ], fieldConfig: FC.network },

  // ===== HOMEDEVICE =====
  ...[
    ['air_conditioning', 'Klimaanlage', 'NYM-J 3x2,5', 320.0],
    ['clothes_dryer', 'Wäschetrockner', 'NYM-J 3x2,5', 12.50],
    ['coffee_machine', 'Kaffeemaschine', 'NYM-J 3x2,5', 12.50],
    ['dishwasher', 'Geschirrspüler', 'NYM-J 3x2,5', 12.50],
    ['freezer', 'Gefrierschrank', 'NYM-J 3x2,5', 12.50],
    ['oven', 'Backofen', 'NYM-J 5x2,5', 15.0],
    ['Refrigerator', 'Kühlschrank', 'NYM-J 3x2,5', 12.50],
    ['stove', 'Herd', 'NYM-J 5x6', 28.50],
    ['washing_machine', 'Waschmaschine', 'NYM-J 3x2,5', 12.50],
  ].map(([name, label, kabel, price], i) => ({
    key: name as string, label: label as string, category: 'homedevice' as const,
    svgPath: s('homedevice', name as string),
    defaultAttribute: { farbe: 'Reinweiss', hoehe: 30, kabeltyp: kabel as string },
    defaultKnx: { geraetetyp: 'Schaltaktor', variante: 'Standard' as const },
    defaultArtikel: [
      { id: `hd${i}-1`, bezeichnung: 'Geräteanschluss', typ: 'material' as const, menge: 1, einheit: 'Stk', einzelpreis: price as number },
      { id: `hd${i}-2`, bezeichnung: 'Anschluss', typ: 'service' as const, menge: 1, einheit: 'Std', einzelpreis: 45.0 },
    ],
    fieldConfig: FC.homedevice,
  })),

  // ===== DISTRIBUTOR =====
  ...[
    ['heating_circuit_distributor', 'Heizkreisverteiler', 180.0],
    ['house_connection', 'Hausanschluss', 350.0],
    ['junction_box', 'Abzweigdose', 2.50],
    ['meter_cabinet', 'Zählerschrank', 450.0],
    ['sub_distributior', 'Unterverteiler', 280.0],
  ].map(([name, label, price], i) => ({
    key: name as string, label: label as string, category: 'distributor' as const,
    svgPath: s('distributor', name as string),
    defaultAttribute: { farbe: 'Grau', hoehe: 150, kabeltyp: 'NYM-J 5x10' },
    defaultKnx: { geraetetyp: '', variante: 'Standard' as const },
    defaultArtikel: [
      { id: `di${i}-1`, bezeichnung: label as string, typ: 'material' as const, menge: 1, einheit: 'Stk', einzelpreis: price as number },
      { id: `di${i}-2`, bezeichnung: 'Montage', typ: 'service' as const, menge: 2, einheit: 'Std', einzelpreis: 55.0 },
    ],
    fieldConfig: FC.distributor,
  })),

  // ===== GROUNDING =====
  ...[
    ['cable_loop_outside', 'Kabelschleife außen', 45.0],
    ['equipotential_bonding_busbar', 'Potentialausgleichsschiene', 28.0],
    ['grounding_general', 'Erdung allgemein', 15.0],
  ].map(([name, label, price], i) => ({
    key: name as string, label: label as string, category: 'grounding' as const,
    svgPath: s('grounding', name as string),
    defaultAttribute: { farbe: 'Grün/Gelb', hoehe: 0, kabeltyp: 'NYM-J 1x16' },
    defaultKnx: { geraetetyp: '', variante: 'Standard' as const },
    defaultArtikel: [
      { id: `gr${i}-1`, bezeichnung: label as string, typ: 'material' as const, menge: 1, einheit: 'Stk', einzelpreis: price as number },
      { id: `gr${i}-2`, bezeichnung: 'Montage', typ: 'service' as const, menge: 1, einheit: 'Std', einzelpreis: 55.0 },
    ],
    fieldConfig: FC.grounding,
  })),

  // ===== INTERCOM =====
  ...[
    ['door_opener', 'Türöffner', 35.0],
    ['gong', 'Gong', 22.0],
    ['intercom_system', 'Sprechanlage', 180.0],
    ['internal_intercom_system', 'Interne Sprechanlage', 120.0],
  ].map(([name, label, price], i) => ({
    key: name as string, label: label as string, category: 'intercom' as const,
    svgPath: s('intercom', name as string),
    defaultAttribute: { farbe: 'Reinweiss', hoehe: 150, kabeltyp: 'BUS 2x2x0,8' },
    defaultKnx: { geraetetyp: 'Sprechanlage', variante: 'Standard' as const },
    defaultArtikel: [
      { id: `ic${i}-1`, bezeichnung: label as string, typ: 'material' as const, menge: 1, einheit: 'Stk', einzelpreis: price as number },
      { id: `ic${i}-2`, bezeichnung: 'UP-Dose', typ: 'material' as const, menge: 1, einheit: 'Stk', einzelpreis: 0.85 },
      { id: `ic${i}-3`, bezeichnung: 'Anschluss', typ: 'service' as const, menge: 1, einheit: 'Std', einzelpreis: 55.0 },
    ],
    fieldConfig: FC.intercom,
  })),

  // ===== OTHERS =====
  { key: 'actuator', label: 'Aktor', category: 'others', svgPath: s('others', 'actuator'),
    defaultAttribute: { farbe: 'Grau', hoehe: 0, kabeltyp: 'NYM-J 3x1,5' },
    defaultKnx: { geraetetyp: 'Schaltaktor', variante: 'Standard' },
    defaultArtikel: [
      { id: 'o01-1', bezeichnung: 'Aktor REG', typ: 'material', menge: 1, einheit: 'Stk', einzelpreis: 85.0 },
      { id: 'o01-2', bezeichnung: 'Montage', typ: 'service', menge: 0.5, einheit: 'Std', einzelpreis: 55.0 },
    ], fieldConfig: FC.others },
  { key: 'charging_station', label: 'Ladestation', category: 'others', svgPath: s('others', 'charging_station'),
    defaultAttribute: { farbe: 'Grau', hoehe: 100, kabeltyp: 'NYM-J 5x6' },
    defaultKnx: { geraetetyp: 'Ladesteuerung', variante: 'Premium' },
    defaultArtikel: [
      { id: 'o02-1', bezeichnung: 'Wallbox 11kW', typ: 'material', menge: 1, einheit: 'Stk', einzelpreis: 650.0 },
      { id: 'o02-2', bezeichnung: 'Anschluss', typ: 'service', menge: 2, einheit: 'Std', einzelpreis: 55.0 },
      { id: 'o02-3', bezeichnung: 'Inbetriebnahme', typ: 'service', menge: 1, einheit: 'Std', einzelpreis: 65.0 },
    ], fieldConfig: FC.others },
  { key: 'electrical_device', label: 'Elektrisches Gerät', category: 'others', svgPath: s('others', 'electrical_device'),
    defaultAttribute: { farbe: 'Reinweiss', hoehe: 30, kabeltyp: 'NYM-J 3x2,5' },
    defaultKnx: { geraetetyp: 'Schaltaktor', variante: 'Standard' },
    defaultArtikel: [
      { id: 'o03-1', bezeichnung: 'Geräteanschluss', typ: 'material', menge: 1, einheit: 'Stk', einzelpreis: 5.0 },
      { id: 'o03-2', bezeichnung: 'Anschluss', typ: 'service', menge: 1, einheit: 'Std', einzelpreis: 45.0 },
    ], fieldConfig: FC.others },
  { key: 'gate_drive', label: 'Torantrieb', category: 'others', svgPath: s('others', 'gate_drive'),
    defaultAttribute: { farbe: 'Grau', hoehe: 200, kabeltyp: 'NYM-J 5x1,5' },
    defaultKnx: { geraetetyp: 'Schaltaktor', variante: 'Standard' },
    defaultArtikel: [
      { id: 'o04-1', bezeichnung: 'Anschlusskasten', typ: 'material', menge: 1, einheit: 'Stk', einzelpreis: 12.0 },
      { id: 'o04-2', bezeichnung: 'Anschluss', typ: 'service', menge: 1.5, einheit: 'Std', einzelpreis: 55.0 },
    ], fieldConfig: FC.others },
  { key: 'general_connection', label: 'Allgemeiner Anschluss', category: 'others', svgPath: s('others', 'general_connection'),
    defaultAttribute: { farbe: 'Reinweiss', hoehe: 30, kabeltyp: 'NYM-J 3x1,5' },
    defaultKnx: { geraetetyp: '', variante: 'Standard' },
    defaultArtikel: [
      { id: 'o05-1', bezeichnung: 'Anschlussdose', typ: 'material', menge: 1, einheit: 'Stk', einzelpreis: 3.50 },
      { id: 'o05-2', bezeichnung: 'Anschluss', typ: 'service', menge: 0.5, einheit: 'Std', einzelpreis: 45.0 },
    ], fieldConfig: { ...FC.others, knx: 'hidden' } },
  { key: 'general_connection_16A', label: 'Anschluss 16A', category: 'others', svgPath: s('others', 'general_connection_16A'),
    defaultAttribute: { farbe: 'Reinweiss', hoehe: 30, kabeltyp: 'NYM-J 3x2,5' },
    defaultKnx: { geraetetyp: '', variante: 'Standard' },
    defaultArtikel: [
      { id: 'o06-1', bezeichnung: 'Anschlussdose 16A', typ: 'material', menge: 1, einheit: 'Stk', einzelpreis: 5.0 },
      { id: 'o06-2', bezeichnung: 'Anschluss', typ: 'service', menge: 0.5, einheit: 'Std', einzelpreis: 45.0 },
    ], fieldConfig: { ...FC.others, knx: 'hidden' } },
  { key: 'general_connection_32A', label: 'Anschluss 32A', category: 'others', svgPath: s('others', 'general_connection_32A'),
    defaultAttribute: { farbe: 'Rot', hoehe: 100, kabeltyp: 'NYM-J 5x6' },
    defaultKnx: { geraetetyp: '', variante: 'Standard' },
    defaultArtikel: [
      { id: 'o07-1', bezeichnung: 'CEE-Anschlussdose 32A', typ: 'material', menge: 1, einheit: 'Stk', einzelpreis: 18.0 },
      { id: 'o07-2', bezeichnung: 'Anschluss', typ: 'service', menge: 1, einheit: 'Std', einzelpreis: 55.0 },
    ], fieldConfig: { ...FC.others, knx: 'hidden' } },
  { key: 'hot_water_storage_tank', label: 'Warmwasserspeicher', category: 'others', svgPath: s('others', 'hot_water_storage_tank'),
    defaultAttribute: { farbe: 'Reinweiss', hoehe: 30, kabeltyp: 'NYM-J 3x2,5' },
    defaultKnx: { geraetetyp: 'Schaltaktor', variante: 'Standard' },
    defaultArtikel: [
      { id: 'o08-1', bezeichnung: 'Geräteanschluss', typ: 'material', menge: 1, einheit: 'Stk', einzelpreis: 8.50 },
      { id: 'o08-2', bezeichnung: 'Anschluss', typ: 'service', menge: 1, einheit: 'Std', einzelpreis: 55.0 },
    ], fieldConfig: FC.others },
  { key: 'instant_water_heater', label: 'Durchlauferhitzer', category: 'others', svgPath: s('others', 'instant_water_heater'),
    defaultAttribute: { farbe: 'Reinweiss', hoehe: 150, kabeltyp: 'NYM-J 5x6' },
    defaultKnx: { geraetetyp: '', variante: 'Standard' },
    defaultArtikel: [
      { id: 'o09-1', bezeichnung: 'Geräteanschlusskasten', typ: 'material', menge: 1, einheit: 'Stk', einzelpreis: 12.0 },
      { id: 'o09-2', bezeichnung: 'Anschluss', typ: 'service', menge: 1.5, einheit: 'Std', einzelpreis: 55.0 },
    ], fieldConfig: { ...FC.others, knx: 'hidden' } },
  { key: 'motor', label: 'Motor', category: 'others', svgPath: s('others', 'motor'),
    defaultAttribute: { farbe: 'Grau', hoehe: 0, kabeltyp: 'NYM-J 5x2,5' },
    defaultKnx: { geraetetyp: 'Schaltaktor', variante: 'Standard' },
    defaultArtikel: [
      { id: 'o10-1', bezeichnung: 'Motoranschluss', typ: 'material', menge: 1, einheit: 'Stk', einzelpreis: 8.0 },
      { id: 'o10-2', bezeichnung: 'Anschluss', typ: 'service', menge: 1, einheit: 'Std', einzelpreis: 55.0 },
    ], fieldConfig: FC.others },
  { key: 'power_storage_unit', label: 'Stromspeicher', category: 'others', svgPath: s('others', 'power_storage_unit'),
    defaultAttribute: { farbe: 'Grau', hoehe: 0, kabeltyp: 'NYM-J 5x6' },
    defaultKnx: { geraetetyp: 'Energiemanagement', variante: 'Premium' },
    defaultArtikel: [
      { id: 'o11-1', bezeichnung: 'Batteriespeicher-Anschluss', typ: 'material', menge: 1, einheit: 'Stk', einzelpreis: 45.0 },
      { id: 'o11-2', bezeichnung: 'Anschluss', typ: 'service', menge: 3, einheit: 'Std', einzelpreis: 65.0 },
      { id: 'o11-3', bezeichnung: 'Inbetriebnahme', typ: 'service', menge: 2, einheit: 'Std', einzelpreis: 75.0 },
    ], fieldConfig: FC.others },
  { key: 'switchable_electrical_device', label: 'Schaltbares Gerät', category: 'others', svgPath: s('others', 'switchable_electrical_device'),
    defaultAttribute: { farbe: 'Reinweiss', hoehe: 30, kabeltyp: 'NYM-J 3x2,5' },
    defaultKnx: { geraetetyp: 'Schaltaktor', variante: 'Standard' },
    defaultArtikel: [
      { id: 'o12-1', bezeichnung: 'Schaltbare Gerätedose', typ: 'material', menge: 1, einheit: 'Stk', einzelpreis: 8.50 },
      { id: 'o12-2', bezeichnung: 'Anschluss', typ: 'service', menge: 1, einheit: 'Std', einzelpreis: 45.0 },
    ], fieldConfig: FC.others },
  { key: 'underground_cable', label: 'Erdkabel', category: 'others', svgPath: s('others', 'underground_cable'),
    defaultAttribute: { farbe: 'Schwarz', hoehe: 0, kabeltyp: 'NYCWY 4x16' },
    defaultKnx: { geraetetyp: '', variante: 'Standard' },
    defaultArtikel: [
      { id: 'o13-1', bezeichnung: 'Erdkabel NYCWY', typ: 'material', menge: 1, einheit: 'm', einzelpreis: 8.50 },
      { id: 'o13-2', bezeichnung: 'Verlegung', typ: 'service', menge: 1, einheit: 'm', einzelpreis: 12.0 },
    ], fieldConfig: { ...FC.others, stromkreis: 'hidden', knx: 'hidden' } },
  { key: 'ventilator', label: 'Ventilator', category: 'others', svgPath: s('others', 'ventilator'),
    defaultAttribute: { farbe: 'Reinweiss', hoehe: 250, kabeltyp: 'NYM-J 3x1,5' },
    defaultKnx: { geraetetyp: 'Schaltaktor', variante: 'Standard' },
    defaultArtikel: [
      { id: 'o14-1', bezeichnung: 'Ventilator-Anschluss', typ: 'material', menge: 1, einheit: 'Stk', einzelpreis: 5.0 },
      { id: 'o14-2', bezeichnung: 'Anschluss', typ: 'service', menge: 0.5, einheit: 'Std', einzelpreis: 45.0 },
    ], fieldConfig: FC.others },
];

export const symbolCatalog: SymbolDefinition[] = rawCatalog.map((sym) => {
  const profile = SYMBOL_PROTECTION_OVERRIDES[sym.key] ?? CATEGORY_PROTECTION_PROFILES[sym.category];
  return {
    ...sym,
    isDistributor: sym.category === 'distributor' || DISTRIBUTOR_KEYS.has(sym.key),
    requiredElectricalProperties: SYMBOL_ELECTRICAL_OVERRIDES[sym.key] ?? CATEGORY_ELECTRICAL_REQUIREMENTS[sym.category],
    protectionProfile: profile,
    cabinetMapping: SYMBOL_CABINET_OVERRIDES[sym.key] ?? CATEGORY_CABINET_MAPPING[sym.category],
  };
});
