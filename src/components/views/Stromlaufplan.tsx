import { useMemo, useRef, useEffect, useState } from 'react';
import { Stage, Layer, Rect, Text, Line, Group } from 'react-konva';
import { useStromkreise, useAllSymbols, useAppStore } from '../../store/useAppStore';
import { symbolCatalog } from '../../data/mockSymbols';
import { findDevice } from '../../data/dinRailCatalog';

export function Stromlaufplan() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dims, setDims] = useState({ width: 800, height: 600 });
  const stromkreise = useStromkreise();
  const allSymbols = useAllSymbols();
  const gebaeude = useAppStore((s) => s.gebaeude);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const obs = new ResizeObserver((entries) => {
      const { width, height } = entries[0].contentRect;
      setDims({ width, height });
    });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const circuits = useMemo(() => {
    const getRaumName = (raumId: string) => {
      for (const sw of gebaeude.stockwerke) {
        const r = sw.raeume.find((r) => r.id === raumId);
        if (r) return r.name;
      }
      return raumId;
    };

    return stromkreise.map(sk => {
      const symbols = allSymbols
        .filter(s => s.stromkreisId === sk.id)
        .map(s => {
          const def = symbolCatalog.find(d => d.key === s.symbolKey);
          return { key: s.symbolKey, label: def?.label ?? s.symbolKey, raum: getRaumName(s.raumId) };
        });

      const devices = sk.devices.map(d => ({
        ...d,
        device: findDevice(d.deviceId),
      }));

      return { sk, devices, symbols };
    }).filter(c => c.devices.length > 0);
  }, [stromkreise, allSymbols, gebaeude]);

  const COL_W = 200;
  const ROW_H = 30;
  const TOP = 80;
  const LEFT = 40;
  const totalW = Math.max(dims.width, circuits.length * COL_W + LEFT + 40);
  const maxSymbols = Math.max(1, ...circuits.map(c => c.symbols.length));
  const maxDevices = Math.max(1, ...circuits.map(c => c.devices.length));
  const deviceZoneH = maxDevices * 40;
  const totalH = Math.max(dims.height, TOP + deviceZoneH + 40 + maxSymbols * ROW_H + 60);

  return (
    <div ref={containerRef} className="w-full h-full overflow-auto bg-white">
      {circuits.length === 0 ? (
        <div className="flex items-center justify-center h-full text-gray-400">
          Keine Stromkreise. Erstellen Sie Stromkreise und weisen Sie Symbole zu.
        </div>
      ) : (
        <Stage width={totalW} height={totalH}>
          <Layer>
            <Text text="Stromlaufplan" x={LEFT} y={15} fontSize={18} fontStyle="bold" fill="#1f2937" />
            {/* Main bus bar */}
            <Line points={[LEFT, TOP, LEFT + circuits.length * COL_W, TOP]} stroke="#374151" strokeWidth={3} />
            <Text text="L1" x={LEFT - 25} y={TOP - 7} fontSize={12} fill="#374151" fontStyle="bold" />

            {circuits.map((circuit, ci) => {
              const x = LEFT + ci * COL_W + COL_W / 2;
              let currentY = TOP;

              return (
                <Group key={ci}>
                  {/* Vertical line from bus */}
                  <Line points={[x, TOP, x, TOP + 15]} stroke="#374151" strokeWidth={2} />

                  {/* Protection devices chain */}
                  {circuit.devices.map((d, di) => {
                    const devY = TOP + 20 + di * 40;
                    currentY = devY + 30;
                    const dev = d.device;
                    const isRcd = d.role === 'rcd' || d.role === 'rcd_type_b' || d.role === 'rcbo';
                    const color = isRcd ? '#fef3c7' : d.role === 'afdd' ? '#fce7f3' : '#dbeafe';
                    const textColor = isRcd ? '#92400e' : d.role === 'afdd' ? '#9d174d' : '#1e40af';

                    return (
                      <Group key={di}>
                        <Line points={[x, devY - 5, x, devY]} stroke="#374151" strokeWidth={2} />
                        <Rect x={x - 35} y={devY} width={70} height={24} fill={color} stroke={textColor} strokeWidth={1} cornerRadius={3} />
                        <Text text={dev?.label ?? d.deviceId} x={x - 33} y={devY + 4} fontSize={8} fill={textColor} width={66} align="center" />
                        <Text text={d.role.toUpperCase()} x={x - 33} y={devY + 14} fontSize={7} fill={textColor} width={66} align="center" />
                        <Line points={[x, devY + 24, x, devY + 35]} stroke="#374151" strokeWidth={2} />
                      </Group>
                    );
                  })}

                  {/* Stromkreis label */}
                  <Text text={circuit.sk.name} x={x - 50} y={currentY + 5} fontSize={9} fill="#6b7280" width={100} align="center" />
                  <Text text={circuit.sk.verteilerId} x={x - 50} y={currentY + 15} fontSize={8} fill="#9ca3af" width={100} align="center" />

                  {/* Line to consumers */}
                  {circuit.symbols.length > 0 && (
                    <Line points={[x, currentY + 25, x, currentY + 35]} stroke="#374151" strokeWidth={1} />
                  )}

                  {/* Consumer symbols */}
                  {circuit.symbols.map((sym, si) => {
                    const sy = currentY + 40 + si * ROW_H;
                    return (
                      <Group key={si}>
                        <Line points={[x, sy, x + 15, sy]} stroke="#6b7280" strokeWidth={1} />
                        <Rect x={x + 15} y={sy - 10} width={120} height={20} fill="#f3f4f6" stroke="#d1d5db" strokeWidth={1} cornerRadius={2} />
                        <Text text={sym.label} x={x + 20} y={sy - 6} fontSize={9} fill="#374151" />
                        <Text text={sym.raum} x={x + 20} y={sy + 3} fontSize={7} fill="#9ca3af" />
                      </Group>
                    );
                  })}
                </Group>
              );
            })}
          </Layer>
        </Stage>
      )}
    </div>
  );
}
