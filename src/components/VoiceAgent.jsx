'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import './VoiceAgent.css';

// ─── Config ─────────────────────────────────────────────────
const AGENT_ID = 'tbf-maya-design-consultant';
const WS_BASE  = 'wss://stellar-viking.fly.dev';
const IDLE_DELAY_MS = 40_000; // 40 seconds
const VIZ_BAR_COUNT = 24;

export default function VoiceAgent() {
  // Widget states: 'idle' | 'ringing' | 'connecting' | 'active' | 'dismissed'
  const [phase, setPhase] = useState('idle');
  const [transcript, setTranscript] = useState([]);
  const [callTime, setCallTime] = useState(0);
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Refs for audio/ws resources (not state to avoid re-renders)
  const wsRef         = useRef(null);
  const micStreamRef  = useRef(null);
  const micCtxRef     = useRef(null);
  const playbackCtxRef = useRef(null);
  const nextPlayRef   = useRef(0);
  const timerRef      = useRef(null);
  const vizBarsRef    = useRef(null);
  const speakTimeoutRef = useRef(null);

  // ─── 40-second idle trigger ───────────────────────────────
  useEffect(() => {
    // Don't re-trigger if already dismissed or shown this session
    if (typeof window === 'undefined') return;
    if (sessionStorage.getItem('va_shown')) {
      setPhase('dismissed');
      return;
    }

    const timer = setTimeout(() => {
      setPhase('ringing');
      sessionStorage.setItem('va_shown', '1');
    }, IDLE_DELAY_MS);

    return () => clearTimeout(timer);
  }, []);

  // ─── Call timer ───────────────────────────────────────────
  useEffect(() => {
    if (phase === 'active') {
      timerRef.current = setInterval(() => {
        setCallTime(t => t + 1);
      }, 1000);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [phase]);

  // ─── Cleanup on unmount ───────────────────────────────────
  useEffect(() => {
    return () => teardown();
  }, []);

  // ─── Teardown helper ──────────────────────────────────────
  const teardown = useCallback(() => {
    if (wsRef.current) { wsRef.current.close(); wsRef.current = null; }
    if (micCtxRef.current) { micCtxRef.current.close(); micCtxRef.current = null; }
    if (playbackCtxRef.current) { playbackCtxRef.current.close(); playbackCtxRef.current = null; }
    if (micStreamRef.current) { micStreamRef.current.getTracks().forEach(t => t.stop()); micStreamRef.current = null; }
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
  }, []);

  // ─── Add transcript line ──────────────────────────────────
  const addLine = useCallback((role, text) => {
    setTranscript(prev => [...prev.slice(-30), { role, text }]);
  }, []);

  // ─── Accept Call ──────────────────────────────────────────
  const acceptCall = useCallback(async () => {
    setPhase('connecting');
    addLine('system', 'Connecting...');

    // Initialize playback context
    playbackCtxRef.current = new (window.AudioContext || window.webkitAudioContext)({ sampleRate: 24000 });
    nextPlayRef.current = playbackCtxRef.current.currentTime;

    // Open WebSocket to Stellar Viking
    const wsUrl = `${WS_BASE}/test-call?agentId=${AGENT_ID}`;
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = async () => {
      setPhase('active');
      addLine('system', 'Connected — speak into your microphone');
      await startMicrophone();
    };

    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        if (msg.type === 'audio') {
          queueAudioPlayback(msg.data);
          setIsSpeaking(true);
          // Reset speaking indicator after a gap
          clearTimeout(speakTimeoutRef.current);
          speakTimeoutRef.current = setTimeout(() => setIsSpeaking(false), 600);
        } else if (msg.type === 'transcript') {
          addLine(msg.role, msg.text);
          if (msg.role === 'agent') {
            // agent finished its turn — short delay then stop speaking indicator
            clearTimeout(speakTimeoutRef.current);
            speakTimeoutRef.current = setTimeout(() => setIsSpeaking(false), 800);
          }
        } else if (msg.type === 'error') {
          addLine('system', `Error: ${msg.message}`);
        }
      } catch { /* ignore parse errors */ }
    };

    ws.onerror = () => addLine('system', 'Connection error');
    ws.onclose = () => {
      addLine('system', 'Call ended');
      setPhase('dismissed');
      teardown();
    };
  }, [addLine, teardown]);

  // ─── Start Microphone ─────────────────────────────────────
  const startMicrophone = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { sampleRate: 16000, channelCount: 1, echoCancellation: true, noiseSuppression: true }
      });
      micStreamRef.current = stream;
      const ctx = new AudioContext({ sampleRate: 16000 });
      micCtxRef.current = ctx;

      const source = ctx.createMediaStreamSource(stream);
      const processor = ctx.createScriptProcessor(2048, 1, 1);
      source.connect(processor);
      processor.connect(ctx.destination);

      processor.onaudioprocess = (e) => {
        const ws = wsRef.current;
        if (!ws || ws.readyState !== WebSocket.OPEN) return;

        const f32 = e.inputBuffer.getChannelData(0);
        updateVisualizer(f32);

        // Simple VAD — skip silence
        let sumSq = 0;
        for (let i = 0; i < f32.length; i++) sumSq += f32[i] * f32[i];
        if (Math.sqrt(sumSq / f32.length) < 0.008) return;

        // Convert Float32 → PCM 16-bit LE → Base64
        const pcm16 = new Int16Array(f32.length);
        for (let i = 0; i < f32.length; i++) {
          pcm16[i] = Math.max(-32768, Math.min(32767, Math.round(f32[i] * 32767)));
        }
        const u8 = new Uint8Array(pcm16.buffer);
        let bin = '';
        for (let i = 0; i < u8.length; i++) bin += String.fromCharCode(u8[i]);
        ws.send(JSON.stringify({ type: 'audio', data: btoa(bin) }));
      };
    } catch (err) {
      addLine('system', 'Microphone access denied — please allow mic access and try again.');
    }
  };

  // ─── Audio Playback Queue ─────────────────────────────────
  const queueAudioPlayback = (base64Pcm24k) => {
    const pCtx = playbackCtxRef.current;
    if (!pCtx) return;

    const raw = atob(base64Pcm24k);
    const bytes = new Uint8Array(raw.length);
    for (let i = 0; i < raw.length; i++) bytes[i] = raw.charCodeAt(i);

    const pcm16 = new Int16Array(bytes.buffer);
    if (pcm16.length === 0) return;

    const f32 = new Float32Array(pcm16.length);
    for (let i = 0; i < pcm16.length; i++) f32[i] = pcm16[i] / 32768;

    const buffer = pCtx.createBuffer(1, f32.length, 24000);
    buffer.getChannelData(0).set(f32);

    const src = pCtx.createBufferSource();
    src.buffer = buffer;
    src.connect(pCtx.destination);

    const now = pCtx.currentTime;
    if (nextPlayRef.current < now) nextPlayRef.current = now;
    src.start(nextPlayRef.current);
    nextPlayRef.current += buffer.duration;
  };

  // ─── Visualizer ───────────────────────────────────────────
  const updateVisualizer = (samples) => {
    if (!vizBarsRef.current) return;
    const bars = vizBarsRef.current.children;
    const step = Math.floor(samples.length / bars.length);
    for (let i = 0; i < bars.length; i++) {
      let sum = 0;
      for (let j = 0; j < step; j++) sum += Math.abs(samples[i * step + j] || 0);
      const avg = sum / step;
      const h = Math.max(4, Math.min(40, avg * 280));
      bars[i].style.height = `${h}px`;
    }
  };

  // ─── Decline / End ────────────────────────────────────────
  const declineCall = useCallback(() => {
    setPhase('dismissed');
  }, []);

  const endCall = useCallback(() => {
    teardown();
    setPhase('dismissed');
  }, [teardown]);

  // ─── Format timer ─────────────────────────────────────────
  const fmt = (s) => {
    const m = String(Math.floor(s / 60)).padStart(2, '0');
    const ss = String(s % 60).padStart(2, '0');
    return `${m}:${ss}`;
  };

  // ─── Render nothing if idle or dismissed ──────────────────
  if (phase === 'idle' || phase === 'dismissed') return null;

  return (
    <>
      {/* Overlay */}
      <div className="va-overlay" onClick={phase === 'ringing' ? declineCall : undefined} />

      {/* Widget */}
      <div className="va-widget">
        <div className="va-card">

          {/* ─── RINGING STATE ─────────────────────────── */}
          {phase === 'ringing' && (
            <>
              <div className="va-ringing-header">
                <div className="va-incoming-label">INCOMING CALL</div>
                <div className="va-ring-animation">
                  <div className="va-ring-pulse" />
                  <div className="va-ring-pulse" />
                  <div className="va-ring-pulse" />
                  <div className="va-avatar">M</div>
                </div>
                <div className="va-caller-name">Maya</div>
                <div className="va-caller-role">Design Consultant · TheBrandFriend</div>
              </div>
              <div className="va-actions">
                <button className="va-btn va-btn-decline" onClick={declineCall}>
                  ✕ Decline
                </button>
                <button className="va-btn va-btn-accept" onClick={acceptCall}>
                  📞 Accept
                </button>
              </div>
            </>
          )}

          {/* ─── CONNECTING STATE ──────────────────────── */}
          {phase === 'connecting' && (
            <div className="va-mic-prompt">
              <div className="va-mic-icon">🎙️</div>
              <div className="va-mic-text">
                Connecting to Maya...<br />
                Please allow microphone access when prompted.
              </div>
            </div>
          )}

          {/* ─── ACTIVE CALL STATE ─────────────────────── */}
          {phase === 'active' && (
            <>
              <div className="va-active-header">
                <div className="va-active-avatar">M</div>
                <div className="va-active-info">
                  <div className="va-active-name">Maya</div>
                  <div className="va-active-status">
                    <div className={`va-status-dot${isSpeaking ? ' speaking' : ''}`} />
                    {isSpeaking ? 'Speaking...' : 'Listening'}
                  </div>
                </div>
                <div className="va-timer">{fmt(callTime)}</div>
              </div>

              {/* Visualizer */}
              <div className="va-visualizer" ref={vizBarsRef}>
                {Array.from({ length: VIZ_BAR_COUNT }, (_, i) => (
                  <div key={i} className="va-viz-bar" style={{ height: '4px' }} />
                ))}
              </div>

              {/* Transcript */}
              <div className="va-transcript">
                {transcript.map((line, i) => (
                  <div key={i} className="va-transcript-line">
                    <span className={`va-role va-role-${line.role}`}>{line.role}</span>
                    {line.text}
                  </div>
                ))}
              </div>

              {/* End Call */}
              <button className="va-btn-end" onClick={endCall}>
                📴 End Call
              </button>
            </>
          )}

        </div>
      </div>
    </>
  );
}
