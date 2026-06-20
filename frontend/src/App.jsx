import { useState, useRef, useEffect } from "react";
import { supabase } from "./supabase";

const Icon = ({ name, className = "" }) => {
  const icons = {
    sparkles: <><path d="M9 3H7l-1 4H2l3 2-1 4 3-2 3 2-1-4 3-2h-4L9 3z"/><path d="M18 8l-.7 2.1L15 11l2.3.9.7 2.1.7-2.1L21 11l-2.3-.9L18 8z"/></>,
    link: <><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></>,
    copy: <><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></>,
    check: <><polyline points="20 6 9 17 4 12"/></>,
    zap: <><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></>,
    tag: <><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></>,
    share: <><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></>,
    loader: <><line x1="12" y1="2" x2="12" y2="6"/><line x1="12" y1="18" x2="12" y2="22"/><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"/><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"/><line x1="2" y1="12" x2="6" y2="12"/><line x1="18" y1="12" x2="22" y2="12"/><line x1="4.93" y1="19.07" x2="7.76" y2="16.24"/><line x1="16.24" y1="7.76" x2="19.07" y2="4.93"/></>,
    star: <><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></>,
    alert: <><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></>,
  };
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      {icons[name]}
    </svg>
  );
};

function CopyBtn({ text }) {
  const [copied, setCopied] = useState(false);
  return (
    <button onClick={() => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-slate-200 text-slate-500 hover:bg-slate-50 transition-all">
      <Icon name={copied ? "check" : "copy"} className={`w-3.5 h-3.5 ${copied ? "text-emerald-500" : ""}`} />
      {copied ? "Kopyalandı!" : "Kopyala"}
    </button>
  );
}

function TagChip({ tag }) {
  const [copied, setCopied] = useState(false);
  return (
    <button onClick={() => { navigator.clipboard.writeText(tag); setCopied(true); setTimeout(() => setCopied(false), 1200); }}
      className={`px-3 py-1 rounded-full text-xs font-medium border transition-all ${copied ? "border-emerald-400 bg-emerald-50 text-emerald-700" : "border-slate-200 bg-slate-50 text-slate-600 hover:border-orange-300 hover:bg-orange-50 hover:text-orange-700"}`}>
      #{tag}
    </button>
  );
}

function ResultCard({ label, icon, children, fullText }) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-5">
      <div className="flex items-center justify-between mb-3">
        <span className="flex items-center gap-2 text-sm font-bold text-slate-700">
          <Icon name={icon} className="w-3.5 h-3.5" />{label}
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
        <div className="w-8 h-8 rounded-full bg-orange-100" />
        <div className="h-4 w-48 rounded-full bg-slate-100" />
      </div>
      {[1,2,3,4,5].map(i => (
        <div key={i} className={`h-3 rounded-full bg-slate-100 ${i === 5 ? "w-1/2" : i % 2 === 0 ? "w-5/6" : "w-full"}`} />
      ))}
      <div className="pt-4 space-y-2">
        <div className="h-3 rounded-full bg-orange-50 w-3/4" />
        <div className="h-3 rounded-full bg-orange-50 w-2/3" />
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
function downloadExcel(results) {
  const rows = [];
  results.forEach(r => {
    if (r.error) {
      rows.push({ "Ürün Adı": r.url, "Hata": r.error });
      return;
    }
    rows.push({
      "Ürün Adı": r.product?.name || "",
      "Marka": r.product?.brand || "",
      "Fiyat": r.product?.price || "",
      "Platform Açıklaması": r.description?.platform || "",
      "Kısa Özet": r.description?.short || "",
      "Özellikler": r.description?.bullets?.join(" | ") || "",
      "SEO Başlık": r.seo?.title || "",
      "Meta Açıklama": r.seo?.meta || "",
      "Anahtar Kelimeler": r.seo?.keywords?.join(", ") || "",
      "Instagram Post": r.social?.instagram?.[0]?.text || "",
      "Instagram Hashtag": r.social?.instagram?.[0]?.hashtags?.map(h => `#${h}`).join(" ") || "",
      "Twitter Post": r.social?.twitterx?.[0]?.text || "",
      "Facebook Post": r.social?.facebook?.[0]?.text || "",
      "URL": r.url,
    });
  });

  const headers = Object.keys(rows[0] || {});
  const tsvContent = [
    headers.join("\t"),
    ...rows.map(row => headers.map(h => (row[h] || "").toString().replace(/\t/g, " ").replace(/\n/g, " ")).join("\t"))
  ].join("\n");

  const blob = new Blob(["\uFEFF" + tsvContent], { type: "text/tab-separated-values;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `icerikbot_${new Date().toISOString().slice(0,10)}.xls`;
  a.click();
  URL.revokeObjectURL(url);
}
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
  const [bulkMode, setBulkMode] = useState(false);
const [bulkUrls, setBulkUrls] = useState("");
const [bulkResults, setBulkResults] = useState([]);
const [bulkLoading, setBulkLoading] = useState(false);
const [bulkProgress, setBulkProgress] = useState(0);
const [credits, setCredits] = useState(null);
const [manualMode, setManualMode] = useState(false);
const [manualForm, setManualForm] = useState({
  name: "",
  brand: "",
  price: "",
  description: "",
  features: "",
});
useEffect(() => {
  if (user) {
    supabase
      .from("profiles")
      .select("credits")
      .eq("id", user.id)
      .single()
      .then(({ data }) => {
        if (data) setCredits(data.credits);
      });
  }
}, [user]);
const [showPlans, setShowPlans] = useState(false);
const [paymentLoading, setPaymentLoading] = useState(null);

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
const [competitors, setCompetitors] = useState(null);
const [competitorLoading, setCompetitorLoading] = useState(false);
const inputRef = useRef();

  const handleAnalyze = async () => {
   
    if (!url.trim()) { inputRef.current?.focus(); return; }
    if (credits !== null && credits <= 0) {
  setShowPlans(true);
  return;
}
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
if (credits !== null && credits > 0) {
  const newCredits = credits - 1;
  setCredits(newCredits);
  await supabase
    .from("profiles")
    .update({ credits: newCredits })
    .eq("id", user.id);
  if (newCredits === 1) {
    fetch("https://icerikbot-production.up.railway.app/api/send-low-credit-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: user.email }),
    }).catch(() => {});
  }
}
setActiveTab("description");
if (r.product?.name) {
  setCompetitorLoading(true);
  setCompetitors(null);
  try {
    const cr = await fetch("https://icerikbot-production.up.railway.app/api/competitors", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productName: r.product.name }),
    });
    const cd = await cr.json();
    setCompetitors(cd);
  } catch (e) {
    console.error("Rakip analizi hatası:", e);
  } finally {
    setCompetitorLoading(false);
  }
}
      setActiveTab("description");
   } catch (e) {
  if (!manualMode) {
    setManualMode(true);
    setError("");
  } else {
    setError(e.message || "Bir hata oluştu.");
  }
    } finally {
      setLoading(false);
    }
  };
 const handleBulkAnalyze = async () => {
    const urls = bulkUrls.split("\n").map(u => u.trim()).filter(u => u.startsWith("http"));
    if (!urls.length) return;
    setBulkLoading(true);
    setBulkResults([]);
    setBulkProgress(0);
    try {
      const res = await fetch("https://icerikbot-production.up.railway.app/api/analyze-bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ urls, platform, tone }),
      });
      const data = await res.json();
      setBulkResults(data.results || []);
    } catch (e) {
      setError(e.message);
    } finally {
      setBulkLoading(false);
    }
  };
  const tabs = [
    { id: "description", label: "Açıklama", icon: "star" },
    { id: "seo", label: "SEO", icon: "zap" },
    { id: "social", label: "Sosyal Medya", icon: "share" },
  ];

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
<header className="border-b border-slate-200 bg-white px-4 md:px-6 py-3 md:py-4 flex items-center gap-2 md:gap-3 flex-wrap">        <div className="w-8 h-8 rounded-xl bg-orange-500 flex items-center justify-center">
          <Icon name="sparkles" className="w-4 h-4 text-white" />
        </div>
        {onBack && (
  <button onClick={onBack} className="text-slate-400 hover:text-slate-600 text-sm mr-2">
    ← Geri
  </button>
)}
        <span className="font-bold text-slate-900 text-lg">İçerik<span className="text-orange-500">Bot</span></span>
