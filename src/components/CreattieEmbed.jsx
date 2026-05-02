'use client';
import Script from 'next/script';

export default function CreattieEmbed({ src, speed = '100', width = '100%', maxWidth = '600px' }) {
  return (
    <div className="creattie-wrapper" aria-hidden="true">
      <div
        dangerouslySetInnerHTML={{
          __html: `<creattie-embed
            src="${src}"
            delay="1"
            speed="${speed}"
            frame_rate="24"
            trigger="loop"
            style="width:${width};max-width:${maxWidth};background-color:transparent">
          </creattie-embed>`
        }}
      />
      <Script
        src="https://creattie.com/js/embed.js?id=3efa1fcb5d85991e845a"
        strategy="lazyOnload"
      />
    </div>
  );
}
