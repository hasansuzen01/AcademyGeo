/**
 * Cards written up but still waiting for a photograph.
 *
 * The picture is the question, so these are seeded as drafts: they stay out of
 * every practice session and out of the atlas until an admin uploads a real
 * photograph and publishes them. Until then they are the editorial backlog, and
 * the admin overview counts them.
 *
 * The text is the half that does not depend on the picture: which country the
 * clue belongs to, what a player should be looking at, and how hard it is. All
 * an admin has to add is the photograph.
 */
import type { MetaCategory } from './catalogue.ts';

export interface CardSeed {
  slug: string;
  countryCode: string;
  category: MetaCategory;
  titleEn: string;
  titleTr: string;
  descriptionEn: string;
  descriptionTr: string;
  /** 1 = obvious at a glance, 5 = only recognisable to experienced players. */
  difficulty: number;
}

export const DRAFT_CARDS: CardSeed[] = [
  // -- Number plates ---------------------------------------------------------
  {
    slug: 'es-plate',
    countryCode: 'ES',
    category: 'PLATE',
    titleEn: 'Blue at both ends, E on the left',
    titleTr: 'İki ucu mavi, solda E',
    descriptionEn:
      'Spanish plates carry the EU band with an E on the left and a second blue strip on the right. Four digits then three letters, with no space you can mistake for anything else in western Europe.',
    descriptionTr:
      'İspanya plakalarında solda E harfli AB şeridi, sağda ikinci bir mavi şerit bulunur. Dört rakam ve üç harf; Batı Avrupa’da başka hiçbir düzenle karıştırılmaz.',
    difficulty: 2,
  },
  {
    slug: 'gr-plate',
    countryCode: 'GR',
    category: 'PLATE',
    titleEn: 'EU band with GR and only shared letters',
    titleTr: 'GR yazan AB şeridi ve yalnızca ortak harfler',
    descriptionEn:
      'Greek plates use only the letters Greek and Latin share, so they read as Latin at a glance. Three letters, a dash, four digits, and a GR in the blue band.',
    descriptionTr:
      'Yunan plakalarında yalnızca Yunan ve Latin alfabesinin ortak harfleri kullanılır, bu yüzden ilk bakışta Latin gibi okunur. Üç harf, tire, dört rakam ve mavi şeritte GR.',
    difficulty: 2,
  },
  {
    slug: 'pl-plate',
    countryCode: 'PL',
    category: 'PLATE',
    titleEn: 'EU band with PL and a long, narrow plate',
    titleTr: 'PL yazan AB şeridi ve uzun, dar plaka',
    descriptionEn:
      'Polish plates are noticeably long and thin, with a red-and-white national mark in the blue band above the PL. The first letters give the region away.',
    descriptionTr:
      'Polonya plakaları belirgin şekilde uzun ve incedir; mavi şeritte PL’nin üstünde kırmızı-beyaz ulusal işaret bulunur. İlk harfler bölgeyi ele verir.',
    difficulty: 2,
  },
  {
    slug: 'no-plate',
    countryCode: 'NO',
    category: 'PLATE',
    titleEn: 'Two letters, five digits, and a red seal',
    titleTr: 'İki harf, beş rakam ve kırmızı mühür',
    descriptionEn:
      'Norwegian plates run two letters then five digits, wider spaced than the neighbours, with a small red inspection seal on the left of the characters.',
    descriptionTr:
      'Norveç plakalarında iki harf ve beş rakam bulunur; aralıkları komşularınkinden geniştir ve karakterlerin solunda küçük kırmızı bir muayene mührü vardır.',
    difficulty: 3,
  },
  {
    slug: 'se-plate',
    countryCode: 'SE',
    category: 'PLATE',
    titleEn: 'Three letters, three characters, and a small crown',
    titleTr: 'Üç harf, üç karakter ve küçük bir taç',
    descriptionEn:
      'Swedish plates read three letters then three characters, with a small yellow crown stamped between them. The blue band carries an S.',
    descriptionTr:
      'İsveç plakalarında üç harf ve üç karakter bulunur; aralarına küçük sarı bir taç basılmıştır. Mavi şeritte S harfi yer alır.',
    difficulty: 3,
  },
  {
    slug: 'fi-plate',
    countryCode: 'FI',
    category: 'PLATE',
    titleEn: 'EU band with FIN and a dash in the middle',
    titleTr: 'FIN yazan AB şeridi ve ortada tire',
    descriptionEn:
      'Finnish plates use the three-letter country mark FIN rather than a single letter, and split three letters from three digits with a clear dash.',
    descriptionTr:
      'Finlandiya plakalarında tek harf yerine üç harfli FIN ülke işareti kullanılır ve üç harfle üç rakam belirgin bir tireyle ayrılır.',
    difficulty: 3,
  },
  {
    slug: 'ru-plate',
    countryCode: 'RU',
    category: 'PLATE',
    titleEn: 'A flag block on the right with RUS under it',
    titleTr: 'Sağda bayrak bloğu, altında RUS',
    descriptionEn:
      'Russian plates put a small block on the right holding the region number and, under it, the flag with RUS. The letters used are only those Cyrillic shares with Latin.',
    descriptionTr:
      'Rusya plakalarında sağda bölge numarasını ve altında RUS yazan bayrağı taşıyan küçük bir blok vardır. Kullanılan harfler yalnızca Kiril ile Latin’in ortak olanlarıdır.',
    difficulty: 2,
  },
  {
    slug: 'it-plate',
    countryCode: 'IT',
    category: 'PLATE',
    titleEn: 'Blue at both ends, province on the right',
    titleTr: 'İki ucu mavi, sağda il kodu',
    descriptionEn:
      'Italian plates carry a blue band at each end: the EU band with an I on the left, and on the right a blue strip with the province code and the year.',
    descriptionTr:
      'İtalya plakalarının iki ucunda da mavi şerit vardır: solda I harfli AB şeridi, sağda il kodunu ve yılı taşıyan mavi şerit.',
    difficulty: 2,
  },
  {
    slug: 'us-plate',
    countryCode: 'US',
    category: 'PLATE',
    titleEn: 'A different plate in every state',
    titleTr: 'Her eyalette farklı bir plaka',
    descriptionEn:
      'American plates are designed per state, so the colour and the graphic narrow the region on their own. Many states issue a rear plate only, which is itself a clue.',
    descriptionTr:
      'Amerikan plakaları eyalet eyalet tasarlanır, bu yüzden renk ve grafik tek başına bölgeyi daraltır. Birçok eyalet yalnızca arka plaka verir, bu da başlı başına bir ipucudur.',
    difficulty: 1,
  },
  {
    slug: 'ca-plate',
    countryCode: 'CA',
    category: 'PLATE',
    titleEn: 'Province plates, and often no front plate',
    titleTr: 'Eyalet plakaları ve çoğu zaman ön plaka yok',
    descriptionEn:
      'Canadian plates are issued per province and several provinces require no front plate at all. Quebec plates carry a French slogan, which settles the province immediately.',
    descriptionTr:
      'Kanada plakaları eyalet bazında verilir ve birkaç eyalette ön plaka hiç istenmez. Quebec plakaları Fransızca bir slogan taşır ve eyaleti anında belli eder.',
    difficulty: 3,
  },
  {
    slug: 'mx-plate',
    countryCode: 'MX',
    category: 'PLATE',
    titleEn: 'A state graphic and MEXICO across the top',
    titleTr: 'Eyalet grafiği ve üstte MEXICO yazısı',
    descriptionEn:
      'Mexican plates are printed per state with a large colour graphic and the word MEXICO along the top edge. The design changes often, so the graphic matters more than the format.',
    descriptionTr:
      'Meksika plakaları eyalet bazında, büyük renkli bir grafikle ve üst kenarında MEXICO yazısıyla basılır. Tasarım sık değişir, bu yüzden grafik biçimden daha önemlidir.',
    difficulty: 2,
  },
  {
    slug: 'cl-plate',
    countryCode: 'CL',
    category: 'PLATE',
    titleEn: 'A blue strip at the top reading CHILE',
    titleTr: 'Üstte CHILE yazan mavi şerit',
    descriptionEn:
      'Chilean plates carry a thin blue strip along the top with CHILE in white, over four letters and two digits in black on white.',
    descriptionTr:
      'Şili plakalarında üst kenar boyunca beyaz CHILE yazan ince mavi bir şerit vardır; altında beyaz zemin üstünde siyah dört harf ve iki rakam bulunur.',
    difficulty: 3,
  },
  {
    slug: 'th-plate',
    countryCode: 'TH',
    category: 'PLATE',
    titleEn: 'Thai script above the numbers',
    titleTr: 'Rakamların üstünde Tay alfabesi',
    descriptionEn:
      'Thai plates put two Thai characters and the numbers on the main line, with the province written in Thai across the bottom. The script alone settles the country.',
    descriptionTr:
      'Tayland plakalarında ana satırda iki Tay karakteri ve rakamlar, altta ise Tayca yazılmış il adı bulunur. Alfabe tek başına ülkeyi belirler.',
    difficulty: 1,
  },
  {
    slug: 'au-plate',
    countryCode: 'AU',
    category: 'PLATE',
    titleEn: 'A state slogan along the bottom',
    titleTr: 'Alt kenarda eyalet sloganı',
    descriptionEn:
      'Australian plates are issued per state and most carry a slogan along the bottom edge naming it. The plate is usually white with dark characters.',
    descriptionTr:
      'Avustralya plakaları eyalet bazında verilir ve çoğu alt kenarında eyaleti adlandıran bir slogan taşır. Plaka genelde beyaz zemin üstüne koyu karakterlidir.',
    difficulty: 2,
  },
  {
    slug: 'nz-plate',
    countryCode: 'NZ',
    category: 'PLATE',
    titleEn: 'Plain white, black characters, no band',
    titleTr: 'Düz beyaz, siyah karakterler, şerit yok',
    descriptionEn:
      'New Zealand plates are plain white with black characters and no country band or slogan at all. Set against left-hand traffic and tree fern, the absence is the clue.',
    descriptionTr:
      'Yeni Zelanda plakaları düz beyaz zemin üstüne siyah karakterlidir; ülke şeridi ya da slogan yoktur. Solda trafik ve ağaç eğreltisiyle birlikte, bu yokluk ipucunun kendisidir.',
    difficulty: 3,
  },
  {
    slug: 'za-plate',
    countryCode: 'ZA',
    category: 'PLATE',
    titleEn: 'A province code at the end of the plate',
    titleTr: 'Plakanın sonunda il kodu',
    descriptionEn:
      'South African plates end in a province code, so the plate names the region as well as the country. Formats differ enough between provinces to be worth learning separately.',
    descriptionTr:
      'Güney Afrika plakaları il koduyla biter, yani plaka ülkeyle birlikte bölgeyi de söyler. Biçimler iller arasında ayrı ayrı öğrenmeye değecek kadar farklıdır.',
    difficulty: 3,
  },

  // -- Bollards --------------------------------------------------------------
  {
    slug: 'fr-bollard',
    countryCode: 'FR',
    category: 'BOLLARD',
    titleEn: 'Red cap on a white post',
    titleTr: 'Beyaz direk üstünde kırmızı başlık',
    descriptionEn:
      'French bollards are white with a red top, wide and flat-faced rather than rounded. They line the verge at close intervals on rural roads.',
    descriptionTr:
      'Fransız dubaları beyaz gövdeli ve kırmızı başlıklıdır; yuvarlak değil, geniş ve düz yüzeylidir. Kırsal yollarda yol kenarını sık aralıklarla dizer.',
    difficulty: 2,
  },
  {
    slug: 'de-bollard',
    countryCode: 'DE',
    category: 'BOLLARD',
    titleEn: 'Grey and white with a black band',
    titleTr: 'Siyah bantlı gri-beyaz',
    descriptionEn:
      'German bollards are grey-white with a black band and an angled top. Coverage in Germany is old and scarce, so seeing one at all is already a clue.',
    descriptionTr:
      'Alman dubaları siyah bantlı gri-beyazdır ve üstü eğiktir. Almanya’da kapsama eski ve seyrek olduğu için böyle bir dubayı görmek bile başlı başına ipucudur.',
    difficulty: 3,
  },
  {
    slug: 'nl-bollard',
    countryCode: 'NL',
    category: 'BOLLARD',
    titleEn: 'Slim white post beside a red cycle path',
    titleTr: 'Kırmızı bisiklet yolunun yanında ince beyaz direk',
    descriptionEn:
      'Dutch bollards are slim and white, and they almost always appear beside the red asphalt of a cycle path. The pair together is more reliable than either alone.',
    descriptionTr:
      'Hollanda dubaları ince ve beyazdır ve neredeyse her zaman bisiklet yolunun kırmızı asfaltının yanında görünür. İkisi birlikte, tek başına her birinden daha güvenilirdir.',
    difficulty: 3,
  },
  {
    slug: 'gb-bollard',
    countryCode: 'GB',
    category: 'BOLLARD',
    titleEn: 'Marker post with a chevron',
    titleTr: 'Ok işaretli kenar direği',
    descriptionEn:
      'British verges carry a slim marker post with a coloured reflector and, on bends, a black chevron. It appears alongside yellow kerb lines and left-hand traffic.',
    descriptionTr:
      'Britanya yol kenarlarında renkli reflektörlü ince bir kenar direği bulunur; virajlarda siyah ok işareti eklenir. Sarı kaldırım çizgileri ve solda trafikle birlikte görünür.',
    difficulty: 3,
  },
  {
    slug: 'ru-bollard',
    countryCode: 'RU',
    category: 'BOLLARD',
    titleEn: 'White post with a black cap',
    titleTr: 'Siyah başlıklı beyaz direk',
    descriptionEn:
      'Russian bollards are white with a black cap, set well back from a wide unpainted shoulder. They read as plainer than any western European equivalent.',
    descriptionTr:
      'Rus dubaları siyah başlıklı beyazdır ve geniş, boyasız banketten epey geride durur. Batı Avrupa’daki hiçbir eşdeğerine göre daha sade görünür.',
    difficulty: 3,
  },

  // -- Road markings ---------------------------------------------------------
  {
    slug: 'no-road',
    countryCode: 'NO',
    category: 'ROAD_LINE',
    titleEn: 'Yellow centre line in Scandinavia',
    titleTr: 'İskandinavya’da sarı orta çizgi',
    descriptionEn:
      'Norway paints its centre line yellow where every neighbour paints it white. Against a Scandinavian scene, that one colour settles the country.',
    descriptionTr:
      'Norveç, bütün komşuları beyaz kullanırken orta çizgisini sarıya boyar. İskandinav bir manzarada bu tek renk ülkeyi belirler.',
    difficulty: 2,
  },
  {
    slug: 'se-road',
    countryCode: 'SE',
    category: 'ROAD_LINE',
    titleEn: 'White centre line where Norway uses yellow',
    titleTr: 'Norveç sarı kullanırken beyaz orta çizgi',
    descriptionEn:
      'Sweden keeps its centre line white. In pine forest that could be either country, the line is the first thing to look at, not the trees.',
    descriptionTr:
      'İsveç orta çizgisini beyaz tutar. İki ülkeden biri olabilecek bir çam ormanında ilk bakılacak şey ağaçlar değil, çizgidir.',
    difficulty: 3,
  },
  {
    slug: 'fi-road',
    countryCode: 'FI',
    category: 'ROAD_LINE',
    titleEn: 'White lines between year-round snow poles',
    titleTr: 'Yıl boyu duran kar direkleri arasında beyaz çizgiler',
    descriptionEn:
      'Finnish roads pair white markings with tall snow poles that stay up through the summer. The poles are what separates it from Sweden in flat forest.',
    descriptionTr:
      'Fin yollarında beyaz çizgiler, yaz boyunca da sökülmeyen uzun kar direkleriyle birlikte görülür. Düz ormanda İsveç’ten ayıran şey bu direklerdir.',
    difficulty: 3,
  },
  {
    slug: 'pl-road',
    countryCode: 'PL',
    category: 'ROAD_LINE',
    titleEn: 'White lines and a wide unpainted shoulder',
    titleTr: 'Beyaz çizgiler ve geniş boyasız banket',
    descriptionEn:
      'Polish rural roads often carry a centre line and no edge line at all, running straight into a wide gravel shoulder lined with trees.',
    descriptionTr:
      'Polonya kırsal yollarında çoğu zaman orta çizgi vardır ama kenar çizgisi hiç yoktur; yol doğrudan ağaçlarla çevrili geniş bir çakıl bankete karışır.',
    difficulty: 4,
  },
  {
    slug: 'au-road',
    countryCode: 'AU',
    category: 'ROAD_LINE',
    titleEn: 'Sealed shoulder over red gravel',
    titleTr: 'Kızıl çakıl üstünde asfalt banket',
    descriptionEn:
      'Australian highways run white lines over a wide sealed shoulder, with red gravel beyond it. Left-hand traffic rules out the Americas at the same time.',
    descriptionTr:
      'Avustralya karayollarında beyaz çizgiler geniş bir asfalt banketin üstünden geçer, ötesinde kızıl çakıl vardır. Solda trafik aynı anda Amerika kıtasını eler.',
    difficulty: 3,
  },
  {
    slug: 'jp-road',
    countryCode: 'JP',
    category: 'ROAD_LINE',
    titleEn: 'Narrow streets with no centre line at all',
    titleTr: 'Orta çizgisi hiç olmayan dar sokaklar',
    descriptionEn:
      'Japanese residential streets are narrow, kerbless, and often carry no centre line, only a painted edge strip marking where pedestrians walk.',
    descriptionTr:
      'Japon mahalle sokakları dar ve kaldırımsızdır; çoğu zaman orta çizgi yoktur, yalnızca yayaların yürüdüğü yeri gösteren boyalı bir kenar şeridi bulunur.',
    difficulty: 2,
  },
  {
    slug: 'br-road',
    countryCode: 'BR',
    category: 'ROAD_LINE',
    titleEn: 'Yellow centre line and a striped kerb',
    titleTr: 'Sarı orta çizgi ve çizgili kaldırım kenarı',
    descriptionEn:
      'Brazilian roads use a yellow centre line with white edges, and kerbs are painted in black and white stripes through towns.',
    descriptionTr:
      'Brezilya yollarında beyaz kenarlarla birlikte sarı orta çizgi kullanılır; kasabalarda kaldırım kenarları siyah-beyaz şeritli boyanır.',
    difficulty: 2,
  },
  {
    slug: 'ar-road',
    countryCode: 'AR',
    category: 'ROAD_LINE',
    titleEn: 'White centre line across flat pampas',
    titleTr: 'Düz pampalarda beyaz orta çizgi',
    descriptionEn:
      'Argentine roads use white markings, unlike most of South America, and run dead straight through fenced pampas with eucalyptus windbreaks.',
    descriptionTr:
      'Arjantin yolları Güney Amerika’nın çoğunun aksine beyaz çizgi kullanır ve okaliptüs rüzgâr perdeleriyle çevrili pampalarda dümdüz uzanır.',
    difficulty: 3,
  },
  {
    slug: 'in-road',
    countryCode: 'IN',
    category: 'ROAD_LINE',
    titleEn: 'Yellow and black striped kerbs',
    titleTr: 'Sarı-siyah çizgili kaldırım kenarları',
    descriptionEn:
      'Indian roads paint kerbs and roadside stones in yellow and black stripes. Add left-hand traffic and Devanagari on the signs and the country is settled.',
    descriptionTr:
      'Hindistan yollarında kaldırım kenarları ve yol kenarı taşları sarı-siyah şeritli boyanır. Buna solda trafik ve tabelalardaki Devanagari eklenince ülke kesinleşir.',
    difficulty: 2,
  },
  {
    slug: 'th-road',
    countryCode: 'TH',
    category: 'ROAD_LINE',
    titleEn: 'Red and white striped kerbs',
    titleTr: 'Kırmızı-beyaz çizgili kaldırım kenarları',
    descriptionEn:
      'Thai kerbs are painted in red and white stripes where stopping is not allowed, which is most of the roadside. The stripes are visible long before any sign.',
    descriptionTr:
      'Tayland’da durmanın yasak olduğu yerlerde kaldırım kenarları kırmızı-beyaz şeritli boyanır ki bu yol kenarının çoğudur. Şeritler herhangi bir tabeladan çok önce görünür.',
    difficulty: 2,
  },

  // -- Script and signage ----------------------------------------------------
  {
    slug: 'gr-script',
    countryCode: 'GR',
    category: 'LANGUAGE',
    titleEn: 'Greek, repeated in Latin underneath',
    titleTr: 'Yunanca, altında Latin harfleriyle tekrar',
    descriptionEn:
      'Greek road signs give the place name in Greek and repeat it in Latin below. No other alphabet looks like it, so one sign is enough.',
    descriptionTr:
      'Yunan yol tabelalarında yer adı Yunanca yazılır ve altında Latin harfleriyle tekrarlanır. Başka hiçbir alfabe ona benzemez, bu yüzden tek tabela yeter.',
    difficulty: 1,
  },
  {
    slug: 'in-script',
    countryCode: 'IN',
    category: 'LANGUAGE',
    titleEn: 'Devanagari beside English',
    titleTr: 'İngilizcenin yanında Devanagari',
    descriptionEn:
      'The horizontal bar running along the top of the letters is the giveaway. Indian signs pair Devanagari with English, and often a third regional script.',
    descriptionTr:
      'Harflerin üstünde uzanan yatay çizgi işi ele verir. Hindistan tabelalarında Devanagari İngilizceyle, çoğu zaman üçüncü bir bölgesel alfabeyle birlikte kullanılır.',
    difficulty: 1,
  },
  {
    slug: 'pl-script',
    countryCode: 'PL',
    category: 'LANGUAGE',
    titleEn: 'Latin with ł, ż and ę',
    titleTr: 'ł, ż ve ę içeren Latin alfabesi',
    descriptionEn:
      'Polish is Latin script with a set of marks no neighbour shares: a crossed ł, a dotted ż, and tails under a and e. One shop sign is usually enough.',
    descriptionTr:
      'Lehçe, hiçbir komşusunda bulunmayan işaretlerle yazılan Latin alfabesidir: çizgili ł, noktalı ż ve a ile e altındaki kuyruklar. Genelde tek bir dükkân tabelası yeter.',
    difficulty: 2,
  },
  {
    slug: 'tr-script',
    countryCode: 'TR',
    category: 'LANGUAGE',
    titleEn: 'Dotless ı beside dotted i',
    titleTr: 'Noktalı i ile noktasız ı yan yana',
    descriptionEn:
      'Turkish is the language that writes both a dotted and a dotless i, and adds ç, ğ, ş and ö. Seeing an ı in the middle of a word settles it.',
    descriptionTr:
      'Türkçe hem noktalı hem noktasız i yazan dildir; buna ç, ğ, ş ve ö eklenir. Bir kelimenin ortasında ı görmek meseleyi bitirir.',
    difficulty: 2,
  },
  {
    slug: 'no-script',
    countryCode: 'NO',
    category: 'LANGUAGE',
    titleEn: 'æ, ø and å on the signs',
    titleTr: 'Tabelalarda æ, ø ve å',
    descriptionEn:
      'Norwegian and Danish share æ and ø, where Swedish uses ä and ö instead. In a Norwegian scene the yellow centre line confirms which of the two you are in.',
    descriptionTr:
      'Norveççe ve Danca æ ile ø harflerini paylaşır; İsveççe bunların yerine ä ve ö kullanır. Norveç manzarasında sarı orta çizgi ikisinden hangisinde olduğunu doğrular.',
    difficulty: 3,
  },

  // -- Vegetation and landscape ---------------------------------------------
  {
    slug: 'br-vegetation',
    countryCode: 'BR',
    category: 'VEGETATION',
    titleEn: 'Red laterite soil under dense green',
    titleTr: 'Yoğun yeşilin altında kırmızı toprak',
    descriptionEn:
      'Inland Brazil pairs deep red soil with dense green growth right up to the verge. The colour contrast is stronger than anywhere else in South America.',
    descriptionTr:
      'Brezilya’nın iç kesimlerinde koyu kırmızı toprak, yol kenarına kadar inen yoğun yeşille birlikte görülür. Renk karşıtlığı Güney Amerika’nın hiçbir yerinde bu kadar güçlü değildir.',
    difficulty: 3,
  },
  {
    slug: 'id-vegetation',
    countryCode: 'ID',
    category: 'VEGETATION',
    titleEn: 'Banana and palm in permanent damp',
    titleTr: 'Sürekli nemde muz ve palmiye',
    descriptionEn:
      'Indonesian roadsides carry banana, palm and dense undergrowth that never dries out, with rice terraces on any slope. Left-hand traffic rules out most of the region.',
    descriptionTr:
      'Endonezya yol kenarlarında hiç kurumayan muz, palmiye ve sık çalılık; her yamaçta pirinç terasları bulunur. Solda trafik bölgenin çoğunu eler.',
    difficulty: 3,
  },
  {
    slug: 'za-vegetation',
    countryCode: 'ZA',
    category: 'VEGETATION',
    titleEn: 'Flat-topped acacia over dry grass',
    titleTr: 'Kuru otların üstünde düz tepeli akasya',
    descriptionEn:
      'South African veld is pale dry grass under widely spaced acacia with flat crowns. Fences run along the road almost everywhere.',
    descriptionTr:
      'Güney Afrika bozkırı, seyrek aralıklı düz taçlı akasyaların altında soluk kuru ottur. Neredeyse her yerde yol boyunca çit uzanır.',
    difficulty: 2,
  },
  {
    slug: 'nz-vegetation',
    countryCode: 'NZ',
    category: 'VEGETATION',
    titleEn: 'Tree fern on steep green hills',
    titleTr: 'Dik yeşil tepelerde ağaç eğreltisi',
    descriptionEn:
      'New Zealand looks like nowhere else: very steep, very green sheep country with tree fern in the gullies rather than eucalyptus on the ridges.',
    descriptionTr:
      'Yeni Zelanda başka hiçbir yere benzemez: çok dik, çok yeşil koyun otlakları ve sırtlarda okaliptüs yerine derelerde ağaç eğreltisi.',
    difficulty: 2,
  },
  {
    slug: 'ru-vegetation',
    countryCode: 'RU',
    category: 'VEGETATION',
    titleEn: 'Birch stands along the verge',
    titleTr: 'Yol kenarında huş toplulukları',
    descriptionEn:
      'White-trunked birch mixed into conifer is the standard Russian roadside, running for hundreds of kilometres without a change in the scene.',
    descriptionTr:
      'İğne yapraklılara karışmış beyaz gövdeli huş, standart Rus yol kenarıdır; manzara değişmeden yüzlerce kilometre böyle sürer.',
    difficulty: 3,
  },
  {
    slug: 'cl-vegetation',
    countryCode: 'CL',
    category: 'VEGETATION',
    titleEn: 'Desert in the north, mountains to the east',
    titleTr: 'Kuzeyde çöl, doğuda dağlar',
    descriptionEn:
      'Chile is long and thin, so the mountains are almost always to the east and the sea to the west. Bare desert in the north gives way to green farmland in the middle.',
    descriptionTr:
      'Şili uzun ve incedir; dağlar neredeyse her zaman doğuda, deniz batıdadır. Kuzeydeki çıplak çöl, ortada yeşil tarım arazisine bırakır.',
    difficulty: 2,
  },

  // -- Architecture ----------------------------------------------------------
  {
    slug: 'gr-architecture',
    countryCode: 'GR',
    category: 'ARCHITECTURE',
    titleEn: 'White render and flat roofs left unfinished',
    titleTr: 'Beyaz sıva ve tamamlanmamış düz çatılar',
    descriptionEn:
      'Greek houses are white or pale render on a concrete frame, with flat roofs and rebar left standing for a floor that may never be built.',
    descriptionTr:
      'Yunan evleri beton karkas üstüne beyaz ya da açık renk sıvalıdır; çatılar düzdür ve hiç yapılmayabilecek bir kat için demirler dikili bırakılmıştır.',
    difficulty: 3,
  },
  {
    slug: 'nl-architecture',
    countryCode: 'NL',
    category: 'ARCHITECTURE',
    titleEn: 'Brick terraces with tall narrow windows',
    titleTr: 'Uzun dar pencereli tuğla sıra evler',
    descriptionEn:
      'Dutch housing is brick, terraced, and built with unusually large windows and no curtains. The rows sit right on the pavement with no front garden.',
    descriptionTr:
      'Hollanda konutları tuğladan, bitişik nizamdır; alışılmadık büyüklükte pencereleri vardır ve perde kullanılmaz. Sıralar ön bahçesiz, doğrudan kaldırıma oturur.',
    difficulty: 2,
  },
  {
    slug: 'mx-architecture',
    countryCode: 'MX',
    category: 'ARCHITECTURE',
    titleEn: 'Flat concrete roofs with standing rebar',
    titleTr: 'Dikili demirli düz beton çatılar',
    descriptionEn:
      'Mexican houses are concrete with flat roofs, painted in strong flat colours, and almost always have rebar standing up from the roof slab.',
    descriptionTr:
      'Meksika evleri düz çatılı betondur, güçlü düz renklerle boyanır ve neredeyse her zaman çatı döşemesinden yukarı dikilen demirler bulunur.',
    difficulty: 3,
  },
  {
    slug: 'in-architecture',
    countryCode: 'IN',
    category: 'ARCHITECTURE',
    titleEn: 'Rooftop water tanks on concrete frames',
    titleTr: 'Beton karkasların üstünde çatı su depoları',
    descriptionEn:
      'Indian buildings are concrete frames with brick infill, and nearly every roof carries a black plastic water tank. The tanks are visible from any distance.',
    descriptionTr:
      'Hindistan binaları tuğla dolgulu beton karkastır ve neredeyse her çatıda siyah plastik bir su deposu bulunur. Depolar her mesafeden görünür.',
    difficulty: 2,
  },
  {
    slug: 'ng-architecture',
    countryCode: 'NG',
    category: 'ARCHITECTURE',
    titleEn: 'Corrugated roofs over unrendered blockwork',
    titleTr: 'Sıvasız briket üstünde oluklu sac çatılar',
    descriptionEn:
      'Nigerian buildings are commonly unrendered concrete block under corrugated metal roofing, with red laterite dust over everything at the roadside.',
    descriptionTr:
      'Nijerya binaları çoğunlukla sıvasız beton briket üstüne oluklu metal çatıdır; yol kenarında her şeyin üstünde kırmızı laterit tozu vardır.',
    difficulty: 3,
  },
  {
    slug: 'se-architecture',
    countryCode: 'SE',
    category: 'ARCHITECTURE',
    titleEn: 'Falu red timber with white trim',
    titleTr: 'Beyaz çerçeveli Falu kırmızısı ahşap',
    descriptionEn:
      'The deep red timber house with white window frames is the Swedish signature. Norway has them too, so check the centre line before committing.',
    descriptionTr:
      'Beyaz pencere çerçeveli koyu kırmızı ahşap ev İsveç’in imzasıdır. Norveç’te de bulunur, bu yüzden karar vermeden önce orta çizgiye bakın.',
    difficulty: 2,
  },

  // -- Roadside infrastructure ----------------------------------------------
  {
    slug: 'th-poles',
    countryCode: 'TH',
    category: 'INFRASTRUCTURE',
    titleEn: 'Square concrete power poles',
    titleTr: 'Kare kesitli beton elektrik direkleri',
    descriptionEn:
      'Thai power poles are square in section rather than round, which separates Thailand from its neighbours before you have read a single sign.',
    descriptionTr:
      'Tayland elektrik direkleri yuvarlak değil kare kesitlidir; bu, tek bir tabela okumadan Tayland’ı komşularından ayırır.',
    difficulty: 2,
  },
  {
    slug: 'id-poles',
    countryCode: 'ID',
    category: 'INFRASTRUCTURE',
    titleEn: 'Round poles under a tangle of low cable',
    titleTr: 'Alçak kablo yumağının altında yuvarlak direkler',
    descriptionEn:
      'Indonesian streets run round concrete poles carrying a dense, low tangle of cable, often within reach of a first-floor window.',
    descriptionTr:
      'Endonezya sokaklarında yuvarlak beton direkler, çoğu zaman birinci kat penceresinden uzanılabilecek kadar alçak ve yoğun bir kablo yumağı taşır.',
    difficulty: 3,
  },
  {
    slug: 'br-poles',
    countryCode: 'BR',
    category: 'INFRASTRUCTURE',
    titleEn: 'Concrete poles with a wide cross-arm',
    titleTr: 'Geniş traversli beton direkler',
    descriptionEn:
      'Brazilian power poles are concrete with a wide horizontal cross-arm near the top, standing over black and white striped kerbs.',
    descriptionTr:
      'Brezilya elektrik direkleri betondur ve tepeye yakın geniş bir yatay travers taşır; altlarında siyah-beyaz şeritli kaldırım kenarları uzanır.',
    difficulty: 3,
  },
  {
    slug: 'us-poles',
    countryCode: 'US',
    category: 'INFRASTRUCTURE',
    titleEn: 'Wooden poles carrying everything',
    titleTr: 'Her şeyi taşıyan ahşap direkler',
    descriptionEn:
      'American streets run untreated wooden poles carrying power, phone and cable all at once, usually on one side of the road only.',
    descriptionTr:
      'Amerikan sokaklarında işlenmemiş ahşap direkler elektriği, telefonu ve kabloyu aynı anda taşır; genelde yolun yalnızca bir tarafında dizilir.',
    difficulty: 2,
  },
  {
    slug: 'pl-poles',
    countryCode: 'PL',
    category: 'INFRASTRUCTURE',
    titleEn: 'Grey concrete poles with a hooked top',
    titleTr: 'Kancalı tepeli gri beton direkler',
    descriptionEn:
      'Polish rural power poles are grey concrete with a distinctive hooked or angled top carrying a single line, standing in fields beside the road.',
    descriptionTr:
      'Polonya kırsalındaki elektrik direkleri gri betondur; tek hat taşıyan belirgin kancalı ya da eğik bir tepesi vardır ve yol kenarındaki tarlalarda dikilirler.',
    difficulty: 4,
  },
  {
    slug: 'ke-poles',
    countryCode: 'KE',
    category: 'INFRASTRUCTURE',
    titleEn: 'Concrete poles over red earth verges',
    titleTr: 'Kırmızı toprak banketlerin üstünde beton direkler',
    descriptionEn:
      'Kenyan roads run concrete poles beside a tarmac strip with bare red earth on both sides, and pedestrians walking on the earth rather than a pavement.',
    descriptionTr:
      'Kenya yollarında beton direkler, iki yanı çıplak kırmızı toprak olan asfalt şeridin kenarında dizilir; yayalar kaldırımda değil toprakta yürür.',
    difficulty: 3,
  },

  // -- The camera and the car ------------------------------------------------
  {
    slug: 'de-camera',
    countryCode: 'DE',
    category: 'CAMERA',
    titleEn: 'Old, soft coverage and very little of it',
    titleTr: 'Eski, yumuşak ve çok az kapsama',
    descriptionEn:
      'German official coverage dates from a single early campaign, so it looks soft and low in contrast next to any neighbour. Its rarity is half the clue.',
    descriptionTr:
      'Almanya’nın resmî kapsaması tek bir erken çekimden gelir, bu yüzden herhangi bir komşusunun yanında yumuşak ve düşük kontrastlı görünür. Nadirliği ipucunun yarısıdır.',
    difficulty: 2,
  },
  {
    slug: 'in-camera',
    countryCode: 'IN',
    category: 'CAMERA',
    titleEn: 'Recent, unusually sharp imagery',
    titleTr: 'Yeni ve alışılmadık ölçüde net görüntü',
    descriptionEn:
      'Indian coverage was captured recently and is sharp enough to read a shop sign across the street. Sharpness plus left-hand traffic is a narrow combination.',
    descriptionTr:
      'Hindistan kapsaması yakın zamanda çekildi ve caddenin karşısındaki dükkân tabelasını okuyacak kadar nettir. Netlikle solda trafiğin birleşimi dardır.',
    difficulty: 3,
  },
  {
    slug: 'ru-camera',
    countryCode: 'RU',
    category: 'CAMERA',
    titleEn: 'Older imagery with heavy compression',
    titleTr: 'Ağır sıkıştırmalı eski görüntü',
    descriptionEn:
      'Much Russian coverage is older and visibly compressed, with washed-out skies. Against birch and Cyrillic it confirms rather than decides.',
    descriptionTr:
      'Rusya kapsamasının çoğu eskidir ve görünür şekilde sıkıştırılmıştır, gökyüzü soluk çıkar. Huş ağaçları ve Kiril alfabesiyle birlikte karar verdirmez, doğrular.',
    difficulty: 3,
  },
  {
    slug: 'ng-camera',
    countryCode: 'NG',
    category: 'CAMERA',
    titleEn: 'Recent coverage, and hardly any of it',
    titleTr: 'Yeni ama neredeyse hiç olmayan kapsama',
    descriptionEn:
      'Nigerian coverage is recent and sparse, concentrated on a few corridors. Sharp modern imagery in west Africa is worth a guess on its own.',
    descriptionTr:
      'Nijerya kapsaması yenidir ve seyrektir, birkaç güzergâhta yoğunlaşır. Batı Afrika’da net ve modern bir görüntü tek başına tahmine değer.',
    difficulty: 4,
  },

  // -- Vehicles in the scene -------------------------------------------------
  {
    slug: 'th-vehicle',
    countryCode: 'TH',
    category: 'VEHICLE',
    titleEn: 'Songthaew and tuk-tuk in traffic',
    titleTr: 'Trafikte songthaew ve tuk-tuk',
    descriptionEn:
      'A pickup converted to a passenger truck with benches in the back, and three-wheeled tuk-tuks alongside it, is a Thai street more than anywhere else.',
    descriptionTr:
      'Arkasına sıra oturaklar konmuş yolcu kamyonetleri ve yanlarındaki üç tekerlekli tuk-tuklar, her yerden çok bir Tayland sokağıdır.',
    difficulty: 2,
  },
  {
    slug: 'in-vehicle',
    countryCode: 'IN',
    category: 'VEHICLE',
    titleEn: 'Yellow and green auto rickshaws',
    titleTr: 'Sarı-yeşil oto rickshawlar',
    descriptionEn:
      'The three-wheeled auto rickshaw in yellow and green, in numbers, is Indian. Colours differ by city, which narrows the guess further.',
    descriptionTr:
      'Sarı-yeşil üç tekerlekli oto rickshaw, hele çok sayıdaysa, Hindistan demektir. Renkler şehre göre değişir ve tahmini daha da daraltır.',
    difficulty: 2,
  },
  {
    slug: 'ke-vehicle',
    countryCode: 'KE',
    category: 'VEHICLE',
    titleEn: 'Matatu minibuses in bright graphics',
    titleTr: 'Parlak grafiklerle kaplı matatu minibüsler',
    descriptionEn:
      'Kenyan matatus are minibuses painted in loud custom graphics, often with a coloured stripe along the side required by law.',
    descriptionTr:
      'Kenya matatuları gösterişli özel grafiklerle boyanmış minibüslerdir; çoğunda yasanın gerektirdiği renkli bir yan şerit bulunur.',
    difficulty: 3,
  },
  {
    slug: 'ng-vehicle',
    countryCode: 'NG',
    category: 'VEHICLE',
    titleEn: 'Yellow danfo buses in Lagos',
    titleTr: 'Lagos’ta sarı danfo otobüsler',
    descriptionEn:
      'Lagos runs yellow minibuses with black stripes in large numbers. Yellow shared transport plus right-hand traffic in west Africa points to Nigeria.',
    descriptionTr:
      'Lagos’ta siyah şeritli sarı minibüsler çok sayıda çalışır. Batı Afrika’da sarı toplu taşıma ve sağda trafik birleşimi Nijerya’yı işaret eder.',
    difficulty: 3,
  },
  {
    slug: 'id-vehicle',
    countryCode: 'ID',
    category: 'VEHICLE',
    titleEn: 'A swarm of small motorbikes',
    titleTr: 'Küçük motosiklet kalabalığı',
    descriptionEn:
      'Indonesian streets carry far more small motorbikes than cars, often parked in dense rows on the pavement, with riders in green delivery jackets.',
    descriptionTr:
      'Endonezya sokaklarında arabadan çok küçük motosiklet vardır; çoğu zaman kaldırımda sık sıralar hâlinde park eder ve sürücüler yeşil kurye montları giyer.',
    difficulty: 3,
  },
  {
    slug: 'br-vehicle',
    countryCode: 'BR',
    category: 'VEHICLE',
    titleEn: 'Small hatchbacks built for the local market',
    titleTr: 'Yerel pazara üretilmiş küçük hatchbackler',
    descriptionEn:
      'Brazilian traffic is dominated by compact hatchbacks built for South America and sold almost nowhere else, which dates and places a scene together.',
    descriptionTr:
      'Brezilya trafiğine, Güney Amerika için üretilip başka neredeyse hiçbir yerde satılmayan kompakt hatchbackler hâkimdir; bu, sahneyi hem tarihlendirir hem yerleştirir.',
    difficulty: 4,
  },
];
