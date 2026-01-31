import { useMemo, useRef, useEffect, useState } from 'react';
import { Stage, Layer, Rect, Text, Line, Group } from 'react-konva';
import { useDerivedCircuits, useAllSymbols, useAppStore, useNetzKonfigurationen } from '../../store/useAppStore';
import { symbolCatalog } from '../../data/mockSymbols';
import { findDevice } from '../../data/cabinetCatalog';
import { groupBySharedRcd, circuitDevicesWithoutRcd } from '../../logic/rcdGrouping';
import { findNetzForVerteiler, resolveUpstreamDevices } from '../../logic/netzUpstream';
import type { RcdGroup } from '../../logic/rcdGrouping';
import type { DerivedCircuit, StromkreisDevice, CabinetDevice, NetzKonfiguration } from '../../types';
import type { UpstreamDevice } from '../../logic/netzUpstream';

interface ColumnData {
  circuit: DerivedCircuit;
  rcdGroup: RcdGroup | null;
  devices: (StromkreisDevice & { device: CabinetDevice | undefined })[];
  symbols: { key: string; label: string; raum: string }[];
}

interface VerteilerSpan {
  verteilerId: string;
  startIdx: number;
  endIdx: number;
  netz: NetzKonfiguration | undefined;
  upstream: UpstreamDevice[];
}

