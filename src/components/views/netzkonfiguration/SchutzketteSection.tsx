import type { NetzKonfiguration, UeberspannungsschutzPosition, CabinetDevice } from '../../../types';
import { UEBERSPANNUNGSSCHUTZ_POSITION_LABELS } from '../../../types';
import { devicesByCategory } from '../../../data/cabinetCatalog';

interface Props {
  netz: NetzKonfiguration;
  onUpdate: (patch: Partial<NetzKonfiguration>) => void;
}

const slsDevices = devicesByCategory('sls');
const meterDevices = devicesByCategory('meter');
const mainSwitchDevices = devicesByCategory('main_switch');
const spdDevices = devicesByCategory('spd');

function DeviceSelect({
  value,
  devices,
  onChange,
  disabled,
}: {
  value: string;
  devices: CabinetDevice[];
  onChange: (deviceId: string) => void;
  disabled?: boolean;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      className="border border-gray-300 rounded px-2 py-1.5 text-sm disabled:opacity-40 disabled:bg-gray-100"
    >
      {devices.map((d) => (
        <option key={d.id} value={d.id}>
          {d.label}
        </option>
      ))}
    </select>
  );
}

function AmpereSelect({
  value,
  onChange,
  disabled,
}: {
  value: number;
  onChange: (a: number) => void;
  disabled?: boolean;
}) {
  const options = [16, 20, 25, 32, 35, 40, 50, 63, 80, 100];
  return (
    <select
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      disabled={disabled}
      className="border border-gray-300 rounded px-2 py-1.5 text-sm w-20 disabled:opacity-40 disabled:bg-gray-100"
    >
      {options.map((a) => (
        <option key={a} value={a}>
          {a}A
        </option>
      ))}
    </select>
  );
}

