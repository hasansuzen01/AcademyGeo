/**
 * The standing pages the footer links to.
 *
 * Seeded rather than hard-coded into the app so an admin can edit the wording
 * without a deploy. Seeded once and never updated, so a page rewritten in the
 * panel stays rewritten, and changing the text here only reaches a fresh
 * database.
 *
 * AcademyGeo is a personal, non-commercial study aid. The wording says so
 * plainly, including that it is not connected to GeoGuessr, whose name belongs
 * to someone else.
 */
export interface FooterPage {
  locale: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  footerOrder: number;
  metaTitle: string;
  metaDescription: string;
}

export const FOOTER_PAGES: FooterPage[] = [
  {
    locale: 'en',
    slug: 'about',
    title: 'About AcademyGeo',
    excerpt: 'A personal project for learning to read the static clues in a GeoGuessr round.',
    footerOrder: 1,
    metaTitle: 'About AcademyGeo',
    metaDescription:
      'AcademyGeo is a personal, non-commercial project for practising the static clues that decide a GeoGuessr round: plates, bollards, road lines, signage and vegetation.',
    content: `<h2>What this is</h2>
<p>AcademyGeo is a personal project. It exists so players can practise the static clues that decide a round: number plates, bollards, road markings, the script on signs, roadside vegetation and building styles.</p>
<p>Those clues are learnable. They are just hard to learn while playing, because a round gives you one look and then moves on. Here each clue is a card you can sit with, and the ones you miss come back until they stick.</p>

<h2>How the practice works</h2>
<p>Every card is a single clue with one correct country. You answer, you find out immediately, and the card is scheduled to return based on how you did. A card you got wrong comes back in ten minutes. A card you knew instantly moves further out each time you see it.</p>
<p>The schedule is a variant of SM-2. Instead of asking you to rate your own recall, it reads your answer time: under two and a half seconds counts as instant, under eight as steady, slower as hesitant.</p>

<h2>Who made it</h2>
<p>One person, for their own practice, shared in case it is useful to anyone else. There is no company behind it, nothing is sold, and there are no advertisements.</p>

<h2>Not connected to GeoGuessr</h2>
<p>AcademyGeo is an independent study aid. It is not affiliated with, endorsed by, or connected to GeoGuessr AB in any way. The name GeoGuessr belongs to them and is used here only to describe what the practice is for.</p>`,
  },
  {
    locale: 'tr',
    slug: 'hakkimizda',
    title: 'AcademyGeo Hakkında',
    excerpt: 'GeoGuessr turlarındaki statik ipuçlarını öğrenmek için kişisel bir proje.',
    footerOrder: 1,
    metaTitle: 'AcademyGeo Hakkında',
    metaDescription:
      'AcademyGeo, bir GeoGuessr turunu belirleyen statik ipuçlarını çalışmak için kurulmuş kişisel ve ticari olmayan bir projedir: plakalar, dubalar, yol çizgileri, tabelalar ve bitki örtüsü.',
    content: `<h2>Bu nedir</h2>
<p>AcademyGeo kişisel bir projedir. Bir turu belirleyen statik ipuçlarını çalışabilmek için var: plakalar, dubalar, yol çizgileri, tabelalardaki yazı, yol kenarı bitki örtüsü ve yapı biçimleri.</p>
<p>Bu ipuçları öğrenilebilir. Oyunun içinde öğrenmesi zordur, çünkü tur size tek bir bakış verip geçer. Burada her ipucu üzerinde durabileceğiniz bir kart, bilemedikleriniz de öğrenene kadar geri gelir.</p>

<h2>Çalışma nasıl işliyor</h2>
<p>Her kart tek bir ipucu ve tek bir doğru ülke taşır. Cevaplarsınız, sonucu anında görürsünüz ve kart performansınıza göre yeniden planlanır. Yanlış bildiğiniz kart on dakika sonra döner. Anında bildiğiniz kart her görüşünüzde biraz daha uzağa gider.</p>
<p>Plan SM-2 algoritmasının bir türevidir. Kendinizi puanlamanızı istemek yerine cevap sürenizi okur: iki buçuk saniyenin altı anında, sekiz saniyenin altı istikrarlı, daha yavaşı tereddütlü sayılır.</p>

<h2>Kim yaptı</h2>
<p>Tek kişi, kendi çalışması için yaptı ve başkasına da yararı olur diye paylaştı. Arkasında bir şirket yok, hiçbir şey satılmıyor, reklam da yok.</p>

<h2>GeoGuessr ile bağlantısı yoktur</h2>
<p>AcademyGeo bağımsız bir çalışma aracıdır. GeoGuessr AB ile herhangi bir bağı, ortaklığı ya da onayı yoktur. GeoGuessr adı onlara aittir ve burada yalnızca çalışmanın neye yönelik olduğunu anlatmak için geçer.</p>`,
  },
  {
    locale: 'en',
    slug: 'privacy',
    title: 'Privacy',
    excerpt: 'What is stored about you, why, and how to have it removed.',
    footerOrder: 2,
    metaTitle: 'Privacy at AcademyGeo',
    metaDescription:
      'What AcademyGeo stores about you: a Google account name and address, your practice history, and nothing else. No advertising, no data sold.',
    content: `<h2>What is stored</h2>
<p>Signing in with Google gives AcademyGeo three things: your name, your email address and your profile picture. That is what Google shares for a basic sign-in, and it is all that is kept.</p>
<p>Alongside that, practising stores your answers: which card, which country you chose, whether it was right, and how long you took. That history is what the review schedule and the statistics on your dashboard are built from.</p>

<h2>Why it is stored</h2>
<p>Your email identifies your account across sign-ins. Your answers make the spaced repetition work: without them every session would start from nothing.</p>

<h2>What is not done with it</h2>
<p>Nothing is sold, rented or shared. There is no advertising. Your email is not added to a mailing list, because there is no mailing list.</p>

<h2>Who else sees it</h2>
<p>Google, because sign-in goes through them. Cloudflare, because uploaded pictures are stored in their object storage. The hosting provider, because the site runs somewhere. None of them are given your practice history for their own purposes.</p>
<p>If the site owner has switched on Google Analytics, the cookie notice will say so and analytics will also see your visits.</p>

<h2>How long</h2>
<p>Until you ask for it to go. Delete your account and the answers, schedule and streaks go with it.</p>

<h2>Having your data removed</h2>
<p>Write to the address on the contact page and ask. There is no form and no waiting period beyond the time it takes to read the message.</p>

<h2>Children</h2>
<p>AcademyGeo is not aimed at children under 13 and does not knowingly keep accounts for them.</p>`,
  },
  {
    locale: 'tr',
    slug: 'gizlilik',
    title: 'Gizlilik',
    excerpt: 'Hakkınızda ne saklanıyor, neden saklanıyor ve nasıl sildirirsiniz.',
    footerOrder: 2,
    metaTitle: 'AcademyGeo Gizlilik',
    metaDescription:
      'AcademyGeo hakkınızda ne saklıyor: Google hesabınızdan gelen ad ve e-posta, bir de çalışma geçmişiniz. Reklam yok, veri satışı yok.',
    content: `<h2>Ne saklanıyor</h2>
<p>Google ile giriş yaptığınızda AcademyGeo üç şey alır: adınız, e-posta adresiniz ve profil fotoğrafınız. Google temel bir giriş için bunları paylaşır, saklanan da yalnızca bunlardır.</p>
<p>Bunun yanında çalışmanız cevaplarınızı kaydeder: hangi kart, hangi ülkeyi seçtiniz, doğru muydu ve ne kadar sürdü. Tekrar planı ve panonuzdaki istatistikler bu geçmiş üzerine kurulur.</p>

<h2>Neden saklanıyor</h2>
<p>E-postanız hesabınızı girişler arasında tanır. Cevaplarınız aralıklı tekrarın çalışmasını sağlar; onlar olmadan her oturum sıfırdan başlardı.</p>

<h2>Ne yapılmıyor</h2>
<p>Hiçbir şey satılmaz, kiralanmaz, paylaşılmaz. Reklam yoktur. E-postanız bir bülten listesine eklenmez, çünkü bülten listesi yoktur.</p>

<h2>Başka kimler görüyor</h2>
<p>Google, çünkü giriş oradan geçiyor. Cloudflare, çünkü yüklenen görseller onların depolamasında duruyor. Barındırma sağlayıcısı, çünkü site bir yerde çalışıyor. Hiçbirine çalışma geçmişiniz kendi amaçları için verilmez.</p>
<p>Site sahibi Google Analytics'i açtıysa çerez bildirimi bunu söyler ve ziyaretlerinizi analitik de görür.</p>

<h2>Ne kadar süreyle</h2>
<p>Silinmesini isteyene kadar. Hesabınızı sildirdiğinizde cevaplar, plan ve seriler de onunla gider.</p>

<h2>Verinizi sildirmek</h2>
<p>İletişim sayfasındaki adrese yazıp isteyin. Form yok, mesajın okunma süresinden başka bekleme de yok.</p>

<h2>Çocuklar</h2>
<p>AcademyGeo 13 yaşından küçükler için tasarlanmadı ve bilerek onlara hesap açmaz.</p>`,
  },
  {
    locale: 'en',
    slug: 'cookies',
    title: 'Cookies',
    excerpt: 'Three cookies, what each one does, and which you can refuse.',
    footerOrder: 3,
    metaTitle: 'Cookies at AcademyGeo',
    metaDescription:
      'AcademyGeo sets a sign-in cookie and a language cookie. Neither is used for advertising, and the language one can be refused.',
    content: `<h2>The sign-in cookie</h2>
<p>Signing in sets a cookie holding a signed session token. Without it the site would ask you to sign in on every page. It lasts thirty days and is removed when you sign out. It cannot be refused while staying signed in, because it is what being signed in means.</p>

<h2>The language cookie</h2>
<p>Choosing English or Turkish in the header stores that choice for a year. Without it, the language is guessed from the country your connection appears to come from, which is right for most people and wrong for some.</p>

<h2>The sign-in handshake</h2>
<p>During sign-in, a short-lived cookie holds a one-time value that ties the request you started to the answer Google sends back. It exists for five minutes and is what stops someone else completing a sign-in on your behalf.</p>

<h2>Measurement</h2>
<p>If the site owner has entered a Google Analytics or Tag Manager id in the admin panel, those services set their own cookies to count visits. No such id is set by default, and nothing is loaded when the field is empty.</p>

<h2>Advertising</h2>
<p>There are no advertising cookies, because there are no advertisements.</p>

<h2>Refusing them</h2>
<p>Your browser can block cookies for this site. The language toggle will stop remembering your choice and you will not be able to stay signed in, but reading the blog and these pages will still work.</p>`,
  },
  {
    locale: 'tr',
    slug: 'cerezler',
    title: 'Çerezler',
    excerpt: 'Üç çerez, her birinin ne yaptığı ve hangisini reddedebileceğiniz.',
    footerOrder: 3,
    metaTitle: 'AcademyGeo Çerezler',
    metaDescription:
      'AcademyGeo bir oturum çerezi ve bir dil çerezi kullanır. Hiçbiri reklam için değildir, dil çerezi reddedilebilir.',
    content: `<h2>Oturum çerezi</h2>
<p>Giriş yaptığınızda imzalı bir oturum belirteci taşıyan bir çerez kurulur. O olmadan site her sayfada tekrar giriş isterdi. Otuz gün sürer ve çıkış yaptığınızda silinir. Giriş yapmış kalmak istiyorsanız reddedilemez, çünkü giriş yapmış olmak zaten budur.</p>

<h2>Dil çerezi</h2>
<p>Üst bardan İngilizce ya da Türkçe seçtiğinizde bu tercih bir yıl saklanır. O olmadan dil, bağlantınızın geldiği görünen ülkeden tahmin edilir; bu çoğu kişi için doğru, bazıları için yanlıştır.</p>

<h2>Giriş el sıkışması</h2>
<p>Giriş sırasında kısa ömürlü bir çerez, başlattığınız isteği Google'ın gönderdiği yanıta bağlayan tek kullanımlık bir değer taşır. Beş dakika yaşar ve başkasının sizin adınıza girişi tamamlamasını engelleyen şey odur.</p>

<h2>Ölçüm</h2>
<p>Site sahibi yönetici panelinden bir Google Analytics ya da Tag Manager kimliği girdiyse bu servisler ziyaretleri saymak için kendi çerezlerini kurar. Varsayılan olarak böyle bir kimlik yoktur ve alan boşken hiçbir şey yüklenmez.</p>

<h2>Reklam</h2>
<p>Reklam çerezi yoktur, çünkü reklam yoktur.</p>

<h2>Reddetmek</h2>
<p>Tarayıcınız bu site için çerezleri engelleyebilir. Dil seçiminiz hatırlanmaz ve giriş yapmış kalamazsınız, ama blogu ve bu sayfaları okumaya devam edebilirsiniz.</p>`,
  },
  {
    locale: 'en',
    slug: 'terms',
    title: 'Terms of use',
    excerpt: 'What you can expect from a personal project, and what it expects from you.',
    footerOrder: 4,
    metaTitle: 'Terms of use at AcademyGeo',
    metaDescription:
      'AcademyGeo is offered free and as is, by one person, with no guarantee of availability. It is not affiliated with GeoGuessr.',
    content: `<h2>What this is</h2>
<p>AcademyGeo is a personal project offered free of charge. Nothing is sold and no payment is taken.</p>

<h2>What it does not promise</h2>
<p>It is offered as it is. There is no guarantee that it will be available, that a card's answer is correct, or that practising here will improve your score. Clues change as countries repaint their roads and replace their signs, and a card can fall out of date.</p>
<p>It may go offline, lose data, or stop being maintained. It is one person's project, not a service with an operations team behind it.</p>

<h2>Your account</h2>
<p>Use one account, and use the Google account that is actually yours. Do not try to reach the admin panel or other people's data. Accounts doing either can be removed without notice.</p>

<h2>The content</h2>
<p>The explanations and the card artwork are the work of the project. Read them, learn from them, share a link. Do not republish the collection as your own.</p>

<h2>Not connected to GeoGuessr</h2>
<p>AcademyGeo is independent. It is not affiliated with, endorsed by, or connected to GeoGuessr AB. Their name is used only to describe what the practice is for.</p>

<h2>Changes</h2>
<p>These terms can change. The page carries the date it was last edited, and continuing to use the site means the current version applies.</p>`,
  },
  {
    locale: 'tr',
    slug: 'kullanim-kosullari',
    title: 'Kullanım koşulları',
    excerpt: 'Kişisel bir projeden ne bekleyebilirsiniz, sizden ne bekleniyor.',
    footerOrder: 4,
    metaTitle: 'AcademyGeo Kullanım Koşulları',
    metaDescription:
      'AcademyGeo tek kişi tarafından ücretsiz ve olduğu gibi sunulur, erişilebilirlik garantisi yoktur. GeoGuessr ile bağlantısı yoktur.',
    content: `<h2>Bu nedir</h2>
<p>AcademyGeo ücretsiz sunulan kişisel bir projedir. Hiçbir şey satılmaz, ödeme alınmaz.</p>

<h2>Neyin sözü verilmiyor</h2>
<p>Olduğu gibi sunulur. Erişilebilir olacağının, bir kartın cevabının doğru olduğunun ya da burada çalışmanın skorunuzu yükselteceğinin garantisi yoktur. Ülkeler yollarını yeniden boyayıp tabelalarını değiştirdikçe ipuçları değişir ve bir kart güncelliğini yitirebilir.</p>
<p>Site kapanabilir, veri kaybedebilir ya da bakımı bırakılabilir. Bu tek kişinin projesidir, arkasında bir operasyon ekibi olan bir hizmet değildir.</p>

<h2>Hesabınız</h2>
<p>Tek hesap kullanın ve gerçekten size ait olan Google hesabını kullanın. Yönetici paneline ya da başkalarının verisine ulaşmaya çalışmayın. Bunları yapan hesaplar haber verilmeden kapatılabilir.</p>

<h2>İçerik</h2>
<p>Açıklamalar ve kart görselleri projenin emeğidir. Okuyun, öğrenin, bağlantısını paylaşın. Koleksiyonu kendinizinmiş gibi yeniden yayımlamayın.</p>

<h2>GeoGuessr ile bağlantısı yoktur</h2>
<p>AcademyGeo bağımsızdır. GeoGuessr AB ile bağı, ortaklığı ya da onayı yoktur. Adları yalnızca çalışmanın neye yönelik olduğunu anlatmak için geçer.</p>

<h2>Değişiklikler</h2>
<p>Bu koşullar değişebilir. Sayfa en son düzenlendiği tarihi taşır ve siteyi kullanmaya devam etmek geçerli sürümün uygulandığı anlamına gelir.</p>`,
  },
];
