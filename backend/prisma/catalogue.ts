/**
 * The learning catalogue. One place for the countries, the metas and the
 * artwork spec each card is drawn from, so the seed and the art generator can
 * never drift apart.
 */

export type Region =
  | 'EUROPE'
  | 'ASIA'
  | 'AFRICA'
  | 'NORTH_AMERICA'
  | 'SOUTH_AMERICA'
  | 'OCEANIA'
  | 'ANTARCTICA';

export type MetaCategory =
  | 'PLATE'
  | 'BOLLARD'
  | 'ROAD_LINE'
  | 'VEGETATION'
  | 'ARCHITECTURE'
  | 'LANGUAGE'
  | 'CAMERA'
  | 'VEHICLE'
  | 'INFRASTRUCTURE'
  | 'POLE'
  | 'SIGN';

export interface CountrySeed {
  code: string;
  nameEn: string;
  nameTr: string;
  region: Region;
}

export type ArtSpec =
  | {
      kind: 'plate';
      body: string;
      text: string;
      textColor: string;
      band?: { color: string; label: string; labelColor: string };
      topStrip?: { color: string; label: string };
    }
  | { kind: 'bollard'; body: string; cap: string; stripe: string | null; rounded: boolean }
  | { kind: 'road'; centre: string; edge: string; dashed: boolean }
  | { kind: 'sign'; text: string; background: string; foreground: string; rounded: boolean }
  | {
      kind: 'scene';
      sky: string;
      ground: string;
      accent: string;
      motif: 'trees' | 'poles' | 'roofs';
    };

export interface MetaSeed {
  slug: string;
  countryCode: string;
  category: MetaCategory;
  titleEn: string;
  titleTr: string;
  descriptionEn: string;
  descriptionTr: string;
  difficulty: number;
  art: ArtSpec;
}

export const COUNTRIES: CountrySeed[] = [
  { code: 'TR', nameEn: 'Turkey', nameTr: 'Türkiye', region: 'ASIA' },
  { code: 'DE', nameEn: 'Germany', nameTr: 'Almanya', region: 'EUROPE' },
  { code: 'FR', nameEn: 'France', nameTr: 'Fransa', region: 'EUROPE' },
  { code: 'NL', nameEn: 'Netherlands', nameTr: 'Hollanda', region: 'EUROPE' },
  { code: 'GB', nameEn: 'United Kingdom', nameTr: 'Birleşik Krallık', region: 'EUROPE' },
  { code: 'ES', nameEn: 'Spain', nameTr: 'İspanya', region: 'EUROPE' },
  { code: 'GR', nameEn: 'Greece', nameTr: 'Yunanistan', region: 'EUROPE' },
  { code: 'PL', nameEn: 'Poland', nameTr: 'Polonya', region: 'EUROPE' },
  { code: 'NO', nameEn: 'Norway', nameTr: 'Norveç', region: 'EUROPE' },
  { code: 'SE', nameEn: 'Sweden', nameTr: 'İsveç', region: 'EUROPE' },
  { code: 'FI', nameEn: 'Finland', nameTr: 'Finlandiya', region: 'EUROPE' },
  { code: 'RU', nameEn: 'Russia', nameTr: 'Rusya', region: 'EUROPE' },
  { code: 'IT', nameEn: 'Italy', nameTr: 'İtalya', region: 'EUROPE' },
  {
    code: 'US',
    nameEn: 'United States',
    nameTr: 'Amerika Birleşik Devletleri',
    region: 'NORTH_AMERICA',
  },
  { code: 'CA', nameEn: 'Canada', nameTr: 'Kanada', region: 'NORTH_AMERICA' },
  { code: 'MX', nameEn: 'Mexico', nameTr: 'Meksika', region: 'NORTH_AMERICA' },
  { code: 'BR', nameEn: 'Brazil', nameTr: 'Brezilya', region: 'SOUTH_AMERICA' },
  { code: 'AR', nameEn: 'Argentina', nameTr: 'Arjantin', region: 'SOUTH_AMERICA' },
  { code: 'CL', nameEn: 'Chile', nameTr: 'Şili', region: 'SOUTH_AMERICA' },
  { code: 'JP', nameEn: 'Japan', nameTr: 'Japonya', region: 'ASIA' },
  { code: 'TH', nameEn: 'Thailand', nameTr: 'Tayland', region: 'ASIA' },
  { code: 'ID', nameEn: 'Indonesia', nameTr: 'Endonezya', region: 'ASIA' },
  { code: 'IN', nameEn: 'India', nameTr: 'Hindistan', region: 'ASIA' },
  { code: 'AU', nameEn: 'Australia', nameTr: 'Avustralya', region: 'OCEANIA' },
  { code: 'NZ', nameEn: 'New Zealand', nameTr: 'Yeni Zelanda', region: 'OCEANIA' },
  { code: 'ZA', nameEn: 'South Africa', nameTr: 'Güney Afrika', region: 'AFRICA' },
  { code: 'KE', nameEn: 'Kenya', nameTr: 'Kenya', region: 'AFRICA' },
  { code: 'NG', nameEn: 'Nigeria', nameTr: 'Nijerya', region: 'AFRICA' },
];

