/**
 * HeroDrone - SVG drone bay theo đường cong trong hero
 * - Cánh quạt xoay liên tục, đèn tín hiệu nhấp nháy
 * - Bay theo path bằng offset-path (CSS)
 * - Vệt bay nét đứt chạy bằng stroke-dashoffset
 */
export default function HeroDrone() {
  return (
    <div className="hero-drone" aria-hidden="true">
      {/* Vệt bay */}
      <svg className="hero-drone__trail" viewBox="0 0 1200 400" preserveAspectRatio="none">
        <path
          className="hero-drone__trail-path"
          d="M 1200 60 C 880 40, 760 150, 560 140 C 380 132, 300 80, 150 120"
          fill="none"
        />
      </svg>

      {/* Drone */}
      <div className="hero-drone__craft">
        <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="hdBody" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#0f766e" />
              <stop offset="1" stopColor="#0891b2" />
            </linearGradient>
          </defs>

          {/* Cánh tay drone */}
          <g stroke="rgba(255,255,255,0.55)" strokeWidth="5" strokeLinecap="round">
            <line x1="60" y1="60" x2="34" y2="38" />
            <line x1="60" y1="60" x2="86" y2="38" />
            <line x1="60" y1="60" x2="34" y2="82" />
            <line x1="60" y1="60" x2="86" y2="82" />
          </g>

          {/* Rotor 1 (trái trên) */}
          <g className="drone-rotor">
            <g stroke="#bae6fd" strokeWidth="3" strokeLinecap="round" opacity="0.9">
              <line x1="18" y1="38" x2="50" y2="38" />
              <line x1="34" y1="22" x2="34" y2="54" />
            </g>
          </g>
          <circle cx="34" cy="38" r="4" fill="#a5f3fc" />

          {/* Rotor 2 (phải trên) */}
          <g className="drone-rotor drone-rotor--reverse">
            <g stroke="#bae6fd" strokeWidth="3" strokeLinecap="round" opacity="0.9">
              <line x1="70" y1="38" x2="102" y2="38" />
              <line x1="86" y1="22" x2="86" y2="54" />
            </g>
          </g>
          <circle cx="86" cy="38" r="4" fill="#a5f3fc" />

          {/* Rotor 3 (trái dưới) */}
          <g className="drone-rotor">
            <g stroke="#bae6fd" strokeWidth="3" strokeLinecap="round" opacity="0.9">
              <line x1="18" y1="82" x2="50" y2="82" />
              <line x1="34" y1="66" x2="34" y2="98" />
            </g>
          </g>
          <circle cx="34" cy="82" r="4" fill="#a5f3fc" />

          {/* Rotor 4 (phải dưới) */}
          <g className="drone-rotor drone-rotor--reverse">
            <g stroke="#bae6fd" strokeWidth="3" strokeLinecap="round" opacity="0.9">
              <line x1="70" y1="82" x2="102" y2="82" />
              <line x1="86" y1="66" x2="86" y2="98" />
            </g>
          </g>
          <circle cx="86" cy="82" r="4" fill="#a5f3fc" />

          {/* Thân drone */}
          <rect x="42" y="46" width="36" height="28" rx="12" fill="url(#hdBody)" />
          {/* Đường kẻ thân */}
          <line x1="48" y1="56" x2="72" y2="56" stroke="rgba(255,255,255,0.35)" strokeWidth="2.5" strokeLinecap="round" />
          {/* Chữ thập y tế */}
          <g fill="#ffffff">
            <rect x="58" y="50" width="6" height="10" rx="1.5" />
            <rect x="56" y="52" width="10" height="6" rx="1.5" />
          </g>
          {/* Camera mũi */}
          <circle cx="60" cy="82" r="5" fill="#0b1f1e" stroke="#67e8f9" strokeWidth="2" />
          {/* Đèn tín hiệu */}
          <circle className="drone-light drone-light--red" cx="42" cy="46" r="2.6" fill="#f87171" />
          <circle className="drone-light drone-light--cyan" cx="78" cy="46" r="2.6" fill="#22d3ee" />
        </svg>
      </div>
    </div>
  );
}
