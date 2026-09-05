# Servisler ve anahtarlar

AcademyGeo dört dış servise bağlanır: PostgreSQL, Redis, Google OAuth ve
Cloudflare R2. Bu belge her birinin anahtarını nereden alacağını ve hangi
dosyaya yazacağını anlatır.

İki env dosyası var ve hiçbiri diğerini okumaz:

| Dosya | Kimin için | Ne zaman gerekir |
| --- | --- | --- |
| `backend/.env` | NestJS API | `npm run dev` |
| `frontend/.env.local` | Next.js arayüzü | `npm run dev` |

`docker compose up` de aynı iki dosyayı okur, bu yüzden kök dizinde ayrı
bir `.env` yok. Bir değeri tek bir yerde tutman yeter.

Başlangıç:

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env.local
```

## 1. PostgreSQL ve Redis

Yerelde ikisi de Docker'dan gelir. Makinende başka projeler 5432 ve 6379'u
tutuyor olabileceği için bu proje 5433 ve 6380 kullanır.

```bash
docker compose up -d postgres redis
npm run db:migrate --workspace backend
npm run seed --workspace backend
```

`backend/.env` içine:

```
DATABASE_URL=postgresql://academygeo:PAROLA@localhost:5433/academygeo?schema=public
REDIS_URL=redis://localhost:6380
```

Parolayı `docker-compose.yml` içindeki `POSTGRES_PASSWORD` ile aynı yap.

Canlıda yönetilen bir servis kullanmak istersen: veritabanı için Neon veya
Supabase, Redis için Upstash. Her biri sana hazır bir bağlantı adresi verir,
onu olduğu gibi yapıştır. Neon ve Upstash adreslerinin sonundaki `sslmode` ve
`rediss://` kısımlarını silme.

## 2. BETTER_AUTH_SECRET

Oturum çerezini imzalayan rastgele dizedir. Kimseden alınmaz, sen üretirsin.

```bash
openssl rand -base64 32
```

`openssl` yoksa:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

Çıkan değeri `backend/.env` içindeki `BETTER_AUTH_SECRET` alanına yaz. Canlı
ortamda geliştirme ortamındakinden farklı bir değer kullan. Bu değeri
değiştirdiğinde herkesin oturumu kapanır.

`BETTER_AUTH_URL` API'nin kendi adresidir, yerelde `http://localhost:3001`.

## 3. Google ile giriş

Giriş yönteminin tamamı budur, e-posta ve parola kapalıdır.

