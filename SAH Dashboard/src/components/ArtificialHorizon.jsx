function ArtificialHorizon({
  pitch = 0,
  roll = 0,
  size = 120,
  armed = false,
  mode = 'vtol',
  heading = 0,
  airspeed = 0,
  altitude = 0,
}) {
  const cx = 50;
  const cy = 50;
  const radius = 42;
  const isLarge = size >= 150;

  // Clamp pitch to ±60° for display
  const clampedPitch = Math.max(-60, Math.min(60, pitch));
  // Pitch offset in our 0-100 coordinate space
  // 30° pitch = move horizon by ~25 units
  const pitchScale = 0.8;
  const pitchOffset = (clampedPitch / 30) * radius * 0.5 * pitchScale;

  const skyGradientId = 'sky-grad';
  const groundGradientId = 'ground-grad';
  const clipId = 'horizon-clip';

  // Generate pitch ladder lines
  const pitchAngles = [];
  for (let angle = -60; angle <= 60; angle += 5) {
    pitchAngles.push(angle);
  }

  // Heading compass points
  const headings = [0, 45, 90, 135, 180, 225, 270, 315];
  const headingLabels = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      className="artificial-horizon"
    >
      <defs>
        {/* Sky gradient */}
        <linearGradient id={skyGradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1a6fc4" />
          <stop offset="100%" stopColor="#4FC3F7" />
        </linearGradient>
        {/* Ground gradient */}
        <linearGradient id={groundGradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#6d4c2a" />
          <stop offset="100%" stopColor="#8D6E63" />
        </linearGradient>
        {/* Instrument face gradient */}
        <radialGradient id="face-grad" cx="50%" cy="50%" r="50%">
          <stop offset="90%" stopColor="#1a1a2e" stopOpacity="0" />
          <stop offset="100%" stopColor="#0a0a1a" stopOpacity="0.6" />
        </radialGradient>
        <clipPath id={clipId}>
          <circle cx={cx} cy={cy} r={radius} />
        </clipPath>
      </defs>

      {/* ===== OUTER RING ===== */}
      <circle
        cx={cx}
        cy={cy}
        r={radius + 3}
        fill="#0d1117"
        stroke="#30363d"
        strokeWidth="1.5"
      />
      <circle
        cx={cx}
        cy={cy}
        r={radius}
        fill="#0a0e1a"
        stroke="#555"
        strokeWidth="1"
      />

      {/* ===== MAIN ATTITUDE DISPLAY ===== */}
      <g clipPath={`url(#${clipId})`} transform={`rotate(${roll}, ${cx}, ${cy})`}>
        {/* Sky */}
        <rect
          x={0}
          y={0}
          width={100}
          height={cy + pitchOffset}
          fill={`url(#${skyGradientId})`}
        />
        {/* Ground */}
        <rect
          x={0}
          y={cy + pitchOffset}
          width={100}
          height={100 - (cy + pitchOffset)}
          fill={`url(#${groundGradientId})`}
        />

        {/* Horizon line */}
        <line
          x1={0}
          y1={cy + pitchOffset}
          x2={100}
          y2={cy + pitchOffset}
          stroke="#fff"
          strokeWidth="1.5"
        />

        {/* Pitch ladder */}
        {pitchAngles.map((angle) => {
          if (angle === 0) return null; // drawn above
          const offset = (angle / 30) * radius * 0.5 * pitchScale;
          const yLine = cy + pitchOffset + offset;

          // Skip if outside visible area
          if (yLine < 2 || yLine > 98) return null;

          const isTen = angle % 10 === 0;
          const lineLen = isTen ? 14 : 7;
          const xStart = cx - lineLen / 2;

          const elements = [];

          // The pitch line
          elements.push(
            <line
              key={`line-${angle}`}
              x1={xStart}
              y1={yLine}
              x2={xStart + lineLen}
              y2={yLine}
              stroke="rgba(255,255,255,0.7)"
              strokeWidth={isTen ? 1.2 : 0.8}
            />
          );

          // Number label for 10-degree increments
          if (isTen) {
            const label = Math.abs(angle).toString();
            elements.push(
              <text
                key={`label-${angle}`}
                x={xStart - 5}
                y={yLine + 1.5}
                textAnchor="end"
                fill="rgba(255,255,255,0.7)"
                fontSize="4"
                fontFamily="monospace"
                fontWeight="bold"
              >
                {label}
              </text>
            );
            // Also on right side
            elements.push(
              <text
                key={`label-r-${angle}`}
                x={xStart + lineLen + 5}
                y={yLine + 1.5}
                textAnchor="start"
                fill="rgba(255,255,255,0.7)"
                fontSize="4"
                fontFamily="monospace"
                fontWeight="bold"
              >
                {label}
              </text>
            );
          }

          return elements;
        })}
      </g>

      {/* ===== INNER SHADOW/VIGNETTE ===== */}
      <circle cx={cx} cy={cy} r={radius} fill="url(#face-grad)" />

      {/* ===== CENTER DOT ===== */}
      <circle cx={cx} cy={cy} r="1.5" fill="#FF5722" />

      {/* ===== AIRCRAFT REFERENCE (FIXED) ===== */}
      <g stroke="#FF5722" fill="none">
        {/* Left wing */}
        <line
          x1={cx - 22}
          y1={cy}
          x2={cx - 3}
          y2={cy}
          strokeWidth="1.8"
          strokeLinecap="round"
        />
        {/* Left winglet */}
        <line
          x1={cx - 22}
          y1={cy}
          x2={cx - 20}
          y2={cy - 3}
          strokeWidth="1"
          strokeLinecap="round"
        />
        {/* Right wing */}
        <line
          x1={cx + 3}
          y1={cy}
          x2={cx + 22}
          y2={cy}
          strokeWidth="1.8"
          strokeLinecap="round"
        />
        {/* Right winglet */}
        <line
          x1={cx + 22}
          y1={cy}
          x2={cx + 20}
          y2={cy - 3}
          strokeWidth="1"
          strokeLinecap="round"
        />
        {/* Nose (upward triangle) */}
        <polygon
          points={`${cx - 1.5},${cy - 10} ${cx + 1.5},${cy - 10} ${cx},${cy - 14}`}
          fill="#FF5722"
          stroke="none"
        />
        {/* Center circle */}
        <circle cx={cx} cy={cy} r="3" strokeWidth="1" fill="#1a1a2e" />
      </g>

      {/* ===== ROLL SCALE ARC (top) ===== */}
      <g>
        {/* Arc background */}
        <path
          d={`M ${cx - 32} ${cy - radius + 4} A 30 30 0 0 1 ${cx + 32} ${cy - radius + 4}`}
          fill="none"
          stroke="#555"
          strokeWidth="1"
        />
        {/* Arc tick marks from -45° to +45° */}
        {[-45, -30, -20, -10, 0, 10, 20, 30, 45].map((deg) => {
          const rad = (deg * Math.PI) / 180;
          const rArc = 30;
          const x1 = cx + rArc * Math.sin(rad);
          const y1 = cy - radius + 4 + rArc * (1 - Math.cos(rad));
          const tickLen = deg % 10 === 0 ? 3 : 2;
          const x2 = cx + (rArc - tickLen) * Math.sin(rad);
          const y2 = cy - radius + 4 + (rArc - tickLen) * (1 - Math.cos(rad));

          return (
            <g key={deg}>
              <line
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke="#aaa"
                strokeWidth="0.8"
              />
              {deg % 10 === 0 && deg !== 0 && (
                <text
                  x={x2 - (rArc - 5) * Math.sin(rad) * 0.1}
                  y={y2 - 2}
                  textAnchor="middle"
                  fill="#aaa"
                  fontSize="2.8"
                  fontFamily="monospace"
                >
                  {Math.abs(deg)}°
                </text>
              )}
            </g>
          );
        })}

        {/* Zero tick longer */}
        <line
          x1={cx}
          y1={cy - radius + 4}
          x2={cx}
          y2={cy - radius + 8}
          stroke="#4CAF50"
          strokeWidth="1.5"
        />
      </g>

      {/* ===== ROLL INDICATOR TRIANGLE ===== */}
      <g
        transform={`rotate(${roll}, ${cx}, ${cy - radius + 2})`}
      >
        <polygon
          points={`${cx - 3.5},${cy - radius + 0} ${cx + 3.5},${cy - radius + 0} ${cx},${cy - radius - 5}`}
          fill={Math.abs(roll) > 10 ? '#FF5722' : '#4CAF50'}
          stroke="#fff"
          strokeWidth="0.3"
        />
      </g>

      {/* ===== HEADING SCALE (bottom) ===== */}
      {isLarge && (
        <g>
          {/* Heading arc background */}
          <path
            d={`M ${cx - 28} ${cy + radius - 4} A 26 26 0 0 0 ${cx + 28} ${cy + radius - 4}`}
            fill="none"
            stroke="#555"
            strokeWidth="1"
          />
          {/* Show a few headings around current heading */}
          {(() => {
            const elements = [];
            // Show heading marks from -45° to +45° of current heading
            for (let offset = -45; offset <= 45; offset += 5) {
              const hdg = ((heading + offset) % 360 + 360) % 360;
              const rad = ((offset) * Math.PI) / 180;
              const rHdg = 26;
              const x1 = cx + rHdg * Math.sin(rad);
              const y1 = cy + radius - 4 - rHdg * (1 - Math.cos(rad));

              const isMajor = hdg % 45 === 0;
              const tickLen = isMajor ? 3 : 1.5;
              const x2 = cx + (rHdg + tickLen) * Math.sin(rad);
              const y2 = cy + radius - 4 - (rHdg + tickLen) * (1 - Math.cos(rad));

              elements.push(
                <line
                  key={offset}
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke={isMajor ? '#ccc' : '#666'}
                  strokeWidth="0.8"
                />
              );

              if (isMajor) {
                const idx = headings.indexOf(hdg);
                const label = idx >= 0 ? headingLabels[idx] : hdg.toString();
                elements.push(
                  <text
                    key={`lbl-${offset}`}
                    x={x2}
                    y={y1 - 2}
                    textAnchor="middle"
                    fill="#ccc"
                    fontSize="3"
                    fontFamily="monospace"
                    fontWeight="bold"
                  >
                    {label}
                  </text>
                );
              }
            }
            return elements;
          })()}

          {/* Current heading pointer */}
          <polygon
            points={`${cx - 3},${cy + radius - 4} ${cx + 3},${cy + radius - 4} ${cx},${cy + radius - 1}`}
            fill="#FF5722"
          />
        </g>
      )}

      {/* ===== AIRSPEED TAPE (left) ===== */}
      {isLarge && (
        <g>
          {/* Tape background */}
          <rect x="2" y="18" width="7" height="50" rx="2" fill="#0d1117" stroke="#444" strokeWidth="0.5" />
          {/* Airspeed label */}
          <text
            x="5.5"
            y="16"
            textAnchor="middle"
            fill="#8b949e"
            fontSize="2.5"
            fontFamily="monospace"
          >
            SPD
          </text>
          {/* Speed value */}
          <text
            x="5.5"
            y="76"
            textAnchor="middle"
            fill="#4FC3F7"
            fontSize="3.5"
            fontFamily="monospace"
            fontWeight="bold"
          >
            {Math.round(airspeed)}
          </text>
          {/* Unit */}
          <text
            x="5.5"
            y="80"
            textAnchor="middle"
            fill="#8b949e"
            fontSize="2"
            fontFamily="monospace"
          >
            m/s
          </text>
        </g>
      )}

      {/* ===== ALTITUDE TAPE (right) ===== */}
      {isLarge && (
        <g>
          {/* Tape background */}
          <rect x="91" y="18" width="7" height="50" rx="2" fill="#0d1117" stroke="#444" strokeWidth="0.5" />
          {/* Alt label */}
          <text
            x="94.5"
            y="16"
            textAnchor="middle"
            fill="#8b949e"
            fontSize="2.5"
            fontFamily="monospace"
          >
            ALT
          </text>
          {/* Alt value */}
          <text
            x="94.5"
            y="76"
            textAnchor="middle"
            fill="#4CAF50"
            fontSize="3.5"
            fontFamily="monospace"
            fontWeight="bold"
          >
            {Math.round(altitude)}
          </text>
          {/* Unit */}
          <text
            x="94.5"
            y="80"
            textAnchor="middle"
            fill="#8b949e"
            fontSize="2"
            fontFamily="monospace"
          >
            m
          </text>
        </g>
      )}

      {/* ===== ARM / DISARM STATUS ===== */}
      {isLarge && (
        <g>
          <rect
            x="8"
            y="6"
            width="18"
            height="6"
            rx="2"
            fill={armed ? '#1b3a1b' : '#3a1b1b'}
            stroke={armed ? '#4CAF50' : '#F44336'}
            strokeWidth="0.5"
          />
          <text
            x="17"
            y="10.5"
            textAnchor="middle"
            fill={armed ? '#4CAF50' : '#F44336'}
            fontSize="3.5"
            fontFamily="monospace"
            fontWeight="bold"
          >
            {armed ? 'ARMED' : 'DISARM'}
          </text>
        </g>
      )}

      {/* ===== MODE DISPLAY ===== */}
      {isLarge && (
        <g>
          <rect
            x="74"
            y="6"
            width="18"
            height="6"
            rx="2"
            fill="#1a2a3a"
            stroke="#58a6ff"
            strokeWidth="0.5"
          />
          <text
            x="83"
            y="10.5"
            textAnchor="middle"
            fill="#58a6ff"
            fontSize="3.5"
            fontFamily="monospace"
            fontWeight="bold"
          >
            {mode.toUpperCase()}
          </text>
        </g>
      )}

      {/* ===== HEADING TEXT AT BOTTOM ===== */}
      {isLarge && (
        <text
          x={cx}
          y={radius + 12}
          textAnchor="middle"
          fill="#8b949e"
          fontSize="3"
          fontFamily="monospace"
        >
          HDG: {Math.round(heading)}°
        </text>
      )}

      {/* ===== PITCH / ROLL TEXT (small mode) ===== */}
      {!isLarge && (
        <>
          <text
            x={cx}
            y={10}
            textAnchor="middle"
            fill="#8b949e"
            fontSize="3.5"
            fontFamily="monospace"
          >
            P:{pitch}° R:{roll}°
          </text>
          <text
            x={cx}
            y={14}
            textAnchor="middle"
            fill={armed ? '#4CAF50' : '#F44336'}
            fontSize="3"
            fontFamily="monospace"
            fontWeight="bold"
          >
            {armed ? 'ARMED' : 'DISARM'} | {mode.toUpperCase()}
          </text>
        </>
      )}
    </svg>
  );
}

export default ArtificialHorizon;