<div className="ml-auto flex items-center gap-3">
  {credits !== null && (
    <span className={`text-xs font-medium px-3 py-1 rounded-full ${credits > 0 ? "bg-orange-50 text-orange-600" : "bg-red-50 text-red-500"}`}>
      {credits > 0 ? `${credits} analiz hakkın var` : "Hakkın doldu"}
    </span>
  )}
  {onAdmin && (
  <button onClick={onAdmin}
    className="text-xs text-slate-400 hover:text-orange-500 transition-all">
    Admin
  </button>
)}
  <button onClick={async () => { await supabase.auth.signOut(); onBack(); }}
    className="text-xs text-slate-400 hover:text-slate-600 transition-all">
    Çıkış
  </button>
</div>
      </header>

      <div className="flex flex-col md:flex-row h-[calc(100vh-65px)]">
<aside className="w-full md:w-80 flex-shrink-0 border-r-0 md:border-r border-b md:border-b-0 border-slate-200 bg-white flex flex-col overflow-y-auto max-h-[50vh] md:max-h-none">          <div className="p-5 space-y-5">
            <div className="flex gap-2">
              <button onClick={() => setBulkMode(false)}
                className={`flex-1 py-2 rounded-xl text-sm font-medium border transition-all ${!bulkMode ? "bg-orange-500 text-white border-orange-500" : "border-slate-200 text-slate-600 hover:border-slate-300"}`}>
                Tekli
              </button>
              <button onClick={() => setBulkMode(true)}
                className={`flex-1 py-2 rounded-xl text-sm font-medium border transition-all ${bulkMode ? "bg-orange-500 text-white border-orange-500" : "border-slate-200 text-slate-600 hover:border-slate-300"}`}>
                Toplu
              </button>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2.5">Platform</label>
              <div className="grid grid-cols-2 gap-2">
                {PLATFORMS.map(p => (
                  <button key={p.id} onClick={() => setPlatform(p.id)}
                    className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-sm font-medium transition-all ${platform === p.id ? "border-orange-400 bg-orange-50 text-orange-700" : "border-slate-200 text-slate-600 hover:border-slate-300"}`}>
                    <span className={`w-2 h-2 rounded-full ${p.color}`} />{p.label}
                  </button>
                ))}
              </div>
            </div>

            {!bulkMode ? (
  <div>
    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2.5">Ürün Linki</label>
    <div className="relative">
      <Icon name="link" className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
      <input ref={inputRef} type="url" value={url} onChange={e => setUrl(e.target.value)}
        onKeyDown={e => e.key === "Enter" && handleAnalyze()}
        placeholder="https://www.trendyol.com/..."
        className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-400/40 focus:border-orange-400 transition-all" />
    {manualMode && (
  <div className="mt-3 p-3 rounded-xl bg-orange-50 border border-orange-200">
    <p className="text-xs text-orange-600 font-medium mb-2">⚠ Link çekilemedi — ürün bilgilerini gir:</p>
    <div className="space-y-2">
      <input type="text" placeholder="Ürün adı *" value={manualForm.name}
        onChange={e => setManualForm(p => ({...p, name: e.target.value}))}
        className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs focus:outline-none focus:border-orange-400" />
      <input type="text" placeholder="Marka" value={manualForm.brand}
        onChange={e => setManualForm(p => ({...p, brand: e.target.value}))}
        className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs focus:outline-none focus:border-orange-400" />
      <input type="text" placeholder="Fiyat (örn: 299 TL)" value={manualForm.price}
        onChange={e => setManualForm(p => ({...p, price: e.target.value}))}
        className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs focus:outline-none focus:border-orange-400" />
      <textarea placeholder="Ürün özellikleri (virgülle ayır)" value={manualForm.features}
        onChange={e => setManualForm(p => ({...p, features: e.target.value}))}
        rows={3}
        className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs focus:outline-none focus:border-orange-400 resize-none" />
    </div>
  </div>
)}
    </div>
  </div>
) : (
  <div>
    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2.5">Ürün Linkleri (her satıra bir link)</label>
    <textarea value={bulkUrls} onChange={e => setBulkUrls(e.target.value)}
      placeholder={"https://www.trendyol.com/...\nhttps://www.trendyol.com/...\nhttps://www.trendyol.com/..."}
      rows={6}
      className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-400/40 focus:border-orange-400 transition-all resize-none" />
    <p className="text-xs text-slate-400 mt-1">{bulkUrls.split("\n").filter(u => u.trim().startsWith("http")).length} link girildi</p>
  </div>
)}

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2.5">Yazı Tonu</label>
              <div className="space-y-1.5">
                {TONES.map(t => (
                  <button key={t} onClick={() => setTone(t)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all ${tone === t ? "bg-orange-50 text-orange-700 font-medium" : "text-slate-600 hover:bg-slate-50"}`}>
                    {tone === t && <span className="mr-2">•</span>}{t}
                  </button>
                ))}
              </div>
            </div>

            <button onClick={bulkMode ? handleBulkAnalyze : handleAnalyze}
  disabled={bulkMode ? bulkLoading : (loading || !url.trim())}
  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm bg-orange-500 hover:bg-orange-600 text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all">
  {bulkMode
   ? (bulkLoading ? <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin inline-block" />Analiz ediliyor...</> : <><Icon name="sparkles" className="w-4 h-4" />Toplu Analiz Başlat</>)
    : (loading ? <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin inline-block" />İçerikler hazırlanıyor...</> : <><Icon name="sparkles" className="w-4 h-4" />İçerik Üret</>)
  }
</button>

            {error && (
              <div className="flex items-start gap-2 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs">
                <Icon name="alert" className="w-4 h-4 mt-0.5 flex-shrink-0" /><span>{error}</span>
              </div>
            )}

            {result?.product && (
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Çekilen Ürün</p>
                {result.product.image && <img src={result.product.image} alt="" className="w-full h-32 object-contain rounded-lg bg-white border border-slate-100 p-2" />}
                <p className="text-sm font-medium text-slate-800 line-clamp-2">{result.product.name}</p>
                {result.product.price && <p className="text-sm font-bold text-orange-500">{result.product.price}</p>}
              </div>
            )}
          </div>
        </aside>

        <main className="flex-1 overflow-y-auto">
          <div className="sticky top-0 z-10 bg-slate-50 border-b border-slate-200 px-6 pt-4 pb-0 flex gap-1">
            {tabs.map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-t-xl border transition-all ${activeTab === tab.id ? "bg-white border-slate-200 border-b-white text-slate-900 -mb-px" : "border-transparent text-slate-500 hover:text-slate-700"}`}>
                <Icon name={tab.icon} className="w-3.5 h-3.5" />{tab.label}
              </button>
            ))}
          </div>

          <div className="p-6 space-y-4">
            {bulkResults.length > 0 && (
  <div className="space-y-4">
    <div className="flex items-center justify-between">
      <h2 className="text-sm font-semibold text-slate-700">{bulkResults.length} ürün analiz edildi</h2>
      
    </div>
    {bulkResults.map((r, i) => (
      <div key={i} className="rounded-2xl border border-slate-100 bg-white p-5">
        <div className="flex items-center gap-2 mb-3">
          <span className="w-6 h-6 rounded-full bg-orange-100 text-orange-600 text-xs font-bold flex items-center justify-center">{i+1}</span>
          <p className="text-sm font-medium text-slate-800 truncate">{r.product?.name || r.url}</p>
          {r.error && <span className="ml-auto text-xs text-red-500">Hata</span>}
        </div>
        {!r.error && (
  <div className="space-y-3">
    <p className="text-xs text-slate-500 line-clamp-2">{r.description?.short}</p>
    <div className="flex flex-wrap gap-1">
      {r.seo?.keywords?.slice(0,4).map((k,j) => (
        <span key={j} className="px-2 py-0.5 rounded-full text-xs bg-slate-100 text-slate-600">#{k}</span>
      ))}
    </div>
    <details className="text-xs text-slate-600">
      <summary className="cursor-pointer text-orange-500 font-medium">Tüm içeriği gör ▼</summary>
      <div className="mt-2 space-y-2">
        <p className="font-medium text-slate-700">Açıklama:</p>
        <p className="leading-relaxed">{r.description?.platform}</p>
        <p className="font-medium text-slate-700 mt-2">SEO Başlık:</p>
        <p>{r.seo?.title}</p>
        <p className="font-medium text-slate-700 mt-2">Meta:</p>
        <p>{r.seo?.meta}</p>
        <p className="font-medium text-slate-700 mt-2">Instagram:</p>
        <p>{r.social?.instagram?.[0]?.text}</p>
      </div>
    </details>
  </div>
)}
      </div>
    ))}
  </div>
)}
{showPlans && (
  <div className="flex flex-col items-center justify-center h-96 text-center space-y-6">
    <div className="w-16 h-16 rounded-2xl bg-orange-100 flex items-center justify-center">
      <Icon name="zap" className="w-8 h-8 text-orange-400" />
    </div>
    <div>
      <p className="text-slate-700 font-semibold text-lg">Ücretsiz analiz hakkın doldu!</p>
      <p className="text-slate-400 text-sm mt-1">Devam etmek için bir plan seç</p>
    </div>
    <div className="grid md:grid-cols-3 gap-4 max-w-3xl">
      {[
        { id: "baslangic", name: "Başlangıç", price: "149₺", credits: "100 analiz" },
        { id: "pro", name: "Pro", price: "349₺", credits: "500 analiz", highlight: true },
        { id: "ajans", name: "Ajans", price: "899₺", credits: "Sınırsız" },
      ].map(p => (
        <div key={p.id} className={`rounded-2xl p-5 border ${p.highlight ? "border-orange-400 bg-orange-50" : "border-slate-200 bg-white"}`}>
          {p.highlight && <div className="text-xs font-semibold text-orange-600 mb-2">⭐ EN POPÜLER</div>}
          <h3 className="font-bold text-slate-900 text-lg mb-1">{p.name}</h3>
          <p className="text-2xl font-bold text-slate-900 mb-1">{p.price}<span className="text-sm text-slate-400 font-normal">/ay</span></p>
          <p className="text-sm text-slate-500 mb-4">{p.credits}</p>
          <button onClick={() => handlePurchase(p.id)} disabled={paymentLoading === p.id}
            className={`w-full py-2.5 rounded-xl font-medium text-sm transition-all ${p.highlight ? "bg-orange-500 hover:bg-orange-600 text-white" : "border border-slate-200 text-slate-700 hover:border-orange-300"}`}>
            {paymentLoading === p.id ? "Yönlendiriliyor..." : "Satın Al"}
          </button>
        </div>
      ))}
    </div>
  </div>
)}
            {!loading && !result && !error && !showPlans && (
              <div className="flex flex-col items-center justify-center h-96 text-center space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-orange-100 flex items-center justify-center">
                  <Icon name="sparkles" className="w-8 h-8 text-orange-400" />
                </div>
                <div>
                  <p className="text-slate-700 font-semibold text-lg">Hadi başlayalım!</p>
                  <p className="text-slate-400 text-sm mt-1">Sol panelden platform seç, ürün linkini yapıştır ve İçerik Üret'e bas.</p>
                </div>
                <div className="flex gap-2 text-xs text-slate-400">
                  <span className="px-2 py-1 rounded-lg bg-slate-100">✓ SEO metinleri</span>
                  <span className="px-2 py-1 rounded-lg bg-slate-100">✓ Ürün açıklaması</span>
                  <span className="px-2 py-1 rounded-lg bg-slate-100">✓ Sosyal medya postları</span>
                </div>
              </div>
            )}

            {loading && <div className="rounded-2xl border border-slate-100 bg-white p-5"><Skeleton /></div>}

            {!loading && result && activeTab === "description" && (
              <div className="space-y-4">
                <ResultCard label="Platform Açıklaması" icon="star" fullText={result.description?.platform}>
                  <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{result.description?.platform}</p>
                </ResultCard>
                <ResultCard label="Kısa Özet" icon="zap" fullText={result.description?.short}>
                  <p className="text-sm text-slate-700 leading-relaxed">{result.description?.short}</p>
                </ResultCard>
                <ResultCard label="Özellikler" icon="tag" fullText={result.description?.bullets?.join("\n")}>
                  <ul className="space-y-2">
                    {result.description?.bullets?.map((b, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                        <span className="mt-1 w-1.5 h-1.5 rounded-full bg-orange-400 flex-shrink-0" />{b}
                      </li>
                    ))}
                  </ul>
                </ResultCard>
              </div>
            )}

            {!loading && result && activeTab === "seo" && (
              <div className="space-y-4">
                <ResultCard label="SEO Başlık" icon="zap" fullText={result.seo?.title}>
                  <p className="text-sm font-medium text-slate-800">{result.seo?.title}</p>
                  <p className="mt-1.5 text-xs text-slate-400">{result.seo?.title?.length} karakter</p>
                </ResultCard>
                <ResultCard label="Meta Açıklama" icon="star" fullText={result.seo?.meta}>
                  <p className="text-sm text-slate-700 leading-relaxed">{result.seo?.meta}</p>
                  <p className="mt-1.5 text-xs text-slate-400">{result.seo?.meta?.length} karakter</p>
                </ResultCard>
                <ResultCard label="Anahtar Kelimeler" icon="tag">
                  <div className="flex flex-wrap gap-2">
                    {result.seo?.keywords?.map((kw, i) => <TagChip key={i} tag={kw} />)}
                  </div>
                </ResultCard>
                <ResultCard label="Long-tail Kelimeler" icon="tag" fullText={result.seo?.longtail?.join("\n")}>
                  <ul className="space-y-1.5">
                    {result.seo?.longtail?.map((lt, i) => (
                      <li key={i} className="text-sm text-slate-600 flex items-center gap-2">
                        <span className="text-orange-400">→</span>{lt}
                      </li>
                    ))}
                    {!loading && result && activeTab === "seo" && (
  <div className="rounded-2xl border border-slate-100 bg-white p-5 mt-4">
    <div className="flex items-center gap-2 mb-4">
      <span className="text-sm font-bold text-slate-700">🔍 Rakip Analizi</span>
      {competitorLoading && <span className="text-xs text-slate-400 animate-pulse">Rakipler analiz ediliyor...</span>}
    </div>
    {competitorLoading && (
      <div className="space-y-2 animate-pulse">
        {[1,2,3].map(i => <div key={i} className={`h-3 rounded-full bg-slate-100 ${i===3?"w-1/2":"w-full"}`} />)}
      </div>
    )}
    {!competitorLoading && competitors?.analysis && (
      <div className="space-y-4">
        <div>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Rakiplerin Ortak Kelimeleri</p>
          <div className="flex flex-wrap gap-2">
            {competitors.analysis.commonKeywords?.map((k,i) => (
              <span key={i} className="px-3 py-1 rounded-full text-xs bg-blue-50 text-blue-700 border border-blue-200">{k}</span>
            ))}
          </div>
        </div>
        <div>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Sende Eksik Kelimeler</p>
          <div className="flex flex-wrap gap-2">
            {competitors.analysis.missingKeywords?.map((k,i) => (
              <span key={i} className="px-3 py-1 rounded-full text-xs bg-red-50 text-red-700 border border-red-200">⚠ {k}</span>
            ))}
          </div>
        </div>
        <div>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Önerilen Başlık</p>
          <p className="text-sm font-medium text-slate-800 p-3 bg-orange-50 rounded-xl border border-orange-100">{competitors.analysis.titleSuggestion}</p>
        </div>
        <div>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Fiyat Konumu</p>
          <p className="text-sm text-slate-600">{competitors.analysis.pricePosition}</p>
        </div>
        <div>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Özet</p>
          <p className="text-sm text-slate-600 leading-relaxed">{competitors.analysis.insight}</p>
        </div>
        <div>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Rakip Ürünler</p>
          <div className="space-y-1">
            {competitors.competitors?.map((c,i) => (
              <div key={i} className="flex items-center justify-between text-xs text-slate-600 py-1 border-b border-slate-50">
                <span className="truncate">{c.brand} — {c.name}</span>
                <span className="font-medium text-slate-800 ml-2 flex-shrink-0">{c.price}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    )}
    {!competitorLoading && !competitors?.analysis && result && (
      <p className="text-sm text-slate-400">Rakip verisi bulunamadı.</p>
    )}
  </div>
)}
                  </ul>
                </ResultCard>
                <ResultCard label="Trendyol Etiketleri" icon="tag" fullText={result.seo?.trendyolTags?.join(", ")}>
                  <div className="flex flex-wrap gap-2">
                    {result.seo?.trendyolTags?.map((t, i) => (
                      <span key={i} className="px-3 py-1 rounded-full text-xs bg-orange-50 text-orange-700 border border-orange-200">{t}</span>
                    ))}
                  </div>
                </ResultCard>
              </div>
            )}

            {!loading && result && activeTab === "social" && (
              <div className="space-y-4">
                <div className="flex gap-2">
                  {SOCIAL.map(s => (
                    <button key={s} onClick={() => setActiveSocial(s)}
                      className={`px-4 py-1.5 rounded-full text-xs font-medium border transition-all ${activeSocial === s ? "border-orange-400 bg-orange-50 text-orange-700" : "border-slate-200 text-slate-500 hover:border-slate-300"}`}>
                      {s}
                    </button>
                  ))}
                </div>
                {result.social?.[activeSocial.toLowerCase().replace("/x","x").replace("twitter","twitter").replace("/","").split("/")[0].replace("twitter/x","twitterx")]?.map((variant, i) => (
                  <ResultCard key={i} label={`Versiyon ${i + 1}`} icon="share"
                    fullText={variant.text + (variant.hashtags ? "\n\n" + variant.hashtags.map(h => `#${h}`).join(" ") : "")}>
                    <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{variant.text}</p>
                    {variant.hashtags && (
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {variant.hashtags.map((h, j) => <span key={j} className="text-xs text-orange-500 font-medium">#{h}</span>)}
                      </div>
                    )}
                    {variant.note && <p className="mt-2 text-xs text-slate-400 italic">{variant.note}</p>}
                  </ResultCard>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
