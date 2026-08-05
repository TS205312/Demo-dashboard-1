/**
 * SAHLogo - Logo component chuyên nghiệp cho SAH-TECH Medical
 * SVG trong suốt, scale mượt, kết hợp icon drone + trái tim y tế
 */
export default function SAHLogo({ size = 64, variant = 'default' }) {
  const isLight = variant === 'light'; // dùng trên nền tối
  const ringColor = isLight ? '#fff' : '#2563EB';
  const accent = isLight ? '#fff' : '#2563EB';
  const accent2 = isLight ? '#93C5FD' : '#1D4ED8';
  const dot = isLight ? '#0B1120' : '#fff';

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 96 96"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ display: 'block' }}
    >
      <defs>
        <linearGradient id="sahLogoGrad" x1="0" y1="0" x2="96" y2="96" gradientUnits="userSpaceOnUse">
          <stop stopColor={accent} />
          <stop offset="1" stopColor={accent2} />
        </linearGradient>
      </defs>

      {/* Outer ring */}
      <circle cx="48" cy="48" r="44" stroke={`url(#sahLogoGrad)`} strokeWidth="4" fill="none" />

      {/* Inner soft disc */}
      <circle cx="48" cy="48" r="36" fill={`url(#sahLogoGrad)`} opacity="0.12" />

      {/* Drone body */}
      <g>
        {/* Fuselage */}
        <rect x="36" y="44" width="24" height="10" rx="5" fill={`url(#sahLogoGrad)`} />
        {/* Nose */}
        <path d="M60 49 L66 46 L66 52 Z" fill={accent} />
        {/* Tail */}
        <path d="M36 49 L30 46 L30 52 Z" fill={accent2} />

        {/* Left arm */}
        <line x1="36" y1="49" x2="22" y2="34" stroke={`url(#sahLogoGrad)`} strokeWidth="4" strokeLinecap="round" />
        {/* Right arm */}
        <line x1="60" y1="49" x2="74" y2="34" stroke={`url(#sahLogoGrad)`} strokeWidth="4" strokeLinecap="round" />

        {/* Rotors */}
        <g stroke={accent} strokeWidth="3.5" strokeLinecap="round">
          <line x1="16" y1="34" x2="28" y2="34" />
          <line x1="68" y1="34" x2="80" y2="34" />
        </g>
        {/* Rotor hubs */}
        <circle cx="22" cy="34" r="3" fill={accent} />
        <circle cx="74" cy="34" r="3" fill={accent} />

        {/* Landing skids */}
        <line x1="40" y1="54" x2="40" y2="62" stroke={accent2} strokeWidth="2.5" strokeLinecap="round" />
        <line x1="56" y1="54" x2="56" y2="62" stroke={accent2} strokeWidth="2.5" strokeLinecap="round" />
        <line x1="36" y1="62" x2="60" y2="62" stroke={accent2} strokeWidth="2.5" strokeLinecap="round" />
      </g>

      {/* Medical cross / heart on fuselage */}
      <g>
        <rect x="44" y="46" width="8" height="6" rx="1" fill={dot} />
        <rect x="46" y="44" width="4" height="10" rx="1" fill={dot} />
      </g>

      {/* Small pulse line (telemetry) */}
      <path
        d="M14 72 L30 72 L36 64 L44 78 L52 66 L58 72 L82 72"
        stroke={accent}
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
        opacity="0.85"
      />
    </svg>
  );
}
