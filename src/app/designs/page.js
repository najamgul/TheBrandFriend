import CreattieEmbed from '@/components/CreattieEmbed';
import DesignGalleryClient from '@/components/DesignGalleryClient';

export const metadata = {
  title: 'Design Library — Pick Your Website Style',
  description: 'Browse 10 handcrafted website designs. Pick a style you love, and we\'ll build your brand around it — delivered in 3 days.',
  keywords: 'website design templates, website styles, design picker, website inspiration, TheBrandFriend designs',
};

export default function DesignsPage() {
  return (
    <>
      <section className="hero" style={{ minHeight: 'auto' }}>
        <div className="hero-layout">
          <div className="hero-inner">
            <div className="sticker sticker-hero" style={{ '--rot': '-2deg' }}>
              <span className="mono">🎨 PICK YOUR VIBE</span>
            </div>
            <h1 className="hero-headline">DESIGN<br /><span className="volt">LIBRARY</span></h1>
            <p className="hero-sub">
              <em>10 handcrafted design styles. Find the one that speaks to your brand. Click &ldquo;I Want This&rdquo; and we&apos;ll build it — in 3 days.</em>
            </p>
          </div>
          <div className="hero-anim">
            <CreattieEmbed src="https://ik.imagekit.io/creattie/main/saved_colors/145118/fOmq6VjhbpevoY1i.json" />
          </div>
        </div>
      </section>

      <section className="section section-dark">
        <div className="section-header">
          <span className="mono tag tag-volt">BROWSE STYLES</span>
          <h2 className="section-title ranchers">CHOOSE YOUR WEAPON</h2>
        </div>
        <DesignGalleryClient />
      </section>
    </>
  );
}
