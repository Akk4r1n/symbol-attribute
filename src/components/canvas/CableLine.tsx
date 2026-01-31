import { Group, Shape, Text } from 'react-konva';
import type { Kabel, PlacedSymbol } from '../../types';
import { useAppStore } from '../../store/useAppStore';

const SYMBOL_CENTER = 20; // SYMBOL_SIZE / 2
const CURVE_OFFSET = 20;

interface Props {
  kabel: Kabel;
  symbols: PlacedSymbol[];
}

function midpoint(x1: number, y1: number, x2: number, y2: number) {
  return { x: (x1 + x2) / 2, y: (y1 + y2) / 2 };
}

function controlPoint(x1: number, y1: number, x2: number, y2: number) {
  const mid = midpoint(x1, y1, x2, y2);
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len = Math.sqrt(dx * dx + dy * dy) || 1;
  // Perpendicular offset
  return { x: mid.x + (-dy / len) * CURVE_OFFSET, y: mid.y + (dx / len) * CURVE_OFFSET };
}

export function CableLine({ kabel, symbols }: Props) {
  const selectedTarget = useAppStore((s) => s.selectedTarget);
  const setSelectedTarget = useAppStore((s) => s.setSelectedTarget);
  const isSelected = selectedTarget?.type === 'kabel' && selectedTarget.id === kabel.id;

  const posMap = new Map(symbols.map((sym) => [sym.id, { x: sym.x + SYMBOL_CENTER, y: sym.y + SYMBOL_CENTER }]));
  const points = kabel.connectedSymbolIds
    .map((id) => posMap.get(id))
    .filter((p): p is { x: number; y: number } => !!p);

  if (points.length < 2) return null;

  // Label at midpoint of first segment
  const labelPos = midpoint(points[0].x, points[0].y, points[1].x, points[1].y);

  return (
    <Group>
      <Shape
        sceneFunc={(ctx, shape) => {
          ctx.beginPath();
          ctx.moveTo(points[0].x, points[0].y);
          for (let i = 1; i < points.length; i++) {
            const cp = controlPoint(points[i - 1].x, points[i - 1].y, points[i].x, points[i].y);
            ctx.quadraticCurveTo(cp.x, cp.y, points[i].x, points[i].y);
          }
          ctx.fillStrokeShape(shape);
        }}
        stroke={isSelected ? '#3b82f6' : '#9ca3af'}
        strokeWidth={isSelected ? 3 : 2}
        hitStrokeWidth={14}
        listening
        onClick={(e) => {
          e.cancelBubble = true;
          setSelectedTarget({ type: 'kabel', id: kabel.id });
        }}
      />
      {kabel.kabeltyp && (
        <Text
          x={labelPos.x - 30}
          y={labelPos.y - 16}
          text={kabel.kabeltyp}
          fontSize={9}
          fill={isSelected ? '#3b82f6' : '#6b7280'}
          width={60}
          align="center"
          listening={false}
        />
      )}
    </Group>
  );
}
