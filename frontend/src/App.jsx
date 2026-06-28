import { useState, useRef, useEffect } from "react";
import JSZip from "jszip";
import { supabase } from "./supabase";

function CopyBtn({ text }) {
  const [copied, setCopied] = useState(false);
  return (
    <button onClick={() => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-slate-700 text-slate-400 hover:bg-slate-800 hover:text-white transition-all">
      {copied ? "✓ Kopyalandı" : "Kopyala"}
    </button>
  );
}

function TagChip({ tag }) {
  const [copied, setCopied] = useState(false);
  return (
    <button onClick={() => { navigator.clipboard.writeText(tag); setCopied(true); setTimeout(() => setCopied(false), 1200); }}
      className={`px-3 py-1 rounded-full text-xs font-medium border transition-all ${copied ? "border-cyan-500 bg-cyan-500/10 text-cyan-400" : "border-slate-700 bg-slate-800 text-slate-400 hover:border-cyan-500/50 hover:text-cyan-400"}`}>
      #{tag}
    </button>
  );
}

function ResultCard({ label, icon, children, fullText }) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5">
      <div className="flex items-center justify-between mb-3">
        <span className="flex items-center gap-2 text-xs font-semibold tracking-widest uppercase text-slate-500">
          {icon} {label}
        </span>
        {fullText && <CopyBtn text={fullText} />}
      </div>
      {children}
    </div>
  );
}

function Skeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-8 h-8 rounded-full bg-slate-800" />
        <div className="h-4 w-48 rounded-full bg-slate-800" />
      </div>
      {[1,2,3,4,5].map(i => (
        <div key={i} className={`h-3 rounded-full bg-slate-800 ${i === 5 ? "w-1/2" : i % 2 === 0 ? "w-5/6" : "w-full"}`} />
      ))}
      <div className="pt-4 space-y-2">
        <div className="h-3 rounded-full bg-cyan-900/30 w-3/4" />
        <div className="h-3 rounded-full bg-cyan-900/30 w-2/3" />
      </div>
    </div>
  );
}

const PLATFORMS = [
  { id: "trendyol", label: "Trendyol", color: "bg-orange-500" },
  { id: "shopify", label: "Shopify", color: "bg-green-600" },
  { id: "hepsiburada", label: "Hepsiburada", color: "bg-orange-400" },
  { id: "amazon", label: "Amazon TR", color: "bg-amber-500" },
];

const TONES = ["Profesyonel", "Samimi & Sıcak", "Enerjik & Genç", "Lüks & Prestijli", "Eğlenceli"];
const SOCIAL = ["Instagram", "Twitter/X", "Facebook", "LinkedIn"];

export default function App({ onBack, user, onAdmin }) {
  const [url, setUrl] = useState("");
  const [platform, setPlatform] = useState("trendyol");
  const [tone, setTone] = useState("Profesyonel");
  const [activeTab, setActiveTab] = useState("description");
  const [activeSocial, setActiveSocial] = useState("Instagram");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);
  const [credits, setCredits] = useState(null);
  const [showPlans, setShowPlans] = useState(false);
  const [paymentLoading, setPaymentLoading] = useState(null);
  const [bulkMode, setBulkMode] = useState(false);
  const [bulkUrls, setBulkUrls] = useState("");
  const [bulkResults, setBulkResults] = useState([]);
  const [bulkLoading, setBulkLoading] = useState(false);
  const [competitors, setCompetitors] = useState(null);
  const [competitorLoading, setCompetitorLoading] = useState(false);
  const [manualMode, setManualMode] = useState(false);
  const [manualForm, setManualForm] = useState({ name: "", brand: "", price: "", description: "", features: "" });
  const [imageMode, setImageMode] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const inputRef = useRef();
  const [apiKeys, setApiKeys] = useState([]);
