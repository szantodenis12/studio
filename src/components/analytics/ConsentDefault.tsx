// Se pune în <head> din app/layout.tsx, ÎNAINTE de GTM.
// Setează consimțământul implicit pe „denied" (Consent Mode v2, obligatoriu în UE)
// și reaplică imediat alegerea salvată de bannerul existent
// (localStorage „cookie_consent_status" = „accepted" / „declined").

const script = `
window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
window.gtag = gtag;
gtag('consent', 'default', {
  ad_storage: 'denied',
  ad_user_data: 'denied',
  ad_personalization: 'denied',
  analytics_storage: 'denied',
  wait_for_update: 500
});
gtag('set', 'ads_data_redaction', true);
gtag('set', 'url_passthrough', true);
try {
  if (localStorage.getItem('cookie_consent_status') === 'accepted') {
    gtag('consent', 'update', {
      ad_storage: 'granted', ad_user_data: 'granted',
      ad_personalization: 'granted', analytics_storage: 'granted'
    });
  }
} catch (e) {}
`;

export function ConsentDefault() {
  return <script id="consent-default" dangerouslySetInnerHTML={{ __html: script }} />;
}
