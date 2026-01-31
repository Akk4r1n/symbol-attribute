import { useAppStore } from '../../../store/useAppStore';
import type { NetzKonfiguration } from '../../../types';
import { EinspeisungSection } from './EinspeisungSection';
import { SchutzketteSection } from './SchutzketteSection';
import { VerteilerSection } from './VerteilerSection';

interface Props {
  netz: NetzKonfiguration;
}

export function NetzKonfigPanel({ netz }: Props) {
  const updateNetzKonfiguration = useAppStore((s) => s.updateNetzKonfiguration);

  const update = (patch: Partial<NetzKonfiguration>) => {
    updateNetzKonfiguration(netz.id, patch);
  };

  return (
    <div className="p-6 max-w-2xl space-y-6">
      {/* Bezeichnung */}
      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1">
          Bezeichnung
        </label>
        <input
          type="text"
          value={netz.bezeichnung}
          onChange={(e) => update({ bezeichnung: e.target.value })}
          className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:border-blue-500"
        />
      </div>

      {/* Leitungstyp + Querschnitt */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">
            Leitungstyp
          </label>
          <input
            type="text"
            value={netz.leitungstyp}
            onChange={(e) => update({ leitungstyp: e.target.value })}
            className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:border-blue-500"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">
            Querschnitt (mm²)
          </label>
          <input
            type="number"
            min={0}
            value={netz.querschnitt}
            onChange={(e) =>
              update({ querschnitt: Number(e.target.value) || 0 })
            }
            className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:border-blue-500"
          />
        </div>
      </div>

      {/* Notiz */}
      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1">
          Notiz
        </label>
        <textarea
          value={netz.notiz}
          onChange={(e) => update({ notiz: e.target.value })}
          rows={2}
          className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:border-blue-500"
        />
      </div>

      <EinspeisungSection netz={netz} onUpdate={update} />
      <SchutzketteSection netz={netz} onUpdate={update} />
      <VerteilerSection netz={netz} />
    </div>
  );
}
