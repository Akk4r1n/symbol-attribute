import { NETZFORM_LABELS, type Netzform, type NetzKonfiguration } from '../../../types';

interface Props {
  netz: NetzKonfiguration;
  onUpdate: (patch: Partial<NetzKonfiguration>) => void;
}

export function EinspeisungSection({ netz, onUpdate }: Props) {
  return (
    <fieldset className="border border-gray-200 rounded-lg p-4 space-y-3">
      <legend className="text-xs font-semibold text-gray-700 px-1">
        Einspeisung
      </legend>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs text-gray-500 mb-1">Netzform</label>
          <select
            value={netz.einspeisung.netzform}
            onChange={(e) =>
              onUpdate({
                einspeisung: {
                  ...netz.einspeisung,
                  netzform: e.target.value as Netzform,
                },
              })
            }
            className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm"
          >
            {(Object.entries(NETZFORM_LABELS) as [Netzform, string][]).map(
              ([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              )
            )}
          </select>
        </div>

        <div className="flex items-end">
          <label className="flex items-center gap-2 text-xs text-gray-600">
            <input
              type="checkbox"
              checked={netz.einspeisung.alsKlemmenblock}
              onChange={(e) =>
                onUpdate({
                  einspeisung: {
                    ...netz.einspeisung,
                    alsKlemmenblock: e.target.checked,
                  },
                })
              }
              className="rounded border-gray-300"
            />
            als Klemmenblock zeichnen
          </label>
        </div>
      </div>
    </fieldset>
  );
}
