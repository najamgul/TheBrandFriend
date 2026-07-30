'use client';

import { useEffect, useRef } from 'react';
import { useSkin } from './SkinProvider';

/* ── Shaders ───────────────────────────────────────────────────────────
   A single full-screen quad. Domain-warped fractal noise drifting slowly
   between the skin's background and its accent, with a ripple that follows
   the cursor, a vignette, and grain. No geometry, no textures, no lights —
   the whole thing is one fragment shader, which is why it stays cheap.    */

const VERT = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position, 1.0);
  }
`;

const FRAG = `
  precision highp float;

  uniform float uTime;
  uniform vec2  uRes;
  uniform vec2  uMouse;     // pointer in 0..1, already smoothed on the CPU
  uniform float uMouseAmp;  // fades the ripple in on first movement
  uniform vec3  uBg;
  uniform vec3  uAccent;
  uniform float uReveal;    // 0..1 intro wipe

  varying vec2 vUv;

  vec2 hash2(vec2 p) {
    p = vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)));
    return -1.0 + 2.0 * fract(sin(p) * 43758.5453123);
  }

  // Simplex-ish gradient noise — cheaper than a texture lookup and tiles well.
  float noise(vec2 p) {
    const float K1 = 0.366025404;
    const float K2 = 0.211324865;
    vec2 i = floor(p + (p.x + p.y) * K1);
    vec2 a = p - i + (i.x + i.y) * K2;
    float m = step(a.y, a.x);
    vec2 o = vec2(m, 1.0 - m);
    vec2 b = a - o + K2;
    vec2 c = a - 1.0 + 2.0 * K2;
    vec3 h = max(0.5 - vec3(dot(a, a), dot(b, b), dot(c, c)), 0.0);
    vec3 n = h * h * h * h * vec3(dot(a, hash2(i)), dot(b, hash2(i + o)), dot(c, hash2(i + 1.0)));
    return dot(n, vec3(70.0));
  }

  float fbm(vec2 p) {
    float v = 0.0;
    float a = 0.5;
    for (int i = 0; i < 5; i++) {
      v += a * noise(p);
      p *= 2.02;
      a *= 0.5;
    }
    return v;
  }

  void main() {
    float m = min(uRes.x, uRes.y);
    vec2 st = (gl_FragCoord.xy - 0.5 * uRes) / m;

    float t = uTime * 0.055;

    // Two rounds of domain warping. This is what makes it read as flowing
    // material rather than as scrolling noise.
    vec2 q = vec2(fbm(st * 1.5 + t), fbm(st * 1.5 + vec2(5.2, 1.3) - t));
    vec2 r = vec2(
      fbm(st * 1.5 + 3.0 * q + vec2(1.7, 9.2) + 0.15 * t),
      fbm(st * 1.5 + 3.0 * q + vec2(8.3, 2.8) - 0.13 * t)
    );
    float f = fbm(st * 1.5 + 2.4 * r);

    vec2 mouse = (uMouse - 0.5) * vec2(uRes.x / m, uRes.y / m);
    float d = length(st - mouse);
    float ripple = uMouseAmp * exp(-d * 2.4) * (0.5 + 0.5 * sin(d * 13.0 - uTime * 1.9));

    float v = smoothstep(-0.18, 0.78, f + ripple * 0.45);

    vec3 col = mix(uBg, uAccent, pow(v, 2.3) * 0.9);
    col = mix(col, uAccent, clamp(ripple, 0.0, 1.0) * 0.3);

    float vig = smoothstep(1.3, 0.2, length(st));
    col *= mix(0.5, 1.0, vig);

    float g = fract(sin(dot(gl_FragCoord.xy + uTime, vec2(12.9898, 78.233))) * 43758.5453);
    col += (g - 0.5) * 0.04;

    col = mix(uBg, col, uReveal);

    gl_FragColor = vec4(col, 1.0);
  }
