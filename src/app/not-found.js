import Link from 'next/link';

export const metadata = {
  title: '404 — Page Not Found',
};

export default function NotFound() {
  return (
    <section className="hero" style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
      <div>
        <div className="sticker" style={{ '--rot': '-2deg', marginBottom: '24px' }}>
          <span className="mono">ERROR 404</span>
        </div>
        <h1 className="hero-headline" style={{ marginBottom: '20px' }}>
          PAGE<br /><span className="volt">NOT FOUND</span>
        </h1>
        <p className="hero-sub" style={{ maxWidth: '500px', margin: '0 auto 32px' }}>
          <em>The page you&apos;re looking for doesn&apos;t exist or has been moved. Let&apos;s get you back on track.</em>
        </p>
        <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href="/" className="btn-submit">← BACK HOME</Link>
          <Link href="/contact/" className="btn-submit" style={{ background: '#fff', color: '#000' }}>CONTACT US</Link>
        </div>
      </div>
    </section>
  );
}
