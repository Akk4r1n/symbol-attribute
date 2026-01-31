import { useState } from 'react';
import { useAppStore } from '../../../store/useAppStore';
import { useShallow } from 'zustand/react/shallow';
import type { NetzKonfiguration } from '../../../types';

interface Props {
  netz: NetzKonfiguration;
}

export function VerteilerSection({ netz }: Props) {
  const {
    verteiler,
    addVerteiler,
    linkVerteilerToNetz,
    unlinkVerteilerFromNetz,
  } = useAppStore(
    useShallow((s) => ({
      verteiler: s.verteiler,
      addVerteiler: s.addVerteiler,
      linkVerteilerToNetz: s.linkVerteilerToNetz,
      unlinkVerteilerFromNetz: s.unlinkVerteilerFromNetz,
    }))
  );

  const [newName, setNewName] = useState('');

  const linkedVerteiler = verteiler.filter((v) =>
    netz.verteilerIds.includes(v.id)
  );
  const unlinkedVerteiler = verteiler.filter(
    (v) => !netz.verteilerIds.includes(v.id)
  );

  const handleAddNew = () => {
    const name = newName.trim();
    if (!name) return;
    addVerteiler(name);
    setNewName('');
    // Link after next render via store update
    // We need the new ID - use a workaround: read from store after add
    const unsub = useAppStore.subscribe((s) => {
      const added = s.verteiler.find((v) => v.name === name);
      if (added && !netz.verteilerIds.includes(added.id)) {
        linkVerteilerToNetz(netz.id, added.id);
        unsub();
      }
    });
  };

  return (
    <fieldset className="border border-gray-200 rounded-lg p-4 space-y-3">
      <legend className="text-xs font-semibold text-gray-700 px-1">
        Verteiler
      </legend>

      {/* Linked */}
      {linkedVerteiler.length > 0 ? (
        <ul className="space-y-1">
          {linkedVerteiler.map((v) => (
            <li
              key={v.id}
              className="flex items-center justify-between bg-blue-50 rounded px-3 py-1.5"
            >
              <span className="text-xs text-gray-800">{v.name}</span>
              <button
                onClick={() => unlinkVerteilerFromNetz(netz.id, v.id)}
                className="text-[10px] text-gray-400 hover:text-red-600"
              >
                entfernen
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-xs text-gray-400">Keine Verteiler verknuepft</p>
      )}

      {/* Link existing */}
      {unlinkedVerteiler.length > 0 && (
        <div className="flex items-center gap-2">
          <select
            id="link-verteiler"
            defaultValue=""
            onChange={(e) => {
              if (e.target.value) {
                linkVerteilerToNetz(netz.id, e.target.value);
                e.target.value = '';
              }
            }}
            className="border border-gray-300 rounded px-2 py-1 text-xs flex-1"
          >
            <option value="" disabled>
              Bestehenden Verteiler zuordnen...
            </option>
            {unlinkedVerteiler.map((v) => (
              <option key={v.id} value={v.id}>
                {v.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Add new */}
      <div className="flex items-center gap-2 pt-1 border-t border-gray-100">
        <input
          type="text"
          placeholder="Neuer Verteiler..."
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAddNew()}
          className="flex-1 border border-gray-300 rounded px-2 py-1 text-xs focus:outline-none focus:border-blue-500"
        />
        <button
          onClick={handleAddNew}
          disabled={!newName.trim()}
          className="px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-40"
        >
          + Neu
        </button>
      </div>
    </fieldset>
  );
}
