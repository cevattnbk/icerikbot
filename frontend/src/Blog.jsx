import { useState } from "react";
const POSTS = [
  {
    id: 1,
    slug: "trendyolda-satis-artiran-urun-aciklamasi",
    title: "Trendyol'da Satışlarını Artıracak Ürün Açıklaması Nasıl Yazılır?",
    date: "28 Haziran 2026",
    readTime: "5 dk okuma",
    category: "İçerik Üretimi",
    summary: "Trendyol'da öne çıkmak için ürün açıklamanızı nasıl optimize edeceğinizi öğrenin. SEO uyumlu başlık, doğru anahtar kelimeler ve etkileyici açıklama teknikleri.",
    content: `
Trendyol'da milyonlarca ürün arasından sıyrılmak için güçlü bir ürün açıklaması şart. Peki iyi bir ürün açıklaması nasıl yazılır?

## 1. Başlık Optimizasyonu

Trendyol'da başlık en kritik unsurdur. İdeal başlık şu formatı izler:

**[Marka] + [Ürün Adı] + [Ana Özellik] + [Hedef Kitle/Kullanım]**

Örnek: "Nike Air Max 90 Erkek Spor Ayakkabı - Beyaz/Siyah - Günlük Kullanım"

Başlığınızda şunlara dikkat edin:
- Maksimum 100 karakter kullanın
- En önemli anahtar kelimeleri başa koyun
- Marka adını mutlaka ekleyin
- Renk, beden veya malzeme gibi filtreleme özelliklerini belirtin

## 2. Ürün Açıklaması Yapısı

İyi bir Trendyol açıklaması 3 bölümden oluşur:

**Giriş (1-2 cümle):** Ürünü tanıt, en güçlü özelliğini vurgula.

**Özellikler (madde madde):** Teknik detayları, malzemeyi, boyutları listele. Trendyol kullanıcıları bu kısmı tarar, özenle hazırla.

**Faydalar (2-3 cümle):** Ürün hayatı nasıl kolaylaştırır? Duygusal bağ kur.

## 3. Anahtar Kelime Stratejisi

Müşterilerin arama kutusuna ne yazdığını düşün:
- "ucuz kadın bot"
- "su geçirmez bot kışlık"
- "topuklu bot 38 numara"

Bu aramaları açıklamanıza doğal şekilde yerleştirin. Zorlamayın — Google ve Trendyol algoritmaları anahtar kelime doldurmayı cezalandırır.

## 4. Yapay Zeka ile İçerik Üretimi

Tüm bu süreci manuel yapmak yerine İçerikBot gibi araçlarla saniyeler içinde profesyonel içerik üretebilirsiniz. Ürün linkini yapıştırın, platform olarak Trendyol'u seçin, içeriği anında alın.

## Sonuç

İyi bir ürün açıklaması; doğru anahtar kelimeler, net bir yapı ve müşterinin sorununu çözen bir dil gerektirir. Bu üç unsuru bir araya getirdiğinizde dönüşüm oranlarınızın arttığını göreceksiniz.
    `
  },
  {
    id: 2,
    slug: "eticarette-seo-urun-basligi",
    title: "E-Ticarette SEO: Ürün Başlığı Optimizasyonu Rehberi",
    date: "25 Haziran 2026",
    readTime: "4 dk okuma",
    category: "SEO",
    summary: "E-ticaret sitenizdeki ürün başlıklarını SEO için nasıl optimize edeceğinizi öğrenin. Daha fazla organik trafik ve daha yüksek dönüşüm için pratik ipuçları.",
    content: `
E-ticarette SEO, ürün başlıklarından başlar. Doğru optimize edilmiş bir başlık hem arama motorlarında üst sıralara çıkar hem de kullanıcıları tıklamaya teşvik eder.

## Ürün Başlığında Olması Gerekenler

**1. Ana Anahtar Kelime**
En önemli kelimeyi başa koyun. "Deri Cüzdan Erkek" değil, "Erkek Deri Cüzdan" — çünkü kullanıcılar genellikle ürün kategorisiyle başlar.

**2. Marka Adı**
Marka bilinirliği varsa başa koyun. Yoksa sona koyabilirsiniz.

**3. Ayırt Edici Özellik**
Renk, malzeme, boyut veya özel bir özellik ekleyin: "Kahverengi", "Hakiki Deri", "12 Kart Bölmeli"

**4. Kullanım Amacı**
"Günlük Kullanım", "İş Hayatı", "Hediye" gibi kelimeler long-tail aramalarda sizi öne çıkarır.

## Kaçınılması Gereken Hatalar

- Başlığı anahtar kelimeyle doldurmak
- Gereksiz noktalama işaretleri kullanmak
- Çok uzun başlıklar (60 karakteri geçmeyin)
- Büyük harf kullanımını abartmak

## Pratik Formül

**[Kategori] + [Marka] + [Model/Tip] + [Renk/Boyut] + [Özellik]**

Örnek: "Spor Ayakkabı Adidas Ultraboost 22 Siyah Erkek Koşu Ayakkabısı"

## Sonuç

SEO uyumlu başlıklar yazmak zaman alır ama karşılığını verir. İçerikBot ile ürün linkini yapıştırarak anında SEO optimize başlıklar üretebilirsiniz.
    `
  },
  {
    id: 3,
    slug: "kargo-desi-hesaplama",
    title: "Kargo Desi Nedir? Nasıl Hesaplanır? (2026 Güncel Rehber)",
    date: "20 Haziran 2026",
    readTime: "3 dk okuma",
    category: "E-Ticaret",
    summary: "Kargo desi hesaplaması nasıl yapılır? Desi formülü, kargo ücretleri ve fazla ödememek için bilmeniz gerekenler bu rehberde.",
    content: `
E-ticaret satıcılarının en çok karıştırdığı konulardan biri kargo desi hesaplamasıdır. Yanlış hesaplama hem maliyet artışına hem de beklenmedik kargo ücretlerine yol açar.

## Desi Nedir?

Desi, kargo şirketlerinin paketlerin taşıma maliyetini hesaplarken kullandığı hacimsel ağırlık birimidir. Bir paket küçük ama hafif olabilir ya da büyük ama ağır — kargo şirketleri her iki durumda da en yüksek ağırlığı baz alır.

## Desi Formülü

**Desi = (En × Boy × Yükseklik) ÷ 3000**

Örnek:
- Kutu boyutları: 30cm × 20cm × 15cm
- Desi = (30 × 20 × 15) ÷ 3000 = 9.000 ÷ 3.000 = **3 desi**

## Gerçek Ağırlık mı, Desi mi?

Kargo şirketi her zaman **gerçek ağırlık ile desi ağırlığından büyük olanı** baz alır.

Örnek:
- Ürün ağırlığı: 1 kg
- Hesaplanan desi: 3 kg
- Kargo ücreti **3 kg** üzerinden hesaplanır

## Desi Maliyetini Düşürme İpuçları

1. **Sıkı paketleyin** — Fazla boşluk hacmi artırır, desiyi yükseltir
2. **Doğru kutu seçin** — Ürüne uygun boyutta kutu kullanın
3. **Hafif ambalaj malzemesi tercih edin** — Baloncuklu naylon yerine kağıt dolgu
4. **Toplu gönderi yapın** — Birden fazla ürünü tek pakette gönderin

## Ücretsiz Desi Hesaplayıcı

İçerikBot'un ana sayfasındaki ücretsiz desi hesaplayıcı ile saniyeler içinde desi hesaplayabilirsiniz. En, boy ve yüksekliği girin, sonucu anında görün.
    `
  },
  {
    id: 4,
    slug: "instagram-urun-satisi-post-stratejisi",
    title: "Instagram'da Ürün Satışı İçin En Etkili Post Stratejileri",
    date: "15 Haziran 2026",
    readTime: "6 dk okuma",
    category: "Sosyal Medya",
    summary: "Instagram'da ürün satışlarınızı artıracak içerik stratejileri, hashtag kullanımı ve gönderi zamanlaması hakkında kapsamlı rehber.",
    content: `
Instagram, Türkiye'deki e-ticaret satıcıları için en güçlü satış kanallarından biri. Doğru stratejiyle organik erişiminizi ve satışlarınızı önemli ölçüde artırabilirsiniz.

## İçerik Türleri

**1. Ürün Fotoğrafı**
Beyaz veya düz arka plan üzerinde yüksek çözünürlüklü ürün fotoğrafı. En basit ama en etkili format.

**2. Yaşam Tarzı Fotoğrafı**
Ürünü kullanırken çekilmiş gerçek hayat fotoğrafları. Müşteri bağı kurar, dönüşüm oranını artırır.

**3. Reels (Kısa Video)**
Instagram algoritması Reels'e öncelik veriyor. 15-30 saniyelik ürün tanıtım videoları organik erişiminizi 3-5 kat artırabilir.

**4. Hikayeler (Stories)**
Günlük paylaşım için ideal. Anket, soru-cevap ve ürün linki sticker'ları ile etkileşim yaratın.

## Hashtag Stratejisi

3 katmanlı hashtag stratejisi kullanın:

**Büyük hashtagler (1-3 adet):** #moda #ayakkabı #alışveriş
**Orta hashtagler (3-5 adet):** #kadınayakkabı #topukluayakkabı
**Küçük hashtagler (5-10 adet):** #istanbul_moda #turkishfashion

Toplam 10-15 hashtag idealdir. 30 hashtag doldurmak artık işe yaramıyor.

## En İyi Paylaşım Saatleri

Türkiye için ideal saatler:
- **Sabah:** 08:00 - 09:00
- **Öğle:** 12:00 - 13:00
- **Akşam:** 19:00 - 21:00 (en yüksek etkileşim)

## Caption (Açıklama) Yazımı

İyi bir Instagram açıklaması şu yapıyı izler:
1. **İlk cümle** — dikkat çekici, merak uyandırıcı
2. **Ürün detayları** — kısa ve net
3. **CTA (Harekete Geçirme)** — "Link bio'da", "DM at", "Sipariş ver"
4. **Hashtagler** — en sona

## Yapay Zeka ile İçerik Üretimi

Her ürün için ayrı ayrı Instagram açıklaması yazmak zaman alır. İçerikBot ile ürün linkini yapıştırın, platform olarak Instagram'ı seçin — hazır post metni ve hashtagler anında gelsin.
    `
  },
];

