'use client';

export default function LaunchSequence() {
  return (
    <div className="launch-seq" aria-hidden="true">
      {/* Pulsing concentric squares */}
      <div className="launch-square launch-sq-1"></div>
      <div className="launch-square launch-sq-2"></div>
      <div className="launch-square launch-sq-3"></div>

      {/* Animated arrows shooting right */}
      <div className="launch-arrows">
        <div className="launch-arrow la-1">→</div>
        <div className="launch-arrow la-2">→</div>
        <div className="launch-arrow la-3">→</div>
      </div>

      {/* Center crosshair */}
      <div className="launch-crosshair">
        <div className="crosshair-h"></div>
        <div className="crosshair-v"></div>
        <div className="crosshair-dot"></div>
      </div>

      {/* Floating labels */}
      <div className="launch-label ll-1">LAUNCH</div>
      <div className="launch-label ll-2">SCALE</div>
      <div className="launch-label ll-3">DOMINATE</div>
    </div>
  );
}
