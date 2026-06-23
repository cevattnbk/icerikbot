import { useState } from "react";

export default function Landing({ onStart }) {
  const [desiOpen, setDesiOpen] = useState(false);
  const [desi, setDesi] = useState({ en: "", boy: "", yukseklik: "", agirlik: "" });
  const en = parseFloat(desi.en) || 0;
  const boy = parseFloat(desi.boy) || 0;
  const yukseklik = parseFloat(desi.yukseklik) || 0;
  const agirlik = parseFloat(desi.agirlik) || 0;
  const hesaplananDesi = (en * boy * yukseklik) / 3000;
  const kargoAgirligi = Math.max(hesaplananDesi, agirlik);

  const [karOpen, setKarOpen] = useState(false);
  const [kar, setKar] = useState({ alis: "", satis: "", komisyon: "", kargo: "", ekstra: "", kdv: "20" });
  const alisFiyati = parseFloat(kar.alis) || 0;
  const satisFiyati = parseFloat(kar.satis) || 0;
  const komisyonOrani = parseFloat(kar.komisyon) || 0;
  const kargoUcreti = parseFloat(kar.kargo) || 0;
  const ekstraMasraf = parseFloat(kar.ekstra) || 0;
  const kdvOrani = parseFloat(kar.kdv) || 0;
  const komisyonTutari = satisFiyati * (komisyonOrani / 100);
  const kdvTutari = satisFiyati * (kdvOrani / 100);
  const toplamMasraf = alisFiyati + komisyonTutari + kdvTutari + kargoUcreti + ekstraMasraf;
  const netKarZarar = satisFiyati - toplamMasraf;
  const karMarji = satisFiyati > 0 ? (netKarZarar / satisFiyati) * 100 : 0;

  const [faqOpen, setFaqOpen] = useState(null);
  const faqs = [
    { q: "Hangi platformları destekliyorsunuz?", a: "Trendyol, Hepsiburada, Amazon TR ve Shopify platformlarını destekliyoruz. Diğer platformlar için manuel veri girişi yapabilirsiniz." },
    { q: "Ücretsiz planda ne kadar analiz yapabilirim?", a: "Ücretsiz planda 3 analiz hakkı tanımlanır. Kayıt için kredi kartı gerekmez." },
    { q: "Görsel yükleyerek içerik üretebilir miyim?", a: "Evet! Ürün fotoğrafınızı yükleyin, yapay zeka görseli analiz edip otomatik içerik üretsin." },
    { q: "Üretilen içerikler SEO uyumlu mu?", a: "Evet, Claude AI tüm içerikleri SEO optimizasyonlu olarak üretir — başlık, meta açıklama, anahtar kelimeler dahil." },
    { q: "Toplu analiz nasıl çalışır?", a: "Birden fazla ürün linkini alt alta yapıştırın, hepsini tek seferde analiz edin." },
    { q: "Verilerim güvende mi?", a: "Evet. Supabase altyapısı ile verileriniz şifrelenmiş ve güvenli şekilde saklanır." },
  ];

  return (
    <div className="min-h-screen bg-[#0b121f] text-white font-sans">

      {/* Announcement Bar */}
      <div className="bg-cyan-500 text-[#0b121f] text-xs font-semibold text-center py-2 px-4">
        🎉 3 analiz ücretsiz — Kredi kartı gerekmez &nbsp;·&nbsp; <button onClick={onStart} className="underline">Hemen Başla →</button>
      </div>

      {/* Navbar */}
      <header className="sticky top-0 z-50 border-b border-slate-800 bg-[#0b121f]/90 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-cyan-500 flex items-center justify-center text-[#0b121f] font-black text-sm">İ</div>
            <span className="font-bold text-lg text-white">İçerik<span className="text-cyan-400">Bot</span></span>
          </div>
          <nav className="hidden md:flex items-center gap-6 text-sm text-slate-400">
            <a href="#ozellikler" className="hover:text-white transition-colors">Özellikler</a>
            <a href="#araclar" className="hover:text-white transition-colors">Araçlar</a>
            <a href="#fiyatlar" className="hover:text-white transition-colors">Fiyatlar</a>
            <a href="#sss" className="hover:text-white transition-colors">SSS</a>
          </nav>
          <button onClick={onStart}
            className="px-5 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-[#0b121f] font-semibold text-sm transition-all shadow-[0_0_15px_rgba(6,182,212,0.3)]">
            Ücretsiz Dene →
          </button>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 pt-24 pb-20">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <p className="text-cyan-400 text-sm font-semibold uppercase tracking-widest mb-4">E-TİCARET SATICILAR İÇİN</p>
            <h1 className="text-5xl md:text-6xl font-extrabold leading-tight mb-6">
              Ürün linkini yapıştır,<br />
              <span className="text-cyan-400">içeriğini saniyeler</span><br />
              içinde al.
            </h1>
            <p className="text-slate-400 text-lg leading-relaxed mb-8">
              Ürün açıklaması, SEO uyumlu metinler ve sosyal medya gönderileri hazırlamakla saatlerinizi harcamayın. İçerikBot ile profesyonel içerikler 30 saniyede hazır.
            </p>

            {/* Badges */}
            <div className="flex flex-wrap gap-3 mb-8">
              {[
                { icon: "⚡", text: "3 Ücretsiz Analiz" },
                { icon: "🔒", text: "Kredi Kartı Gerekmez" },
                { icon: "🇹🇷", text: "Türkçe Destek" },
              ].map((b, i) => (
                <span key={i} className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-slate-700 bg-slate-800/50 text-slate-300 text-xs font-medium">
                  {b.icon} {b.text}
                </span>
              ))}
            </div>

            <div className="flex items-center gap-4">
              <button onClick={onStart}
                className="px-8 py-3.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-[#0b121f] font-bold text-base transition-all shadow-[0_0_25px_rgba(6,182,212,0.3)]">
                Ücretsiz Dene →
              </button>
              <span className="text-slate-500 text-sm">Kayıt 30 saniye</span>
            </div>
          </div>

          {/* Dashboard mockup */}
          <div className="hidden md:block">
            <div className="rounded-2xl border border-slate-700 bg-slate-900 p-4 shadow-[0_0_30px_rgba(6,182,212,0.15)]">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <div className="w-3 h-3 rounded-full bg-yellow-500" />
                <div className="w-3 h-3 rounded-full bg-green-500" />
                <div className="ml-2 flex-1 bg-slate-800 rounded px-3 py-1 text-xs text-slate-500">icerikbot.vercel.app</div>
              </div>
              <div className="space-y-2">
                <div className="bg-slate-800 rounded-lg p-3">
                  <div className="text-xs text-slate-500 mb-1">Platform Açıklaması</div>
                  <div className="h-2 bg-slate-700 rounded w-full mb-1" />
                  <div className="h-2 bg-slate-700 rounded w-4/5 mb-1" />
                  <div className="h-2 bg-slate-700 rounded w-3/5" />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-slate-800 rounded-lg p-3">
                    <div className="text-xs text-slate-500 mb-1">SEO Başlık</div>
                    <div className="h-2 bg-cyan-900 rounded w-full mb-1" />
                    <div className="h-2 bg-cyan-900 rounded w-3/4" />
                  </div>
                  <div className="bg-slate-800 rounded-lg p-3">
                    <div className="text-xs text-slate-500 mb-1">Instagram Post</div>
                    <div className="h-2 bg-slate-700 rounded w-full mb-1" />
                    <div className="h-2 bg-slate-700 rounded w-2/3" />
                  </div>
                </div>
                <div className="bg-cyan-500/10 border border-cyan-500/20 rounded-lg p-3 flex items-center gap-2">
                  <div className="w-6 h-6 rounded bg-cyan-500/20 flex items-center justify-center text-cyan-400 text-xs">✓</div>
                  <div className="text-xs text-cyan-400">İçerik başarıyla üretildi!</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Özellikler */}
      <section id="ozellikler" className="max-w-6xl mx-auto px-6 py-20">
        <div className="text-center mb-14">
          <p className="text-cyan-400 text-xs font-semibold uppercase tracking-widest mb-3">ÖZELLİKLER</p>
          <h2 className="text-3xl md:text-4xl font-bold text-white">Ne üretir?</h2>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { icon: "⭐", title: "Platform Açıklaması", desc: "300-500 kelimelik, platforma özel profesyonel ürün açıklaması.", color: "cyan" },
            { icon: "🔍", title: "SEO Optimizasyonu", desc: "SEO başlığı, meta açıklama, anahtar kelimeler ve long-tail kelimeler.", color: "green" },
            { icon: "📱", title: "Sosyal Medya", desc: "Instagram, Twitter/X, Facebook ve LinkedIn için hazır postlar.", color: "cyan" },
            { icon: "📷", title: "Vision AI", desc: "Ürün fotoğrafını yükle, yapay zeka içeriği otomatik üretsin.", color: "green" },
          ].map((f, i) => (
            <div key={i} className={`rounded-2xl border border-slate-800 bg-slate-900/50 p-5 hover:border-${f.color}-500/30 transition-all`}>
              <span className="text-2xl mb-3 block">{f.icon}</span>
              <h3 className="font-semibold text-white mb-2">{f.title}</h3>
              <p className="text-sm text-slate-400 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Ücretsiz Araçlar */}
      <section id="araclar" className="max-w-3xl mx-auto px-6 py-10 space-y-4">
        <div className="text-center mb-10">
          <p className="text-cyan-400 text-xs font-semibold uppercase tracking-widest mb-3">ÜCRETSİZ ARAÇLAR</p>
          <h2 className="text-3xl font-bold text-white">Hesaplayıcılar</h2>
        </div>

        {/* Desi */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6">
          <button onClick={() => setDesiOpen(o => !o)} className="w-full flex items-center justify-between text-left">
            <div className="flex items-center gap-3">
              <span className="text-xl">📦</span>
              <div>
                <h3 className="font-semibold text-white">Kargo Desi Hesaplama</h3>
                <p className="text-xs text-slate-400">Boyutlardan desi ağırlığını anında hesapla</p>
              </div>
            </div>
            <span className={`text-slate-400 transition-transform text-lg ${desiOpen ? "rotate-180" : ""}`}>⌄</span>
          </button>
          {desiOpen && (
            <div className="mt-5">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                {[
                  { key: "en", label: "En (cm)" },
                  { key: "boy", label: "Boy (cm)" },
                  { key: "yukseklik", label: "Yükseklik (cm)" },
                  { key: "agirlik", label: "Ağırlık (kg)" },
                ].map(f => (
                  <div key={f.key}>
                    <label className="block text-xs text-slate-400 mb-1.5">{f.label}</label>
                    <input type="number" min="0" value={desi[f.key]} onChange={e => setDesi(d => ({ ...d, [f.key]: e.target.value }))}
                      placeholder="0"
                      className="w-full px-3 py-2.5 rounded-lg border border-slate-700 bg-slate-800 text-white text-sm focus:outline-none focus:border-cyan-500" />
                  </div>
                ))}
              </div>
              {(en > 0 && boy > 0 && yukseklik > 0) && (
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-xl bg-slate-800 border border-slate-700 p-4 text-center">
                    <p className="text-xs text-slate-400 mb-1">Hesaplanan Desi</p>
                    <p className="text-2xl font-bold text-white">{hesaplananDesi.toFixed(2)}</p>
                  </div>
                  <div className="rounded-xl bg-cyan-500/10 border border-cyan-500/30 p-4 text-center">
                    <p className="text-xs text-cyan-400 mb-1">Kargo Ağırlığı</p>
                    <p className="text-2xl font-bold text-cyan-400">{kargoAgirligi.toFixed(2)} kg</p>
                  </div>
                </div>
              )}
              <p className="text-xs text-slate-500 mt-3 text-center">Desi = (En × Boy × Yükseklik) ÷ 3000</p>
            </div>
          )}
        </div>

        {/* Kar/Zarar */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6">
          <button onClick={() => setKarOpen(o => !o)} className="w-full flex items-center justify-between text-left">
            <div className="flex items-center gap-3">
              <span className="text-xl">💰</span>
              <div>
                <h3 className="font-semibold text-white">Kâr/Zarar Hesaplama</h3>
                <p className="text-xs text-slate-400">Komisyon, KDV ve masrafları gir, net kârını gör</p>
              </div>
            </div>
            <span className={`text-slate-400 transition-transform text-lg ${karOpen ? "rotate-180" : ""}`}>⌄</span>
          </button>
          {karOpen && (
            <div className="mt-5">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
                {[
                  { key: "alis", label: "Alış Fiyatı (₺)" },
                  { key: "satis", label: "Satış Fiyatı (₺)" },
                  { key: "komisyon", label: "Komisyon (%)" },
                  { key: "kargo", label: "Kargo Ücreti (₺)" },
                  { key: "ekstra", label: "Ekstra Masraf (₺)" },
                ].map(f => (
                  <div key={f.key}>
                    <label className="block text-xs text-slate-400 mb-1.5">{f.label}</label>
                    <input type="number" min="0" value={kar[f.key]} onChange={e => setKar(k => ({ ...k, [f.key]: e.target.value }))}
                      placeholder="0"
                      className="w-full px-3 py-2.5 rounded-lg border border-slate-700 bg-slate-800 text-white text-sm focus:outline-none focus:border-cyan-500" />
                  </div>
                ))}
                <div>
                  <label className="block text-xs text-slate-400 mb-1.5">KDV Oranı</label>
                  <select value={kar.kdv} onChange={e => setKar(k => ({ ...k, kdv: e.target.value }))}
                    className="w-full px-3 py-2.5 rounded-lg border border-slate-700 bg-slate-800 text-white text-sm focus:outline-none focus:border-cyan-500">
                    <option value="1">%1</option>
                    <option value="10">%10</option>
                    <option value="20">%20</option>
                  </select>
                </div>
              </div>
              {satisFiyati > 0 && (
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-xl bg-slate-800 border border-slate-700 p-4 text-center">
                    <p className="text-xs text-slate-400 mb-1">Komisyon Tutarı</p>
                    <p className="text-xl font-bold text-white">{komisyonTutari.toFixed(2)} ₺</p>
                  </div>
                  <div className="rounded-xl bg-slate-800 border border-slate-700 p-4 text-center">
                    <p className="text-xs text-slate-400 mb-1">KDV Tutarı</p>
                    <p className="text-xl font-bold text-white">{kdvTutari.toFixed(2)} ₺</p>
                  </div>
                  <div className={`rounded-xl p-4 text-center ${netKarZarar >= 0 ? "bg-emerald-500/10 border border-emerald-500/30" : "bg-red-500/10 border border-red-500/30"}`}>
                    <p className={`text-xs mb-1 ${netKarZarar >= 0 ? "text-emerald-400" : "text-red-400"}`}>{netKarZarar >= 0 ? "Net Kâr 🎉" : "Net Zarar ⚠️"}</p>
                    <p className={`text-xl font-bold ${netKarZarar >= 0 ? "text-emerald-400" : "text-red-400"}`}>{Math.abs(netKarZarar).toFixed(2)} ₺</p>
                  </div>
                  <div className={`rounded-xl p-4 text-center ${karMarji >= 0 ? "bg-emerald-500/10 border border-emerald-500/30" : "bg-red-500/10 border border-red-500/30"}`}>
                    <p className={`text-xs mb-1 ${karMarji >= 0 ? "text-emerald-400" : "text-red-400"}`}>Kâr Marjı</p>
                    <p className={`text-xl font-bold ${karMarji >= 0 ? "text-emerald-400" : "text-red-400"}`}>%{karMarji.toFixed(1)}</p>
                  </div>
                </div>
              )}
              <p className="text-xs text-slate-500 mt-3 text-center">Net Kâr = Satış − (Alış + Komisyon + KDV + Kargo + Ekstra)</p>
            </div>
          )}
        </div>
      </section>

      {/* Fiyatlandırma */}
      <section id="fiyatlar" className="max-w-5xl mx-auto px-6 py-20">
        <div className="text-center mb-14">
          <p className="text-cyan-400 text-xs font-semibold uppercase tracking-widest mb-3">FİYATLANDIRMA</p>
          <h2 className="text-3xl md:text-4xl font-bold text-white">Şeffaf fiyatlar</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { name: "Ücretsiz", price: "0₺", period: "/ay", features: ["3 analiz/ay", "Tekli analiz", "Tüm platformlar", "Vision AI"], cta: "Hemen Başla", highlight: false },
            { name: "Başlangıç", price: "149₺", period: "/ay", features: ["100 analiz/ay", "Toplu analiz", "Vision AI", "Öncelikli destek"], cta: "Başlat", highlight: true },
            { name: "Pro", price: "349₺", period: "/ay", features: ["500 analiz/ay", "Sınırsız toplu analiz", "API erişimi", "7/24 destek"], cta: "Başlat", highlight: false },
          ].map((plan, i) => (
            <div key={i} className={`rounded-2xl p-6 border transition-all ${plan.highlight ? "border-cyan-500/50 bg-cyan-500/5 shadow-[0_0_25px_rgba(6,182,212,0.1)]" : "border-slate-800 bg-slate-900/50"}`}>
              {plan.highlight && <div className="text-xs font-semibold text-cyan-400 mb-3">⭐ EN POPÜLER</div>}
              <h3 className="font-bold text-white text-lg mb-1">{plan.name}</h3>
              <div className="flex items-end gap-1 mb-6">
                <span className="text-3xl font-bold text-white">{plan.price}</span>
                <span className="text-slate-400 text-sm mb-1">{plan.period}</span>
              </div>
              <ul className="space-y-2 mb-6">
                {plan.features.map((f, j) => (
                  <li key={j} className="text-sm text-slate-400 flex items-center gap-2">
                    <span className="text-cyan-400">✓</span>{f}
                  </li>
                ))}
              </ul>
              <button onClick={onStart}
                className={`w-full py-2.5 rounded-lg font-medium text-sm transition-all ${plan.highlight ? "bg-cyan-500 hover:bg-cyan-400 text-[#0b121f]" : "border border-slate-700 text-slate-300 hover:border-cyan-500/50 hover:text-white"}`}>
                {plan.cta}
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* SSS */}
      <section id="sss" className="max-w-3xl mx-auto px-6 py-20">
        <div className="text-center mb-12">
          <p className="text-slate-500 text-xs uppercase tracking-widest mb-2">VIII — SIKÇA SORULANLAR</p>
          <h2 className="text-3xl font-bold text-white">Hızlı <span className="text-cyan-400">cevaplar.</span></h2>
        </div>
        <div className="rounded-2xl border border-slate-800 overflow-hidden">
          {faqs.map((faq, i) => (
            <div key={i} className="border-b border-slate-800 last:border-0">
              <button onClick={() => setFaqOpen(faqOpen === i ? null : i)}
                className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-slate-800/30 transition-colors">
                <span className="text-sm text-white font-medium">{faq.q}</span>
                <span className="text-slate-400 text-lg ml-4 flex-shrink-0">{faqOpen === i ? "−" : "+"}</span>
              </button>
              {faqOpen === i && (
                <div className="px-6 pb-4">
                  <p className="text-sm text-slate-400 leading-relaxed">{faq.a}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-4xl mx-auto px-6 py-20 text-center">
        <h2 className="text-4xl font-bold text-white mb-4">Hadi başlayalım!</h2>
        <p className="text-slate-400 mb-8">Kayıt gerekmez. Kredi kartı gerekmez.</p>
        <button onClick={onStart}
          className="px-10 py-4 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-[#0b121f] font-bold text-lg transition-all shadow-[0_0_25px_rgba(6,182,212,0.3)]">
          Ücretsiz Dene →
        </button>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800 mt-10">
        <div className="max-w-6xl mx-auto px-6 py-14">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
            {[
              { title: "Ürün", links: ["Özellikler", "Vision AI", "Toplu Analiz", "Araçlar"] },
              { title: "Platform", links: ["Trendyol", "Hepsiburada", "Amazon TR", "Shopify"] },
              { title: "Hukuki", links: ["Gizlilik Politikası", "Kullanım Koşulları", "Çerez Politikası", "KVKK"] },
              { title: "Diğer", links: ["SSS", "Destek", "İletişim", "Blog"] },
            ].map((col, i) => (
              <div key={i}>
                <h4 className="text-white font-semibold text-sm mb-4">{col.title}</h4>
                <ul className="space-y-2">
                  {col.links.map((link, j) => (
                    <li key={j}><a href="#" className="text-slate-400 text-sm hover:text-white transition-colors">{link}</a></li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-cyan-500 flex items-center justify-center text-[#0b121f] font-black text-xs">İ</div>
              <span className="text-slate-400 text-sm">© 2026 İçerikBot — E-Ticaret AI İçerik Üretici</span>
            </div>
            <div className="flex items-center gap-2 text-slate-500 text-xs">
              <span>Güvenli ödeme altyapısı:</span>
              <span className="px-2 py-1 rounded bg-slate-800 border border-slate-700 text-slate-300 font-bold text-xs">iyzico</span>
              <span className="px-2 py-1 rounded bg-slate-800 border border-slate-700 text-blue-400 font-bold text-xs">VISA</span>
              <span className="px-2 py-1 rounded bg-slate-800 border border-slate-700 text-red-400 font-bold text-xs">MC</span>
              <span className="px-2 py-1 rounded bg-slate-800 border border-slate-700 text-slate-300 font-bold text-xs">TROY</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}