`;

/* ── Helpers ───────────────────────────────────────────────────────────── */

/** Parse a CSS colour into normalised rgb. Avoids THREE.Color, whose colour
 *  management would convert sRGB to linear and darken everything. */
function parseColor(css, fallback = [0, 0, 0]) {
  if (!css) return fallback;
  const s = css.trim();

  if (s[0] === '#') {
    const h = s.slice(1);
    const full = h.length === 3 ? h.split('').map(c => c + c).join('') : h;
    if (full.length < 6) return fallback;
    return [0, 2, 4].map(i => parseInt(full.slice(i, i + 2), 16) / 255);
  }

  const nums = s.match(/-?\d*\.?\d+/g);
  if (nums && nums.length >= 3) return nums.slice(0, 3).map(n => Math.min(1, parseFloat(n) / 255));
  return fallback;
}

/** Weak devices get the CSS fallback instead of a shader they'd struggle with. */
function canRunShader() {
  if (typeof window === 'undefined') return false;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return false;
  if (navigator.hardwareConcurrency && navigator.hardwareConcurrency < 4) return false;
  if (navigator.deviceMemory && navigator.deviceMemory < 4) return false;

  try {
    const c = document.createElement('canvas');
    return Boolean(c.getContext('webgl2') || c.getContext('webgl'));
  } catch {
    return false;
  }
}

/* ── Component ─────────────────────────────────────────────────────────── */

export default function HeroCanvas() {
  const hostRef = useRef(null);
  const apiRef = useRef(null);
  const { skinId } = useSkin();

  useEffect(() => {
    const host = hostRef.current;
    if (!host || !canRunShader()) return;

    let disposed = false;
    let cleanup = () => {};

    // three is ~600KB. Loading it here keeps it out of the initial bundle and
    // off the critical path entirely — the hero text is already painted.
    import('three').then(THREE => {
      if (disposed) return;

      const renderer = new THREE.WebGLRenderer({
        antialias: false,
        alpha: false,
        powerPreference: 'high-performance',
      });

      // The field is soft by nature, so rendering under-resolution and letting
      // the browser upscale is free quality: nobody can see the difference and
      // it roughly halves the fragment work.
      const coarse = window.matchMedia('(pointer: coarse)').matches;
      const scale = coarse ? 0.5 : 0.7;
      renderer.setPixelRatio(1);

      host.appendChild(renderer.domElement);
      Object.assign(renderer.domElement.style, {
        width: '100%', height: '100%', display: 'block',
      });

      const scene = new THREE.Scene();
      const camera = new THREE.Camera();

      const read = name => getComputedStyle(document.documentElement).getPropertyValue(name);
      const bg0 = parseColor(read('--bg'), [0.04, 0.04, 0.05]);
      const ac0 = parseColor(read('--accent'), [1, 0.3, 0.18]);

      const uniforms = {
        uTime:     { value: 0 },
        uRes:      { value: new THREE.Vector2(1, 1) },
        uMouse:    { value: new THREE.Vector2(0.5, 0.5) },
        uMouseAmp: { value: 0 },
        uBg:       { value: new THREE.Vector3(...bg0) },
        uAccent:   { value: new THREE.Vector3(...ac0) },
        uReveal:   { value: 0 },
      };

      const mesh = new THREE.Mesh(
        new THREE.PlaneGeometry(2, 2),
        new THREE.ShaderMaterial({ vertexShader: VERT, fragmentShader: FRAG, uniforms, depthTest: false }),
      );
      mesh.frustumCulled = false;
      scene.add(mesh);

      const target = { bg: [...bg0], accent: [...ac0] };
      const pointer = { x: 0.5, y: 0.5 };

      function resize() {
        const { clientWidth: w, clientHeight: h } = host;
        if (!w || !h) return;
        renderer.setSize(Math.round(w * scale), Math.round(h * scale), false);
        uniforms.uRes.value.set(Math.round(w * scale), Math.round(h * scale));
      }
      resize();

      const ro = new ResizeObserver(resize);
      ro.observe(host);

      function onMove(e) {
        const r = host.getBoundingClientRect();
        pointer.x = (e.clientX - r.left) / r.width;
        pointer.y = 1 - (e.clientY - r.top) / r.height;
      }
      window.addEventListener('pointermove', onMove, { passive: true });

      // Only run while actually on screen and in a foreground tab.
      let onScreen = true;
      const io = new IntersectionObserver(([e]) => { onScreen = e.isIntersecting; }, { threshold: 0 });
      io.observe(host);

      let raf = 0;
      let last = performance.now();
      const start = last;

      function frame(now) {
        raf = requestAnimationFrame(frame);
        const dt = Math.min((now - last) / 1000, 0.05);
        last = now;

        if (!onScreen || document.hidden) return;

        uniforms.uTime.value = (now - start) / 1000;
        uniforms.uReveal.value = Math.min(1, uniforms.uReveal.value + dt / 1.2);

        // Ease the pointer so the ripple trails rather than snapping.
        const mv = uniforms.uMouse.value;
        mv.x += (pointer.x - mv.x) * Math.min(1, dt * 4);
        mv.y += (pointer.y - mv.y) * Math.min(1, dt * 4);
        uniforms.uMouseAmp.value += (0.55 - uniforms.uMouseAmp.value) * Math.min(1, dt * 1.5);

        // Cross-fade to the new palette when the skin changes.
        const lerp = (u, t) => {
          u.x += (t[0] - u.x) * Math.min(1, dt * 3);
          u.y += (t[1] - u.y) * Math.min(1, dt * 3);
          u.z += (t[2] - u.z) * Math.min(1, dt * 3);
        };
        lerp(uniforms.uBg.value, target.bg);
        lerp(uniforms.uAccent.value, target.accent);

        renderer.render(scene, camera);
      }
      raf = requestAnimationFrame(frame);

      apiRef.current = {
        retarget() {
          const cs = getComputedStyle(document.documentElement);
          target.bg = parseColor(cs.getPropertyValue('--bg'), target.bg);
          target.accent = parseColor(cs.getPropertyValue('--accent'), target.accent);
        },
      };

      cleanup = () => {
        cancelAnimationFrame(raf);
        ro.disconnect();
        io.disconnect();
        window.removeEventListener('pointermove', onMove);
        mesh.geometry.dispose();
        mesh.material.dispose();
        renderer.dispose();
        renderer.domElement.remove();
        apiRef.current = null;
      };
    }).catch(() => {
      // three failed to load — the CSS fallback underneath is already visible.
    });

    return () => { disposed = true; cleanup(); };
  }, []);

  // Repoint the shader at the new palette whenever the skin changes.
  useEffect(() => { apiRef.current?.retarget(); }, [skinId]);

  return <div className="herocanvas" ref={hostRef} aria-hidden="true" />;
}
