interface ChakraProps {
  size?: number;
  strokeWidth?: number;
  style?: React.CSSProperties;
  className?: string;
}

export default function Chakra({ size = 28, strokeWidth = 1.4, style, className }: ChakraProps) {
  const cx = size / 2;
  const cy = size / 2;
  const r = size * 0.46;
  const hubR = size * 0.11;
  const spokes = 24;

  return (
    <svg
      viewBox={`0 0 ${size} ${size}`}
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      style={style}
      className={className}
    >
      <circle cx={cx} cy={cy} r={r} />
      <circle cx={cx} cy={cy} r={hubR} fill="currentColor" stroke="none" />
      {Array.from({ length: spokes }).map((_, i) => {
        const angle = (i * 360) / spokes;
        const rad = (angle * Math.PI) / 180;
        const x1 = cx + hubR * Math.cos(rad);
        const y1 = cy + hubR * Math.sin(rad);
        const x2 = cx + r * Math.cos(rad);
        const y2 = cy + r * Math.sin(rad);
        return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} />;
      })}
    </svg>
  );
}
