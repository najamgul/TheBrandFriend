import Link from 'next/link';

export const metadata = {
  title: '404 — Page not found',
  // Stops soft-404s and dead URLs accumulating in the index.
  robots: { index: false, follow: true },
};

export default function NotFound() {
  return (
    <section className="section" style={{ minHeight: '60vh', display: 'grid', placeItems: 'center' }}>
      <div className="wrap" style={{ textAlign: 'center' }}>
        <span className="label muted" style={{ display: 'block', marginBottom: 'var(--s-5)' }}>
          Error 404
        </span>
        <h1 className="display" style={{ marginBottom: 'var(--s-5)' }}>
          There&apos;s nothing
          <br />
          at this address.
        </h1>
        <p className="lede muted" style={{ margin: '0 auto var(--s-7)' }}>
          The page has either moved or never existed. Both are fixable.
        </p>
        <div style={{ display: 'flex', gap: 'var(--s-3)', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href="/" className="btn">Back home</Link>
          <Link href="/portfolio/" className="btn btn--ghost">
            See the work
            <span className="btn__arrow" aria-hidden="true">→</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
