import { useMemo } from 'react';

/**
 * BackgroundFX - Lớp nền animation toàn trang
 * - Aurora: các blob gradient lớn mờ, di chuyển/xoay chậm
 * - Hạt sáng: chấm nhỏ bay lơ lửng (vị trí/thời gian cố định)
 */
const PARTICLES = [
  { left: '6%', top: '18%', size: 4, dur: 14, delay: 0, hue: 'cyan' },
  { left: '14%', top: '68%', size: 3, dur: 17, delay: -3, hue: 'green' },
  { left: '22%', top: '34%', size: 5, dur: 12, delay: -6, hue: 'teal' },
  { left: '31%', top: '82%', size: 3, dur: 16, delay: -9, hue: 'cyan' },
  { left: '40%', top: '12%', size: 4, dur: 13, delay: -2, hue: 'green' },
  { left: '48%', top: '58%', size: 3, dur: 18, delay: -7, hue: 'teal' },
  { left: '56%', top: '26%', size: 5, dur: 15, delay: -4, hue: 'cyan' },
  { left: '64%', top: '76%', size: 3, dur: 12, delay: -8, hue: 'green' },
  { left: '72%', top: '16%', size: 4, dur: 16, delay: -1, hue: 'teal' },
  { left: '79%', top: '48%', size: 3, dur: 14, delay: -5, hue: 'cyan' },
  { left: '86%', top: '70%', size: 5, dur: 17, delay: -10, hue: 'green' },
  { left: '93%', top: '28%', size: 3, dur: 13, delay: -6, hue: 'teal' },
  { left: '9%', top: '90%', size: 4, dur: 15, delay: -11, hue: 'teal' },
  { left: '34%', top: '94%', size: 3, dur: 18, delay: -3, hue: 'cyan' },
  { left: '68%', top: '92%', size: 4, dur: 14, delay: -9, hue: 'green' },
  { left: '88%', top: '88%', size: 3, dur: 16, delay: -2, hue: 'teal' },
];

export default function BackgroundFX() {
  const particles = useMemo(
    () =>
      PARTICLES.map((p, i) => (
        <span
          key={i}
          className={`bgfx-particle bgfx-particle--${p.hue}`}
          style={{
            left: p.left,
            top: p.top,
            width: p.size,
            height: p.size,
            animationDuration: `${p.dur}s`,
            animationDelay: `${p.delay}s`,
          }}
        />
      )),
    []
  );

  return (
    <div className="bgfx" aria-hidden="true">
      <div className="bgfx-aurora bgfx-aurora--1" />
      <div className="bgfx-aurora bgfx-aurora--2" />
      <div className="bgfx-aurora bgfx-aurora--3" />
      {particles}
    </div>
  );
}
