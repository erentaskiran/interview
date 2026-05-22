# AInterview

## README Dosyasının Amacı

README dosyası, bir yazılım projesinin ne yaptığını, hangi teknolojilerle geliştirildiğini, nasıl kurulacağını ve nasıl çalıştırılacağını açıklayan temel dokümandır. Projeyi GitHub üzerinden inceleyen bir geliştiricinin veya değerlendiricinin kaynak kodu çalıştırmadan önce proje hakkında hızlı ve doğru bilgi almasını sağlar.

Yazılım projelerinde README önemlidir çünkü proje paylaşımını daha profesyonel hale getirir, kurulum sürecindeki belirsizlikleri azaltır ve ekip dışındaki kişilerin projeyi daha kolay anlamasına yardımcı olur. Ayrıca proje büyüdükçe kullanım, geliştirme ve katkı süreçleri için ortak bir referans noktası oluşturur.

## Proje Tanımı

AInterview, yapay zeka destekli mülakat simülasyonu sunan bir web uygulamasıdır. Kullanıcılar sisteme kayıt olabilir, mülakat şablonları oluşturabilir, hazır şablonları inceleyebilir ve seçilen şablona göre sesli veya yazılı cevaplarla mülakat oturumu başlatabilir.

Sistem, verilen cevaplara göre oturum akışını yönetir ve mülakat sonunda kullanıcıya puan, güçlü yönler, geliştirilmesi gereken alanlar ve öneriler içeren bir geri bildirim üretir. Proje; frontend, API servisi, speech servisi ve ortak tip paketlerinden oluşan modüler bir monorepo yapısında geliştirilmiştir.

## Özellikler

- Kullanıcı kayıt, giriş ve JWT tabanlı kimlik doğrulama
- Mülakat şablonu oluşturma, listeleme ve detay görüntüleme
- Şablon beğenme ve beğenilen şablonları görüntüleme
- Kullanıcı profili ve geçmiş mülakat oturumları
- Yapay zeka destekli soru üretimi ve cevap değerlendirme
- Minimum ve maksimum soru sayısına göre uyarlanabilir oturum akışı
- Sesli cevap alma, konuşmayı metne çevirme ve metinden ses üretme
- React tabanlı component odaklı kullanıcı arayüzü
- Backend, frontend ve speech servisleri için otomatik test altyapısı

## Kullanılan Teknolojiler

### Frontend

- React
- Vite
- TypeScript
- React Router
- Vitest
- React Testing Library
- Playwright

### Backend

- Node.js
- Fastify
- TypeScript
- Prisma
- JWT
- Zod
- Vitest

### Speech Servisi

- Fastify
- TypeScript
- Deepgram TTS ve STT entegrasyonu

### Veritabanı ve Altyapı

- PostgreSQL
- Docker Compose
- npm workspaces
- Prettier

## Kurulum Adımları

1. Depoyu klonlayın.

```bash
git clone <repository-url>
cd interview
```

2. Bağımlılıkları yükleyin.

```bash
npm install
```

3. Ortam değişkeni dosyalarını oluşturun.

```bash
cp services/api/.env.example services/api/.env
cp services/speech/.env.example services/speech/.env
cp apps/web/.env.example apps/web/.env
```

4. Gerekli ortam değişkenlerini düzenleyin.

```bash
services/api/.env
services/speech/.env
apps/web/.env
```

5. PostgreSQL servisini başlatın.

```bash
docker compose up -d postgres
```

6. Prisma migration ve client oluşturma işlemlerini çalıştırın.

```bash
npm run prisma:migrate
npm run prisma:generate
```

7. Servisleri ayrı terminallerde başlatın.

```bash
npm run dev:speech
npm run dev:api
npm run dev:web
```

## Kullanım

Web arayüzü varsayılan olarak Vite geliştirme sunucusu üzerinden çalışır. Uygulama açıldıktan sonra kullanıcı kayıt olabilir veya giriş yapabilir, mülakat şablonlarını inceleyebilir ve bir şablon seçerek mülakat oturumu başlatabilir.

API servisi varsayılan olarak `http://localhost:4000` adresinde, speech servisi ise `http://localhost:4001` adresinde çalışır. Frontend uygulaması API adresini `apps/web/.env` dosyasındaki `VITE_API_URL` değişkeninden alır.

Projeyi test etmek için aşağıdaki komut kullanılabilir.

```bash
npm test
```

Projeyi build etmek için aşağıdaki komut kullanılabilir.

```bash
npm run build
```

Kod formatını kontrol etmek için aşağıdaki komut kullanılabilir.

```bash
npm run format:check
```

## Katkı

Projeye katkı sağlamak için önce yeni bir branch oluşturulmalı, değişiklikler bu branch üzerinde yapılmalı ve testler çalıştırıldıktan sonra pull request açılmalıdır. Yeni özellik eklenirken mevcut kod yapısına uyulmalı, mümkün olduğunca küçük ve anlaşılır değişiklikler yapılmalıdır.

Katkı sürecinde dikkat edilmesi gerekenler:

- Kod TypeScript tip kontrollerinden geçmelidir.
- Mevcut testler çalışır durumda olmalıdır.
- Yeni davranış ekleniyorsa uygun testler yazılmalıdır.
- Gereksiz refactor veya proje kapsamı dışı değişikliklerden kaçınılmalıdır.
- Commit mesajları açık ve kısa olmalıdır.

## Lisans

Bu proje eğitim ve geliştirme amacıyla hazırlanmıştır. Ayrı bir lisans dosyası eklenmediği sürece tüm hakları proje geliştiricilerine aittir.
