import Link from 'next/link';

export const metadata = {
  title: 'Privacy Policy — TheBrandFriend',
  description: 'How we collect, use, and protect your information at TheBrandFriend. Transparent, direct, and secure data handling practices.',
  keywords: 'privacy policy, legal, data privacy, TheBrandFriend',
};

export default function PrivacyPage() {
  return (
    <>
      {/* Hero Section */}
      <section className="hero" style={{ minHeight: 'auto' }}>
        <div className="hero-layout">
          <div className="hero-inner">
            <div className="sticker sticker-hero" style={{ '--rot': '-2deg' }}>
              <span className="mono">LEGAL</span>
            </div>
            <h1 className="hero-headline" id="privacy-title">
              PRIVACY<br />
              <span className="volt">POLICY</span>
            </h1>
            <p className="hero-sub" id="privacy-intro">
              <em>LAST UPDATED: MAY 22, 2026. TRANSPARENCY IS OUR FOUNDATION. HERE IS HOW WE RESPECT AND SAFEGUARD YOUR DATA.</em>
            </p>
          </div>
        </div>
      </section>

      {/* Content Section */}
      <section className="section section-dark">
        <div className="legal-container">
          
          <div className="legal-section">
            <h2>1. OVERVIEW</h2>
            <p>
              At TheBrandFriend, we are committed to maintaining the trust and confidence of our clients and website visitors. This Privacy Policy details how we collect, use, and protect your personal information when you interact with our website or use our agency <Link href="/services/" className="volt" style={{ textDecoration: 'underline' }}>services</Link>.
            </p>
          </div>

          <div className="legal-section">
            <h2>2. INFORMATION WE COLLECT</h2>
            <p>
              We only collect information that is necessary to deliver our services, communicate project updates, or improve your website experience:
            </p>
            <ul>
              <li><strong>Contact Information:</strong> Your name, email address, phone number, and company name when you fill out our contact form or submit a request on our <Link href="/contact/" className="volt" style={{ textDecoration: 'underline' }}>contact page</Link>.</li>
              <li><strong>Project Details:</strong> Information regarding your business goals, design assets, and marketing preferences provided during onboarding or proposal phases.</li>
              <li><strong>Usage Data:</strong> Anonymous analytical data, such as IP addresses, browser types, and referring pages, collected via cookies to help us optimize website performance.</li>
            </ul>
          </div>

          <div className="legal-section">
            <h2>3. HOW WE USE YOUR INFORMATION</h2>
            <p>
              Your data is processed based on legitimate business interests and the execution of project contracts. Specifically, we use your information to:
            </p>
            <ul>
              <li>Provide, execute, and deliver custom design, development, and marketing campaigns as described in <Link href="/process/" className="volt" style={{ textDecoration: 'underline' }}>our process</Link>.</li>
              <li>Respond to inquiries, send proposals, or coordinate client calls.</li>
              <li>Analyze website performance and user interaction to refine our design and user experience.</li>
              <li>Comply with legal obligations, prevent fraudulent submissions, and secure our contact interfaces using Google reCAPTCHA.</li>
            </ul>
          </div>

          <div className="legal-section">
            <h2>4. DATA SHARING & THIRD-PARTY SERVICES</h2>
            <p>
              We do not sell, rent, or trade your personal information. To keep our operations fast and reliable, we share relevant data with trusted infrastructure providers:
            </p>
            <ul>
              <li><strong>Hosting & Backend:</strong> Vercel (for frontend hosting) and Supabase (for secure CRM database storage).</li>
              <li><strong>Security & Forms:</strong> Google reCAPTCHA (to secure our submission forms).</li>
              <li><strong>Legal Disclosures:</strong> We may disclose data if required by law, regulatory bodies, or to protect the safety and rights of our agency, users, or clients.</li>
            </ul>
          </div>

          <div className="legal-section">
            <h2>5. DATA RETENTION & SECURITY</h2>
            <p>
              We implement industry-standard security measures to guard your data. Your contact details and project correspondence are retained only as long as necessary to fulfill project requirements or comply with tax and legal record-keeping obligations.
            </p>
          </div>

          <div className="legal-section">
            <h2>6. YOUR RIGHTS</h2>
            <p>
              Depending on your location, you have rights regarding your personal data. You can request access to the information we hold, ask for corrections, or request complete deletion of your data from our systems. To exercise any of these rights, please email us directly at the address below.
            </p>
          </div>

          <div className="legal-section" style={{ marginBottom: 0 }}>
            <h2>7. CONTACT US</h2>
            <p>
              If you have any questions about this Privacy Policy or how we handle your data, please contact us at:
            </p>
            <p className="mono" style={{ color: '#fff', fontSize: '13px' }}>
              THEBRANDFRIEND LEGAL TEAM<br />
              EMAIL: <a href="mailto:care@thebrandfriend.com" id="privacy-contact-link" className="volt" style={{ textDecoration: 'underline' }}>CARE@THEBRANDFRIEND.COM</a><br />
              WEBSITE: <Link href="/" className="volt" style={{ textDecoration: 'underline' }}>WWW.THEBRANDFRIEND.COM</Link>
            </p>
          </div>

        </div>
      </section>
    </>
  );
}
