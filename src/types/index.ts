export type SymbolCategory =
  | 'socket'
  | 'switch'
  | 'light'
  | 'sensor'
  | 'safety'
  | 'smarthome'
  | 'network'
  | 'homedevice'
  | 'distributor'
  | 'grounding'
  | 'intercom'
  | 'others';

export type KnxVariante = 'Standard' | 'Premium';

export type FieldRelevance = 'required' | 'optional' | 'hidden';

export interface SymbolFieldConfig {
  attribute: {
    farbe: FieldRelevance;
    hoehe: FieldRelevance;
    kabeltyp: FieldRelevance;
  };
  stromkreis: FieldRelevance;
  knx: FieldRelevance;
}

export interface Attribute {
  farbe: string;
  hoehe: number;
  kabeltyp: string;
}

// --- DIN-Rail Device Catalog ---

export type DinRailCategory =
  | 'mcb' | 'rcd' | 'rcbo' | 'afdd'
  | 'sls' | 'main_switch'
  | 'contactor' | 'meter' | 'spd'
  | 'motor_protection' | 'fuse' | 'disconnect'
  | 'relay' | 'power_supply'
  | 'intercom_system' | 'energy' | 'contact';

export const DIN_RAIL_CATEGORY_LABELS: Record<DinRailCategory, string> = {
  mcb: 'Leitungsschutzschalter',
  rcd: 'FI-Schutzschalter',
  rcbo: 'FI/LS-Kombination',
  afdd: 'Brandschutzschalter',
  sls: 'SLS (Zählervorsicherung)',
  main_switch: 'Hauptschalter',
  contactor: 'Schütz',
  meter: 'Zähler',
  spd: 'Überspannungsschutz',
  motor_protection: 'Motorschutz',
  fuse: 'Schmelzsicherung',
  disconnect: 'Trennschalter',
  relay: 'Relais / Schaltaktor',
  power_supply: 'Netzteil / Spannungsversorgung',
  intercom_system: 'TKS / Sprechanlage',
  energy: 'Energiemanagement',
  contact: 'Hilfsgeräte / Kontakte',
};

export interface DinRailDevice {
  id: string;
  category: DinRailCategory;
  label: string;
  teWidth: number;
  poles: number;
  svgFile: string;
  ratedCurrent?: number;
  characteristic?: string;
  faultCurrent?: number;
  rcdType?: 'A' | 'B' | 'F';
}

// --- Stromkreis (Circuit) ---

export interface StromkreisDevice {
  role: ElectricalPropertyType;
  deviceId: string;
}

export interface Stromkreis {
  id: string;
  name: string;
  verteilerId: string;
  devices: StromkreisDevice[];
}

export interface KnxEigenschaften {
  geraetetyp: string;
  variante: KnxVariante;
}

export interface ArtikelPosition {
  id: string;
  bezeichnung: string;
  typ: 'material' | 'service';
  menge: number;
  einheit: string;
  einzelpreis: number;
}

export type ElectricalPropertyType = 'mcb' | 'rcd' | 'rcbo' | 'afdd' | 'rcd_type_b';

export const ELECTRICAL_PROPERTY_LABELS: Record<ElectricalPropertyType, string> = {
  mcb: 'LSS (MCB)',
  rcd: 'FI (RCD)',
  rcbo: 'FI/LS (RCBO)',
  afdd: 'AFDD',
  rcd_type_b: 'RCD Typ B',
};

// --- Protection Specs (bottom-up circuit derivation) ---

export interface ProtectionRequirement {
  role: ElectricalPropertyType;
  ratedCurrent?: number;
  characteristic?: string;
  faultCurrent?: number;
  rcdType?: 'A' | 'B' | 'F';
  poles?: number;
}

export type CircuitGroupingHint = 'socket' | 'light' | 'dedicated' | 'special';

export const GROUPING_HINT_LABELS: Record<CircuitGroupingHint, string> = {
  socket: 'Steckdosen',
  light: 'Beleuchtung',
  dedicated: 'Einzelstromkreis',
  special: 'Sonstiges',
};

export interface ProtectionProfile {
  requirements: ProtectionRequirement[];
  dedicatedCircuit: boolean;
  groupingHint: CircuitGroupingHint;
}

