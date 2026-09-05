/**
 * The reference half of a country page: the handful of facts a player checks
 * once they think they know where they are, plus the sentence that tells them
 * what to look at first. The clue pictures live in the catalogue; these are
 * the words around them.
 *
 * Every field is optional in the schema, so a country an admin has not written
 * up yet still works. This file is only the starting set.
 */

export type DrivingSide = 'LEFT' | 'RIGHT';

export interface CountryFacts {
  flagEmoji: string;
  drivingSide: DrivingSide;
  ccTld: string;
  phonePrefix: string;
  currency: string;
  /** Comma-separated, most spoken first. */
  languages: string;
  /** Comma-separated Street View coverage generations. */
  cameraGens: string;
  summaryEn: string;
  summaryTr: string;
}

export const COUNTRY_FACTS: Record<string, CountryFacts> = {
  TR: {
    flagEmoji: '🇹🇷',
    drivingSide: 'RIGHT',
    ccTld: '.tr',
    phonePrefix: '+90',
    currency: 'TRY',
    languages: 'Turkish',
    cameraGens: 'Gen 3,Gen 4',
    summaryEn:
      'Dotted Latin script with ç, ğ, ş and ı, a blue EU-style band on the plate reading TR, and red-and-white kilometre stones. Signs are green for motorways and blue for other roads, the opposite of most of Europe.',
    summaryTr:
      'Noktalı Latin alfabesi: ç, ğ, ş ve ı. Plakada TR yazan mavi AB benzeri şerit ve kırmızı-beyaz kilometre taşları. Otoyol tabelaları yeşil, diğer yollar mavi; Avrupa geneliyle ters.',
  },
  DE: {
    flagEmoji: '🇩🇪',
    drivingSide: 'RIGHT',
    ccTld: '.de',
    phonePrefix: '+49',
    currency: 'EUR',
    languages: 'German',
    cameraGens: 'Gen 2',
    summaryEn:
      'Official coverage is old and rare, so almost anything you see is photo spheres or the 2008 Gen 2 car. Look for umlauts, straße on street signs, and the grey and white bollard with a black band.',
    summaryTr:
      'Resmî kapsama eski ve seyrek; gördüğünüz çoğu şey foto küre veya 2008 Gen 2 aracı. Umlaut harfleri, sokak tabelalarındaki straße ve siyah bantlı gri-beyaz dubaya bakın.',
  },
  FR: {
    flagEmoji: '🇫🇷',
    drivingSide: 'RIGHT',
    ccTld: '.fr',
    phonePrefix: '+33',
    currency: 'EUR',
    languages: 'French',
    cameraGens: 'Gen 3,Gen 4',
    summaryEn:
      'Broken white centre lines, a red top on the roadside bollard, and route numbers on a yellow diamond. Village entry signs are white with a red border.',
    summaryTr:
      'Kesikli beyaz orta çizgi, yol kenarı dubasında kırmızı başlık ve sarı eşkenar dörtgen üstünde yol numarası. Köy giriş tabelaları kırmızı çerçeveli beyazdır.',
  },
  NL: {
    flagEmoji: '🇳🇱',
    drivingSide: 'RIGHT',
    ccTld: '.nl',
    phonePrefix: '+31',
    currency: 'EUR',
    languages: 'Dutch',
    cameraGens: 'Gen 3,Gen 4',
    summaryEn:
      'Red cycle paths beside almost every road, yellow number plates, and flat farmland cut by drainage ditches. Street name signs are white text on blue.',
    summaryTr:
      'Neredeyse her yolun yanında kırmızı bisiklet yolu, sarı plakalar ve drenaj kanallarıyla bölünmüş düz tarım arazisi. Sokak tabelaları mavi zemin üstüne beyaz yazıdır.',
  },
  GB: {
    flagEmoji: '🇬🇧',
    drivingSide: 'LEFT',
    ccTld: '.uk',
    phonePrefix: '+44',
    currency: 'GBP',
    languages: 'English',
    cameraGens: 'Gen 3,Gen 4',
    summaryEn:
      'Driving on the left with yellow lines along the kerb, white front plates and yellow rear plates, and double-headed street lamps. Road signs use a rounded typeface with no route shields.',
    summaryTr:
      'Solda trafik, kaldırım boyunca sarı çizgiler, önde beyaz arkada sarı plaka ve çift başlı sokak lambaları. Tabelalarda yuvarlak hatlı yazı tipi kullanılır, yol kalkanı yoktur.',
  },
  ES: {
    flagEmoji: '🇪🇸',
    drivingSide: 'RIGHT',
    ccTld: '.es',
    phonePrefix: '+34',
    currency: 'EUR',
    languages: 'Spanish,Catalan,Galician,Basque',
    cameraGens: 'Gen 3,Gen 4',
    summaryEn:
      'Dry ground with olive groves in the south, a black-and-white striped kilometre post, and the tall thin bollard with a reflective band. Signs carry the ñ and inverted question marks.',
    summaryTr:
      'Güneyde zeytinliklerle kurak zemin, siyah-beyaz çizgili kilometre direği ve yansıtıcı bantlı ince uzun duba. Tabelalarda ñ harfi ve ters soru işareti görülür.',
  },
  GR: {
    flagEmoji: '🇬🇷',
    drivingSide: 'RIGHT',
    ccTld: '.gr',
    phonePrefix: '+30',
    currency: 'EUR',
    languages: 'Greek',
    cameraGens: 'Gen 3,Gen 4',
    summaryEn:
      'The Greek alphabet settles it instantly. Beyond that: dry limestone hills, orange-tiled roofs, and blue-and-white road signs that repeat every name in Latin script underneath.',
    summaryTr:
      'Yunan alfabesi tek başına yeter. Ayrıca kurak kireçtaşı tepeler, turuncu kiremitli çatılar ve her adı altında Latin harfleriyle tekrarlayan mavi-beyaz tabelalar.',
  },
  PL: {
    flagEmoji: '🇵🇱',
    drivingSide: 'RIGHT',
    ccTld: '.pl',
    phonePrefix: '+48',
    currency: 'PLN',
    languages: 'Polish',
    cameraGens: 'Gen 3,Gen 4',
    summaryEn:
      'Latin script with ł, ż and ę, plates with a narrow blue EU band and no country colour, and grey concrete utility poles. Buildings are often unpainted brick or grey render.',
    summaryTr:
      'ł, ż ve ę içeren Latin alfabesi, dar mavi AB şeritli plakalar ve gri beton elektrik direkleri. Binalar sıklıkla sıvasız tuğla ya da gri sıvalıdır.',
  },
  NO: {
    flagEmoji: '🇳🇴',
    drivingSide: 'RIGHT',
    ccTld: '.no',
    phonePrefix: '+47',
    currency: 'NOK',
    languages: 'Norwegian',
    cameraGens: 'Gen 3,Gen 4',
    summaryEn:
      'Yellow centre lines, æ ø å on signs, and bare rock cuttings beside the road. Guardrails are often wooden posts with a steel rail.',
    summaryTr:
      'Sarı orta çizgi, tabelalarda æ ø å ve yol kenarında çıplak kaya kesitleri. Bariyerler genelde ahşap direkli çelik korkuluktur.',
  },
  SE: {
    flagEmoji: '🇸🇪',
    drivingSide: 'RIGHT',
    ccTld: '.se',
    phonePrefix: '+46',
    currency: 'SEK',
    languages: 'Swedish',
    cameraGens: 'Gen 3,Gen 4',
    summaryEn:
      'White centre lines where Norway uses yellow, ä ö å on signs, and dark red wooden houses with white trim. Pine forest runs right to the verge.',
    summaryTr:
      'Norveç sarı kullanırken burada beyaz orta çizgi, tabelalarda ä ö å ve beyaz çerçeveli koyu kırmızı ahşap evler. Çam ormanı yol kenarına kadar iner.',
  },
  FI: {
    flagEmoji: '🇫🇮',
    drivingSide: 'RIGHT',
    ccTld: '.fi',
    phonePrefix: '+358',
    currency: 'EUR',
    languages: 'Finnish,Swedish',
    cameraGens: 'Gen 3,Gen 4',
    summaryEn:
      'Double vowels everywhere in place names, signs repeated in Finnish and Swedish near the coast, and birch mixed into the pine. Snow poles line the road all year.',
    summaryTr:
      'Yer adlarında sık çift ünlü, kıyıya yakın yerlerde Fince ve İsveççe çift dilli tabelalar, çamla karışık huş ağaçları. Kar direkleri yıl boyu yol kenarında durur.',
  },
  RU: {
    flagEmoji: '🇷🇺',
    drivingSide: 'RIGHT',
    ccTld: '.ru',
    phonePrefix: '+7',
    currency: 'RUB',
    languages: 'Russian',
    cameraGens: 'Gen 3,Gen 4',
    summaryEn:
      'Cyrillic, a white plate with a small flag on the right, and grey concrete apartment blocks. Kilometre posts are white with a black cap.',
    summaryTr:
      'Kiril alfabesi, sağında küçük bayrak olan beyaz plaka ve gri beton apartmanlar. Kilometre direkleri siyah başlıklı beyazdır.',
  },
  IT: {
    flagEmoji: '🇮🇹',
    drivingSide: 'RIGHT',
    ccTld: '.it',
    phonePrefix: '+39',
    currency: 'EUR',
    languages: 'Italian',
    cameraGens: 'Gen 3,Gen 4',
    summaryEn:
      'Green motorway signs with blue for ordinary roads, narrow plates with a blue band at each end, and stone or ochre render on older buildings.',
    summaryTr:
      'Otoyollarda yeşil, normal yollarda mavi tabelalar. İki ucunda mavi şerit olan dar plakalar ve eski binalarda taş ya da toprak sarısı sıva.',
  },
  US: {
    flagEmoji: '🇺🇸',
    drivingSide: 'RIGHT',
    ccTld: '.us',
    phonePrefix: '+1',
    currency: 'USD',
    languages: 'English,Spanish',
    cameraGens: 'Gen 2,Gen 3,Gen 4',
    summaryEn:
      'Yellow centre lines, white edge lines, and a plate per state so the colour narrows the region on its own. Wooden utility poles carry the wires almost everywhere.',
    summaryTr:
      'Sarı orta çizgi, beyaz kenar çizgisi ve her eyalete özel plaka; renk tek başına bölgeyi daraltır. Kablolar neredeyse her yerde ahşap direklerle taşınır.',
  },
  CA: {
    flagEmoji: '🇨🇦',
    drivingSide: 'RIGHT',
    ccTld: '.ca',
    phonePrefix: '+1',
    currency: 'CAD',
    languages: 'English,French',
    cameraGens: 'Gen 3,Gen 4',
    summaryEn:
      'Like the United States but with metric speed limits on a white rectangle, bilingual signs in Quebec and the east, and a stop sign that reads ARRÊT in French areas.',
    summaryTr:
      'ABD’ye benzer ama hız limitleri beyaz dikdörtgen üstünde metrik. Quebec ve doğuda çift dilli tabelalar, Fransızca bölgelerde ARRÊT yazan dur işareti.',
  },
  MX: {
    flagEmoji: '🇲🇽',
    drivingSide: 'RIGHT',
    ccTld: '.mx',
    phonePrefix: '+52',
    currency: 'MXN',
    languages: 'Spanish',
    cameraGens: 'Gen 3,Gen 4',
    summaryEn:
      'Topes speed bumps announced by a sign, painted kerbs, and unfinished rebar poking from flat concrete roofs. Signs use ALTO rather than STOP.',
    summaryTr:
      'Tabelayla duyurulan tope kasisleri, boyalı kaldırım kenarları ve düz beton çatılardan çıkan tamamlanmamış demirler. Tabelalarda STOP yerine ALTO yazar.',
  },
  BR: {
    flagEmoji: '🇧🇷',
    drivingSide: 'RIGHT',
    ccTld: '.br',
    phonePrefix: '+55',
    currency: 'BRL',
    languages: 'Portuguese',
    cameraGens: 'Gen 3,Gen 4',
    summaryEn:
      'Portuguese with ã and ç, red terracotta soil in the interior, and a black-and-white striped kerb. Bus stops and shopfronts are painted in strong flat colours.',
    summaryTr:
      'ã ve ç içeren Portekizce, iç bölgelerde kırmızı toprak ve siyah-beyaz çizgili kaldırım kenarı. Durak ve dükkân cepheleri güçlü düz renklerle boyanır.',
  },
  AR: {
    flagEmoji: '🇦🇷',
    drivingSide: 'RIGHT',
    ccTld: '.ar',
    phonePrefix: '+54',
    currency: 'ARS',
    languages: 'Spanish',
    cameraGens: 'Gen 3,Gen 4',
    summaryEn:
      'Flat pampas with wire fences and eucalyptus windbreaks, blue-and-white kilometre posts, and plates with a small blue band. Signs are Spanish with a distinctive narrow typeface.',
    summaryTr:
      'Tel çitler ve okaliptüs rüzgâr perdeleriyle düz pampalar, mavi-beyaz kilometre direkleri ve küçük mavi şeritli plakalar. Tabelalar İspanyolca ve belirgin dar yazı tipiyle yazılır.',
  },
  CL: {
    flagEmoji: '🇨🇱',
    drivingSide: 'RIGHT',
    ccTld: '.cl',
    phonePrefix: '+56',
    currency: 'CLP',
    languages: 'Spanish',
    cameraGens: 'Gen 3,Gen 4',
    summaryEn:
      'A long thin country: desert in the north, the Andes to the east in almost every shot, and green farmland in the middle. Bollards are white with a black band.',
    summaryTr:
      'Uzun ve ince bir ülke: kuzeyde çöl, neredeyse her karede doğuda And Dağları, ortada yeşil tarım arazisi. Dubalar siyah bantlı beyazdır.',
  },
  JP: {
    flagEmoji: '🇯🇵',
    drivingSide: 'LEFT',
    ccTld: '.jp',
    phonePrefix: '+81',
    currency: 'JPY',
    languages: 'Japanese',
    cameraGens: 'Gen 3,Gen 4',
    summaryEn:
      'Driving on the left, kanji and kana on every sign, narrow streets without kerbs, and a forest of overhead wires. Vending machines stand on residential corners.',
    summaryTr:
      'Solda trafik, her tabelada kanji ve kana, kaldırımsız dar sokaklar ve havai kablo ormanı. Otomatlar mahalle köşelerinde durur.',
  },
  TH: {
    flagEmoji: '🇹🇭',
    drivingSide: 'LEFT',
    ccTld: '.th',
    phonePrefix: '+66',
    currency: 'THB',
    languages: 'Thai',
    cameraGens: 'Gen 3,Gen 4',
    summaryEn:
      'Thai script, driving on the left, and red-and-white striped kerbs. Power poles are square concrete, and spirit houses stand outside homes and shops.',
    summaryTr:
      'Tay alfabesi, solda trafik ve kırmızı-beyaz çizgili kaldırım kenarları. Elektrik direkleri kare kesitli betondur; ev ve dükkân önlerinde ruh evleri bulunur.',
  },
  ID: {
    flagEmoji: '🇮🇩',
    drivingSide: 'LEFT',
    ccTld: '.id',
    phonePrefix: '+62',
    currency: 'IDR',
    languages: 'Indonesian,Javanese',
    cameraGens: 'Gen 3,Gen 4',
    summaryEn:
      'Latin script in Indonesian, driving on the left, and dense green vegetation. Plates are black with white text on older cars, and mosques appear in most villages.',
    summaryTr:
      'Endonezce Latin alfabesi, solda trafik ve yoğun yeşil bitki örtüsü. Eski araçlarda plakalar siyah zemin üstüne beyaz yazıdır, çoğu köyde cami görülür.',
  },
  IN: {
    flagEmoji: '🇮🇳',
    drivingSide: 'LEFT',
    ccTld: '.in',
    phonePrefix: '+91',
    currency: 'INR',
    languages: 'Hindi,English',
    cameraGens: 'Gen 4',
    summaryEn:
      'Devanagari alongside English, driving on the left, and yellow-and-black striped kerbs. Coverage is recent, so the imagery is sharp and the car is rarely visible.',
    summaryTr:
      'İngilizceyle birlikte Devanagari, solda trafik ve sarı-siyah çizgili kaldırım kenarları. Kapsama yeni olduğu için görüntü nettir ve araç nadiren görünür.',
  },
  AU: {
    flagEmoji: '🇦🇺',
    drivingSide: 'LEFT',
    ccTld: '.au',
    phonePrefix: '+61',
    currency: 'AUD',
    languages: 'English',
    cameraGens: 'Gen 3,Gen 4',
    summaryEn:
      'Driving on the left, red soil and eucalyptus almost everywhere, and a white plate whose slogan names the state. Road signs use a yellow diamond for warnings.',
    summaryTr:
      'Solda trafik, neredeyse her yerde kırmızı toprak ve okaliptüs, sloganı eyaleti belirten beyaz plaka. Uyarı tabelaları sarı eşkenar dörtgendir.',
  },
  NZ: {
    flagEmoji: '🇳🇿',
    drivingSide: 'LEFT',
    ccTld: '.nz',
    phonePrefix: '+64',
    currency: 'NZD',
    languages: 'English,Maori',
    cameraGens: 'Gen 3,Gen 4',
    summaryEn:
      'Driving on the left, steep green sheep country, and Maori place names. Road signs are the Australian shape but the vegetation is tree fern rather than eucalyptus.',
    summaryTr:
      'Solda trafik, dik yeşil koyun otlakları ve Maori yer adları. Tabelalar Avustralya biçimindedir ama bitki örtüsü okaliptüs değil ağaç eğreltisidir.',
  },
  ZA: {
    flagEmoji: '🇿🇦',
    drivingSide: 'LEFT',
    ccTld: '.za',
    phonePrefix: '+27',
    currency: 'ZAR',
    languages: 'English,Afrikaans,Zulu',
    cameraGens: 'Gen 3,Gen 4',
    summaryEn:
      'Driving on the left, English and Afrikaans on signs, and dry grassland with flat-topped acacia. Electric fences and walls surround houses in the cities.',
    summaryTr:
      'Solda trafik, tabelalarda İngilizce ve Afrikaanca, düz tepeli akasyalarla kurak otlaklar. Şehirlerde evler elektrikli tel ve duvarlarla çevrilidir.',
  },
  KE: {
    flagEmoji: '🇰🇪',
    drivingSide: 'LEFT',
    ccTld: '.ke',
    phonePrefix: '+254',
    currency: 'KES',
    languages: 'Swahili,English',
    cameraGens: 'Gen 4',
    summaryEn:
      'Driving on the left, Swahili and English side by side, and red earth beside the tarmac. Matatu minibuses are painted in bright graphics.',
    summaryTr:
      'Solda trafik, yan yana Svahili ve İngilizce, asfaltın kenarında kırmızı toprak. Matatu minibüsleri parlak grafiklerle boyanır.',
  },
  NG: {
    flagEmoji: '🇳🇬',
    drivingSide: 'RIGHT',
    ccTld: '.ng',
    phonePrefix: '+234',
    currency: 'NGN',
    languages: 'English,Hausa,Yoruba,Igbo',
    cameraGens: 'Gen 4',
    summaryEn:
      'Driving on the right, unlike most of its neighbours in East Africa. English on signs, red laterite soil, and yellow danfo buses in Lagos.',
    summaryTr:
      'Doğu Afrika’daki çoğu komşusunun aksine sağda trafik. Tabelalarda İngilizce, kırmızı lateritik toprak ve Lagos’ta sarı danfo otobüsleri.',
  },
};
