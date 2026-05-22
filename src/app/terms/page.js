import Link from 'next/link';

export const metadata = {
  title: 'Terms of Service — TheBrandFriend',
  description: 'Terms of Service for TheBrandFriend digital agency. Read our project terms, client responsibilities, payment terms, and intellectual property conditions.',
  keywords: 'terms of service, terms of use, legal agreements, TheBrandFriend',
};

export default function TermsPage() {
  return (
    <>
      {/* Hero Section */}
      <section className="hero" style={{ minHeight: 'auto' }}>
        <div className="hero-layout">
          <div className="hero-inner">
            <div className="sticker sticker-hero" style={{ '--rot': '1deg' }}>
              <span className="mono">LEGAL</span>
            </div>
            <h1 className="hero-headline" id="terms-title">
              TERMS OF<br />
              <span className="volt">SERVICE</span>
            </h1>
            <p className="hero-sub" id="terms-intro">
              <em>LAST UPDATED: MAY 22, 2026. THE TERMS OF WORK. PLEASE READ CAREFULLY TO UNDERSTAND HOW WE ENGAGE AND EXECUTE PROJECTS.</em>
            </p>
          </div>
        </div>
      </section>

      {/* Content Section */}
      <section className="section section-dark">
        <div className="legal-container">
          
          <div className="legal-section">
            <h2>1. AGREEMENT TO TERMS</h2>
            <p>
              By accessing our website or engaging TheBrandFriend for digital services, you agree to comply with and be bound by these Terms of Service. If you do not agree to these terms, you must not access our website or engage our agency for any work.
            </p>
          </div>

          <div className="legal-section">
            <h2>2. SCOPE OF SERVICES</h2>
            <p>
              We provide professional creative and development services, including strategy, design, front-end and back-end development, social media management, and performance marketing, as outlined on our <Link href="/services/" className="volt" style={{ textDecoration: 'underline' }}>services page</Link>.
            </p>
            <p>
              All projects are executed based on a signed proposal or statement of work (SOW) which details the specific deliverables, timelines, and budgets. Any work outside the defined SOW is subject to change orders and additional billing.
            </p>
          </div>

          <div className="legal-section">
            <h2>3. CLIENT RESPONSIBILITIES</h2>
            <p>
              To ensure projects are delivered fast and correctly (following <Link href="/process/" className="volt" style={{ textDecoration: 'underline' }}>our process</Link>), client collaboration is essential:
            </p>
            <ul>
              <li><strong>Content & Assets:</strong> The client must provide text, images, logos, and login credentials in a timely manner. Delays in asset submission will extend project timelines.</li>
              <li><strong>Approvals & Feedback:</strong> The client agrees to provide clear, consolidated feedback on design drafts or code features within three (3) business days of submission.</li>
              <li><strong>Representation:</strong> The client warrants that they own or have permission to use all materials and content provided to us for incorporation into the project.</li>
            </ul>
          </div>

          <div className="legal-section">
            <h2>4. BILLING & PAYMENTS</h2>
            <p>
              Unless specified otherwise in the SOW, our billing terms are as follows:
            </p>
            <ul>
              <li><strong>Deposits:</strong> A non-refundable deposit (typically 50%) is required before project kickoff.</li>
              <li><strong>Milestones:</strong> Outstanding balances are billed upon milestone completions or before final file transfer and deployment.</li>
              <li><strong>Late Fees:</strong> Invoices unpaid after ten (10) business days will accrue a late fee of 1.5% per month on the outstanding balance. We reserve the right to suspend development or pause live services if bills remain unpaid.</li>
            </ul>
          </div>

          <div className="legal-section">
            <h2>5. INTELLECTUAL PROPERTY & OWNERSHIP</h2>
            <p>
              We believe in client ownership. Here is how intellectual property rights are handled:
            </p>
            <ul>
              <li><strong>Transfer of Rights:</strong> Upon receiving full and final payment, ownership of the final designs and code created specifically for your project is fully transferred to you.</li>
              <li><strong>Agency Portfolio:</strong> We reserve the right to showcase designs, mockups, code screenshots, and live website links in our agency case studies, social media, and portfolio, unless a non-disclosure agreement (NDA) has been explicitly signed.</li>
              <li><strong>Pre-existing Code:</strong> Pre-existing software libraries, open-source code, and standard frameworks used to build the website remain the property of their respective owners.</li>
            </ul>
          </div>

          <div className="legal-section">
            <h2>6. WARRANTY & LIMITATION OF LIABILITY</h2>
            <p>
              We take pride in our obsession with high quality. However, our services are provided on an &quot;as is&quot; and &quot;as available&quot; basis:
            </p>
            <ul>
              <li><strong>No ROI Guarantees:</strong> While we aim for exceptional market results, we do not guarantee specific sales targets, search rankings, or ROI figures.</li>
              <li><strong>Liability Cap:</strong> To the maximum extent permitted by law, TheBrandFriend is not liable for any indirect, incidental, or consequential damages (such as lost profits or site downtime). In no event shall our total liability exceed the actual fees paid by you for the specific project.</li>
            </ul>
          </div>

          <div className="legal-section" style={{ marginBottom: 0 }}>
            <h2>7. TERMINATION & CONTACT</h2>
            <p>
              Either party may terminate an ongoing SOW with fifteen (15) days written notice if either party breaches their material obligations under the contract.
            </p>
            <p>
              For legal inquiries, contract clarifications, or onboarding questions, please reach out to our team via our <Link href="/contact/" className="volt" style={{ textDecoration: 'underline' }}>contact page</Link> or contact us at:
            </p>
            <p className="mono" style={{ color: '#fff', fontSize: '13px' }}>
              THEBRANDFRIEND LEGAL TEAM<br />
              EMAIL: <a href="mailto:care@thebrandfriend.com" id="terms-contact-link" className="volt" style={{ textDecoration: 'underline' }}>CARE@THEBRANDFRIEND.COM</a><br />
              WEBSITE: <Link href="/" className="volt" style={{ textDecoration: 'underline' }}>WWW.THEBRANDFRIEND.COM</Link>
            </p>
          </div>

        </div>
      </section>
    </>
  );
}
