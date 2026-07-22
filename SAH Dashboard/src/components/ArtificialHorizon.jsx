function ArtificialHorizon({ pitch = 0, roll = 0, size = 120 }) {
  const cx = size / 2;
  const cy = size / 2;
  const radius = size / 2 - 8;
  const pitchOffset = (pitch / 30) * radius * 0.6;

  const skyColor = '#4FC3F7';
  const groundColor = '#8D6E63';

  const clipId = `horizon-clip-${pitch}-${roll}`;

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className="artificial-horizon"
    >
      <defs>
        <clipPath id={clipId}>
          <circle cx={cx} cy={cy} r={radius} />
        </clipPath>
      </defs>

      {/* Background circle */}
      <circle cx={cx} cy={cy} r={radius} fill="#1a1a2e" stroke="#444" strokeWidth="1.5" />

      {/* Horizon line group rotated by roll */}
      <g
        clipPath={`url(#horizon-clip-${pitch}-${roll})`}
        transform={`rotate(${roll}, ${cx}, ${cy})`}
      >
        {/* Sky - top half offset by pitch */}
        <rect
          x={0}
          y={0}
          width={size}
          height={cy + pitchOffset}
          fill={skyColor}
          opacity="0.8"
        />
        {/* Ground - bottom half offset by pitch */}
        <rect
          x={0}
          y={cy + pitchOffset}
          width={size}
          height={size - (cy + pitchOffset)}
          fill={groundColor}
          opacity="0.8"
        />

        {/* Horizon line */}
        <line
          x1={0}
          y1={cy + pitchOffset}
          x2={size}
          y2={cy + pitchOffset}
          stroke="#fff"
          strokeWidth="2"
        />

        {/* Pitch angle lines */}
        {[-20, -10, 10, 20].map((angle) => {
          const offset = (angle / 30) * radius * 0.6;
          const yLine = cy + pitchOffset + offset;
          const lineLen = angle % 10 === 0 ? 20 : 10;
          const xStart = cx - lineLen / 2;

          return (
            <line
              key={angle}
              x1={xStart}
              y1={yLine}
              x2={xStart + lineLen}
              y2={yLine}
              stroke="#fff"
              strokeWidth="1"
              opacity="0.6"
            />
          );
        })}
      </g>

      {/* Fixed aircraft reference lines */}
      {/* Center dot */}
      <circle cx={cx} cy={cy} r="3" fill="#FF5722" />
      {/* Wings */}
      <line
        x1={cx - radius * 0.5}
        y1={cy}
        x2={cx + radius * 0.5}
        y2={cy}
        stroke="#FF5722"
        strokeWidth="2"
      />
      {/* Vertical line */}
      <line
        x1={cx}
        y1={cy - radius * 0.2}
        x2={cx}
        y2={cy + radius * 0.2}
        stroke="#FF5722"
        strokeWidth="1.5"
      />

      {/* Outer ring markings */}
      {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((deg) => {
        const rad = (deg * Math.PI) / 180;
        const inner = radius - 10;
        const outer = radius - 4;
        const x1 = cx + inner * Math.sin(rad);
        const y1 = cy - inner * Math.cos(rad);
        const x2 = cx + outer * Math.sin(rad);
        const y2 = cy - outer * Math.cos(rad);

        return (
          <line
            key={deg}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke="#888"
            strokeWidth="1"
          />
        );
      })}

      {/* Roll indicator at top */}
      <polygon
        points={`${cx - 5},${cy - radius + 2} ${cx + 5},${cy - radius + 2} ${cx},${cy - radius - 5}`}
        fill={roll > 5 ? '#FF5722' : roll < -5 ? '#FF5722' : '#4CAF50'}
      />

      {/* Roll angle text */}
      <text
        x={cx}
        y={size - 4}
        textAnchor="middle"
        fill="#aaa"
        fontSize="9"
        fontFamily="monospace"
      >
        Roll: {roll}°
      </text>

      {/* Pitch text */}
      <text
        x={cx}
        y={12}
        textAnchor="middle"
        fill="#aaa"
        fontSize="9"
        fontFamily="monospace"
      >
        Pitch: {pitch}°
      </text>
    </svg>
  );
}

export default ArtificialHorizon;

