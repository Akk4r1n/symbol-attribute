import { useAppStore } from '../../store/useAppStore';
import { useShallow } from 'zustand/react/shallow';
import { NETZWERK_TYP_LABELS, type NetzwerkTyp } from '../../types';
import { NetzKonfigPanel } from './netzkonfiguration/NetzKonfigPanel';

export function Netzkonfiguration() {
  const {
    netzKonfigurationen,
    activeNetzKonfigId,
    setActiveNetzKonfig,
    addNetzKonfiguration,
    removeNetzKonfiguration,
  } = useAppStore(
    useShallow((s) => ({
      netzKonfigurationen: s.netzKonfigurationen,
      activeNetzKonfigId: s.activeNetzKonfigId,
      setActiveNetzKonfig: s.setActiveNetzKonfig,
      addNetzKonfiguration: s.addNetzKonfiguration,
      removeNetzKonfiguration: s.removeNetzKonfiguration,
    }))
  );

  const activeNetz = netzKonfigurationen.find((n) => n.id === activeNetzKonfigId);

  return (
    <div className="flex h-full">
      {/* Left: network type tree */}
      <aside className="w-80 border-r border-gray-200 bg-white overflow-y-auto shrink-0">
        <div className="p-3 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-gray-700">Netzstruktur</h2>
        </div>

        {(Object.entries(NETZWERK_TYP_LABELS) as [NetzwerkTyp, string][]).map(
          ([typ, label]) => {
            const items = netzKonfigurationen.filter((n) => n.netzwerkTyp === typ);
            return (
              <div key={typ} className="border-b border-gray-100">
                <div className="px-3 py-2 bg-gray-50 flex items-center justify-between">
                  <span className="text-xs font-medium text-gray-600 truncate">
                    {label}
                  </span>
                  <button
                    onClick={() => addNetzKonfiguration(typ)}
                    className="ml-2 px-1.5 py-0.5 text-[10px] font-medium bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    +
                  </button>
                </div>
                {items.map((netz) => (
                  <div
                    key={netz.id}
                    className={`flex items-center group ${
                      netz.id === activeNetzKonfigId
                        ? 'bg-blue-100'
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    <button
                      onClick={() => setActiveNetzKonfig(netz.id)}
                      className={`flex-1 px-5 py-1.5 text-left text-xs truncate ${
                        netz.id === activeNetzKonfigId
                          ? 'text-blue-800 font-medium'
                          : 'text-gray-700'
                      }`}
                    >
                      {netz.bezeichnung}
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeNetzKonfiguration(netz.id);
                      }}
                      className="mr-2 px-1 text-[10px] text-gray-400 hover:text-red-600 opacity-0 group-hover:opacity-100"
                    >
                      x
                    </button>
                  </div>
                ))}
              </div>
            );
          }
        )}
      </aside>

      {/* Right: config form */}
      <main className="flex-1 overflow-y-auto bg-white">
        {activeNetz ? (
          <NetzKonfigPanel netz={activeNetz} />
        ) : (
          <div className="flex items-center justify-center h-full text-sm text-gray-400">
            Netz auswaehlen oder neues erstellen
          </div>
        )}
      </main>
    </div>
  );
}