export function Stromlaufplan() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dims, setDims] = useState({ width: 800, height: 600 });
  const derivedCircuits = useDerivedCircuits();
  const allSymbols = useAllSymbols();
  const gebaeude = useAppStore((s) => s.gebaeude);
  const netzKonfigurationen = useNetzKonfigurationen();

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

  const { columns, rcdGroupSpans, verteilerSpans } = useMemo(() => {
    const getRaumName = (raumId: string) => {
      for (const sw of gebaeude.stockwerke) {
        const r = sw.raeume.find((r) => r.id === raumId);
        if (r) return r.name;
      }
      return raumId;
    };

    const rcdGroups = groupBySharedRcd(derivedCircuits);
    const circuitMap = new Map(derivedCircuits.map((c) => [c.id, c]));

    // Map circuitId → rcdGroup
    const circuitToGroup = new Map<string, RcdGroup>();
    for (const g of rcdGroups) {
      for (const cid of g.circuitIds) circuitToGroup.set(cid, g);
    }

    // Order: RCD group members adjacent, then standalone
    const ordered: { circuit: DerivedCircuit; rcdGroup: RcdGroup | null }[] = [];
    const placed = new Set<string>();

    for (const g of rcdGroups) {
      for (const cid of g.circuitIds) {
        const circuit = circuitMap.get(cid);
        if (circuit && !placed.has(cid)) {
          ordered.push({ circuit, rcdGroup: g });
          placed.add(cid);
        }
      }
    }
    for (const circuit of derivedCircuits) {
      if (!placed.has(circuit.id)) {
        ordered.push({ circuit, rcdGroup: null });
        placed.add(circuit.id);
      }
    }

    // Build columns
    const cols: ColumnData[] = ordered.map(({ circuit, rcdGroup }) => {
      const symbols = circuit.symbolIds
        .map((sid) => allSymbols.find((s) => s.id === sid))
        .filter((s) => {
          if (!s) return false;
          const def = symbolCatalog.find((d) => d.key === s.symbolKey);
          return def?.isVerbraucher ?? false;
        })
        .map((s) => {
          const def = symbolCatalog.find((d) => d.key === s!.symbolKey);
          return { key: s!.symbolKey, label: def?.label ?? s!.symbolKey, raum: getRaumName(s!.raumId) };
        });

      const rawDevices = rcdGroup
        ? circuitDevicesWithoutRcd(circuit)
        : circuit.resolvedDevices;
      const devices = rawDevices.map((d) => ({ ...d, device: findDevice(d.deviceId) }));

      return { circuit, rcdGroup, devices, symbols };
    });

    // Compute RCD group column spans (start/end indices)
    const spans: { group: RcdGroup; startIdx: number; endIdx: number }[] = [];
    const seenRcd = new Set<string>();
    for (let i = 0; i < cols.length; i++) {
      const g = cols[i].rcdGroup;
      if (g && !seenRcd.has(g.id)) {
        seenRcd.add(g.id);
        let end = i;
        for (let j = i + 1; j < cols.length; j++) {
          if (cols[j].rcdGroup?.id === g.id) end = j;
          else break;
        }
        spans.push({ group: g, startIdx: i, endIdx: end });
      }
    }

    // Compute verteiler spans for upstream chain rendering
    const vSpans: VerteilerSpan[] = [];
    const seenVerteiler = new Set<string>();
    for (let i = 0; i < cols.length; i++) {
      const vid = cols[i].circuit.verteilerId;
      if (!seenVerteiler.has(vid)) {
        seenVerteiler.add(vid);
        let end = i;
        for (let j = i + 1; j < cols.length; j++) {
          if (cols[j].circuit.verteilerId === vid) end = j;
          else break;
        }
        const netz = findNetzForVerteiler(netzKonfigurationen, vid);
        vSpans.push({
          verteilerId: vid,
          startIdx: i,
          endIdx: end,
          netz,
          upstream: netz ? resolveUpstreamDevices(netz) : [],
        });
      }
    }

    return { columns: cols, rcdGroupSpans: spans, verteilerSpans: vSpans };
  }, [derivedCircuits, allSymbols, gebaeude, netzKonfigurationen]);

  const COL_W = 200;
  const ROW_H = 30;
  const LEFT = 40;
  const UPSTREAM_SLOT_H = 40;

  // Compute upstream zone height (max across all verteiler groups)
  const maxUpstreamCount = Math.max(0, ...verteilerSpans.map((s) => s.upstream.length));
  const UPSTREAM_H = maxUpstreamCount * UPSTREAM_SLOT_H;

  const TOP = 80 + UPSTREAM_H;
  const RCD_TIER_Y = TOP + 20;
  const hasRcdGroups = rcdGroupSpans.length > 0;
  const DEVICE_TIER_Y = hasRcdGroups ? TOP + 70 : TOP + 20;

  const maxDevices = Math.max(1, ...columns.map((c) => c.devices.length));
  const deviceZoneH = maxDevices * 40;
  const labelY = DEVICE_TIER_Y + deviceZoneH + 5;
  const maxSymbols = Math.max(1, ...columns.map((c) => c.symbols.length));
  const totalW = Math.max(dims.width, columns.length * COL_W + LEFT + 40);
  const totalH = Math.max(dims.height, labelY + 25 + maxSymbols * ROW_H + 60);

  return (
    <div ref={containerRef} className="w-full h-full overflow-auto bg-white">
      {columns.length === 0 ? (
        <div className="flex items-center justify-center h-full text-gray-400">
          Keine Stromkreise. Platzieren Sie Symbole mit Schutzgeräte-Anforderungen.
        </div>
      ) : (
        <Stage width={totalW} height={totalH}>
          <Layer>
            <Text text="Stromlaufplan" x={LEFT} y={15} fontSize={18} fontStyle="bold" fill="#1f2937" />

            {/* Upstream chain per verteiler group */}
            {verteilerSpans.filter((s) => s.upstream.length > 0).map((span) => {
              const cx = LEFT + ((span.startIdx + span.endIdx) / 2) * COL_W + COL_W / 2;

              return (
                <Group key={`upstream-${span.verteilerId}`}>
                  {span.upstream.map((ud, ui) => {
                    const y = 80 + ui * UPSTREAM_SLOT_H;
                    const isEinspeisung = ud.slot === 'einspeisung';
                    const isZaehler = ud.slot === 'zaehler';
                    const color = isEinspeisung ? '#f0fdf4' : isZaehler ? '#e0e7ff' : '#d1fae5';
                    const textColor = isEinspeisung ? '#166534' : isZaehler ? '#3730a3' : '#065f46';
                    return (
                      <Group key={ui}>
                        {/* Connection line from previous device */}
                        {ui > 0 && <Line points={[cx, y - 5, cx, y]} stroke="#374151" strokeWidth={2} />}
                        <Rect x={cx - 55} y={y} width={110} height={28} fill={color} stroke={textColor} strokeWidth={1} cornerRadius={3} />
                        <Text text={ud.label} x={cx - 53} y={y + 3} fontSize={8} fill={textColor} width={106} align="center" />
                        <Text text={ud.sublabel} x={cx - 53} y={y + 15} fontSize={7} fill={textColor} width={106} align="center" />
                        {/* Connection line to next device */}
                        <Line points={[cx, y + 28, cx, y + UPSTREAM_SLOT_H - 5]} stroke="#374151" strokeWidth={2} />
                      </Group>
                    );
                  })}
                  {/* Final line from last upstream device to bus bar */}
                  <Line points={[cx, 80 + span.upstream.length * UPSTREAM_SLOT_H - 5, cx, TOP]} stroke="#374151" strokeWidth={2} />
                </Group>
              );
            })}

            {/* Main bus bar */}
            <Line points={[LEFT, TOP, LEFT + columns.length * COL_W, TOP]} stroke="#374151" strokeWidth={3} />
            <Text text="L1" x={LEFT - 25} y={TOP - 7} fontSize={12} fill="#374151" fontStyle="bold" />

            {/* Shared RCD boxes spanning grouped columns */}
            {rcdGroupSpans.map((span) => {
              const x1 = LEFT + span.startIdx * COL_W + COL_W / 2 - 35;
              const x2 = LEFT + span.endIdx * COL_W + COL_W / 2 + 35;
              const cx = (x1 + x2) / 2;
              const w = x2 - x1;
              const dev = span.group.sharedRcdDevice ? findDevice(span.group.sharedRcdDevice.deviceId) : null;

              return (
                <Group key={span.group.id}>
                  {/* Line from bus to shared RCD */}
                  <Line points={[cx, TOP, cx, RCD_TIER_Y]} stroke="#374151" strokeWidth={2} />
                  {/* Shared RCD box */}
                  <Rect x={x1} y={RCD_TIER_Y} width={w} height={24} fill="#fef3c7" stroke="#92400e" strokeWidth={1} cornerRadius={3} />
                  <Text text={dev?.label ?? 'RCD'} x={x1 + 2} y={RCD_TIER_Y + 4} fontSize={8} fill="#92400e" width={w - 4} align="center" />
                  <Text
                    text={`gemeinsam (${span.endIdx - span.startIdx + 1} SK)`}
                    x={x1 + 2} y={RCD_TIER_Y + 14} fontSize={7} fill="#92400e" width={w - 4} align="center"
                  />
                  {/* Branch lines from RCD down to each column */}
                  {Array.from({ length: span.endIdx - span.startIdx + 1 }, (_, ci) => {
                    const colX = LEFT + (span.startIdx + ci) * COL_W + COL_W / 2;
                    return (
                      <Line key={ci} points={[colX, RCD_TIER_Y + 24, colX, DEVICE_TIER_Y - 5]} stroke="#374151" strokeWidth={2} />
                    );
                  })}
                </Group>
              );
            })}

            {/* Per-column rendering */}
            {columns.map((col, ci) => {
              const x = LEFT + ci * COL_W + COL_W / 2;
              const inRcdGroup = !!col.rcdGroup;

              return (
                <Group key={ci}>
                  {/* Vertical from bus (standalone only) */}
                  {!inRcdGroup && (
                    <Line points={[x, TOP, x, DEVICE_TIER_Y - 5]} stroke="#374151" strokeWidth={2} />
                  )}

                  {/* Per-circuit devices (MCB, AFDD, RCBO) */}
                  {col.devices.map((d, di) => {
                    const devY = DEVICE_TIER_Y + di * 40;
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

                  {/* If no per-circuit devices but in RCD group, draw line to label */}
                  {col.devices.length === 0 && (
                    <Line points={[x, DEVICE_TIER_Y - 5, x, labelY - 5]} stroke="#374151" strokeWidth={1} dash={[4, 4]} />
                  )}

                  {/* Circuit label */}
                  <Text text={col.circuit.name} x={x - 50} y={labelY} fontSize={9} fill="#6b7280" width={100} align="center" />
                  <Text text={col.circuit.verteilerId} x={x - 50} y={labelY + 10} fontSize={8} fill="#9ca3af" width={100} align="center" />

                  {/* Line to consumers */}
                  {col.symbols.length > 0 && (
                    <Line points={[x, labelY + 22, x, labelY + 32]} stroke="#374151" strokeWidth={1} />
                  )}

                  {/* Consumer symbols */}
                  {col.symbols.map((sym, si) => {
                    const sy = labelY + 37 + si * ROW_H;
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
