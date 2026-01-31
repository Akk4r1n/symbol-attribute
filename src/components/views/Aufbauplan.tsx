import { useMemo, useRef, useEffect, useState } from 'react';
import { Stage, Layer, Rect, Text, Line, Group } from 'react-konva';
import { useStromkreise, useAllSymbols } from '../../store/useAppStore';
import { findDevice, DIN_RAIL_TE_PER_ROW } from '../../data/dinRailCatalog';

const TE_PX = 30;
const ROW_H = 50;
const HEADER_H = 35;

interface PlacedDevice {
  deviceId: string;
  label: string;
  teWidth: number;
  role: string;
  x: number;
  row: number;
  color: string;
}

export function Aufbauplan() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dims, setDims] = useState({ width: 800, height: 600 });
  const stromkreise = useStromkreise();
  const allSymbols = useAllSymbols();

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

  const verteilerGroups = useMemo(() => {
    const groups = new Map<string, typeof stromkreise>();
    for (const sk of stromkreise) {
      const arr = groups.get(sk.verteilerId) ?? [];
      arr.push(sk);
      groups.set(sk.verteilerId, arr);
    }
    return groups;
  }, [stromkreise]);

  const verteilerLayouts = useMemo(() => {
    const layouts: { name: string; devices: PlacedDevice[]; consumerCounts: Map<string, number> }[] = [];

    for (const [name, sks] of verteilerGroups) {
      const seen = new Set<string>();
      const devices: PlacedDevice[] = [];
      const consumerCounts = new Map<string, number>();

      for (const sk of sks) {
        const count = allSymbols.filter(s => s.stromkreisId === sk.id).length;
        consumerCounts.set(sk.id, count);
      }

      for (const sk of sks) {
        for (const d of sk.devices) {
          const key = `${d.role}:${d.deviceId}`;
          if (seen.has(key)) continue;
          seen.add(key);
          const device = findDevice(d.deviceId);
          if (!device) continue;

          const color = d.role === 'rcd' || d.role === 'rcd_type_b' ? '#fef3c7'
            : d.role === 'afdd' ? '#fce7f3'
            : d.role === 'rcbo' ? '#e0f2fe'
            : '#dbeafe';

          devices.push({
            deviceId: d.deviceId,
            label: device.label,
            teWidth: device.teWidth,
            role: d.role,
            x: 0,
            row: 0,
            color,
          });
        }
      }

      let totalTE = 0;
      let row = 0;
      for (const d of devices) {
        if (totalTE + d.teWidth > DIN_RAIL_TE_PER_ROW) {
          row++;
          totalTE = 0;
        }
        d.x = totalTE * TE_PX;
        d.row = row;
        totalTE += d.teWidth;
      }

      layouts.push({ name, devices, consumerCounts });
    }
    return layouts;
  }, [verteilerGroups, allSymbols]);

  const LEFT = 40;
  const TOP = 60;
  const CABINET_GAP = 30;

  let totalHeight = TOP;
  for (const layout of verteilerLayouts) {
    const maxRow = Math.max(0, ...layout.devices.map(d => d.row));
    totalHeight += HEADER_H + (maxRow + 1) * ROW_H + CABINET_GAP;
  }
  totalHeight = Math.max(totalHeight, dims.height);
  const totalWidth = Math.max(dims.width, LEFT + DIN_RAIL_TE_PER_ROW * TE_PX + 80);

  let yOffset = TOP;

  return (
    <div ref={containerRef} className="w-full h-full overflow-auto bg-white">
      {verteilerLayouts.length === 0 ? (
        <div className="flex items-center justify-center h-full text-gray-400">
          Keine Stromkreise definiert.
        </div>
      ) : (
        <Stage width={totalWidth} height={totalHeight}>
          <Layer>
            <Text text="Aufbauplan" x={LEFT} y={15} fontSize={18} fontStyle="bold" fill="#1f2937" />
            {verteilerLayouts.map((layout, vi) => {
              const maxRow = Math.max(0, ...layout.devices.map(d => d.row));
              const cabinetH = HEADER_H + (maxRow + 1) * ROW_H + 10;
              const startY = yOffset;
              yOffset += cabinetH + CABINET_GAP;

              return (
                <Group key={vi}>
                  {/* Cabinet background */}
                  <Rect x={LEFT} y={startY} width={DIN_RAIL_TE_PER_ROW * TE_PX + 20} height={cabinetH} fill="#f9fafb" stroke="#d1d5db" strokeWidth={1} cornerRadius={4} />
                  {/* Cabinet name */}
                  <Rect x={LEFT} y={startY} width={DIN_RAIL_TE_PER_ROW * TE_PX + 20} height={HEADER_H} fill="#374151" cornerRadius={[4, 4, 0, 0]} />
                  <Text text={layout.name} x={LEFT + 10} y={startY + 10} fontSize={14} fontStyle="bold" fill="white" />

                  {/* DIN rails */}
                  {Array.from({ length: maxRow + 1 }, (_, ri) => (
                    <Line key={ri} points={[LEFT + 10, startY + HEADER_H + ri * ROW_H + 20, LEFT + DIN_RAIL_TE_PER_ROW * TE_PX + 10, startY + HEADER_H + ri * ROW_H + 20]} stroke="#9ca3af" strokeWidth={2} dash={[4, 4]} />
                  ))}

                  {/* Devices */}
                  {layout.devices.map((d, di) => {
                    const dx = LEFT + 10 + d.x;
                    const dy = startY + HEADER_H + d.row * ROW_H + 5;
                    const w = d.teWidth * TE_PX - 4;
                    return (
                      <Group key={di}>
                        <Rect x={dx} y={dy} width={w} height={28} fill={d.color} stroke="#6b7280" strokeWidth={1} cornerRadius={2} />
                        <Text text={d.label} x={dx + 2} y={dy + 4} fontSize={8} fill="#1f2937" width={w - 4} />
                        <Text text={`${d.teWidth} TE`} x={dx + 2} y={dy + 16} fontSize={7} fill="#6b7280" width={w - 4} />
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