export function SchutzketteSection({ netz, onUpdate }: Props) {
  const { zaehlervorsicherung, zaehler, hauptschalter, ueberspannungsschutz } =
    netz;

  return (
    <fieldset className="border border-gray-200 rounded-lg p-4 space-y-4">
      <legend className="text-xs font-semibold text-gray-700 px-1">
        Schutzkette
      </legend>

      {/* Zaehlervorsicherung */}
      <div className="flex items-center gap-3">
        <label className="flex items-center gap-2 w-52 shrink-0">
          <input
            type="checkbox"
            checked={zaehlervorsicherung.enabled}
            onChange={(e) =>
              onUpdate({
                zaehlervorsicherung: {
                  ...zaehlervorsicherung,
                  enabled: e.target.checked,
                },
              })
            }
            className="rounded border-gray-300"
          />
          <span className="text-xs text-gray-700">Zaehlervorsicherung</span>
        </label>
        <AmpereSelect
          value={zaehlervorsicherung.ampere}
          disabled={!zaehlervorsicherung.enabled}
          onChange={(ampere) =>
            onUpdate({
              zaehlervorsicherung: { ...zaehlervorsicherung, ampere },
            })
          }
        />
        <span className="text-xs text-gray-500">Typ</span>
        <DeviceSelect
          value={zaehlervorsicherung.deviceId}
          devices={slsDevices}
          disabled={!zaehlervorsicherung.enabled}
          onChange={(deviceId) =>
            onUpdate({
              zaehlervorsicherung: { ...zaehlervorsicherung, deviceId },
            })
          }
        />
      </div>

      {/* Zaehler */}
      <div className="flex items-center gap-3">
        <label className="flex items-center gap-2 w-52 shrink-0">
          <input
            type="checkbox"
            checked={zaehler.enabled}
            onChange={(e) =>
              onUpdate({
                zaehler: { ...zaehler, enabled: e.target.checked },
              })
            }
            className="rounded border-gray-300"
          />
          <span className="text-xs text-gray-700">Zaehler</span>
        </label>
        <DeviceSelect
          value={zaehler.deviceId}
          devices={meterDevices}
          disabled={!zaehler.enabled}
          onChange={(deviceId) =>
            onUpdate({ zaehler: { ...zaehler, deviceId } })
          }
        />
      </div>

      {/* Hauptschalter */}
      <div className="flex items-center gap-3">
        <label className="flex items-center gap-2 w-52 shrink-0">
          <input
            type="checkbox"
            checked={hauptschalter.enabled}
            onChange={(e) =>
              onUpdate({
                hauptschalter: {
                  ...hauptschalter,
                  enabled: e.target.checked,
                },
              })
            }
            className="rounded border-gray-300"
          />
          <span className="text-xs text-gray-700">Hauptschalter</span>
        </label>
        <AmpereSelect
          value={hauptschalter.ampere}
          disabled={!hauptschalter.enabled}
          onChange={(ampere) =>
            onUpdate({ hauptschalter: { ...hauptschalter, ampere } })
          }
        />
        <span className="text-xs text-gray-500">Typ</span>
        <DeviceSelect
          value={hauptschalter.deviceId}
          devices={mainSwitchDevices}
          disabled={!hauptschalter.enabled}
          onChange={(deviceId) =>
            onUpdate({ hauptschalter: { ...hauptschalter, deviceId } })
          }
        />
      </div>

      {/* Ueberspannungsschutz */}
      <div className="flex items-center gap-3 flex-wrap">
        <label className="flex items-center gap-2 w-52 shrink-0">
          <input
            type="checkbox"
            checked={ueberspannungsschutz.enabled}
            onChange={(e) =>
              onUpdate({
                ueberspannungsschutz: {
                  ...ueberspannungsschutz,
                  enabled: e.target.checked,
                },
              })
            }
            className="rounded border-gray-300"
          />
          <span className="text-xs text-gray-700">Ue-Schutz</span>
        </label>
        <select
          value={ueberspannungsschutz.position}
          disabled={!ueberspannungsschutz.enabled}
          onChange={(e) =>
            onUpdate({
              ueberspannungsschutz: {
                ...ueberspannungsschutz,
                position: e.target.value as UeberspannungsschutzPosition,
              },
            })
          }
          className="border border-gray-300 rounded px-2 py-1.5 text-sm disabled:opacity-40 disabled:bg-gray-100"
        >
          {(
            Object.entries(UEBERSPANNUNGSSCHUTZ_POSITION_LABELS) as [
              UeberspannungsschutzPosition,
              string,
            ][]
          ).map(([key, label]) => (
            <option key={key} value={key}>
              {label}
            </option>
          ))}
        </select>
        <span className="text-xs text-gray-500">Typ</span>
        <DeviceSelect
          value={ueberspannungsschutz.deviceId}
          devices={spdDevices}
          disabled={!ueberspannungsschutz.enabled}
          onChange={(deviceId) =>
            onUpdate({
              ueberspannungsschutz: { ...ueberspannungsschutz, deviceId },
            })
          }
        />
      </div>

      {/* Vorsicherung fuer Ueberspannungsschutz */}
      {ueberspannungsschutz.enabled && (
        <div className="flex items-center gap-3 ml-6">
          <label className="flex items-center gap-2 w-46 shrink-0">
            <input
              type="checkbox"
              checked={ueberspannungsschutz.vorsicherung.enabled}
              onChange={(e) =>
                onUpdate({
                  ueberspannungsschutz: {
                    ...ueberspannungsschutz,
                    vorsicherung: {
                      ...ueberspannungsschutz.vorsicherung,
                      enabled: e.target.checked,
                    },
                  },
                })
              }
              className="rounded border-gray-300"
            />
            <span className="text-xs text-gray-600">
              Vorsicherung Ue-Schutz
            </span>
          </label>
          <AmpereSelect
            value={ueberspannungsschutz.vorsicherung.ampere}
            disabled={!ueberspannungsschutz.vorsicherung.enabled}
            onChange={(ampere) =>
              onUpdate({
                ueberspannungsschutz: {
                  ...ueberspannungsschutz,
                  vorsicherung: {
                    ...ueberspannungsschutz.vorsicherung,
                    ampere,
                  },
                },
              })
            }
          />
        </div>
      )}
    </fieldset>
  );
}
