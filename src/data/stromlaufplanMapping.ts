import { DIN_RAIL_SVG_BASE } from './dinRailCatalog';

/**
 * Maps installation symbol keys to their Stromlaufplan (circuit diagram) SVG filenames.
 * Symbols not in this map render as text labels (fallback).
 */
export const symbolSvgMap: Record<string, string> = {
  // Socket
  grounded_socket: 'reg-steckdose.svg',
  grounded_socket_switchable: 'reg-steckdose.svg',
  grounded_socket_usb: 'reg-steckdose.svg',
  grounded_socket_with_lid: 'reg-steckdose.svg',
  grounded_surface_mounted_socket_with_lid: 'reg-steckdose.svg',
  high_voltage_socket: 'reg-steckdose-5pol.svg',
  socket_switchable: 'reg-steckdose.svg',
  socket_with_extra_touch_protection: 'reg-steckdose.svg',
  surface_mounted_socket: 'reg-steckdose.svg',
  surface_mounted_socket_with_extra_touch_protection: 'reg-steckdose.svg',
  // Switch
  off_switch: 'umschalter.svg',
  off_switch_double: 'umschalter.svg',
  off_switch_indicator_light: 'umschalter.svg',
  changeover_switch: 'wechsler.svg',
  changeover_switch_double: 'wechsler.svg',
  changeover_switch_indicator_light: 'wechsler.svg',
  cross_switch: 'wechsler.svg',
  button: 'taster-1pol.svg',
  button_indicator_light: 'taster-1pol.svg',
  dimmer_button: 'taster-1pol.svg',
  dimmer_switch: 'umschalter.svg',
  series_switch: 'umschalter.svg',
  series_switch_singlepole: 'umschalter.svg',
  series_button: 'taster-1pol.svg',
  roller_shutter_button: 'taster-2pol.svg',
  roller_shutter_switch: 'umschalter.svg',
  switch_general: 'umschalter.svg',
  // Light
  ceiling_light: 'verbraucher.svg',
  fluorescent_lamp: 'verbraucher.svg',
  LED: 'verbraucher.svg',
  surface_mounted_wall_light: 'verbraucher.svg',
  // Intercom
  gong: 'gong-ap.svg',
  door_opener: 'tueroeffner.svg',
  // Homedevice
  charging_station: 'elektrofahrzeug.svg',
  oven: 'verbraucher.svg',
  stove: 'verbraucher.svg',
  dishwasher: 'verbraucher.svg',
  washing_machine: 'verbraucher.svg',
  clothes_dryer: 'verbraucher.svg',
  air_conditioning: 'verbraucher.svg',
  // Others
  motor: 'verbraucher.svg',
  ventilator: 'verbraucher.svg',
};

export function getSymbolSvgPath(symbolKey: string): string | undefined {
  const file = symbolSvgMap[symbolKey];
  if (!file) return undefined;
  return `${DIN_RAIL_SVG_BASE}/${file}`;
}
