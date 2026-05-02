'use client';

const strips = [
  { label: 'STRATEGY', desc: 'Market research, competitor analysis, and brand positioning to build your roadmap.' },
  { label: 'DESIGN', desc: 'UI/UX design, brand identity, and visual systems that command attention.' },
  { label: 'BUILD', desc: 'Custom websites, apps, and software — clean code, blazing performance.' },
  { label: 'SHIP', desc: 'Launch, deploy, and go live with confidence. We handle everything.' },
  { label: 'GROW', desc: 'Performance marketing, SEO, and social media to scale your brand.' },
];

export default function Sidebar() {
  return (
    <aside className="sidebar" id="sidebar" aria-hidden="true">
      {strips.map((s, i) => (
        <div key={i} className="sidebar-strip">
          <span className="sidebar-strip-label">{s.label}</span>
          <div className="sidebar-strip-content">
            <span className="sidebar-strip-title">{s.label}</span>
            <p className="sidebar-strip-desc">{s.desc}</p>
          </div>
        </div>
      ))}
    </aside>
  );
}
