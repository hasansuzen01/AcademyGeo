Canlıya çıkarken aynı OAuth client'a canlı adresleri de ekle:

```
https://academygeo.com
https://api.academygeo.com/api/auth/callback/google
```

Uygulamayı herkese açmak için OAuth consent screen sayfasındaki **Publish app**
düğmesine bas. Yalnızca temel profil ve e-posta izinleri istendiği için Google
doğrulaması gerekmez.

**Doğru yol (canlı için):** Bucket → **Settings** → **Custom Domains** →
**Connect Domain** → `media.academygeo.com` gibi bir alt alan adı bağla.
Cloudflare DNS kaydını kendisi ekler.

```
R2_PUBLIC_BASE_URL=https://media.academygeo.com
```

r2.dev adresi hız sınırlıdır ve önbelleğe alınmaz, canlıda özel alan adı kullan.

## 7. Canlıya çıkmadan önce

- [ ] `BETTER_AUTH_SECRET` geliştirme ortamındakinden farklı
- [ ] Google OAuth client'ında canlı origin ve callback adresleri kayıtlı
- [ ] OAuth consent screen "Published" durumda
- [ ] R2 bucket'ında özel alan adı ve canlı origin'i içeren CORS kaydı var
- [ ] `NEXT_PUBLIC_MEDIA_HOST` bucket adresine ayarlı ve web yeniden derlendi
- [ ] `AUTH_COOKIE_DOMAIN` web ve API farklı alt alan adlarındaysa dolu
- [ ] `npm run db:deploy --workspace api` ile migration'lar uygulandı
- [ ] `ADMIN_EMAILS` dolu ya da en az bir hesap `admin:grant` ile yükseltildi