export interface DerivedCircuit {
  id: string;
  name: string;
  verteilerId: string;
  raumId: string;
  groupingHint: CircuitGroupingHint;
  symbolIds: string[];
  resolvedDevices: StromkreisDevice[];
  mergedRequirements: ProtectionRequirement[];
}

export interface CircuitGroupOverride {
  groupId: string;
  customName?: string;
  verteilerId?: string;
  deviceOverrides?: StromkreisDevice[];
  locked: boolean;
}

export type CabinetFieldType = 'NAR' | 'APZ' | 'ZF' | 'ARR' | 'RfZ' | 'VF';

export const CABINET_FIELD_LABELS: Record<CabinetFieldType, string> = {
  NAR: 'Netzanschlussraum',
  APZ: 'Allg. Prüf-/Zählraum',
  ZF: 'Zählerfeld',
  ARR: 'Anlagenseitiger Anschlussraum',
  RfZ: 'Raum für Zusatzanwendungen',
  VF: 'Verteilerfeld',
};

export interface CabinetMappingInfo {
  targetField: CabinetFieldType | null;
  elementTypes: ElectricalPropertyType[];
  description: string;
}

export interface SymbolDefinition {
  /** Unique key, matches SVG filename without prefix, e.g. "grounded_socket" */
  key: string;
  label: string;
  category: SymbolCategory;
  /** Path to SVG in /public, e.g. "/symbols/simple-socket-grounded_socket.svg" */
  svgPath: string;
  defaultAttribute: Attribute;
  defaultKnx: KnxEigenschaften;
  defaultArtikel: ArtikelPosition[];
  fieldConfig: SymbolFieldConfig;
  isDistributor: boolean;
  requiredElectricalProperties: ElectricalPropertyType[];
  protectionProfile: ProtectionProfile;
  cabinetMapping: CabinetMappingInfo;
}

export interface PlacedSymbol {
  id: string;
  symbolKey: string;
  raumId: string;
  x: number;
  y: number;
  rotation: number;
  attribute: Attribute;
  verteilerId: string | null;
  protectionOverrides?: ProtectionRequirement[];
  circuitGroupOverride?: string | null;
  knx: KnxEigenschaften;
  artikel: ArtikelPosition[];
}

export interface Raum {
  id: string;
  name: string;
}

export interface Stockwerk {
  id: string;
  name: string;
  raeume: Raum[];
}

export interface Gebaeude {
  id: string;
  name: string;
  stockwerke: Stockwerk[];
}

export type ViewType =
  | 'symboluebersicht'
  | 'installationsplan'
  | 'stromlaufplan'
  | 'aufbauplan'
  | 'stueckliste'
  | 'bestellliste';

export interface StuecklisteRow {
  bezeichnung: string;
  typ: 'material' | 'service';
  menge: number;
  einheit: string;
  einzelpreis: number;
  gesamtpreis: number;
}

export interface BestelllisteRow {
  bezeichnung: string;
  menge: number;
  einheit: string;
}

/** Feature areas that depend on properties (not on symbols). */
export type FeatureArea = 'stromlaufplan' | 'aufbauplan' | 'knx' | 'pruefprotokoll' | 'stueckliste';

export const FEATURE_AREA_LABELS: Record<FeatureArea, string> = {
  stromlaufplan: 'Stromlaufplan',
  aufbauplan: 'Aufbauplan',
  knx: 'KNX-System',
  pruefprotokoll: 'Pruefprotokoll',
  stueckliste: 'Stueckliste',
};

/** Global property definition -- first-class entity, independent of symbols. */
export interface PropertyDefinition {
  id: string;
  name: string;
  group: 'attribute' | 'stromkreis' | 'knx' | 'artikel';
  description: string;
  /** Which feature areas consume this property */
  usedBy: FeatureArea[];
  /** Value type for display */
  valueType: 'string' | 'number' | 'enum' | 'boolean' | 'device_ref';
}

export const CATEGORY_LABELS: Record<SymbolCategory, string> = {
  socket: 'Steckdosen',
  switch: 'Schalter',
  light: 'Beleuchtung',
  sensor: 'Sensoren',
  safety: 'Sicherheit',
  smarthome: 'Smart Home',
  network: 'Netzwerk',
  homedevice: 'Hausgeräte',
  distributor: 'Verteiler',
  grounding: 'Erdung',
  intercom: 'Sprechanlage',
  others: 'Sonstiges',
};