1. [Google Cloud Console](https://console.cloud.google.com/) aç, sağ üstten
   yeni bir proje oluştur.
2. Sol menüden **APIs & Services** → **OAuth consent screen**.
3. **External** seç, devam et.
4. Uygulama adı, destek e-postası ve geliştirici e-postası gir. Logo ve alan
   adı doğrulaması bu aşamada gerekmez.
5. **Scopes** adımında hiçbir şey ekleme. Uygulama yalnızca temel profil ve
   e-posta ister, bunlar varsayılan olarak gelir.
6. **Test users** adımında kendi Google hesabını ekle. Uygulama yayına
   alınana kadar yalnızca buradaki hesaplar giriş yapabilir.
7. **APIs & Services** → **Credentials** → **Create Credentials** →
   **OAuth client ID**.
8. Application type olarak **Web application** seç.
9. **Authorized JavaScript origins** alanına arayüzün adresini ekle:

   ```
   http://localhost:3000
   ```

10. **Authorized redirect URIs** alanına API'nin geri dönüş adresini ekle.
    Buradaki port arayüzün değil API'nin portudur, en sık yapılan hata budur:

    ```
    http://localhost:3001/api/auth/callback/google
    ```

11. **Create** de. Açılan kutudaki iki değeri `backend/.env` içine yaz:

    ```
    GOOGLE_CLIENT_ID=...apps.googleusercontent.com
    GOOGLE_CLIENT_SECRET=GOCSPX-...
    ```

Client secret'ı sonradan tekrar görebilirsin, ama kaybedersen yenisini
üretmen gerekir.

Canlıya çıkarken aynı OAuth client'a canlı adresleri de ekle:

```
https://academygeo.com
https://api.academygeo.com/api/auth/callback/google
```

Uygulamayı herkese açmak için OAuth consent screen sayfasındaki **Publish app**
düğmesine bas. Yalnızca temel profil ve e-posta izinleri istendiği için Google
doğrulaması gerekmez.

### Giriş çalışmıyorsa

Ayrı bir kayıt olma adımı yoktur. Google ile ilk girişte hesap kendiliğinden
oluşur, `ADMIN_EMAILS` listesindeysen yönetici olarak.

`redirect_uri_mismatch` hatası, adım 10'daki adresin harfi harfine
eşleşmediği anlamına gelir. Sondaki eğik çizgi ve port dahil aynı olmalı.

Düğmeye bastığında hiçbir şey olmuyorsa sorun Google'da değil, arayüzün
JavaScript'inin çalışmamasındadır. Tarayıcı konsolunu aç. `SyntaxError`
görüyorsan aşağıdaki Console Ninja notuna bak.

`state_not_found` hatası, Google'dan dönen adresteki sorgu dizesinin API'ye
ulaşmadığı anlamına gelir. Better Auth handler'ı joker karakterli bir yola
bağlanırsa Express yolun tamamını `baseUrl` içine koyar ve sorgu düşer.
`backend/src/auth/mount-auth.ts` bu yüzden düz bir önek kullanır ve
`mount-auth.spec.ts` bunu koruyan testi taşır.

`state_mismatch` görüyorsan state kaydı bulunamamıştır. Google ekranında beş
dakikadan uzun kaldıysan ya da bu arada veritabanını sıfırladıysan normaldir,
girişi baştan başlat.

`internal_server_error` ile birlikte kayıtlarda `Unknown argument` diyen bir
Prisma hatası görüyorsan şema, Better Auth'un beklediği tablolarla uyuşmuyor
demektir. `npm run db:deploy --workspace backend` ile migration'ları uygula.
`backend/src/auth/auth-schema.spec.ts` iki tarafı karşılaştırır, yani bu
uyuşmazlık normalde teste takılır. Better Auth sürümünü yükselttikten sonra
`npm test` çalıştır.

## 4. Yönetici hesabı

Yönetici panelinin ayrı bir giriş sayfası yoktur. Rol sunucuda kontrol edilir,
rolü olmayan `/admin` adresine gittiğinde 404 alır.

İlk yönetici, `ADMIN_EMAILS` listesindeki bir adresle giriş yapan kişidir:

```
ADMIN_EMAILS=sen@ornek.com,ortak@ornek.com
```

Bu yalnızca hesap ilk oluşturulurken bakılır. Zaten var olan bir hesabı
yükseltmek için:

```bash
npm run admin:grant --workspace backend -- sen@ornek.com
```

Son yöneticinin rolü panelden geri alınamaz, aksi halde kimse içeri
giremezdi.

## 5. Cloudflare R2 (fotoğraf depolama)

Yönetici bir kart eklerken fotoğrafı doğrudan tarayıcıdan R2'ye yükler. API
yalnızca imza üretir, dosya API'nin üzerinden geçmez.

1. [Cloudflare panelinde](https://dash.cloudflare.com/) **R2 Object Storage**
   bölümüne gir. İlk kullanımda kredi kartı doğrulaması ister; 10 GB'a kadar
   ücretsizdir.
2. **Create bucket** ile bir bucket aç, örneğin `academygeo-media`. Konum
   **Automatic** kalabilir.

   ```
   R2_BUCKET=academygeo-media
   ```

3. Hesap kimliğini R2 ana sayfasının sağındaki **Account ID** alanından ya da
   tarayıcı adresindeki uzun onaltılık dizeden al:

   ```
   R2_ACCOUNT_ID=32 karakterlik dize
   ```

4. **Manage R2 API Tokens** → **Create API token**. İzin olarak
   **Object Read & Write** seç ve yalnızca bu bucket'ı kapsayacak şekilde
   daralt. Oluştur.
5. Ekranda **Access Key ID** ve **Secret Access Key** görünür. Secret bir daha
   gösterilmez, hemen kopyala:

   ```
   R2_ACCESS_KEY_ID=32 karakterlik dize
   R2_SECRET_ACCESS_KEY=64 karakterlik dize
   ```

   Aynı ekrandaki S3 endpoint adresini kullanmana gerek yok, uygulama onu
   hesap kimliğinden kendisi kurar.

6. Bucket → **Settings** → **Public access**. Geliştirme için **R2.dev
   subdomain** başlığındaki **Allow Access** düğmesine bas. Sana şuna benzer
   bir adres verir:

   ```
   R2_PUBLIC_BASE_URL=https://pub-abc123....r2.dev
   ```

   Aynı adresi arayüz tarafına da yaz, yoksa yüklenen fotoğraflar kırık
   görünür:

   ```
   # frontend/.env.local
   NEXT_PUBLIC_MEDIA_HOST=https://pub-abc123....r2.dev
   ```

   Bu değer derleme sırasında okunur. Değiştirdiğinde arayüzü yeniden
   başlatman gerekir.

7. Bucket → **Settings** → **CORS Policy** → **Add CORS policy**. Bu adım
   olmadan tarayıcıdan yükleme sessizce başarısız olur:

   ```json
   [
     {
       "AllowedOrigins": ["http://localhost:3000", "https://academygeo.com"],
       "AllowedMethods": ["PUT", "GET"],
       "AllowedHeaders": ["content-type"],
       "MaxAgeSeconds": 3600
     }
   ]
   ```

Yüklemeler 8 MB ile sınırlıdır ve yalnızca JPEG, PNG, WebP ve AVIF kabul
edilir. SVG bilerek dışarıda bırakıldı: medya alan adından sunulan bir SVG
betik taşıyabilir.

**Doğru yol (canlı için):** Bucket → **Settings** → **Custom Domains** →
**Connect Domain** → `media.academygeo.com` gibi bir alt alan adı bağla.
Cloudflare DNS kaydını kendisi ekler.

```
R2_PUBLIC_BASE_URL=https://media.academygeo.com
```

r2.dev adresi hız sınırlıdır ve önbelleğe alınmaz, canlıda özel alan adı kullan.

## 6. Tüm değişkenler

`backend/.env`:

| Anahtar | Zorunlu | Nereden |
| --- | --- | --- |
| `PORT` | hayır | Varsayılan 3001 |
| `API_URL` | evet | API'nin kendi adresi |
| `WEB_URL` | evet | Arayüzün adresi, virgülle çoğaltılabilir |
| `CORS_ORIGIN` | evet | Genelde `WEB_URL` ile aynı |
| `DATABASE_URL` | evet | Bölüm 1 |
| `REDIS_URL` | evet | Bölüm 1 |
| `BETTER_AUTH_SECRET` | evet | Bölüm 2, kendin üretirsin |
| `BETTER_AUTH_URL` | evet | `API_URL` ile aynı |
| `GOOGLE_CLIENT_ID` | evet | Bölüm 3 |
| `GOOGLE_CLIENT_SECRET` | evet | Bölüm 3 |
| `AUTH_COOKIE_DOMAIN` | hayır | Yalnızca web ve API farklı alt alan adlarındaysa |
| `ADMIN_EMAILS` | hayır | Bölüm 4 |
| `R2_ACCOUNT_ID` | hayır | Bölüm 5, boşsa yükleme kapalı |
| `R2_ACCESS_KEY_ID` | hayır | Bölüm 5 |
| `R2_SECRET_ACCESS_KEY` | hayır | Bölüm 5 |
| `R2_BUCKET` | hayır | Bölüm 5 |
| `R2_PUBLIC_BASE_URL` | hayır | Bölüm 5 |

API, ilk üç zorunlu kimlik değeri olmadan başlamayı reddeder ve hangi dosyayı
dolduracağını söyler.

`frontend/.env.local`:

| Anahtar | Zorunlu | Nereden |
| --- | --- | --- |
| `NEXT_PUBLIC_API_URL` | evet | API'nin tarayıcıdan görünen adresi |
| `NEXT_PUBLIC_AUTH_URL` | evet | Genelde API adresiyle aynı |
| `NEXT_PUBLIC_APP_URL` | evet | Arayüzün kendi adresi |
| `NEXT_PUBLIC_MEDIA_HOST` | R2 kullanıyorsan | Bölüm 5 |
| `INTERNAL_API_URL` | hayır | Yalnızca Docker ağı içinde, yerelde yorumda kalsın |
| `DEFAULT_COUNTRY` | hayır | Geo başlığı yoksa varsayılan ülke, boşsa İngilizce |

## 7. Console Ninja uyarısı

Bu makinede Console Ninja eklentisi kuruluysa Next.js'i yamalar ve tarayıcıya
bozuk JavaScript gönderir. Sayfa açılır, ama hiçbir düğme çalışmaz, Google
giriş düğmesi dahil. Konsolda Next'in kendi paketlerinde `SyntaxError`
görürsün.

Çözüm: eklentiyi bu proje için duraklat (komut paletinde **Console Ninja:
Pause**), sonra:

```bash
rm -rf frontend/.next
npm run dev
```

Eklenti `node_modules` içindeki dosyaları da değiştirir. Tekrar temizlemek
için `npm ci` yeterlidir.

Aynı anda iki `next dev` sunucusu çalıştırmak da aynı klasöre yazdıkları için
paketleri bozar. Hata mesajı "Another next dev server is already running"
diyorsa eskisini kapat.

## 8. Canlıya çıkmadan önce

- [ ] `BETTER_AUTH_SECRET` geliştirme ortamındakinden farklı
- [ ] Google OAuth client'ında canlı origin ve callback adresleri kayıtlı
- [ ] OAuth consent screen "Published" durumda
- [ ] R2 bucket'ında özel alan adı ve canlı origin'i içeren CORS kaydı var
- [ ] `NEXT_PUBLIC_MEDIA_HOST` bucket adresine ayarlı ve web yeniden derlendi
- [ ] `AUTH_COOKIE_DOMAIN` web ve API farklı alt alan adlarındaysa dolu
- [ ] `npm run db:deploy --workspace backend` ile migration'lar uygulandı
- [ ] `ADMIN_EMAILS` dolu ya da en az bir hesap `admin:grant` ile yükseltildi
- [ ] `backend/.env` içinde R2 ve `ADMIN_EMAILS` değerleri var
