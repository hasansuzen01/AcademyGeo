/**
 * The starting blog.
 *
 * A post belongs to one language rather than being a translation pair, so the
 * English and Turkish sets cover the same ground without being sentence-for-
 * sentence copies of each other.
 *
 * Seeded so a fresh install is not an empty feed. Re-seeding rewrites these
 * posts in place, so a post an admin has rewritten will be overwritten: change
 * it here too, or seed once and write in the panel from then on.
 */

export interface BlogPostSeed {
  locale: string;
  slug: string;
  title: string;
  excerpt: string;
  keywords: string;
  metaTitle: string;
  metaDescription: string;
  /** Days before the seed date, so the feed is not one flat timestamp. */
  daysAgo: number;
  content: string;
}

export const BLOG_POSTS: BlogPostSeed[] = [
  {
    locale: 'en',
    slug: 'the-first-five-seconds',
    title: 'The first five seconds of a round',
    excerpt:
      'A fixed order to read a new location in, so the obvious clues are never the ones you miss.',
    keywords: 'geoguessr, method, meta, technique',
    metaTitle: 'The first five seconds of a GeoGuessr round',
    metaDescription:
      'A fixed checklist for the opening seconds of a round: traffic side, road markings, bollards, script, vegetation and the car itself.',
    daysAgo: 21,
    content: `<p>Most rounds are lost in the first five seconds, not the last thirty. Players drop into a new location, see nothing they recognise, and start panning at random. By the time something familiar appears they have already spent the part of the round where the obvious clues were sitting in plain view.</p>
<p>The fix is boring and it works: read every location in the same order, every time.</p>

<h2>1. Which side is the traffic on</h2>
<p>This is the cheapest clue in the game and it halves the map. Look at parked cars, the position of the driver in oncoming traffic, or which side the road markings put the solid line on. Left-hand traffic rules out almost all of Europe, the Americas and China in one glance.</p>

<h2>2. The lines on the road</h2>
<p>Centre and edge lines are visible in every weather and from every camera position. Ask three questions in order: what colour is the centre line, what colour are the edges, and is anything doubled.</p>
<ul>
<li><strong>Yellow centre, white edges.</strong> The Americas, and Norway.</li>
<li><strong>White centre, yellow edges.</strong> Southern Africa, and parts of Asia.</li>
<li><strong>All white.</strong> Most of Europe, and Australia.</li>
</ul>
<p>That single question moves you from the whole world to a continent.</p>

<h2>3. The bollard</h2>
<p>If there is a bollard in shot, stop and look at it properly. Countries choose a shape and a reflector colour and then leave it alone for decades, which makes bollards the most stable clue on the roadside. A Norwegian bollard is not a Swedish one, and the difference is visible at the resolution the camera gives you.</p>

<h2>4. The writing</h2>
<p>Non-Latin script narrows things immediately. Latin script is more interesting: it is the marks above the letters that matter. A single word with an <em>ő</em> puts you in Hungary; an <em>ı</em> without a dot puts you in Turkey or Azerbaijan; <em>ș</em> and <em>ț</em> put you in Romania.</p>
<blockquote>Read the small signs, not the big ones. A motorway sign is designed to be legible from far away and tends to be spelled plainly. A shop front is written for locals.</blockquote>

<h2>5. The car and the camera</h2>
<p>Finally, look at what you are riding in. A visible bonnet, its colour, a roof rack, an aerial, the sharpness of the image and how the blur is applied all narrow the country and sometimes the year. This is the clue people learn last and it is often the one that decides a close guess.</p>

<h2>Why an order helps</h2>
<p>Any one of these can be missing. The point of a fixed order is that you never spend the opening of a round deciding what to look at. You look, you answer the five questions, and whatever is left is a much smaller map than the one you started with.</p>`,
  },
  {
    locale: 'en',
    slug: 'european-bollards',
    title: 'A field guide to European bollards',
    excerpt:
      'Why the roadside bollard is the most reliable clue in Europe, and how to read one at speed.',
    keywords: 'bollard, europe, geoguessr, meta',
    metaTitle: 'A field guide to European bollards',
    metaDescription:
      'Roadside bollards are the most reliable clue in Europe. Shape, cap and reflector colour narrow a guess to one country in about a second.',
    daysAgo: 14,
    content: `<p>A bollard is a short post at the edge of the road with a reflector on it. It exists to show the driver where the road ends in the dark. It is also, for our purposes, a national identity card planted every fifty metres.</p>

<h2>Why they are so reliable</h2>
<p>Road furniture is specified by a national standard and then installed by the hundred thousand. Once a country has picked a shape, replacing it means replacing every post on every road, so the design outlives governments. That is what makes bollards better than the things players usually reach for first: the buildings change, the cars change, the bollards do not.</p>

<h2>What to look at, in order</h2>
<ol>
<li><strong>The top.</strong> Flat, angled, rounded, or a separate cap in another colour.</li>
<li><strong>The reflector.</strong> Colour, shape, and whether the two sides differ.</li>
<li><strong>The body.</strong> Width, whether it tapers, and whether there is a black band.</li>
</ol>

<h2>The ones worth learning first</h2>
<ul>
<li><strong>Norway.</strong> A squared-off head with an orange reflector. Once you have seen it you will not confuse it with Sweden again.</li>
<li><strong>Sweden.</strong> Narrower, with the reflector set into the post rather than sitting on it.</li>
<li><strong>Finland.</strong> Often paired with the snow poles that stay up all year, which is itself a clue.</li>
<li><strong>Poland.</strong> Grey concrete with a black band, unmistakable once known.</li>
<li><strong>Greece.</strong> Thin, white, with a shape that reads as almost delicate next to its neighbours.</li>
<li><strong>Spain and Italy.</strong> Both tall and thin, and the pair worth drilling against each other rather than in isolation.</li>
</ul>

<h2>How to practise them</h2>
<p>Do not learn bollards one country at a time. Learn them in the pairs you actually confuse: Norway against Sweden, Spain against Italy, Poland against Czechia. A card you can only answer when it appears alone is a card you have not learned.</p>`,
  },
  {
    locale: 'en',
    slug: 'telling-neighbours-apart',
    title: 'Telling neighbours apart is the whole game',
    excerpt:
      'Nobody loses a round by guessing Brazil instead of Finland. Rounds are lost between countries that look alike.',
    keywords: 'geoguessr, confusion, practice, method',
    metaTitle: 'Telling neighbours apart is the whole game',
    metaDescription:
      'Rounds are lost between countries that look alike, not between countries on opposite sides of the world. Practise the pairs, not the list.',
    daysAgo: 7,
    content: `<p>Look at where your points actually go. Almost nobody guesses Brazil when the answer is Finland. The points disappear in the small gaps: Turkey and Georgia, Norway and Sweden, Argentina and Uruguay, Malaysia and Indonesia, Czechia and Slovakia.</p>

<h2>Why lists do not work</h2>
<p>The usual way to study is to go country by country: read everything about Norway, then everything about Sweden. It feels productive and it trains the wrong thing. You end up able to recognise a clue when you already know which country you are looking at, which is exactly the situation a round never gives you.</p>
<p>What a round gives you is an image and a doubt. The skill being tested is discrimination, not recall.</p>

<h2>Practise in pairs</h2>
<p>Take the two countries you keep swapping and find the one feature that always separates them. Not five features: one, that is visible in a bad screenshot from a moving car.</p>
<ul>
<li><strong>Norway and Sweden.</strong> The centre line. Norway paints it yellow, Sweden white.</li>
<li><strong>Turkey and Georgia.</strong> The script. Georgian is its own alphabet and nothing else looks like it.</li>
<li><strong>Argentina and Uruguay.</strong> The bollard, and the density of the fencing along the road.</li>
</ul>
<p>Then drill the pair until the answer arrives before you have finished looking.</p>

<h2>Let your mistakes choose the session</h2>
<p>The most useful practice set is not a curated one. It is the list of countries you got wrong last week. That is why the weak spots mode here builds its hand from your own answer history rather than from a syllabus: the cards you keep missing come round more often, and the ones you have settled get out of the way.</p>`,
  },
  {
    locale: 'en',
    slug: 'what-the-car-tells-you',
    title: 'What the car tells you',
    excerpt:
      'Coverage generation, car colour and the shape of the blur narrow a guess before you look at the scenery.',
    keywords: 'camera, coverage, generation, geoguessr',
    metaTitle: 'What the camera car tells you in GeoGuessr',
    metaDescription:
      'Coverage generation, car colour, aerials and blur quality are clues in their own right, and they are visible in every single round.',
    daysAgo: 3,
    content: `<p>Every round shows you two things: a place, and the vehicle it was photographed from. Most players only look at the first one.</p>

<h2>Generation</h2>
<p>Street level imagery has been captured in distinct waves, and each wave has a look. Older coverage is softer, lower in dynamic range, and often shows a heavier vehicle. Newer coverage is sharp enough to read a shop sign across a street. Learning to place the image on that timeline tells you which countries are even possible: a country whose only coverage is old cannot produce a crisp modern image, and a country covered only recently cannot produce a soft one.</p>

<h2>The car itself</h2>
<p>Where the vehicle is visible, it is a clue with a name attached. Colour, roof rack, aerial, a visible snorkel, a trailer: these were used in specific countries in specific years. Some regions are famous for one distinctive vehicle, and recognising it is worth more than any amount of guessing at vegetation.</p>

<h2>Blur</h2>
<p>How faces and plates are obscured differs by region and by era, and so does how much of the vehicle itself is hidden. A heavily blurred bonnet, a blurred trailer, an unusually large blur patch: all of these repeat, and repetition is what a clue is.</p>

<h2>Making it a habit</h2>
<p>The car is always there. That is what makes it worth training: unlike a bollard or a plate, it cannot be absent from the shot. Check it in the same place in your routine every round, after the road and before the scenery, and it will start answering questions the landscape cannot.</p>`,
  },
  {
    locale: 'tr',
    slug: 'turun-ilk-bes-saniyesi',
    title: 'Turun ilk beş saniyesi',
    excerpt:
      'Yeni bir konumu her seferinde aynı sırayla okumak, bariz ipuçlarını kaçırmanı engeller.',
    keywords: 'geoguessr, yöntem, meta, teknik',
    metaTitle: 'GeoGuessr turunun ilk beş saniyesi',
    metaDescription:
      'Turun açılışı için sabit bir kontrol listesi: trafik yönü, yol çizgileri, dubalar, alfabe, bitki örtüsü ve aracın kendisi.',
    daysAgo: 20,
    content: `<p>Turların çoğu son otuz saniyede değil, ilk beş saniyede kaybedilir. Oyuncu yeni bir konuma düşer, tanıdık bir şey göremez ve rastgele dönmeye başlar. Tanıdık bir şey belirdiğinde, bariz ipuçlarının göz önünde durduğu bölüm çoktan harcanmıştır.</p>
<p>Çözümü sıkıcı ve işe yarıyor: her konumu her seferinde aynı sırayla oku.</p>

<h2>1. Trafik hangi yönden akıyor</h2>
<p>Oyunun en ucuz ipucu bu ve haritayı ikiye bölüyor. Park etmiş araçlara, karşıdan gelen araçta sürücünün yerine ya da çizgilerin kesiksiz olanını hangi tarafa koyduğuna bak. Solda trafik, tek bakışta Avrupa'nın, Amerika kıtasının ve Çin'in neredeyse tamamını eler.</p>

<h2>2. Yoldaki çizgiler</h2>
<p>Orta ve kenar çizgileri her havada ve her kamera açısında görünür. Sırayla üç soru sor: orta çizgi ne renk, kenarlar ne renk, çift olan var mı.</p>
<ul>
<li><strong>Sarı orta, beyaz kenar.</strong> Amerika kıtası ve Norveç.</li>
<li><strong>Beyaz orta, sarı kenar.</strong> Güney Afrika ve Asya'nın bazı bölgeleri.</li>
<li><strong>Hepsi beyaz.</strong> Avrupa'nın çoğu ve Avustralya.</li>
</ul>
<p>Bu tek soru seni bütün dünyadan tek bir kıtaya taşır.</p>

<h2>3. Duba</h2>
<p>Karede duba varsa dur ve doğru düzgün bak. Ülkeler bir biçim ve bir reflektör rengi seçip onlarca yıl dokunmuyor; dubaları yol kenarının en kararlı ipucu yapan da bu. Norveç dubası İsveç dubası değildir ve fark, kameranın verdiği çözünürlükte görülebilir.</p>

<h2>4. Yazı</h2>
<p>Latin olmayan alfabe işi hemen daraltır. Latin alfabesi daha ilginçtir: asıl mesele harflerin üstündeki işaretlerdir. İçinde <em>ő</em> geçen tek kelime seni Macaristan'a koyar; noktasız <em>ı</em> Türkiye'ye ya da Azerbaycan'a; <em>ș</em> ve <em>ț</em> Romanya'ya.</p>
<blockquote>Büyük tabelaları değil, küçükleri oku. Otoyol tabelası uzaktan okunmak için tasarlanır ve sade yazılır. Dükkân cephesi ise yerliler için yazılmıştır.</blockquote>

<h2>5. Araç ve kamera</h2>
<p>Son olarak neyin içinde olduğuna bak. Görünen kaput, rengi, port bagaj, anten, görüntünün netliği ve bulanıklığın uygulanma biçimi ülkeyi, bazen yılı daraltır. Bu, en son öğrenilen ipucudur ve yakın bir tahmini çoğu zaman o belirler.</p>

<h2>Sıra neden işe yarıyor</h2>
<p>Bunlardan herhangi biri eksik olabilir. Sabit sıranın amacı, turun açılışını neye bakacağına karar vererek harcamamandır. Bakarsın, beş soruyu cevaplarsın, geriye kalan harita başladığındakinden çok daha küçüktür.</p>`,
  },
  {
    locale: 'tr',
    slug: 'avrupa-dubalari',
    title: 'Avrupa dubalarına saha rehberi',
    excerpt:
      "Yol kenarı dubası neden Avrupa'nın en güvenilir ipucu ve bir dubayı hızla nasıl okursun.",
    keywords: 'duba, avrupa, geoguessr, meta',
    metaTitle: 'Avrupa dubalarına saha rehberi',
    metaDescription:
      "Yol kenarı dubaları Avrupa'nın en güvenilir ipucudur. Biçim, başlık ve reflektör rengi tahmini yaklaşık bir saniyede tek ülkeye indirir.",
    daysAgo: 13,
    content: `<p>Duba, yolun kenarında duran, üstünde reflektör olan kısa bir direktir. Karanlıkta sürücüye yolun nerede bittiğini göstermek için vardır. Bizim açımızdan ise her elli metrede bir dikilmiş bir kimlik kartıdır.</p>

<h2>Neden bu kadar güvenilirler</h2>
<p>Yol donanımı ulusal bir standartla belirlenir ve yüz binlerce adet kurulur. Bir ülke bir biçim seçtikten sonra onu değiştirmek, her yoldaki her direği değiştirmek demektir; bu yüzden tasarım hükûmetlerden uzun yaşar. Dubaları oyuncuların önce baktığı şeylerden daha iyi yapan da bu: binalar değişir, arabalar değişir, dubalar değişmez.</p>

<h2>Neye, hangi sırayla bakmalı</h2>
<ol>
<li><strong>Üst kısım.</strong> Düz, eğik, yuvarlak ya da başka renkte ayrı bir başlık.</li>
<li><strong>Reflektör.</strong> Rengi, biçimi ve iki yüzün farklı olup olmadığı.</li>
<li><strong>Gövde.</strong> Genişliği, incelip incelmediği ve siyah bant olup olmadığı.</li>
</ol>

<h2>Önce öğrenilmeye değenler</h2>
<ul>
<li><strong>Norveç.</strong> Düz kesilmiş baş, turuncu reflektör. Bir kez gördükten sonra İsveç'le karıştırmazsın.</li>
<li><strong>İsveç.</strong> Daha dar, reflektör direğin üstünde değil içine gömülü.</li>
<li><strong>Finlandiya.</strong> Genelde yıl boyu duran kar direkleriyle birlikte görünür, ki bu da kendi başına bir ipucudur.</li>
<li><strong>Polonya.</strong> Siyah bantlı gri beton; bilindikten sonra şaşmaz.</li>
<li><strong>Yunanistan.</strong> İnce, beyaz, komşularının yanında neredeyse zarif duran bir biçim.</li>
<li><strong>İspanya ve İtalya.</strong> İkisi de uzun ve ince; tek tek değil, birbirine karşı çalışılması gereken çift.</li>
</ul>

<h2>Nasıl çalışmalı</h2>
<p>Dubaları ülke ülke öğrenme. Gerçekten karıştırdığın çiftler hâlinde öğren: Norveç'e karşı İsveç, İspanya'ya karşı İtalya, Polonya'ya karşı Çekya. Yalnız başına çıktığında bilebildiğin kart, öğrenmediğin karttır.</p>`,
  },
  {
    locale: 'tr',
    slug: 'komsulari-ayirmak',
    title: 'Komşuları ayırmak oyunun tamamıdır',
    excerpt:
      'Kimse Finlandiya yerine Brezilya diyerek tur kaybetmiyor. Turlar birbirine benzeyen ülkeler arasında kaybediliyor.',
    keywords: 'geoguessr, karışıklık, pratik, yöntem',
    metaTitle: 'Komşuları ayırmak oyunun tamamıdır',
    metaDescription:
      'Turlar dünyanın iki ucundaki ülkeler arasında değil, birbirine benzeyenler arasında kaybedilir. Listeyi değil, çiftleri çalış.',
    daysAgo: 6,
    content: `<p>Puanlarının nereye gittiğine bak. Cevap Finlandiya iken Brezilya diyen neredeyse yok. Puanlar küçük aralıklarda kayboluyor: Türkiye ve Gürcistan, Norveç ve İsveç, Arjantin ve Uruguay, Malezya ve Endonezya, Çekya ve Slovakya.</p>

<h2>Listeler neden işe yaramıyor</h2>
<p>Alışılmış çalışma yöntemi ülke ülke ilerlemek: önce Norveç hakkında her şeyi oku, sonra İsveç. Verimli hissettirir ve yanlış şeyi çalıştırır. Sonunda, hangi ülkeye baktığını zaten bildiğinde ipucunu tanıyabilir hâle gelirsin; oysa tur sana asla o durumu vermez.</p>
<p>Turun verdiği şey bir görüntü ve bir tereddüttür. Ölçülen beceri hatırlamak değil, ayırt etmektir.</p>

<h2>Çiftler hâlinde çalış</h2>
<p>Sürekli birbirine karıştırdığın iki ülkeyi al ve onları her zaman ayıran tek özelliği bul. Beş özellik değil: hareket hâlindeki bir araçtan alınmış kötü bir ekran görüntüsünde bile görünen bir tane.</p>
<ul>
<li><strong>Norveç ve İsveç.</strong> Orta çizgi. Norveç sarı boyar, İsveç beyaz.</li>
<li><strong>Türkiye ve Gürcistan.</strong> Alfabe. Gürcüce kendi alfabesidir ve başka hiçbir şey ona benzemez.</li>
<li><strong>Arjantin ve Uruguay.</strong> Duba ve yol boyunca çitlerin sıklığı.</li>
</ul>
<p>Sonra çifti, cevap sen bakmayı bitirmeden gelene kadar tekrarla.</p>

<h2>Oturumu hatalarına seçtir</h2>
<p>En işe yarar çalışma seti özenle hazırlanmış olan değildir. Geçen hafta yanlış bildiğin ülkelerin listesidir. Buradaki zayıf noktalar modunun elini bir müfredattan değil senin kendi cevap geçmişinden kurmasının sebebi bu: kaçırmaya devam ettiğin kartlar daha sık gelir, oturmuş olanlar yoldan çekilir.</p>`,
  },
  {
    locale: 'tr',
    slug: 'arabanin-anlattiklari',
    title: 'Arabanın anlattıkları',
    excerpt:
      'Kapsama nesli, araç rengi ve bulanıklığın biçimi, sen manzaraya bakmadan tahmini daraltır.',
    keywords: 'kamera, kapsama, nesil, geoguessr',
    metaTitle: "GeoGuessr'da kamera aracı sana ne anlatır",
    metaDescription:
      'Kapsama nesli, araç rengi, antenler ve bulanıklık kalitesi başlı başına ipuçlarıdır ve her turda görünürler.',
    daysAgo: 2,
    content: `<p>Her tur sana iki şey gösterir: bir yer ve o yerin fotoğraflandığı araç. Oyuncuların çoğu yalnızca birincisine bakar.</p>

<h2>Nesil</h2>
<p>Sokak görüntüleri birbirinden ayrı dalgalar hâlinde toplandı ve her dalganın kendine has bir görünüşü var. Eski kapsama daha yumuşak, dinamik aralığı düşük ve genelde daha ağır bir araç gösteriyor. Yeni kapsama, caddenin karşısındaki dükkân tabelasını okuyacak kadar net. Görüntüyü bu zaman çizgisine yerleştirmeyi öğrenmek, hangi ülkelerin ihtimal dâhilinde olduğunu söyler: yalnızca eski kapsaması olan bir ülke net bir modern görüntü üretemez, yalnızca yeni kapsaması olan da yumuşak bir görüntü veremez.</p>

<h2>Aracın kendisi</h2>
<p>Araç göründüğünde, adı olan bir ipucudur. Renk, port bagaj, anten, görünen şnorkel, römork: bunlar belirli ülkelerde belirli yıllarda kullanıldı. Bazı bölgeler tek bir ayırt edici araçla tanınır ve onu tanımak, bitki örtüsü üzerinden yapılan her tahminden değerlidir.</p>

<h2>Bulanıklık</h2>
<p>Yüzlerin ve plakaların nasıl kapatıldığı bölgeye ve döneme göre değişir; aracın kendisinin ne kadarının gizlendiği de öyle. Ağır bulanıklaştırılmış bir kaput, bulanık bir römork, alışılmadık büyüklükte bir bulanık leke: hepsi tekrar eder ve ipucu dediğimiz şey zaten tekrardır.</p>

<h2>Alışkanlığa dönüştürmek</h2>
<p>Araç hep oradadır. Çalışmaya değer olmasının sebebi bu: bir dubanın ya da plakanın aksine karede olmaması mümkün değil. Rutininde her tur aynı yerde, yoldan sonra manzaradan önce kontrol et; manzaranın cevaplayamadığı soruları cevaplamaya başlayacak.</p>`,
  },
];