export default function Blog({ post, onBack }) {
  const [selectedPost, setSelectedPost] = useState(post || null);

  const renderContent = (content) => {
    return content.split("\n").map((line, i) => {
      if (line.startsWith("## ")) {
        return <h2 key={i} className="text-xl font-bold text-white mt-8 mb-3">{line.replace("## ", "")}</h2>;
      }
      if (line.startsWith("**") && line.endsWith("**")) {
        return <p key={i} className="font-semibold text-white mt-4 mb-1">{line.replace(/\*\*/g, "")}</p>;
      }
      if (line.startsWith("- ")) {
        return <li key={i} className="text-slate-400 text-sm ml-4 mb-1 list-disc">{line.replace("- ", "")}</li>;
      }
      if (line.trim() === "") return <br key={i} />;
      return <p key={i} className="text-slate-400 text-sm leading-relaxed mb-2">{line}</p>;
    });
  };

  return (
    <div className="min-h-screen bg-[#0b121f] text-white">
      <header className="border-b border-slate-800 bg-[#0b121f]/90 backdrop-blur-md px-6 py-4 flex items-center gap-3 sticky top-0 z-10">
        <button onClick={selectedPost ? () => setSelectedPost(null) : onBack}
          className="flex items-center gap-1 text-slate-500 hover:text-white text-xs font-medium mr-2 transition-colors">
          ← {selectedPost ? "Blog'a Dön" : "Ana Sayfaya Dön"}
        </button>
        <div className="w-7 h-7 rounded-lg bg-cyan-500 flex items-center justify-center text-[#0b121f] font-black text-xs">İ</div>
        <span className="font-bold text-white">İçerik<span className="text-cyan-400">Bot</span></span>
        <span className="text-slate-600 text-sm ml-2">/ Blog</span>
      </header>

      {!selectedPost ? (
        <div className="max-w-4xl mx-auto px-6 py-12">
          <div className="mb-12">
            <p className="text-cyan-400 text-xs font-semibold uppercase tracking-widest mb-3">BLOG</p>
            <h1 className="text-4xl font-bold text-white mb-4">E-Ticaret Rehberleri</h1>
            <p className="text-slate-400">Trendyol, Hepsiburada ve diğer platformlarda satışlarınızı artıracak içerikler.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {POSTS.map(p => (
              <div key={p.id} onClick={() => setSelectedPost(p)}
                className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6 cursor-pointer hover:border-cyan-500/30 transition-all group">
                <span className="text-xs font-medium px-2 py-1 rounded-full border border-cyan-500/20 bg-cyan-500/10 text-cyan-400 mb-4 inline-block">
                  {p.category}
                </span>
                <h2 className="text-white font-bold text-lg mb-2 group-hover:text-cyan-400 transition-colors leading-snug">{p.title}</h2>
                <p className="text-slate-400 text-sm leading-relaxed mb-4">{p.summary}</p>
                <div className="flex items-center gap-3 text-xs text-slate-500">
                  <span>{p.date}</span>
                  <span>·</span>
                  <span>{p.readTime}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="max-w-2xl mx-auto px-6 py-12">
          <span className="text-xs font-medium px-2 py-1 rounded-full border border-cyan-500/20 bg-cyan-500/10 text-cyan-400 mb-6 inline-block">
            {selectedPost.category}
          </span>
          <h1 className="text-3xl font-bold text-white mb-4 leading-tight">{selectedPost.title}</h1>
          <div className="flex items-center gap-3 text-xs text-slate-500 mb-8 pb-8 border-b border-slate-800">
            <span>{selectedPost.date}</span>
            <span>·</span>
            <span>{selectedPost.readTime}</span>
          </div>
          <div className="prose prose-invert">
            {renderContent(selectedPost.content)}
          </div>
          <div className="mt-12 p-6 rounded-2xl border border-cyan-500/20 bg-cyan-500/5">
            <h3 className="text-white font-bold mb-2">İçerikBot ile Deneyin 🚀</h3>
            <p className="text-slate-400 text-sm mb-4">Ürün linkini yapıştırın, yapay zeka saniyeler içinde profesyonel içerik üretsin.</p>
            <button onClick={onBack}
              className="px-6 py-2.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-[#0b121f] font-semibold text-sm transition-all">
              Ücretsiz Dene →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}