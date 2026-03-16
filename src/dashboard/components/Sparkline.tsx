interface SparklineProps {
  data: number[];
  width?: number;
  height?: number;
}

export function Sparkline({ data, width = 80, height = 24 }: SparklineProps) {
  if (data.length < 2) return null;

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;

  const points = data
    .map((v, i) => {
      const x = (i / (data.length - 1)) * width;
      const y = height - ((v - min) / range) * (height - 2) - 1;
      return `${x},${y}`;
    })
    .join(" ");

  const last = data[data.length - 1];
  const color = last >= 0 ? "#16a34a" : "#dc2626";

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
      {/* Zero line */}
      {min < 0 && max > 0 && (
        <line
          x1={0}
          y1={height - ((0 - min) / range) * (height - 2) - 1}
          x2={width}
          y2={height - ((0 - min) / range) * (height - 2) - 1}
          stroke="#d1d5db"
          strokeWidth={0.5}
          strokeDasharray="2 2"
        />
      )}
      <polyline points={points} fill="none" stroke={color} strokeWidth={1.5} />
      <circle
        cx={width}
        cy={height - ((last - min) / range) * (height - 2) - 1}
        r={2}
        fill={color}
      />
    </svg>
  );
}
