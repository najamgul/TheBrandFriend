'use client';
import { Suspense, useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import CreattieEmbed from '@/components/CreattieEmbed';
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
  const heroSticker = quizAnswers ? '🎯 YOUR TOP PICKS' : '🎨 PICK YOUR VIBE';
  const heroSubtext = quizAnswers
    ? 'Designs sorted by your preferences. Best matches first.'
    : '12 handcrafted design styles. Find the one that speaks to your brand. Click \u201cI Want This\u201d and we\u2019ll build it \u2014 in 3 days.';

  return (
    <>
      <section className="hero" style={{ minHeight: 'auto' }}>
        <div className="hero-layout">
          <div className="hero-inner">
            <div className="sticker sticker-hero" style={{ '--rot': '-2deg' }}>
              <span className="mono">{heroSticker}</span>
            </div>
            <h1 className="hero-headline">DESIGN<br /><span className="volt">LIBRARY</span></h1>
            <p className="hero-sub">
              <em>{heroSubtext}</em>
            </p>
          </div>
          <div className="hero-anim">
            <CreattieEmbed src="https://ik.imagekit.io/creattie/main/saved_colors/145118/fOmq6VjhbpevoY1i.json" />
          </div>
        </div>
      </section>

      <section className="section section-dark">
        <div className="section-header">
          <span className="mono tag tag-volt">
            {quizAnswers ? 'PERSONALIZED FOR YOU' : 'BROWSE STYLES'}
          </span>
          <h2 className="section-title ranchers">
            {quizAnswers ? 'YOUR BEST MATCHES' : 'CHOOSE YOUR WEAPON'}
          </h2>
        </div>
        <DesignGalleryClient quizAnswers={quizAnswers} />
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
