'use client';
import { Suspense, useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import DesignGalleryClient from '@/components/DesignGalleryClient';
import DesignQuiz from '@/components/DesignQuiz';

function DesignsContent() {
  const searchParams = useSearchParams();
  const skipQuiz = searchParams.get('skip') === 'true';

  const [quizAnswers, setQuizAnswers] = useState(null);
  const [showQuiz, setShowQuiz] = useState(!skipQuiz);

  useEffect(() => {
    if (skipQuiz) setShowQuiz(false);
  }, [skipQuiz]);

  const handleQuizComplete = useCallback((answers) => {
    setQuizAnswers(answers);
    setShowQuiz(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleSkip = useCallback(() => {
    setShowQuiz(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // ─── Quiz Phase ─────────────────────────────────────────────
  if (showQuiz) {
    return <DesignQuiz onComplete={handleQuizComplete} onSkip={handleSkip} />;
  }

  // ─── Gallery Phase ──────────────────────────────────────────
  return (
    <>
      <section className="pagehead">
        <div className="wrap">
          <span className="label pagehead__label">Design library</span>
          <h1 className="display pagehead__title">
            Twelve systems.
            <br />
            One of them is yours.
          </h1>
          <p className="lede pagehead__lede">
            {quizAnswers
              ? 'Sorted against your answers — closest fit first. Every one of these is a complete, working system, not a mood board.'
              : 'Each of these is a complete, working design system: real type pairings, real palettes, real code. We start from whichever genuinely fits and tailor it to you.'}
          </p>
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <header className="sec-head">
            <h2 className="h2">{quizAnswers ? 'Your closest matches' : 'Browse the library'}</h2>
            <span className="label sec-head__index">12 systems</span>
          </header>
          <DesignGalleryClient quizAnswers={quizAnswers} />
        </div>
      </section>
    </>
  );
}

export default function DesignsPage() {
  return (
    <Suspense fallback={null}>
      <DesignsContent />
    </Suspense>
  );
}
