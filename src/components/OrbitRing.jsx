'use client';
import { useEffect, useRef } from 'react';

export default function OrbitRing() {
  const ringRef = useRef(null);

  useEffect(() => {
    // Continuous rotation via CSS animation (no JS overhead)
  }, []);

  const words = ['STRATEGY', 'DESIGN', 'BUILD', 'SHIP', 'GROW', 'DOMINATE'];
  const totalChars = words.join(' • ').length + (words.length * 3); // including separators

  // Build circular text
  const textContent = words.map(w => w + ' • ').join('');
  const chars = textContent.split('');
  const angleStep = 360 / chars.length;

  return (
    <div className="orbit-ring" ref={ringRef} aria-hidden="true">
      {/* Outer rotating text ring */}
      <div className="orbit-text-ring">
        {chars.map((char, i) => (
          <span
            key={i}
            className="orbit-char"
            style={{
              transform: `rotate(${i * angleStep}deg) translateY(-200px)`,
              fontSize: '13px',
            }}
          >
            {char}
          </span>
        ))}
      </div>

      {/* Inner static element */}
      <div className="orbit-center">
        <span className="orbit-center-text ranchers">TBF</span>
      </div>

      {/* Decorative geometric elements */}
      <div className="orbit-square orbit-sq-1"></div>
      <div className="orbit-square orbit-sq-2"></div>
      <div className="orbit-dot orbit-dot-1"></div>
      <div className="orbit-dot orbit-dot-2"></div>
      <div className="orbit-dot orbit-dot-3"></div>
    </div>
  );
}