const [apiKeyLoading, setApiKeyLoading] = useState(false);
const [newKeyName, setNewKeyName] = useState("");
const [bulkBannerItems, setBulkBannerItems] = useState([
  { title: "", price: "", slogan: "" },
]);
const [bulkBannerMode, setBulkBannerMode] = useState(false);
  const [bannerForm, setBannerForm] = useState({
  title: "",
  price: "",
  slogan: "",
  color: "#06b6d4",
  template: "instagram",
});

  useEffect(() => {
    if (user) {
      supabase.from("profiles").select("credits").eq("id", user.id).single()
        .then(({ data }) => { if (data) setCredits(data.credits); });
    }
  }, [user]);
  useEffect(() => {
    if (user) {
      supabase.from("profiles").select("credits").eq("id", user.id).single()
        .then(({ data }) => { if (data) setCredits(data.credits); });
    }
  }, [user]);

  const handlePurchase = async (plan) => {
    setPaymentLoading(plan);
    try {
      const res = await fetch("https://icerikbot-production.up.railway.app/api/create-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan, userId: user.id, email: user.email }),
      });
      const { formData, paymentUrl } = await res.json();
      const form = document.createElement("form");
      form.method = "POST";
      form.action = paymentUrl;
      Object.entries(formData).forEach(([key, value]) => {
        const input = document.createElement("input");
        input.type = "hidden";
        input.name = key;
        input.value = value;
        form.appendChild(input);
      });
      document.body.appendChild(form);
      form.submit();
    } catch (e) {
      console.error("Ödeme başlatma hatası:", e);
      setPaymentLoading(null);
    }
  };

  const handleAnalyze = async () => {
    if (!url.trim()) { inputRef.current?.focus(); return; }
    if (credits !== null && credits <= 0) { setShowPlans(true); return; }
    setLoading(true); setError(""); setResult(null);
    try {
      const res = await fetch("https://icerikbot-production.up.railway.app/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: url.trim(), platform, tone }),
      });
      if (!res.ok) throw new Error(await res.text());
      const r = await res.json();
      setResult(r);
      setActiveTab("description");
      if (credits !== null && credits > 0) {
        const newCredits = credits - 1;
        setCredits(newCredits);
        await supabase.from("profiles").update({ credits: newCredits }).eq("id", user.id);
        if (newCredits === 1) {
          fetch("https://icerikbot-production.up.railway.app/api/send-low-credit-email", {
            method: "POST", headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: user.email }),
          }).catch(() => {});
        }
      }
      if (r.product?.name) {
        setCompetitorLoading(true); setCompetitors(null);
        try {
          const cr = await fetch("https://icerikbot-production.up.railway.app/api/competitors", {
            method: "POST", headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ productName: r.product.name }),
          });
          setCompetitors(await cr.json());
        } catch (e) { console.error(e); }
        finally { setCompetitorLoading(false); }
      }
    } catch (e) {
      if (!manualMode) { setManualMode(true); setError(""); }
      else { setError(e.message || "Bir hata oluştu."); }
    } finally { setLoading(false); }
  };

  const handleBulkAnalyze = async () => {
    const urls = bulkUrls.split("\n").map(u => u.trim()).filter(u => u.startsWith("http"));
    if (!urls.length) return;
    setBulkLoading(true); setBulkResults([]);
    try {
      const res = await fetch("https://icerikbot-production.up.railway.app/api/analyze-bulk", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ urls, platform, tone }),
      });
      const data = await res.json();
      setBulkResults(data.results || []);
    } catch (e) { setError(e.message); }
    finally { setBulkLoading(false); }
  };

  const handleImageAnalyze = async () => {
    if (!imageFile) return;
    if (credits !== null && credits <= 0) { setShowPlans(true); return; }
    setLoading(true); setError(""); setResult(null);
    try {
      const formData = new FormData();
      formData.append("image", imageFile);
      formData.append("platform", platform);
      formData.append("tone", tone);
      const res = await fetch("https://icerikbot-production.up.railway.app/api/analyze-image", {
        method: "POST", body: formData,
      });
      if (!res.ok) throw new Error(await res.text());
      const r = await res.json();
      setResult(r); setActiveTab("description");
      if (credits !== null && credits > 0) {
        const newCredits = credits - 1;
        setCredits(newCredits);
        await supabase.from("profiles").update({ credits: newCredits }).eq("id", user.id);
      }
    } catch (e) { setError(e.message || "Bir hata oluştu."); }
    finally { setLoading(false); }
  };

  const tabs = [
  { id: "description", label: "Açıklama", icon: "⭐" },
  { id: "seo", label: "SEO", icon: "⚡" },
  { id: "social", label: "Sosyal Medya", icon: "📱" },
  { id: "banner", label: "Banner", icon: "🎨" },
  { id: "api", label: "API", icon: "🔑" },
];

  return (
    <div className="min-h-screen bg-[#0b121f] text-white font-sans">
      <header className="border-b border-slate-800 bg-[#0b121f]/90 backdrop-blur-md px-4 md:px-6 py-3 flex items-center gap-2 flex-wrap sticky top-0 z-10">
{onBack && <button onClick={onBack} className="flex items-center gap-1 text-slate-500 hover:text-white text-xs font-medium mr-2 transition-colors">← Geri Dön</button>}        <div className="w-7 h-7 rounded-lg bg-cyan-500 flex items-center justify-center text-[#0b121f] font-black text-xs">İ</div>
        <span className="font-bold text-white">İçerik<span className="text-cyan-400">Bot</span></span>
        <div className="ml-auto flex items-center gap-3">
          {credits !== null && (
            <button onClick={() => credits <= 0 && setShowPlans(true)}
  className={`text-xs font-medium px-3 py-1 rounded-full border transition-all ${credits > 0 ? "border-cyan-500/30 bg-cyan-500/10 text-cyan-400" : "border-red-500/30 bg-red-500/10 text-red-400 hover:bg-red-500/20 cursor-pointer animate-pulse"}`}>
  {credits > 0 ? `${credits} analiz hakkın var` : "⚡ Hakkın doldu — Plan Al"}
</button>
          )}
          {onAdmin && (
            <button onClick={onAdmin} className="text-xs text-slate-500 hover:text-cyan-400 transition-colors">Admin</button>
          )}
          <button onClick={async () => { await supabase.auth.signOut(); onBack(); }}
            className="text-xs text-slate-500 hover:text-white transition-colors">Çıkış</button>
        </div>
      </header>

      <div className="flex flex-col md:flex-row h-[calc(100vh-57px)]">
        <aside className="w-full md:w-80 flex-shrink-0 border-r-0 md:border-r border-b md:border-b-0 border-slate-800 bg-[#0b121f] flex flex-col overflow-y-auto max-h-[50vh] md:max-h-none">
          <div className="p-5 space-y-5">
            <div className="flex gap-2">
              <button onClick={() => { setBulkMode(false); setImageMode(false); }}
                className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-all ${!bulkMode && !imageMode ? "bg-cyan-500 text-[#0b121f] border-cyan-500" : "border-slate-700 text-slate-400 hover:border-slate-600"}`}>
                Tekli
              </button>
              <button onClick={() => { setBulkMode(true); setImageMode(false); }}
                className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-all ${bulkMode ? "bg-cyan-500 text-[#0b121f] border-cyan-500" : "border-slate-700 text-slate-400 hover:border-slate-600"}`}>
                Toplu
              </button>
            </div>
            <button onClick={() => { setImageMode(m => !m); setBulkMode(false); }}
              className={`w-full py-2 rounded-lg text-sm font-medium border transition-all flex items-center justify-center gap-2 ${imageMode ? "bg-cyan-500 text-[#0b121f] border-cyan-500" : "border-slate-700 text-slate-400 hover:border-slate-600"}`}>
              📷 {imageMode ? "Görsel Modunda" : "Görselden Üret"}
            </button>

            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2.5">Platform</label>
              <div className="grid grid-cols-2 gap-2">
                {PLATFORMS.map(p => (
                  <button key={p.id} onClick={() => setPlatform(p.id)}
                    className={`flex items-center gap-2 px-3 py-2.5 rounded-lg border text-sm font-medium transition-all ${platform === p.id ? "border-cyan-500/50 bg-cyan-500/10 text-cyan-400" : "border-slate-700 text-slate-400 hover:border-slate-600"}`}>
                    <span className={`w-2 h-2 rounded-full ${p.color}`} />{p.label}
                  </button>
                ))}
              </div>
            </div>

            {imageMode && (
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2.5">Ürün Görseli</label>
                <div onClick={() => document.getElementById("imageInput").click()}
                  onDragOver={e => e.preventDefault()}
                  onDrop={e => {
                    e.preventDefault();
                    const file = e.dataTransfer.files[0];
                    if (file && file.type.startsWith("image/")) { setImageFile(file); setImagePreview(URL.createObjectURL(file)); }
                  }}
                  className="border-2 border-dashed border-slate-700 rounded-xl p-4 text-center cursor-pointer hover:border-cyan-500/50 transition-all">
                  {imagePreview
                    ? <img src={imagePreview} alt="preview" className="w-full h-32 object-contain rounded-lg" />
                    : <div className="py-4"><p className="text-2xl mb-1">📷</p><p className="text-sm text-slate-500">Görsel sürükle veya tıkla</p><p className="text-xs text-slate-600 mt-1">JPG, PNG, WebP</p></div>
                  }
                </div>
                <input id="imageInput" type="file" accept="image/*" className="hidden"
                  onChange={e => { const file = e.target.files[0]; if (file) { setImageFile(file); setImagePreview(URL.createObjectURL(file)); } }} />
              </div>
            )}

            {!imageMode && !bulkMode ? (
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2.5">Ürün Linki</label>
                <input ref={inputRef} type="url" value={url} onChange={e => setUrl(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && handleAnalyze()}
                  placeholder="https://www.trendyol.com/..."
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-700 bg-slate-800 text-white text-sm placeholder:text-slate-600 focus:outline-none focus:border-cyan-500 transition-all" />
                {manualMode && (
                  <div className="mt-3 p-3 rounded-xl bg-cyan-500/5 border border-cyan-500/20">
                    <p className="text-xs text-cyan-400 font-medium mb-2">⚠ Link çekilemedi — ürün bilgilerini gir:</p>
                    <div className="space-y-2">
                      {[{ key: "name", placeholder: "Ürün adı *" }, { key: "brand", placeholder: "Marka" }, { key: "price", placeholder: "Fiyat (örn: 299 TL)" }].map(f => (
                        <input key={f.key} type="text" placeholder={f.placeholder} value={manualForm[f.key]}
                          onChange={e => setManualForm(p => ({ ...p, [f.key]: e.target.value }))}
                          className="w-full px-3 py-2 rounded-lg border border-slate-700 bg-slate-800 text-white text-xs focus:outline-none focus:border-cyan-500" />
                      ))}
                      <textarea placeholder="Ürün özellikleri (virgülle ayır)" value={manualForm.features}
                        onChange={e => setManualForm(p => ({ ...p, features: e.target.value }))}
                        rows={3} className="w-full px-3 py-2 rounded-lg border border-slate-700 bg-slate-800 text-white text-xs focus:outline-none focus:border-cyan-500 resize-none" />
                    </div>
                  </div>
                )}
              </div>
            ) : !imageMode && (
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2.5">Ürün Linkleri</label>
                <textarea value={bulkUrls} onChange={e => setBulkUrls(e.target.value)}
                  placeholder={"https://www.trendyol.com/...\nhttps://www.trendyol.com/..."}
                  rows={6} className="w-full px-3 py-2.5 rounded-lg border border-slate-700 bg-slate-800 text-white text-sm placeholder:text-slate-600 focus:outline-none focus:border-cyan-500 resize-none" />
                <p className="text-xs text-slate-600 mt-1">{bulkUrls.split("\n").filter(u => u.trim().startsWith("http")).length} link girildi</p>
              </div>
            )}


            <button onClick={imageMode ? handleImageAnalyze : bulkMode ? handleBulkAnalyze : handleAnalyze}
              disabled={imageMode ? (loading || !imageFile) : bulkMode ? bulkLoading : (loading || !url.trim())}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-lg font-semibold text-sm bg-cyan-500 hover:bg-cyan-400 text-[#0b121f] disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-[0_0_15px_rgba(6,182,212,0.2)]">
              {imageMode
                ? (loading ? <><span className="w-4 h-4 border-2 border-[#0b121f] border-t-transparent rounded-full animate-spin inline-block" />Görsel analiz ediliyor...</> : <>📷 Görseli Analiz Et</>)
                : bulkMode
                ? (bulkLoading ? <><span className="w-4 h-4 border-2 border-[#0b121f] border-t-transparent rounded-full animate-spin inline-block" />Analiz ediliyor...</> : <>⚡ Toplu Analiz Başlat</>)
                : (loading ? <><span className="w-4 h-4 border-2 border-[#0b121f] border-t-transparent rounded-full animate-spin inline-block" />İçerikler hazırlanıyor...</> : <>✨ İçerik Üret</>)
              }
            </button>
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2.5">Yazı Tonu</label>
              <div className="space-y-1">
                {TONES.map(t => (
                  <button key={t} onClick={() => setTone(t)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all ${tone === t ? "bg-cyan-500/10 text-cyan-400" : "text-slate-400 hover:bg-slate-800"}`}>
                    {tone === t && <span className="mr-2">·</span>}{t}
                  </button>
                ))}
              </div>
            </div>


            {error && (
              <div className="flex items-start gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
                ⚠ {error}
              </div>
            )}

            {result?.product && (
              <div className="p-3 rounded-xl bg-slate-800 border border-slate-700 space-y-2">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Çekilen Ürün</p>
                {result.product.image && <img src={result.product.image} alt="" className="w-full h-32 object-contain rounded-lg bg-slate-900 p-2" />}
                <p className="text-sm font-medium text-white line-clamp-2">{result.product.name}</p>
                {result.product.price && <p className="text-sm font-bold text-cyan-400">{result.product.price}</p>}
              </div>
            )}
          </div>
        </aside>

        <main className="flex-1 overflow-y-auto bg-[#0d1521]">
          <div className="sticky top-0 z-10 bg-[#0d1521] border-b border-slate-800 px-6 pt-4 pb-0 flex gap-1">
            {tabs.map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-t-lg border transition-all ${activeTab === tab.id ? "bg-slate-900 border-slate-700 border-b-[#0d1521] text-white -mb-px" : "border-transparent text-slate-500 hover:text-slate-300"}`}>
                {tab.icon} {tab.label}
              </button>
            ))}
          </div>

          <div className="p-6 space-y-4">
            {showPlans && (
              <div className="flex flex-col items-center justify-center py-12 text-center space-y-6">
                <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-2xl">⚡</div>
                <div>
                  <p className="text-white font-semibold text-lg">Ücretsiz analiz hakkın doldu!</p>
                  <p className="text-slate-400 text-sm mt-1">Devam etmek için bir plan seç</p>
                </div>
                <div className="grid md:grid-cols-3 gap-4 max-w-3xl w-full">
                  {[
                    { id: "baslangic", name: "Başlangıç", price: "199₺", credits: "100 analiz", features: ["100 analiz/ay", "Toplu analiz", "Vision AI", "Banner aracı"] },
{ id: "pro", name: "Pro", price: "499₺", credits: "500 analiz", highlight: true, features: ["500 analiz/ay", "Sınırsız toplu analiz", "API erişimi", "Banner aracı", "7/24 destek"] },
{ id: "ajans", name: "Ajans", price: "1.499₺", credits: "Sınırsız", features: ["Sınırsız analiz", "API erişimi", "Toplu banner", "White label", "Özel destek"] },
                  ].map(p => (
                    <div key={p.id} className={`rounded-2xl p-5 border ${p.highlight ? "border-cyan-500/50 bg-cyan-500/5" : "border-slate-800 bg-slate-900"}`}>
                      {p.highlight && <div className="text-xs font-semibold text-cyan-400 mb-2">⭐ EN POPÜLER</div>}
                      <h3 className="font-bold text-white text-lg mb-1">{p.name}</h3>
                      <p className="text-2xl font-bold text-white mb-1">{p.price}<span className="text-sm text-slate-400 font-normal">/ay</span></p>
                      {p.features && (
  <ul className="space-y-1.5 mb-4">
    {p.features.map((f, i) => (
      <li key={i} className="text-xs text-slate-400 flex items-center gap-2">
        <span className="text-cyan-400">✓</span>{f}
      </li>
    ))}
  </ul>
)}
                      <p className="text-sm text-slate-400 mb-4">{p.credits}</p>
                      <button onClick={() => handlePurchase(p.id)} disabled={paymentLoading === p.id}
                        className={`w-full py-2.5 rounded-lg font-medium text-sm transition-all ${p.highlight ? "bg-cyan-500 hover:bg-cyan-400 text-[#0b121f]" : "border border-slate-700 text-slate-300 hover:border-cyan-500/50"}`}>
                        {paymentLoading === p.id ? "Yönlendiriliyor..." : "Satın Al"}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {!loading && !result && !error && !showPlans && bulkResults.length === 0 && (
              <div className="flex flex-col items-center justify-center h-96 text-center space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-2xl">✨</div>
                <div>
                  <p className="text-white font-semibold text-lg">Hadi başlayalım!</p>
                  <p className="text-slate-400 text-sm mt-1">Sol panelden platform seç, ürün linkini yapıştır ve İçerik Üret'e bas.</p>
                </div>
                <div className="flex gap-2 text-xs text-slate-500">
                  <span className="px-2 py-1 rounded-lg bg-slate-800 border border-slate-700">✓ SEO metinleri</span>
                  <span className="px-2 py-1 rounded-lg bg-slate-800 border border-slate-700">✓ Ürün açıklaması</span>
                  <span className="px-2 py-1 rounded-lg bg-slate-800 border border-slate-700">✓ Sosyal medya postları</span>
                </div>
              </div>
            )}

            {loading && <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5"><Skeleton /></div>}

            {bulkResults.length > 0 && (
              <div className="space-y-4">
                <h2 className="text-sm font-semibold text-white">{bulkResults.length} ürün analiz edildi</h2>
                {bulkResults.map((r, i) => (
                  <div key={i} className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="w-6 h-6 rounded-full bg-cyan-500/10 text-cyan-400 text-xs font-bold flex items-center justify-center border border-cyan-500/20">{i+1}</span>
                      <p className="text-sm font-medium text-white truncate">{r.product?.name || r.url}</p>
                      {r.error && <span className="ml-auto text-xs text-red-400">Hata</span>}
                    </div>
                    {!r.error && (
                      <div className="space-y-2">
                        <p className="text-xs text-slate-400 line-clamp-2">{r.description?.short}</p>
                        <div className="flex flex-wrap gap-1">
                          {r.seo?.keywords?.slice(0,4).map((k,j) => (
                            <span key={j} className="px-2 py-0.5 rounded-full text-xs bg-slate-800 text-slate-400 border border-slate-700">#{k}</span>
                          ))}
                        </div>
                        <details className="text-xs text-slate-400">
                          <summary className="cursor-pointer text-cyan-400 font-medium">Tüm içeriği gör ▼</summary>
                          <div className="mt-2 space-y-2">
                            <p className="font-medium text-slate-300">Açıklama:</p>
                            <p className="leading-relaxed">{r.description?.platform}</p>
                            <p className="font-medium text-slate-300 mt-2">SEO Başlık:</p>
                            <p>{r.seo?.title}</p>
                            <p className="font-medium text-slate-300 mt-2">Instagram:</p>
                            <p>{r.social?.instagram?.[0]?.text}</p>
                          </div>
                        </details>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {!loading && result && activeTab === "description" && (
              <div className="space-y-4">
                <ResultCard label="Platform Açıklaması" icon="⭐" fullText={result.description?.platform}>
                  <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">{result.description?.platform}</p>
                </ResultCard>
                <ResultCard label="Kısa Özet" icon="⚡" fullText={result.description?.short}>
                  <p className="text-sm text-slate-300 leading-relaxed">{result.description?.short}</p>
                </ResultCard>
                <ResultCard label="Özellikler" icon="🏷️" fullText={result.description?.bullets?.join("\n")}>
                  <ul className="space-y-2">
                    {result.description?.bullets?.map((b, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                        <span className="mt-1 w-1.5 h-1.5 rounded-full bg-cyan-400 flex-shrink-0" />{b}
                      </li>
                    ))}
                  </ul>
                </ResultCard>
              </div>
            )}

            {!loading && result && activeTab === "seo" && (
              <div className="space-y-4">
                <ResultCard label="SEO Başlık" icon="⚡" fullText={result.seo?.title}>
                  <p className="text-sm font-medium text-white">{result.seo?.title}</p>
                  <p className="mt-1.5 text-xs text-slate-500">{result.seo?.title?.length} karakter</p>
                </ResultCard>
                <ResultCard label="Meta Açıklama" icon="⭐" fullText={result.seo?.meta}>
                  <p className="text-sm text-slate-300 leading-relaxed">{result.seo?.meta}</p>
                  <p className="mt-1.5 text-xs text-slate-500">{result.seo?.meta?.length} karakter</p>
                </ResultCard>
                <ResultCard label="Anahtar Kelimeler" icon="🏷️">
                  <div className="flex flex-wrap gap-2">
                    {result.seo?.keywords?.map((kw, i) => <TagChip key={i} tag={kw} />)}
                  </div>
                </ResultCard>
                <ResultCard label="Long-tail Kelimeler" icon="🏷️" fullText={result.seo?.longtail?.join("\n")}>
                  <ul className="space-y-1.5">
                    {result.seo?.longtail?.map((lt, i) => (
                      <li key={i} className="text-sm text-slate-400 flex items-center gap-2">
                        <span className="text-cyan-400">→</span>{lt}
                      </li>
                    ))}
                  </ul>
                </ResultCard>
                <ResultCard label="Trendyol Etiketleri" icon="🏷️" fullText={result.seo?.trendyolTags?.join(", ")}>
                  <div className="flex flex-wrap gap-2">
                    {result.seo?.trendyolTags?.map((t, i) => (
                      <span key={i} className="px-3 py-1 rounded-full text-xs bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">{t}</span>
                    ))}
                  </div>
                </ResultCard>
                <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-sm font-bold text-white">🔍 Rakip Analizi</span>
                    {competitorLoading && <span className="text-xs text-slate-500 animate-pulse">Analiz ediliyor...</span>}
                  </div>
                  {competitorLoading && <Skeleton />}
                  {!competitorLoading && competitors?.analysis && (
                    <div className="space-y-4">
                      <div>
                        <p className="text-xs text-slate-500 uppercase tracking-wider mb-2">Rakiplerin Ortak Kelimeleri</p>
                        <div className="flex flex-wrap gap-2">
                          {competitors.analysis.commonKeywords?.map((k,i) => (
                            <span key={i} className="px-3 py-1 rounded-full text-xs bg-blue-500/10 text-blue-400 border border-blue-500/20">{k}</span>
                          ))}
                        </div>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 uppercase tracking-wider mb-2">Sende Eksik Kelimeler</p>
                        <div className="flex flex-wrap gap-2">
                          {competitors.analysis.missingKeywords?.map((k,i) => (
                            <span key={i} className="px-3 py-1 rounded-full text-xs bg-red-500/10 text-red-400 border border-red-500/20">⚠ {k}</span>
                          ))}
                        </div>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 uppercase tracking-wider mb-2">Önerilen Başlık</p>
                        <p className="text-sm font-medium text-white p-3 bg-cyan-500/5 rounded-xl border border-cyan-500/20">{competitors.analysis.titleSuggestion}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 uppercase tracking-wider mb-2">Özet</p>
                        <p className="text-sm text-slate-400 leading-relaxed">{competitors.analysis.insight}</p>
                      </div>
                    </div>
                  )}
                  {!competitorLoading && !competitors?.analysis && result && (
                    <p className="text-sm text-slate-500">Rakip verisi bulunamadı.</p>
                  )}
                </div>
              </div>
            )}

            {!loading && result && activeTab === "social" && (
              <div className="space-y-4">
                <div className="flex gap-2 flex-wrap">
                  {SOCIAL.map(s => (
                    <button key={s} onClick={() => setActiveSocial(s)}
                      className={`px-4 py-1.5 rounded-full text-xs font-medium border transition-all ${activeSocial === s ? "border-cyan-500/50 bg-cyan-500/10 text-cyan-400" : "border-slate-700 text-slate-500 hover:border-slate-600"}`}>
                      {s}
                    </button>
                  ))}
                </div>
                {result.social?.[activeSocial.toLowerCase().replace("twitter/x","twitterx")]?.map((variant, i) => (
                  <ResultCard key={i} label={`Versiyon ${i + 1}`} icon="📱"
                    fullText={variant.text + (variant.hashtags ? "\n\n" + variant.hashtags.map(h => `#${h}`).join(" ") : "")}>
                    <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">{variant.text}</p>
                    {variant.hashtags && (
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {variant.hashtags.map((h, j) => <span key={j} className="text-xs text-cyan-400 font-medium">#{h}</span>)}
                      </div>
                    )}
                    {variant.note && <p className="mt-2 text-xs text-slate-500 italic">{variant.note}</p>}
                  </ResultCard>
                ))}
              </div>
            )}
            {activeTab === "banner" && (
  <div className="space-y-6">
    <div className="grid md:grid-cols-2 gap-6">
      {/* Form */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-white">Banner Bilgileri</h3>
        <div>
          <label className="block text-xs text-slate-500 mb-1.5">Ürün Adı / Başlık</label>
          <input type="text" value={bannerForm.title}
            onChange={e => setBannerForm(f => ({ ...f, title: e.target.value }))}
            placeholder="Örn: Premium Güneş Gözlüğü"
            className="w-full px-3 py-2.5 rounded-lg border border-slate-700 bg-slate-800 text-white text-sm focus:outline-none focus:border-cyan-500" />
        </div>
        <div>
          <label className="block text-xs text-slate-500 mb-1.5">Fiyat</label>
          <input type="text" value={bannerForm.price}
            onChange={e => setBannerForm(f => ({ ...f, price: e.target.value }))}
            placeholder="Örn: 299₺"
            className="w-full px-3 py-2.5 rounded-lg border border-slate-700 bg-slate-800 text-white text-sm focus:outline-none focus:border-cyan-500" />
        </div>
        <div>
          <label className="block text-xs text-slate-500 mb-1.5">Slogan / Alt Başlık</label>
          <input type="text" value={bannerForm.slogan}
            onChange={e => setBannerForm(f => ({ ...f, slogan: e.target.value }))}
            placeholder="Örn: Ücretsiz kargo • Hızlı teslimat"
            className="w-full px-3 py-2.5 rounded-lg border border-slate-700 bg-slate-800 text-white text-sm focus:outline-none focus:border-cyan-500" />
        </div>
        <div>
          <label className="block text-xs text-slate-500 mb-1.5">Vurgu Rengi</label>
          <div className="flex gap-2 flex-wrap">
            {["#06b6d4", "#8b5cf6", "#f97316", "#10b981", "#f43f5e", "#3b82f6"].map(c => (
              <button key={c} onClick={() => setBannerForm(f => ({ ...f, color: c }))}
                style={{ backgroundColor: c }}
                className={`w-8 h-8 rounded-full border-2 transition-all ${bannerForm.color === c ? "border-white scale-110" : "border-transparent"}`} />
            ))}
          </div>
        </div>
        <div>
          <label className="block text-xs text-slate-500 mb-1.5">Şablon</label>
          <div className="grid grid-cols-2 gap-2">
            {[
              { id: "instagram", label: "Instagram Karesi" },
              { id: "story", label: "Story (9:16)" },
              { id: "trendyol", label: "Trendyol Banner" },
              { id: "wide", label: "Geniş Banner" },
            ].map(t => (
              <button key={t.id} onClick={() => setBannerForm(f => ({ ...f, template: t.id }))}
                className={`py-2 px-3 rounded-lg text-xs font-medium border transition-all ${bannerForm.template === t.id ? "border-cyan-500/50 bg-cyan-500/10 text-cyan-400" : "border-slate-700 text-slate-400 hover:border-slate-600"}`}>
                {t.label}
              </button>
            ))}
          </div>
        </div>
        <button
          onClick={() => {
            const svg = document.getElementById("bannerSvg");
            if (!svg) return;
            const svgData = new XMLSerializer().serializeToString(svg);
            const canvas = document.createElement("canvas");
            const ctx = canvas.getContext("2d");
            const img = new Image();
            const blob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
            const url = URL.createObjectURL(blob);
            img.onload = () => {
              canvas.width = img.width;
              canvas.height = img.height;
              ctx.drawImage(img, 0, 0);
              URL.revokeObjectURL(url);
              const a = document.createElement("a");
              a.download = "banner.png";
              a.href = canvas.toDataURL("image/png");
              a.click();
            };
            img.src = url;
          }}
          className="w-full py-3 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-[#0b121f] font-semibold text-sm transition-all">
          ⬇ PNG Olarak İndir
        </button>
      </div>

      {/* Önizleme */}
      <div>
        <h3 className="text-sm font-semibold text-white mb-3">Önizleme</h3>
        <div className="flex items-center justify-center bg-slate-800 rounded-2xl p-4 border border-slate-700">
          {bannerForm.template === "instagram" && (
            <svg id="bannerSvg" width="400" height="400" xmlns="http://www.w3.org/2000/svg">
              <rect width="400" height="400" fill="#0b121f"/>
              <rect width="400" height="6" fill={bannerForm.color}/>
              <rect y="394" width="400" height="6" fill={bannerForm.color}/>
              <rect x="30" y="80" width="340" height="2" fill={bannerForm.color} opacity="0.3"/>
              <rect x="30" y="318" width="340" height="2" fill={bannerForm.color} opacity="0.3"/>
              <text x="200" y="160" textAnchor="middle" fill="white" fontSize="28" fontWeight="bold" fontFamily="Arial">{bannerForm.title || "Ürün Adı"}</text>
              <text x="200" y="210" textAnchor="middle" fill={bannerForm.color} fontSize="42" fontWeight="bold" fontFamily="Arial">{bannerForm.price || "₺"}</text>
              <text x="200" y="260" textAnchor="middle" fill="#94a3b8" fontSize="16" fontFamily="Arial">{bannerForm.slogan || "Slogan"}</text>
              <rect x="130" y="290" width="140" height="36" rx="18" fill={bannerForm.color}/>
              <text x="200" y="313" textAnchor="middle" fill="#0b121f" fontSize="14" fontWeight="bold" fontFamily="Arial">Hemen Al →</text>
            </svg>
          )}
          {bannerForm.template === "story" && (
            <svg id="bannerSvg" width="225" height="400" xmlns="http://www.w3.org/2000/svg">
              <rect width="225" height="400" fill="#0b121f"/>
              <rect width="225" height="4" fill={bannerForm.color}/>
              <rect y="396" width="225" height="4" fill={bannerForm.color}/>
              <circle cx="112" cy="100" r="50" fill={bannerForm.color} opacity="0.1" stroke={bannerForm.color} strokeWidth="1"/>
              <text x="112" y="107" textAnchor="middle" fill={bannerForm.color} fontSize="30" fontFamily="Arial">✨</text>
              <text x="112" y="190" textAnchor="middle" fill="white" fontSize="18" fontWeight="bold" fontFamily="Arial">{bannerForm.title || "Ürün Adı"}</text>
              <text x="112" y="240" textAnchor="middle" fill={bannerForm.color} fontSize="32" fontWeight="bold" fontFamily="Arial">{bannerForm.price || "₺"}</text>
              <text x="112" y="280" textAnchor="middle" fill="#94a3b8" fontSize="12" fontFamily="Arial">{bannerForm.slogan || "Slogan"}</text>
              <rect x="62" y="310" width="100" height="32" rx="16" fill={bannerForm.color}/>
              <text x="112" y="331" textAnchor="middle" fill="#0b121f" fontSize="12" fontWeight="bold" fontFamily="Arial">Hemen Al →</text>
            </svg>
          )}
          {bannerForm.template === "trendyol" && (
            <svg id="bannerSvg" width="400" height="200" xmlns="http://www.w3.org/2000/svg">
              <rect width="400" height="200" fill="#0b121f"/>
              <rect width="8" height="200" fill={bannerForm.color}/>
              <text x="30" y="80" fill="white" fontSize="22" fontWeight="bold" fontFamily="Arial">{bannerForm.title || "Ürün Adı"}</text>
              <text x="30" y="120" fill={bannerForm.color} fontSize="36" fontWeight="bold" fontFamily="Arial">{bannerForm.price || "₺"}</text>
              <text x="30" y="150" fill="#94a3b8" fontSize="13" fontFamily="Arial">{bannerForm.slogan || "Slogan"}</text>
              <rect x="280" y="70" width="100" height="36" rx="8" fill={bannerForm.color}/>
              <text x="330" y="93" textAnchor="middle" fill="#0b121f" fontSize="13" fontWeight="bold" fontFamily="Arial">Satın Al</text>
            </svg>
          )}
          {bannerForm.template === "wide" && (
            <svg id="bannerSvg" width="400" height="150" xmlns="http://www.w3.org/2000/svg">
              <rect width="400" height="150" fill="#0b121f"/>
              <rect width="400" height="4" fill={bannerForm.color}/>
              <rect y="146" width="400" height="4" fill={bannerForm.color}/>
              <text x="200" y="55" textAnchor="middle" fill="white" fontSize="20" fontWeight="bold" fontFamily="Arial">{bannerForm.title || "Ürün Adı"}</text>
              <text x="200" y="95" textAnchor="middle" fill={bannerForm.color} fontSize="30" fontWeight="bold" fontFamily="Arial">{bannerForm.price || "₺"}</text>
              <text x="200" y="125" textAnchor="middle" fill="#94a3b8" fontSize="12" fontFamily="Arial">{bannerForm.slogan || "Slogan"}</text>
            </svg>
          )}
        </div>
      </div>
    </div>
  </div>
  )}
  {/* Toplu Banner */}
    <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6 mt-4">
      <h3 className="text-white font-semibold mb-4">📦 Toplu Banner Üret</h3>
      <p className="text-slate-400 text-sm mb-4">Birden fazla ürün için aynı şablonla banner üret, ZIP olarak indir.</p>
      <div className="space-y-3 mb-4">
        {bulkBannerItems.map((item, i) => (
          <div key={i} className="grid grid-cols-3 gap-2 items-center">
            <input type="text" placeholder="Ürün adı" value={item.title}
              onChange={e => setBulkBannerItems(items => items.map((it, j) => j === i ? { ...it, title: e.target.value } : it))}
              className="px-3 py-2 rounded-lg border border-slate-700 bg-slate-800 text-white text-xs focus:outline-none focus:border-cyan-500" />
            <input type="text" placeholder="Fiyat" value={item.price}
              onChange={e => setBulkBannerItems(items => items.map((it, j) => j === i ? { ...it, price: e.target.value } : it))}
              className="px-3 py-2 rounded-lg border border-slate-700 bg-slate-800 text-white text-xs focus:outline-none focus:border-cyan-500" />
            <input type="text" placeholder="Slogan" value={item.slogan}
              onChange={e => setBulkBannerItems(items => items.map((it, j) => j === i ? { ...it, slogan: e.target.value } : it))}
              className="px-3 py-2 rounded-lg border border-slate-700 bg-slate-800 text-white text-xs focus:outline-none focus:border-cyan-500" />
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <button onClick={() => setBulkBannerItems(items => [...items, { title: "", price: "", slogan: "" }])}
          className="px-4 py-2 rounded-lg border border-slate-700 text-slate-400 text-sm hover:border-slate-600 transition-all">
          + Ürün Ekle
        </button>
        <button onClick={async () => {
          const JSZip = (await import("jszip")).default;
          const zip = new JSZip();
          for (const item of bulkBannerItems) {
            if (!item.title) continue;
            const svgContent = `<svg width="400" height="400" xmlns="http://www.w3.org/2000/svg">
              <rect width="400" height="400" fill="#0b121f"/>
              <rect width="400" height="6" fill="${bannerForm.color}"/>
              <rect y="394" width="400" height="6" fill="${bannerForm.color}"/>
              <text x="200" y="160" text-anchor="middle" fill="white" font-size="28" font-weight="bold" font-family="Arial">${item.title}</text>
              <text x="200" y="210" text-anchor="middle" fill="${bannerForm.color}" font-size="42" font-weight="bold" font-family="Arial">${item.price || ""}</text>
              <text x="200" y="260" text-anchor="middle" fill="#94a3b8" font-size="16" font-family="Arial">${item.slogan || ""}</text>
              <rect x="130" y="290" width="140" height="36" rx="18" fill="${bannerForm.color}"/>
              <text x="200" y="313" text-anchor="middle" fill="#0b121f" font-size="14" font-weight="bold" font-family="Arial">Hemen Al</text>
            </svg>`;
            zip.file(`${item.title.replace(/\s+/g, "_")}.svg`, svgContent);
          }
          const blob = await zip.generateAsync({ type: "blob" });
          const a = document.createElement("a");
          a.href = URL.createObjectURL(blob);
          a.download = "bannerlar.zip";
          a.click();
        }}
          className="flex-1 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-[#0b121f] font-semibold text-sm transition-all">
          ⬇ Tümünü ZIP İndir
        </button>
      </div>
    </div>
{activeTab === "api" && (
  <div className="space-y-6 max-w-2xl">
    <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6">
      <h3 className="text-white font-semibold mb-1">🔑 API Erişimi</h3>
      <p className="text-slate-400 text-sm mb-6">API key'inizi kullanarak kendi sisteminizden içerik üretebilirsiniz.</p>

      {/* Yeni key oluştur */}
      <div className="flex gap-2 mb-6">
        <input type="text" value={newKeyName} onChange={e => setNewKeyName(e.target.value)}
          placeholder="Key adı (örn: Mağazam)"
          className="flex-1 px-3 py-2.5 rounded-lg border border-slate-700 bg-slate-800 text-white text-sm focus:outline-none focus:border-cyan-500" />
        <button onClick={async () => {
            setApiKeyLoading(true);
            const { data } = await supabase.from("api_keys").insert({
              user_id: user.id, name: newKeyName || "Varsayılan"
            }).select().single();
            if (data) { setApiKeys(k => [...k, data]); setNewKeyName(""); }
            setApiKeyLoading(false);
          }}
          disabled={apiKeyLoading}
          className="px-4 py-2.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-[#0b121f] font-semibold text-sm transition-all disabled:opacity-40">
          {apiKeyLoading ? "..." : "Oluştur"}
        </button>
      </div>

      {/* Key listesi */}
      {apiKeys.length === 0 ? (
        <p className="text-slate-500 text-sm text-center py-8">Henüz API key oluşturmadın.</p>
      ) : (
        <div className="space-y-3">
          {apiKeys.map((k, i) => (
            <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-slate-800 border border-slate-700">
              <div className="flex-1 min-w-0">
                <p className="text-xs text-slate-400 mb-1">{k.name}</p>
                <p className="text-sm font-mono text-cyan-400 truncate">{k.key}</p>
              </div>
              <button onClick={() => navigator.clipboard.writeText(k.key)}
                className="text-xs px-3 py-1.5 rounded-lg border border-slate-600 text-slate-400 hover:text-white hover:border-slate-500 transition-all flex-shrink-0">
                Kopyala
              </button>
              <button onClick={async () => {
                  await supabase.from("api_keys").update({ is_active: false }).eq("id", k.id);
                  setApiKeys(keys => keys.filter(key => key.id !== k.id));
                }}
                className="text-xs px-3 py-1.5 rounded-lg border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-all flex-shrink-0">
                Sil
              </button>
            </div>
          ))}
        </div>
      )}
    </div>

    {/* Kullanım kılavuzu */}
    <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6">
      <h3 className="text-white font-semibold mb-4">📖 Kullanım</h3>
      <p className="text-slate-400 text-sm mb-3">Aşağıdaki formatta POST isteği gönder:</p>
      <div className="bg-slate-950 rounded-xl p-4 font-mono text-xs text-slate-300 overflow-x-auto">
        <p className="text-cyan-400">POST</p>
        <p className="text-slate-500 mb-2">https://icerikbot-production.up.railway.app/api/analyze</p>
        <p className="text-slate-500">Headers:</p>
        <p className="ml-2">x-api-key: <span className="text-cyan-400">ib_your_key_here</span></p>
        <p className="ml-2">Content-Type: <span className="text-green-400">application/json</span></p>
        <p className="text-slate-500 mt-2">Body:</p>
        <p className="ml-2">{"{"}</p>
        <p className="ml-4">"url": <span className="text-green-400">"https://trendyol.com/..."</span>,</p>
        <p className="ml-4">"platform": <span className="text-green-400">"trendyol"</span>,</p>
        <p className="ml-4">"tone": <span className="text-green-400">"Profesyonel"</span></p>
        <p className="ml-2">{"}"}</p>
      </div>
    </div>
  </div>
)}
          </div>
        </main>
      </div>
    </div>
  );
}