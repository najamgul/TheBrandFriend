'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import './VoiceAgent.css';

// ─── Config ─────────────────────────────────────────────────
const AGENT_ID = '76cf959a-5f50-4c37-83b7-49830659568d';
const WS_BASE  = 'wss://voice.tohundguide.com';
const IDLE_DELAY_MS = 20_000; // 20 seconds
const VIZ_BAR_COUNT = 18; // fewer bars for mobile

export default function VoiceAgent() {
  // Widget states: 'idle' | 'ringing' | 'connecting' | 'active' | 'dismissed'
  const [phase, setPhase] = useState('idle');
  const [transcript, setTranscript] = useState([]);
  const [callTime, setCallTime] = useState(0);
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Refs for audio/ws resources
  const wsRef          = useRef(null);
  const micStreamRef   = useRef(null);
  const micCtxRef      = useRef(null);
  const playbackCtxRef = useRef(null);
  const nextPlayRef    = useRef(0);
  const timerRef       = useRef(null);
  const vizBarsRef     = useRef(null);
  const speakTimeoutRef = useRef(null);
  const ringtoneRef    = useRef(null);
  const audioCtxRef    = useRef(null); // Shared AudioContext for ringtone unlock
  const retryListenersRef = useRef([]); // Track retry-play listeners for cleanup

  // ─── Idle trigger ─────────────────────────────────────────
  useEffect(() => {
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

  // ─── Unlock audio on first user interaction ───────────────
  // Mobile Safari / Chrome require an AudioContext to be resumed
  // inside a user gesture. We create one and resume it on first tap.
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;

    const ctx = new AudioContextClass();
    audioCtxRef.current = ctx;

    const unlock = () => {
      // Resume AudioContext if suspended (required on iOS/mobile)
      if (ctx.state === 'suspended') {
        ctx.resume().catch(() => {});
      }
      // Also pre-load ringtone into an Audio element during gesture
      if (!ringtoneRef.current) {
        const audio = new Audio('/ringtone.mp3');
        audio.loop = true;
        audio.volume = 0.7;
        audio.preload = 'auto';
        // iOS trick: load the audio element during a user gesture
        audio.load();
        ringtoneRef.current = audio;
      }
    };

    // Listen on multiple events (touch is critical for mobile)
    const events = ['touchstart', 'touchend', 'click', 'keydown', 'scroll'];
    events.forEach(e => document.addEventListener(e, unlock, { passive: true, capture: true }));

    return () => {
      events.forEach(e => document.removeEventListener(e, unlock, { capture: true }));
      if (ctx.state !== 'closed') ctx.close().catch(() => {});
    };
  }, []);

  // ─── Play / stop ringtone based on phase ──────────────────
  useEffect(() => {
    // Helper: remove any pending retry-play listeners
    const clearRetryListeners = () => {
      retryListenersRef.current.forEach(({ event, handler }) => {
        document.removeEventListener(event, handler);
      });
      retryListenersRef.current = [];
    };

    if (phase === 'ringing') {
      // If ringtone was pre-loaded during gesture, play it.
      // If not (no gesture happened yet), create it now as best-effort.
      if (!ringtoneRef.current) {
        const audio = new Audio('/ringtone.mp3');
        audio.loop = true;
        audio.volume = 0.7;
        ringtoneRef.current = audio;
      }
      const audio = ringtoneRef.current;
      audio.currentTime = 0;
      audio.volume = 0.7;

      // Use a promise chain — on mobile this may only work after gesture
      const playPromise = audio.play();
      if (playPromise) {
        playPromise.catch(() => {
          // Autoplay blocked — try again on next user interaction,
          // but ONLY if we're still in the 'ringing' phase.
          const retryPlay = () => {
            // Guard: if user already declined/accepted, do NOT play
            if (!ringtoneRef.current) return;
            ringtoneRef.current.play().catch(() => {});
          };
          const touchHandler = retryPlay;
          const clickHandler = retryPlay;
          document.addEventListener('touchstart', touchHandler, { once: true, passive: true });
          document.addEventListener('click', clickHandler, { once: true });
          // Track so we can remove them on cleanup
          retryListenersRef.current.push(
            { event: 'touchstart', handler: touchHandler },
            { event: 'click', handler: clickHandler }
          );
        });
      }
    } else {
      // Phase is NOT ringing — stop ringtone and remove any retry listeners
      clearRetryListeners();
      if (ringtoneRef.current) {
        ringtoneRef.current.pause();
        ringtoneRef.current.currentTime = 0;
      }
    }

    // Cleanup on phase change
    return () => clearRetryListeners();
  }, [phase]);

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
    if (micCtxRef.current) { micCtxRef.current.close().catch(() => {}); micCtxRef.current = null; }
    if (playbackCtxRef.current) { playbackCtxRef.current.close().catch(() => {}); playbackCtxRef.current = null; }
    if (micStreamRef.current) { micStreamRef.current.getTracks().forEach(t => t.stop()); micStreamRef.current = null; }
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
    if (ringtoneRef.current) { ringtoneRef.current.pause(); ringtoneRef.current = null; }
  }, []);

  // ─── Add transcript line ──────────────────────────────────
  const addLine = useCallback((role, text) => {
    setTranscript(prev => [...prev.slice(-30), { role, text }]);
  }, []);

  // ─── Accept Call ──────────────────────────────────────────
  const acceptCall = useCallback(async () => {
    setPhase('connecting');
    addLine('system', 'Connecting...');

    // Stop ringtone
    if (ringtoneRef.current) {
      ringtoneRef.current.pause();
      ringtoneRef.current.currentTime = 0;
    }

    // Initialize playback context — use device default sample rate then
    // resample during playback (more compatible with mobile)
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    playbackCtxRef.current = new AudioContextClass();
    // Resume if suspended (iOS requirement after user gesture)
    if (playbackCtxRef.current.state === 'suspended') {
      await playbackCtxRef.current.resume();
    }
    nextPlayRef.current = playbackCtxRef.current.currentTime;

    // Open WebSocket to Stellar Viking
    const wsUrl = `${WS_BASE}/test-call?agentId=${AGENT_ID}`;
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = async () => {
      setPhase('active');
      addLine('system', 'Connected — speak into your microphone');
      try {
        await startMicrophone();
      } catch (err) {
        addLine('system', `Mic error: ${err.message || 'Could not access microphone'}`);
      }
    };

    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        if (msg.type === 'audio') {
          queueAudioPlayback(msg.data);
          setIsSpeaking(true);
          clearTimeout(speakTimeoutRef.current);
          speakTimeoutRef.current = setTimeout(() => setIsSpeaking(false), 600);
        } else if (msg.type === 'transcript') {
          addLine(msg.role, msg.text);
          if (msg.role === 'agent') {
            clearTimeout(speakTimeoutRef.current);
            speakTimeoutRef.current = setTimeout(() => setIsSpeaking(false), 800);
          }
        } else if (msg.type === 'error') {
          addLine('system', `Error: ${msg.message}`);
        }
      } catch { /* ignore parse errors */ }
    };

    ws.onerror = (err) => {
      console.error('[VoiceAgent] WebSocket error:', err);
      addLine('system', 'Connection error — please try again');
    };
    ws.onclose = (e) => {
      if (e.code !== 1000) {
        addLine('system', `Disconnected (code ${e.code})`);
      }
      setPhase('dismissed');
      teardown();
    };
  }, [addLine, teardown]);

  // ─── Start Microphone ─────────────────────────────────────
  // Mobile browsers don't honor sampleRate constraints in getUserMedia.
  // We capture at the browser's native rate and downsample to 16kHz.
  const startMicrophone = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        }
      });
      micStreamRef.current = stream;

      // Create AudioContext at default rate (mobile-safe)
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      const ctx = new AudioContextClass();
      if (ctx.state === 'suspended') await ctx.resume();
      micCtxRef.current = ctx;

      const nativeRate = ctx.sampleRate; // typically 44100 or 48000 on mobile
      const targetRate = 16000;

      const source = ctx.createMediaStreamSource(stream);
      const processor = ctx.createScriptProcessor(4096, 1, 1);
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

        // Downsample from native rate → 16kHz
        const ratio = nativeRate / targetRate;
        const outLen = Math.floor(f32.length / ratio);
        const pcm16 = new Int16Array(outLen);
        for (let i = 0; i < outLen; i++) {
          const srcIdx = Math.floor(i * ratio);
          const sample = f32[Math.min(srcIdx, f32.length - 1)];
          pcm16[i] = Math.max(-32768, Math.min(32767, Math.round(sample * 32767)));
        }

        // Convert to Base64
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
  // Server sends PCM 24kHz. We decode and resample to the
  // AudioContext's native rate for correct playback on all devices.
  const queueAudioPlayback = (base64Pcm24k) => {
    const pCtx = playbackCtxRef.current;
    if (!pCtx || pCtx.state === 'closed') return;

    // Resume context if it got suspended (iOS can suspend anytime)
    if (pCtx.state === 'suspended') pCtx.resume().catch(() => {});

    const raw = atob(base64Pcm24k);
    const bytes = new Uint8Array(raw.length);
    for (let i = 0; i < raw.length; i++) bytes[i] = raw.charCodeAt(i);

    const pcm16 = new Int16Array(bytes.buffer);
    if (pcm16.length === 0) return;

    const srcRate = 24000;
    const dstRate = pCtx.sampleRate; // device native rate
    const ratio = dstRate / srcRate;
    const outLen = Math.round(pcm16.length * ratio);

    const buffer = pCtx.createBuffer(1, outLen, dstRate);
    const channelData = buffer.getChannelData(0);

    // Linear interpolation resample 24kHz → native rate
    for (let i = 0; i < outLen; i++) {
      const srcPos = i / ratio;
      const srcIdx = Math.floor(srcPos);
      const frac = srcPos - srcIdx;
      const s0 = srcIdx < pcm16.length ? pcm16[srcIdx] / 32768 : 0;
      const s1 = (srcIdx + 1) < pcm16.length ? pcm16[srcIdx + 1] / 32768 : s0;
      channelData[i] = s0 + frac * (s1 - s0);
    }

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
      const h = Math.max(4, Math.min(36, avg * 280));
      bars[i].style.height = `${h}px`;
    }
  };

  // ─── Decline / End ────────────────────────────────────────
  const declineCall = useCallback(() => {
    // Remove any pending retry-play listeners FIRST to prevent race condition
    retryListenersRef.current.forEach(({ event, handler }) => {
      document.removeEventListener(event, handler);
    });
    retryListenersRef.current = [];
    // Stop and destroy ringtone
    if (ringtoneRef.current) {
      ringtoneRef.current.pause();
      ringtoneRef.current.currentTime = 0;
      ringtoneRef.current = null;
    }
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
                  <div className="va-avatar">B</div>
                </div>
                <div className="va-caller-name">Brandi</div>
                <div className="va-caller-role">Customer Executive · TheBrandFriend</div>
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
                Connecting to Brandi...<br />
                Please allow microphone access when prompted.
              </div>
            </div>
          )}

          {/* ─── ACTIVE CALL STATE ─────────────────────── */}
          {phase === 'active' && (
            <>
              <div className="va-active-header">
                <div className="va-active-avatar">B</div>
                <div className="va-active-info">
                  <div className="va-active-name">Brandi</div>
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
