import React from 'react';
import Svg, { Polygon, Polyline, Defs, LinearGradient, Stop } from 'react-native-svg';

interface SparkLineProps {
  data: number[];
  positive: boolean;
  w?: number;
  h?: number;
}

export const SparkLine: React.FC<SparkLineProps> = ({ data, positive, w = 64, h = 28 }) => {
  const min = Math.min(...data);
  const max = Math.max(...data);
  const rng = max - min || 1;
  const pts = data.map((v, i) => `${(i / (data.length - 1)) * w},${h - ((v - min) / rng) * (h - 2) - 1}`).join(' ');
  const color = positive ? '#00D09C' : '#FF4466';
  const fillId = `fill-${positive ? 'g' : 'r'}-${w}`;

  return (
    <Svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ pointerEvents: 'none' }}>
      <Defs>
        <LinearGradient id={fillId} x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0%" stopColor={color} stopOpacity="0.25" />
          <Stop offset="100%" stopColor={color} stopOpacity="0" />
        </LinearGradient>
      </Defs>
      <Polygon points={`0,${h} ${pts} ${w},${h}`} fill={`url(#${fillId})`} />
      <Polyline points={pts} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
};
