/**
 * The privacy section about donations, and how it gets onto live pages.
 *
 * Standing pages are seeded once and then belong to the panel, so a new
 * paragraph in footer-pages.ts would never reach the live site. This section
 * is added to the page that is there instead, without touching a word of it,
 * and only once: a page that already mentions Buy Me a Coffee is left alone.
 */
export interface PrivacySupportSection {
  locale: string;
  slug: string;
  /** The heading the section goes in front of, when the page still has it. */
  before: string;
  html: string;
}

const MARKER = 'Buy Me a Coffee';

export const PRIVACY_SUPPORT_SECTIONS: PrivacySupportSection[] = [
  {
    locale: 'tr',
    slug: 'gizlilik',
    before: '<h2>Çocuklar</h2>',
    html: `<h2>Destek ve bağışlar</h2>
<p>Siteye Buy Me a Coffee üzerinden kahve ısmarlayarak destek olabilirsiniz. Ödemeyi Buy Me a Coffee ve onun ödeme altyapısı Stripe alır; kart bilgileriniz AcademyGeo'ya hiç ulaşmaz. Bu ödemelere Buy Me a Coffee'nin kendi gizlilik politikası uygulanır.</p>
<p>Desteğinizi herkese açık bırakırsanız, Buy Me a Coffee'de yazdığınız ad, bıraktığınız mesaj, kaç kahve ısmarladığınız ve tarih <a href="/tr/support">Destekçiler</a> listesinde gösterilir. Bu bilgiler Buy Me a Coffee'den okunur ve yaklaşık 15 dakikada bir yenilenir. E-posta adresiniz ve kartınızın üzerindeki ad hiçbir zaman gösterilmez. Desteğinizi Buy Me a Coffee'de gizli olarak işaretlerseniz listede görünmezsiniz.</p>
<p>Listeden çıkmak ya da mesajınızı kaldırtmak için <a href="mailto:academygeoo@gmail.com">academygeoo@gmail.com</a> adresine yazın.</p>

`,
  },
  {
    locale: 'en',
    slug: 'privacy',
    before: '<h2>Children</h2>',
    html: `<h2>Support and donations</h2>
<p>You can support the site by buying it a coffee on Buy Me a Coffee. The payment is taken by Buy Me a Coffee and its payment provider Stripe; your card details never reach AcademyGeo. Buy Me a Coffee's own privacy policy applies to those payments.</p>
<p>If you leave your support public, the name you gave on Buy Me a Coffee, your message, how many coffees you bought and the date are shown on the <a href="/en/support">Supporters</a> list. They are read from Buy Me a Coffee and refreshed about every 15 minutes. Your email address and the name on your card are never shown. If you mark your support as private on Buy Me a Coffee, you do not appear on the list.</p>
<p>To be taken off the list or have your message removed, write to <a href="mailto:academygeoo@gmail.com">academygeoo@gmail.com</a>.</p>

`,
  },
];

/**
 * The page with the section added, or null when it needs nothing: the page
 * already talks about Buy Me a Coffee.
 */
export function withSupportSection(content: string, section: PrivacySupportSection): string | null {
  if (content.includes(MARKER)) return null;

  const at = content.indexOf(section.before);
  if (at === -1) return `${content}\n\n${section.html.trimEnd()}`;

  return `${content.slice(0, at)}${section.html}${content.slice(at)}`;
}
