'use client';
import { useState, useCallback } from 'react';
import './DesignQuiz.css';

// ─── Quiz Data ────────────────────────────────────────────────
const STEPS = [
  {
    id: 'industry',
    num: '01',
    question: "WHAT'S YOUR BUSINESS?",
    options: [
      { value: 'tech',      icon: '💻', label: 'Tech / SaaS' },
      { value: 'fashion',   icon: '👗', label: 'Fashion / Luxury' },
      { value: 'creative',  icon: '🎨', label: 'Creative / Agency' },
      { value: 'medical',   icon: '🏥', label: 'Medical / Wellness' },
      { value: 'travel',    icon: '✈️', label: 'Travel / Hospitality' },
      { value: 'ecommerce', icon: '🛍️', label: 'E-commerce / Retail' },
      { value: 'other',     icon: '🚀', label: 'Other' },
    ],
  },
  {
    id: 'vibe',
    num: '02',
    question: 'PICK A VIBE',
    options: [
      { value: 'bold',      icon: '⚡', label: 'Bold & Loud' },
      { value: 'clean',     icon: '✨', label: 'Clean & Minimal' },
      { value: 'dark',      icon: '🌑', label: 'Dark & Cinematic' },
      { value: 'warm',      icon: '🕯️', label: 'Warm & Editorial' },
      { value: 'playful',   icon: '🎯', label: 'Playful & Colorful' },
    ],
  },
  {
    id: 'priority',
    num: '03',
    question: 'WHAT MATTERS MOST?',
    options: [
      { value: 'standout',  icon: '🔥', label: 'Stand Out' },
      { value: 'trust',     icon: '🤝', label: 'Build Trust' },
      { value: 'convert',   icon: '📈', label: 'Convert Visitors' },
      { value: 'showcase',  icon: '🖼️', label: 'Showcase Work' },
    ],
  },
];

/**
 * DesignQuiz — 3-step preference quiz.
 * @param {{ onComplete: (answers: object) => void, onSkip: () => void }} props
 */
export default function DesignQuiz({ onComplete, onSkip }) {
  const [stepIdx, setStepIdx] = useState(0);
  const [answers, setAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);

  const step = STEPS[stepIdx];
  const totalSteps = STEPS.length;
  const currentAnswer = answers[step?.id] || null;

  const selectOption = useCallback((value) => {
    setAnswers(prev => ({ ...prev, [step.id]: value }));
  }, [step]);

  const nextStep = useCallback(() => {
    if (stepIdx < totalSteps - 1) {
      setStepIdx(prev => prev + 1);
    } else {
      // Quiz complete — show results splash briefly
      setShowResults(true);
      setTimeout(() => {
        onComplete(answers);
      }, 1200);
    }
  }, [stepIdx, totalSteps, answers, onComplete]);

  // ─── Results Splash ─────────────────────────────────────────
  if (showResults) {
    return (
      <div className="dq-container">
        <div className="dq-results">
          <div className="dq-results-icon">🎯</div>
          <div className="dq-results-title">PERFECT MATCH FOUND</div>
          <div className="dq-results-sub">Curating your personalized gallery...</div>
        </div>
      </div>
    );
  }

  // ─── Quiz Steps ─────────────────────────────────────────────
  return (
    <div className="dq-container">
      {/* Progress Dots */}
      <div className="dq-progress">
        {STEPS.map((s, i) => (
          <span key={s.id}>
            <span
              className={`dq-progress-dot${i === stepIdx ? ' active' : ''}${i < stepIdx ? ' done' : ''}`}
            />
            {i < totalSteps - 1 && <span className="dq-progress-line" />}
          </span>
        ))}
      </div>

      {/* Step Content */}
      <div className="dq-step" key={step.id}>
        <div className="dq-step-num">STEP {step.num} OF {String(totalSteps).padStart(2, '0')}</div>
        <h2 className="dq-question ranchers">{step.question}</h2>

        <div className="dq-options">
          {step.options.map(opt => (
            <button
              key={opt.value}
              className={`dq-option${currentAnswer === opt.value ? ' selected' : ''}`}
              onClick={() => selectOption(opt.value)}
              type="button"
            >
              <span className="dq-option-icon">{opt.icon}</span>
              {opt.label}
            </button>
          ))}
        </div>

        <div className="dq-nav">
          <button
            className="dq-btn-next"
            onClick={nextStep}
            disabled={!currentAnswer}
            type="button"
          >
            {stepIdx < totalSteps - 1 ? 'NEXT →' : 'SHOW MY MATCHES'}
          </button>
        </div>
        <button className="dq-skip" onClick={onSkip} type="button">
          Skip, show me everything →
        </button>
      </div>
    </div>
  );
}
