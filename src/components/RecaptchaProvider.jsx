'use client';
import { GoogleReCaptchaProvider } from 'react-google-recaptcha-v3';

/**
 * Wraps the app with Google reCAPTCHA v3 provider.
 * The site key is loaded from NEXT_PUBLIC_RECAPTCHA_SITE_KEY.
 * If not set, the provider is skipped (dev mode).
 */
export default function RecaptchaProvider({ children }) {
  const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;

  if (!siteKey) {
    // Skip reCAPTCHA in dev / when key not configured
    return <>{children}</>;
  }

  return (
    <GoogleReCaptchaProvider
      reCaptchaKey={siteKey}
      scriptProps={{ async: true, defer: true }}
    >
      {children}
    </GoogleReCaptchaProvider>
  );
}
