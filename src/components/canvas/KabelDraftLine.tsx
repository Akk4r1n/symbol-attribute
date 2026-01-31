import { Line } from 'react-konva';
import type { PlacedSymbol } from '../../types';

const SYMBOL_CENTER = 20;

interface Props {
  draftSymbolIds: string[];
  symbols: PlacedSymbol[];
  cursorPos: { x: number; y: number } | null;
}

export function KabelDraftLine({ draftSymbolIds, symbols, cursorPos }: Props) {
  const posMap = new Map(symbols.map((s) => [s.id, { x: s.x + SYMBOL_CENTER, y: s.y + SYMBOL_CENTER }]));

  const points: number[] = [];
  for (const id of draftSymbolIds) {
    const p = posMap.get(id);
    if (p) {
      points.push(p.x, p.y);
    }
  }

  // Add cursor position as trailing point
  if (cursorPos && points.length >= 2) {
    points.push(cursorPos.x, cursorPos.y);
  }

  if (points.length < 4) return null;

  return (
    <Line
      points={points}
      stroke="#22c55e"
      strokeWidth={2}
      dash={[6, 4]}
      listening={false}
    />
  );
}
