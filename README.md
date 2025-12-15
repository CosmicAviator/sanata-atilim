# Sanata Atılım

Sanata Atılım, Atılım Üniversitesi Kütüphane Topluluğu'nun sanat, sinema, mitoloji ve edebiyat üzerine yazılar yayımladığı dijital arşividir.

---

Proje, Metropolitan Museum of Art koleksiyonundan rastgele seçilen klasik eserlerle karşılayan bir ana sayfa, kategori bazlı filtreleme ve modern bir okuma deneyimi sunar.

Supabase altyapısı üzerinde çalışan içerik yönetim sistemi, yetkili kullanıcıların makale oluşturmasına ve düzenlemesine olanak tanır.

---

## Kurulum

Bağımlılıkları yükleyin:

```
npm install
```

Ortam değişkenlerini yapılandırın:

```
cp .env.example .env
```

Supabase proje bilgilerinizi `.env` dosyasına ekleyin.

Geliştirme sunucusunu başlatın:

```
npm run dev
```

---

## Yapı

```
src/
  components/   Yeniden kullanılabilir arayüz bileşenleri
  pages/        Sayfa düzeni bileşenleri
  supabaseClient.js
```

---

## Dağıtım

Proje Vercel üzerinde barındırılmaktadır. Ana dala yapılan her commit otomatik olarak dağıtılır.

---

Atılım Üniversitesi Kütüphane Topluluğu