export const METAS: MetaSeed[] = [
  {
    slug: 'tr-plate',
    countryCode: 'TR',
    category: 'PLATE',
    titleEn: 'Blue band with TR',
    titleTr: 'TR yazan mavi şerit',
    descriptionEn:
      'Turkish plates carry a narrow blue band on the left with a white TR. The plate itself is white with black characters and a red seal between the province number and the letters.',
    descriptionTr:
      'Türkiye plakalarında solda beyaz TR yazan dar mavi bir şerit bulunur. Plaka beyaz, karakterler siyahtır ve il kodu ile harfler arasında kırmızı bir mühür yer alır.',
    difficulty: 1,
    art: {
      kind: 'plate',
      body: '#f8fafc',
      text: '34 ABC 123',
      textColor: '#0f172a',
      band: { color: '#1d4ed8', label: 'TR', labelColor: '#ffffff' },
    },
  },
  {
    slug: 'de-plate',
    countryCode: 'DE',
    category: 'PLATE',
    titleEn: 'EU band with D and a wide black frame',
    titleTr: 'D harfli AB şeridi ve geniş siyah çerçeve',
    descriptionEn:
      'German plates use the EU blue band with a D, plus two round stickers between the city code and the letters. The black border is noticeably thick.',
    descriptionTr:
      'Alman plakalarında D harfli AB mavi şeridi ve şehir kodu ile harfler arasında iki yuvarlak etiket bulunur. Siyah çerçeve belirgin şekilde kalındır.',
    difficulty: 2,
    art: {
      kind: 'plate',
      body: '#f8fafc',
      text: 'B AG 4711',
      textColor: '#111827',
      band: { color: '#1e40af', label: 'D', labelColor: '#facc15' },
    },
  },
  {
    slug: 'fr-plate',
    countryCode: 'FR',
    category: 'PLATE',
    titleEn: 'Blue bands on both sides',
    titleTr: 'Her iki yanda mavi şerit',
    descriptionEn:
      'France is the classic double-band plate: the EU band on the left and a second blue block on the right carrying the department number and regional logo.',
    descriptionTr:
      'Fransa çift şeritli plakanın klasik örneğidir: solda AB şeridi, sağda ise bölge numarası ve logosunu taşıyan ikinci mavi blok bulunur.',
    difficulty: 1,
    art: {
      kind: 'plate',
      body: '#f8fafc',
      text: 'AB-123-CD',
      textColor: '#111827',
      band: { color: '#1e40af', label: 'F', labelColor: '#ffffff' },
      topStrip: { color: '#1e40af', label: 'ILE-DE-FRANCE 75' },
    },
  },
  {
    slug: 'nl-plate',
    countryCode: 'NL',
    category: 'PLATE',
    titleEn: 'Yellow plates front and back',
    titleTr: 'Önde ve arkada sarı plaka',
    descriptionEn:
      'The Netherlands runs yellow plates on both ends of the car, with black characters split by dashes and the EU band carrying NL.',
    descriptionTr:
      'Hollanda aracın hem önünde hem arkasında sarı plaka kullanır; siyah karakterler tirelerle ayrılır ve AB şeridinde NL yazar.',
    difficulty: 1,
    art: {
      kind: 'plate',
      body: '#facc15',
      text: 'XX-123-Y',
      textColor: '#111827',
      band: { color: '#1e40af', label: 'NL', labelColor: '#ffffff' },
    },
  },
  {
    slug: 'gb-plate',
    countryCode: 'GB',
    category: 'PLATE',
    titleEn: 'White at the front, yellow at the back',
    titleTr: 'Önde beyaz, arkada sarı',
    descriptionEn:
      'British cars pair a white front plate with a yellow rear plate. Combined with left-hand traffic this is one of the fastest calls in the game.',
    descriptionTr:
      'İngiltere araçlarında ön plaka beyaz, arka plaka sarıdır. Soldan trafikle birlikte oyundaki en hızlı çıkarımlardan biridir.',
    difficulty: 2,
    art: {
      kind: 'plate',
      body: '#fde047',
      text: 'AB12 CDE',
      textColor: '#111827',
      band: { color: '#1e3a8a', label: 'UK', labelColor: '#ffffff' },
    },
  },
  {
    slug: 'br-plate',
    countryCode: 'BR',
    category: 'PLATE',
    titleEn: 'Mercosul strip across the top',
    titleTr: 'Üstte Mercosul şeridi',
    descriptionEn:
      'Brazil uses the Mercosul layout: a blue strip along the whole top edge with BRASIL written in it, above black characters on white.',
    descriptionTr:
      'Brezilya Mercosul düzenini kullanır: üst kenar boyunca BRASIL yazan mavi bir şerit, altında beyaz zemin üzerinde siyah karakterler yer alır.',
    difficulty: 2,
    art: {
      kind: 'plate',
      body: '#f8fafc',
      text: 'ABC1D23',
      textColor: '#111827',
      topStrip: { color: '#1d4ed8', label: 'BRASIL' },
    },
  },
  {
    slug: 'ar-plate',
    countryCode: 'AR',
    category: 'PLATE',
    titleEn: 'Mercosur strip with a wide grey body',
    titleTr: 'Geniş gri gövdeli Mercosur şeridi',
    descriptionEn:
      'Argentina also runs the Mercosur top strip, but the plate below it is grey-white with a heavier, wider font than Brazil.',
    descriptionTr:
      'Arjantin de üstte Mercosur şeridini kullanır, ancak alttaki plaka gri-beyazdır ve yazı tipi Brezilya plakasına göre daha kalın ve geniştir.',
    difficulty: 3,
    art: {
      kind: 'plate',
      body: '#e5e7eb',
      text: 'AB 123 CD',
      textColor: '#111827',
      topStrip: { color: '#1e3a8a', label: 'ARGENTINA' },
    },
  },
  {
    slug: 'jp-plate',
    countryCode: 'JP',
    category: 'PLATE',
    titleEn: 'Small plate with green characters',
    titleTr: 'Yeşil karakterli küçük plaka',
    descriptionEn:
      'Japanese private cars carry a white plate with green characters and a kanji city name on the top row. Kei cars flip this to yellow with black text.',
    descriptionTr:
      'Japonyada özel araçlar üst satırda kanji şehir adı bulunan, yeşil karakterli beyaz plaka taşır. Kei araçlarda bu düzen siyah yazılı sarıya döner.',
    difficulty: 2,
    art: {
      kind: 'plate',
      body: '#f8fafc',
      text: '300 A 12-34',
      textColor: '#15803d',
    },
  },
  {
    slug: 'id-plate',
    countryCode: 'ID',
    category: 'PLATE',
    titleEn: 'Black plate with white characters',
    titleTr: 'Beyaz karakterli siyah plaka',
    descriptionEn:
      'Indonesia is one of the few countries still running black plates with white text on private cars, with the expiry month and year underneath.',
    descriptionTr:
      'Endonezya, özel araçlarda hâlâ beyaz yazılı siyah plaka kullanan az sayıdaki ülkeden biridir; altta geçerlilik ay ve yılı yer alır.',
    difficulty: 2,
    art: {
      kind: 'plate',
      body: '#111827',
      text: 'B 1234 ABC',
      textColor: '#f8fafc',
    },
  },
  {
    slug: 'ke-plate',
    countryCode: 'KE',
    category: 'PLATE',
    titleEn: 'Yellow rear plate with a K prefix',
    titleTr: 'K ile başlayan sarı arka plaka',
    descriptionEn:
      'Kenyan rear plates are yellow with black text and almost always start with a K. Fronts are white, which is the opposite of the British pattern.',
    descriptionTr:
      'Kenyada arka plakalar siyah yazılı sarıdır ve neredeyse her zaman K ile başlar. Ön plakalar beyazdır; bu, İngiltere düzeninin tersidir.',
    difficulty: 3,
    art: {
      kind: 'plate',
      body: '#fbbf24',
      text: 'KDA 123A',
      textColor: '#111827',
    },
  },
  {
    slug: 'in-plate',
    countryCode: 'IN',
    category: 'PLATE',
    titleEn: 'Yellow commercial plates with state codes',
    titleTr: 'Eyalet kodlu sarı ticari plakalar',
    descriptionEn:
      'Indian plates open with a two letter state code such as MH or KA. Commercial vehicles use yellow plates with black text.',
    descriptionTr:
      'Hindistan plakaları MH veya KA gibi iki harfli eyalet koduyla başlar. Ticari araçlar siyah yazılı sarı plaka kullanır.',
    difficulty: 3,
    art: {
      kind: 'plate',
      body: '#fbbf24',
      text: 'MH 12 AB 1234',
      textColor: '#111827',
    },
  },
  {
    slug: 'ng-plate',
    countryCode: 'NG',
    category: 'PLATE',
    titleEn: 'Green strip with a federal slogan',
    titleTr: 'Federal sloganlı yeşil şerit',
    descriptionEn:
      'Nigerian plates carry a green top strip and the state name printed under the characters, on a white body with a green flag block.',
    descriptionTr:
      'Nijerya plakalarında üstte yeşil bir şerit ve karakterlerin altında eyalet adı bulunur; gövde beyaz, bayrak bloğu yeşildir.',
    difficulty: 4,
    art: {
      kind: 'plate',
      body: '#f8fafc',
      text: 'ABC 123 DE',
      textColor: '#111827',
      topStrip: { color: '#15803d', label: 'FEDERAL REPUBLIC' },
    },
  },
  {
    slug: 'no-bollard',
    countryCode: 'NO',
    category: 'BOLLARD',
    titleEn: 'White bollard with an orange reflector',
    titleTr: 'Turuncu reflektörlü beyaz duba',
    descriptionEn:
      'Norwegian bollards are white with a squared-off top and an orange reflector strip near the head. They stand noticeably taller than Swedish ones.',
    descriptionTr:
      'Norveç dubaları beyazdır, üstü düz kesilmiştir ve baş kısmına yakın turuncu bir reflektör şeridi bulunur. İsveç dubalarından belirgin şekilde daha uzundur.',
    difficulty: 2,
    art: { kind: 'bollard', body: '#f8fafc', cap: '#f97316', stripe: '#f97316', rounded: false },
  },
  {
    slug: 'se-bollard',
    countryCode: 'SE',
    category: 'BOLLARD',
    titleEn: 'Rounded white bollard with a yellow band',
    titleTr: 'Sarı bantlı yuvarlak beyaz duba',
    descriptionEn:
      'Sweden uses a shorter white bollard with a rounded top and a yellow reflector band. It is the sibling of the Norwegian one, so compare the head shape.',
    descriptionTr:
      'İsveç, üstü yuvarlatılmış ve sarı reflektör bantlı daha kısa beyaz duba kullanır. Norveç dubasının kardeşidir, bu yüzden baş şeklini karşılaştırın.',
    difficulty: 3,
    art: { kind: 'bollard', body: '#f8fafc', cap: '#facc15', stripe: '#facc15', rounded: true },
  },
  {
    slug: 'fi-bollard',
    countryCode: 'FI',
    category: 'BOLLARD',
    titleEn: 'Grey bollard with a black head',
    titleTr: 'Siyah başlı gri duba',
    descriptionEn:
      'Finnish bollards are grey or dull white with a dark band at the very top and a small yellow reflector, often paired with wooden snow poles.',
    descriptionTr:
      'Finlandiya dubaları gri veya mat beyazdır; en üstte koyu bir bant ve küçük bir sarı reflektör bulunur, çoğunlukla tahta kar direkleriyle birlikte görülür.',
    difficulty: 4,
    art: { kind: 'bollard', body: '#e2e8f0', cap: '#0f172a', stripe: '#facc15', rounded: false },
  },
  {
    slug: 'pl-bollard',
    countryCode: 'PL',
    category: 'BOLLARD',
    titleEn: 'White bollard with a red top block',
    titleTr: 'Kırmızı üst bloklu beyaz duba',
    descriptionEn:
      'Poland runs a wide flat bollard, white with a red block across the top third. They appear in long uninterrupted rows along rural roads.',
    descriptionTr:
      'Polonya, üst üçte birinde kırmızı blok bulunan geniş ve düz beyaz duba kullanır. Kırsal yollarda kesintisiz uzun sıralar hâlinde görülür.',
    difficulty: 2,
    art: { kind: 'bollard', body: '#f8fafc', cap: '#dc2626', stripe: null, rounded: false },
  },
  {
    slug: 'gr-bollard',
    countryCode: 'GR',
    category: 'BOLLARD',
    titleEn: 'White bollard with a dark head and red reflector',
    titleTr: 'Koyu başlı ve kırmızı reflektörlü beyaz duba',
    descriptionEn:
      'Greek bollards are white with a dark head and a red reflector. Look for them next to dry stone verges and olive groves.',
    descriptionTr:
      'Yunanistan dubaları beyazdır, koyu bir baş ve kırmızı reflektör taşır. Kuru taş banketlerin ve zeytinliklerin yanında arayın.',
    difficulty: 3,
    art: { kind: 'bollard', body: '#f8fafc', cap: '#0f172a', stripe: '#dc2626', rounded: true },
  },
  {
    slug: 'es-bollard',
    countryCode: 'ES',
    category: 'BOLLARD',
    titleEn: 'Slim bollard with a yellow reflector square',
    titleTr: 'Sarı reflektör kareli ince duba',
    descriptionEn:
      'Spain uses a slim white bollard with a small yellow square reflector and a black outline, usually planted in reddish soil.',
    descriptionTr:
      'İspanya, küçük sarı kare reflektörlü ve siyah konturlu ince beyaz duba kullanır; genellikle kızılımsı toprağa dikilidir.',
    difficulty: 3,
    art: { kind: 'bollard', body: '#f8fafc', cap: '#facc15', stripe: '#0f172a', rounded: true },
  },
  {
    slug: 'it-bollard',
    countryCode: 'IT',
    category: 'BOLLARD',
    titleEn: 'Grey bollard with a black band',
    titleTr: 'Siyah bantlı gri duba',
    descriptionEn:
      'Italy uses a grey-white bollard with a black band and a red reflector, often set into low stone walls on mountain roads.',
    descriptionTr:
      'İtalya, siyah bantlı ve kırmızı reflektörlü gri-beyaz duba kullanır; dağ yollarında genellikle alçak taş duvarlara yerleştirilir.',
    difficulty: 4,
    art: { kind: 'bollard', body: '#e2e8f0', cap: '#1f2937', stripe: '#dc2626', rounded: false },
  },
  {
    slug: 'us-road',
    countryCode: 'US',
    category: 'ROAD_LINE',
    titleEn: 'Yellow centre line, white edges',
    titleTr: 'Sarı orta çizgi, beyaz kenarlar',
    descriptionEn:
      'North America separates opposing traffic with a yellow centre line and marks the shoulder in white. Nearly every European country uses white for both.',
    descriptionTr:
      'Kuzey Amerika karşı yönlü trafiği sarı orta çizgiyle ayırır ve banketi beyazla işaretler. Avrupa ülkelerinin neredeyse tamamı ikisinde de beyaz kullanır.',
    difficulty: 1,
    art: { kind: 'road', centre: '#facc15', edge: '#f8fafc', dashed: true },
  },
  {
    slug: 'ca-road',
    countryCode: 'CA',
    category: 'ROAD_LINE',
    titleEn: 'Yellow centre line with bilingual signage',
    titleTr: 'İki dilli tabelalarla sarı orta çizgi',
    descriptionEn:
      'Canada shares the yellow centre line with the United States, so lean on the bilingual signs, the different stop sign shape and the shorter treeline.',
    descriptionTr:
      'Kanada sarı orta çizgiyi ABD ile paylaşır; bu yüzden iki dilli tabelalara, farklı dur işareti biçimine ve daha kısa ağaç sınırına bakın.',
    difficulty: 4,
    art: { kind: 'road', centre: '#facc15', edge: '#f8fafc', dashed: false },
  },
  {
    slug: 'mx-road',
    countryCode: 'MX',
    category: 'ROAD_LINE',
    titleEn: 'Yellow centre line with a worn white edge',
    titleTr: 'Yıpranmış beyaz kenarlı sarı orta çizgi',
    descriptionEn:
      'Mexico keeps the yellow centre line but the paint is usually faded and the edge line often disappears entirely on rural roads.',
    descriptionTr:
      'Meksika sarı orta çizgiyi korur ancak boya genelde soluktur ve kırsal yollarda kenar çizgisi çoğu zaman tamamen kaybolur.',
    difficulty: 4,
    art: { kind: 'road', centre: '#eab308', edge: '#cbd5e1', dashed: true },
  },
  {
    slug: 'za-road',
    countryCode: 'ZA',
    category: 'ROAD_LINE',
    titleEn: 'Yellow edge lines, white centre',
    titleTr: 'Sarı kenar çizgileri, beyaz orta çizgi',
    descriptionEn:
      'South Africa inverts the North American rule: the edge lines are yellow and the centre line is white. Traffic also drives on the left.',
    descriptionTr:
      'Güney Afrika Kuzey Amerika kuralını tersine çevirir: kenar çizgileri sarı, orta çizgi beyazdır. Ayrıca trafik soldan akar.',
    difficulty: 2,
    art: { kind: 'road', centre: '#f8fafc', edge: '#facc15', dashed: true },
  },
  {
    slug: 'nz-road',
    countryCode: 'NZ',
    category: 'ROAD_LINE',
    titleEn: 'White lines with a wide sealed shoulder',
    titleTr: 'Geniş asfalt banketli beyaz çizgiler',
    descriptionEn:
      'New Zealand keeps every line white and drives on the left, with rolling green hills and yellow-topped marker posts along the verge.',
    descriptionTr:
      'Yeni Zelanda tüm çizgileri beyaz tutar ve soldan trafiği kullanır; dalgalı yeşil tepeler ve banket boyunca sarı başlı işaret direkleri görülür.',
    difficulty: 4,
    art: { kind: 'road', centre: '#f8fafc', edge: '#f8fafc', dashed: true },
  },
  {
    slug: 'cl-road',
    countryCode: 'CL',
    category: 'ROAD_LINE',
    titleEn: 'White centre line with orange-tipped posts',
    titleTr: 'Turuncu uçlu direkli beyaz orta çizgi',
    descriptionEn:
      'Chile marks the centre in white and lines its roads with slim posts capped in orange, against dry mountain slopes.',
    descriptionTr:
      'Şili orta çizgiyi beyaz işaretler ve yollarını kuru dağ yamaçlarına karşı turuncu uçlu ince direklerle çevreler.',
    difficulty: 4,
    art: { kind: 'road', centre: '#f8fafc', edge: '#fb923c', dashed: true },
  },
  {
    slug: 'ru-script',
    countryCode: 'RU',
    category: 'LANGUAGE',
    titleEn: 'Cyrillic script on blue signs',
    titleTr: 'Mavi tabelalarda Kiril alfabesi',
    descriptionEn:
      'Cyrillic narrows the world to a handful of countries. Russia pairs it with blue road signs and a white plate carrying a RUS oval.',
    descriptionTr:
      'Kiril alfabesi olasılıkları birkaç ülkeye indirir. Rusya bunu mavi yol tabelaları ve RUS ovali taşıyan beyaz plakayla birleştirir.',
    difficulty: 2,
    art: {
      kind: 'sign',
      text: 'Москва 120',
      background: '#1d4ed8',
      foreground: '#f8fafc',
      rounded: false,
    },
  },
  {
    slug: 'th-script',
    countryCode: 'TH',
    category: 'LANGUAGE',
    titleEn: 'Thai script on green signs',
    titleTr: 'Yeşil tabelalarda Tayca yazı',
    descriptionEn:
      'Thai script with its looping ascenders appears on green directional signs, usually alongside a romanised line underneath.',
    descriptionTr:
      'Kıvrımlı üst uzantılarıyla Tayca yazı yeşil yön tabelalarında görülür ve genellikle altında Latin harfli bir satır bulunur.',
    difficulty: 2,
    art: {
      kind: 'sign',
      text: 'กรุงเทพฯ 45',
      background: '#15803d',
      foreground: '#f8fafc',
      rounded: false,
    },
  },
  {
    slug: 'jp-script',
    countryCode: 'JP',
    category: 'LANGUAGE',
    titleEn: 'Kanji on blue signs with a route shield',
    titleTr: 'Rota kalkanlı mavi tabelalarda kanji',
    descriptionEn:
      'Japan mixes kanji and kana on blue signs and marks national routes with a distinctive inverted triangle shield.',
    descriptionTr:
      'Japonya mavi tabelalarda kanji ve kanayı birlikte kullanır ve ulusal yolları kendine özgü ters üçgen kalkanla işaretler.',
    difficulty: 2,
    art: {
      kind: 'sign',
      text: '東京 45km',
      background: '#1e40af',
      foreground: '#f8fafc',
      rounded: true,
    },
  },
  {
    slug: 'au-vegetation',
    countryCode: 'AU',
    category: 'VEGETATION',
    titleEn: 'Eucalyptus over red soil',
    titleTr: 'Kızıl toprak üzerinde okaliptüs',
    descriptionEn:
      'Sparse eucalyptus with pale peeling trunks over red or ochre soil is the outback signature. Look for the grey-green leaf colour.',
    descriptionTr:
      'Kızıl veya koyu sarı toprak üzerinde soluk, kabuk atan gövdeli seyrek okaliptüsler outback imzasıdır. Gri-yeşil yaprak rengine dikkat edin.',
    difficulty: 2,
    art: { kind: 'scene', sky: '#7dd3fc', ground: '#b45309', accent: '#65a30d', motif: 'trees' },
  },
  {
    slug: 'fi-vegetation',
    countryCode: 'FI',
    category: 'VEGETATION',
    titleEn: 'Dense pine and birch walls',
    titleTr: 'Sık çam ve huş duvarları',
    descriptionEn:
      'Finland lines its roads with an unbroken wall of pine and birch, with white trunks and a very flat horizon behind them.',
    descriptionTr:
      'Finlandiya yollarını kesintisiz bir çam ve huş duvarıyla çevreler; beyaz gövdeler ve arkalarında çok düz bir ufuk vardır.',
    difficulty: 4,
    art: { kind: 'scene', sky: '#cbd5e1', ground: '#334155', accent: '#166534', motif: 'trees' },
  },
  {
    slug: 'jp-poles',
    countryCode: 'JP',
    category: 'POLE',
    titleEn: 'Concrete poles with stacked transformers',
    titleTr: 'Üst üste trafolu beton direkler',
    descriptionEn:
      'Japanese streets are crowded with slim concrete utility poles carrying cylindrical transformers and dense cable bundles.',
    descriptionTr:
      'Japon sokakları, silindirik trafolar ve yoğun kablo demetleri taşıyan ince beton elektrik direkleriyle doludur.',
    difficulty: 3,
    art: { kind: 'scene', sky: '#e2e8f0', ground: '#475569', accent: '#94a3b8', motif: 'poles' },
  },
  {
    slug: 'tr-architecture',
    countryCode: 'TR',
    category: 'ARCHITECTURE',
    titleEn: 'Concrete apartment blocks with red roofs',
    titleTr: 'Kırmızı çatılı beton apartmanlar',
    descriptionEn:
      'Turkish towns are built from repeated concrete apartment blocks with terracotta roofs, solar water tanks on top and white satellite dishes.',
    descriptionTr:
      'Türkiye kentleri, kiremit çatılı, üstünde güneş enerjili su depoları ve beyaz çanak antenler bulunan tekrarlayan beton apartmanlardan oluşur.',
    difficulty: 3,
    art: { kind: 'scene', sky: '#93c5fd', ground: '#a16207', accent: '#b91c1c', motif: 'roofs' },
  },
];
