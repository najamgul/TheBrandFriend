'use client';
import { useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export default function Animations() {
  useEffect(() => {
    // Stagger service cards
    gsap.utils.toArray('.service-card').forEach((card, i) => {
      gsap.from(card, {
        scrollTrigger: { trigger: card, start: 'top 90%', once: true },
        y: 40, opacity: 0, duration: 0.5, delay: i * 0.08, ease: 'power2.out',
      });
    });

    // Process cards
    gsap.utils.toArray('.process-card').forEach((card, i) => {
      gsap.from(card, {
        scrollTrigger: { trigger: card, start: 'top 85%', once: true },
        y: 50, opacity: 0, duration: 0.6, delay: i * 0.15, ease: 'power2.out',
      });
    });

    // Sticker cards
    gsap.utils.toArray('.sticker-card').forEach((card, i) => {
      gsap.from(card, {
        scrollTrigger: { trigger: card, start: 'top 90%', once: true },
        y: 30, opacity: 0, rotation: [-5, 4, -3, 5][i % 4],
        duration: 0.5, delay: i * 0.1, ease: 'back.out(1.5)',
      });
    });

    // Compare rows
    gsap.utils.toArray('.compare-row').forEach(row => {
      const old = row.querySelector('.compare-old');
      const nw = row.querySelector('.compare-new');
      if (old) gsap.from(old, { scrollTrigger: { trigger: row, start: 'top 85%', once: true }, x: -50, opacity: 0, duration: 0.6, ease: 'power3.out' });
      if (nw) gsap.from(nw, { scrollTrigger: { trigger: row, start: 'top 85%', once: true }, x: 50, opacity: 0, duration: 0.6, delay: 0.1, ease: 'power3.out' });
    });

    // Stat counters
    gsap.utils.toArray('.stat-num').forEach(el => {
      const target = parseInt(el.dataset.target);
      const suffix = el.dataset.suffix || '';
      ScrollTrigger.create({
        trigger: el, start: 'top 85%', once: true,
        onEnter: () => {
          gsap.to({ val: 0 }, {
            val: target, duration: 2, ease: 'power2.out',
            onUpdate: function () {
              el.textContent = Math.round(this.targets()[0].val) + suffix;
            },
          });
        },
      });
    });

    // Stat boxes
    gsap.utils.toArray('.stat-box').forEach((box, i) => {
      gsap.from(box, {
        scrollTrigger: { trigger: box, start: 'top 90%', once: true },
        y: 30, opacity: 0, duration: 0.5, delay: i * 0.1, ease: 'power2.out',
      });
    });

    // CTA headline
    gsap.utils.toArray('.cta-headline').forEach(el => {
      gsap.from(el, {
        scrollTrigger: { trigger: el, start: 'top 80%', once: true },
        y: 50, opacity: 0, duration: 0.7, ease: 'power3.out',
      });
    });

    // Deliverable list items
    gsap.utils.toArray('.deliverable-item').forEach((item, i) => {
      gsap.from(item, {
        scrollTrigger: { trigger: item, start: 'top 92%', once: true },
        x: -20, opacity: 0, duration: 0.4, delay: i * 0.06, ease: 'power2.out',
      });
    });

    return () => {
      ScrollTrigger.getAll().forEach(t => t.kill());
    };
  }, []);

  return null;
}
