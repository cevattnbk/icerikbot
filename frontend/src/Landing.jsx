export default function Landing({ onStart }) {
  return (
    <div className="min-h-screen bg-white font-sans">
      {/* Header */}
      <header className="border-b border-slate-100 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-orange-500 flex items-center justify-center text-white font-bold text-sm">İ</div>
          <span className="font-bold text-slate-900 text-lg">İçerik<span className="text-orange-500">Bot</span></span>
        </div>
        <button onClick={onStart}
          className="px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium transition-all">
          Hemen Dene →
        </button>
      </header>

      {/* Hero */}
      <section className="max-w-4xl mx-auto px-6 py-20 text-center">
        <div className="inline-block px-3 py-1 rounded-full bg-orange-50 text-orange-600 text-xs font-medium mb-6">
          🚀 Trendyol, Shopify, Hepsiburada, Amazon TR
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-slate-900 leading-tight mb-6">
          Ürün linkini yapıştır,<br />
          <span className="text-orange-500">içeriğini saniyeler içinde al</span>
        </h1>
        <p className="text-lg text-slate-500 mb-10 max-w-2xl mx-auto">
          SEO başlığı, ürün açıklaması, Instagram postu — hepsi tek tıkla. 
          1 saatlik işini 30 saniyeye indir.
        </p>
        <button onClick={onStart}
          className="px-8 py-4 rounded-2xl bg-orange-500 hover:bg-orange-600 text-white font-semibold text-lg transition-all shadow-lg shadow-orange-200">
          Ücretsiz Dene →
        </button>
        <p className="text-sm text-slate-400 mt-3">Kayıt gerekmez • 5 ücretsiz analiz</p>
      </section>

      {/* Nasıl çalışır */}
      <section className="bg-slate-50 py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-slate-900 text-center mb-12">Nasıl çalışır?</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { num: "1", title: "Linki yapıştır", desc: "Trendyol veya diğer platformlardan ürün linkini kopyala, kutuya yapıştır." },
              { num: "2", title: "Platform seç", desc: "Trendyol, Shopify, Hepsiburada veya Amazon'u seç. Ton belirle." },
              { num: "3", title: "İçeriği kopyala", desc: "SEO metinleri, ürün açıklaması ve sosyal medya postları hazır!" },
            ].map((step, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 border border-slate-100">
                <div className="w-10 h-10 rounded-xl bg-orange-500 text-white font-bold flex items-center justify-center mb-4">{step.num}</div>
                <h3 className="font-semibold text-slate-900 mb-2">{step.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Özellikler */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-slate-900 text-center mb-12">Ne üretir?</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {[
              { icon: "⭐", title: "Platform Açıklaması", desc: "300-500 kelimelik, platforma özel profesyonel ürün açıklaması." },
              { icon: "🔍", title: "SEO Optimizasyonu", desc: "SEO başlığı, meta açıklama, anahtar kelimeler ve long-tail kelimeler." },
              { icon: "📱", title: "Sosyal Medya Postları", desc: "Instagram, Twitter/X, Facebook ve LinkedIn için hazır postlar." },
              { icon: "📊", title: "Toplu Analiz", desc: "10 ürün linkini aynı anda analiz et, hepsini tek seferde al." },
            ].map((f, i) => (
              <div key={i} className="flex gap-4 p-5 rounded-2xl border border-slate-100 hover:border-orange-200 transition-all">
                <span className="text-2xl">{f.icon}</span>
                <div>
                  <h3 className="font-semibold text-slate-900 mb-1">{f.title}</h3>
                  <p className="text-sm text-slate-500">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Fiyatlandırma */}
      <section className="bg-slate-50 py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-slate-900 text-center mb-12">Fiyatlandırma</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { name: "Ücretsiz", price: "0₺", period: "/ay", features: ["5 analiz/ay", "Tekli analiz", "Tüm platformlar"], cta: "Hemen Başla", highlight: false },
              { name: "Başlangıç", price: "149₺", period: "/ay", features: ["100 analiz/ay", "Toplu analiz", "Excel export", "Öncelikli destek"], cta: "Başlat", highlight: true },
              { name: "Pro", price: "349₺", period: "/ay", features: ["500 analiz/ay", "Sınırsız toplu analiz", "API erişimi", "7/24 destek"], cta: "Başlat", highlight: false },
            ].map((plan, i) => (
              <div key={i} className={`rounded-2xl p-6 border ${plan.highlight ? "border-orange-400 bg-orange-50" : "border-slate-200 bg-white"}`}>
                {plan.highlight && <div className="text-xs font-semibold text-orange-600 mb-3">⭐ EN POPÜLER</div>}
                <h3 className="font-bold text-slate-900 text-lg mb-1">{plan.name}</h3>
                <div className="flex items-end gap-1 mb-6">
                  <span className="text-3xl font-bold text-slate-900">{plan.price}</span>
                  <span className="text-slate-400 text-sm mb-1">{plan.period}</span>
                </div>
                <ul className="space-y-2 mb-6">
                  {plan.features.map((f, j) => (
                    <li key={j} className="text-sm text-slate-600 flex items-center gap-2">
                      <span className="text-orange-500">✓</span>{f}
                    </li>
                  ))}
                </ul>
                <button onClick={onStart}
                  className={`w-full py-2.5 rounded-xl font-medium text-sm transition-all ${plan.highlight ? "bg-orange-500 hover:bg-orange-600 text-white" : "border border-slate-200 text-slate-700 hover:border-orange-300"}`}>
                  {plan.cta}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6 text-center">
        <h2 className="text-3xl font-bold text-slate-900 mb-4">Hadi başlayalım!</h2>
        <p className="text-slate-500 mb-8">Kayıt gerekmez. Kredi kartı gerekmez.</p>
        <button onClick={onStart}
          className="px-8 py-4 rounded-2xl bg-orange-500 hover:bg-orange-600 text-white font-semibold text-lg transition-all shadow-lg shadow-orange-200">
          Ücretsiz Dene →
        </button>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-100 px-6 py-8 text-center text-sm text-slate-400">
        © 2026 İçerikBot — E-Ticaret AI İçerik Üretici
      </footer>
    </div>
  );
}