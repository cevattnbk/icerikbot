
import "dotenv/config";
import express from "express";
import cors from "cors";
import * as cheerio from "cheerio";
import crypto from "crypto";
import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";
import multer from "multer";
import rateLimit from "express-rate-limit";
import * as XLSX from "xlsx";
import { parseStringPromise } from "xml2js";
import ExcelJS from "exceljs";
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

const app = express();
const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  message: { error: "Çok fazla istek gönderdiniz. Lütfen 1 dakika bekleyin." },
  standardHeaders: true,
  legacyHeaders: false,
});

const strictLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  message: { error: "Çok fazla analiz isteği. Lütfen 1 dakika bekleyin." },
  standardHeaders: true,
  legacyHeaders: false,
});

app.set("trust proxy", 1);
app.use(limiter);
app.use(cors({
  origin: ["https://icerikbot.vercel.app", "http://localhost:5173"]
}));
app.use(express.json());

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
const SHOPIER_API_KEY = process.env.SHOPIER_API_KEY;
const SHOPIER_API_SECRET = process.env.SHOPIER_API_SECRET;
async function validateApiKey(req, res, next) {
  const apiKey = req.headers["x-api-key"];
  if (!apiKey) return next();
  
  const { data } = await supabase
    .from("api_keys")
    .select("user_id, is_active")
    .eq("key", apiKey)
    .eq("is_active", true)
    .single();
  
  if (!data) return res.status(401).json({ error: "Geçersiz API key" });
  
  await supabase.from("api_keys").update({ last_used_at: new Date().toISOString() }).eq("key", apiKey);
  
  req.apiUserId = data.user_id;
  next();
}
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);
const resend = new Resend(process.env.RESEND_API_KEY);
// ============ PLAN & KREDİ SİSTEMİ ============
const PLAN_LIMITS = {
  free:      { credits: 3,    vision: 3,   features: ["banner", "karloss"] },
  baslangic: { credits: 100,  vision: 30,  features: ["banner", "karloss", "bulk"] },
  pro:       { credits: 500,  vision: 100, features: ["banner", "karloss", "bulk", "feed", "api"] },
  ajans:     { credits: 1000, vision: 300, features: ["banner", "karloss", "bulk", "feed", "api"] },
};

// Kullanıcının kredisini kontrol eder ve düşürür. Yeterli kredi yoksa hata fırlatır.
async function checkAndUseCredit(userId, type = "text") {
  if (!userId) {
    const e = new Error("Giriş yapmalısınız."); e.status = 401; throw e;
  }
  let { data: profile, error } = await supabase
    .from("profiles")
    .select("credits, vision_credits, plan, plan_expires_at")
    .eq("id", userId)
    .single();
  if (error || !profile) {
    const e = new Error("Kullanıcı bulunamadı."); e.status = 404; throw e;
  }

  // Plan süresi dolmuş mu? Dolmuşsa free'ye düşür.
  if (profile.plan && profile.plan !== "free" && profile.plan_expires_at) {
    const expired = new Date(profile.plan_expires_at) < new Date();
    if (expired) {
      console.log(`⏰ Plan süresi doldu: ${userId} (${profile.plan} → free)`);
      const freeLimits = PLAN_LIMITS.free;
      await supabase
        .from("profiles")
        .update({ plan: "free", credits: 0, vision_credits: 0, plan_expires_at: null })
        .eq("id", userId);
      profile = { ...profile, plan: "free", credits: 0, vision_credits: 0 };
    }
  }

  const column = type === "vision" ? "vision_credits" : "credits";
  const current = profile[column] ?? 0;

  if (current <= 0) {
    const e = new Error(type === "vision"
      ? "Görsel analiz hakkınız bitti. Planınızı yükseltin."
      : "Analiz hakkınız bitti. Planınızı yükseltin.");
    e.status = 403;
    throw e;
  }

  const { error: updErr } = await supabase
    .from("profiles")
    .update({ [column]: current - 1 })
    .eq("id", userId);
  if (updErr) {
    const e = new Error("Kredi güncellenemedi."); e.status = 500; throw e;
  }

  return { remaining: current - 1, plan: profile.plan || "free" };
}

// Kullanıcının planı belirtilen özelliğe erişebiliyor mu?
async function checkFeatureAccess(userId, feature) {
  if (!userId) {
    const e = new Error("Giriş yapmalısınız."); e.status = 401; throw e;
  }
  const { data: profile } = await supabase
    .from("profiles")
    .select("plan")
    .eq("id", userId)
    .single();
  const plan = profile?.plan || "free";
  const allowed = PLAN_LIMITS[plan]?.features || PLAN_LIMITS.free.features;
  if (!allowed.includes(feature)) {
    const e = new Error("Bu özellik planınızda bulunmuyor. Lütfen planınızı yükseltin.");
    e.status = 403;
    throw e;
  }
  return plan;
}
// ============================================

async function sendEmail(to, subject, html) {
  try {
    await resend.emails.send({
      from: "İçerikBot <onboarding@resend.dev>",
      to,
      subject,
      html,
    });
    console.log(`✅ Email gönderildi: ${to}`);
  } catch (err) {
    console.error(`❌ Email hatası: ${err.message}`);
  }
}
app.post("/api/send-low-credit-email", async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: "Email gerekli" });
  await sendEmail(
    email,
    "Son Analiz Hakkın! ⚡",
    `<div style="font-family: sans-serif; max-width: 500px; margin: 0 auto;">
      <h2 style="color: #f97316;">Dikkat! Son hakkın kaldı ⚡</h2>
      <p>Ücretsiz analiz hakkından <strong>sadece 1 tane</strong> kaldı.</p>
      <p>Kesintisiz devam etmek için bir plan seçebilirsin.</p>
      <a href="https://icerikbot.vercel.app" style="display: inline-block; background: #f97316; color: white; padding: 12px 24px; border-radius: 12px; text-decoration: none; margin-top: 16px;">Plan Seç →</a>
    </div>`
  );
  res.json({ success: true });
});
async function scrapeProduct(url) {
 const headers = {
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
  "Accept-Language": "tr-TR,tr;q=0.9,en;q=0.8",
  Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
  "Cache-Control": "no-cache",
  "Sec-Ch-Ua": '"Chromium";v="124", "Google Chrome";v="124", "Not-A.Brand";v="99"',
  "Sec-Ch-Ua-Mobile": "?0",
  "Sec-Ch-Ua-Platform": '"Windows"',
  "Sec-Fetch-Dest": "document",
  "Sec-Fetch-Mode": "navigate",
  "Sec-Fetch-Site": "none",
  "Sec-Fetch-User": "?1",
  "Upgrade-Insecure-Requests": "1",
  "Referer": "https://www.google.com/",
};
  const SCRAPER_API_KEY = process.env.SCRAPER_API_KEY;
const scraperUrl = `http://api.scraperapi.com?api_key=${SCRAPER_API_KEY}&url=${encodeURIComponent(url)}&country_code=tr`;
const res = await fetch(scraperUrl);
  if (!res.ok) throw new Error(`HTTP ${res.status}: Sayfa yüklenemedi`);
  const html = await res.text();
  const $ = cheerio.load(html);
  const hostname = new URL(url).hostname;
  let product = {};
  if (hostname.includes("trendyol")) product = scrapeTrendyol($, html);
  else if (hostname.includes("hepsiburada")) product = scrapeHepsiburada($, html);
  else if (hostname.includes("amazon")) product = scrapeAmazon($);
  else product = scrapeGeneric($, html);
  if (!product.name) product = scrapeGeneric($, html);
  return { ...product, url };
}

function scrapeTrendyol($, html) {
  let name = "", price = "", brand = "", image = "", description = "", features = [];
  $('script[type="application/ld+json"]').each((_, el) => {
    try {
      const data = JSON.parse($(el).html());
      const product = Array.isArray(data) ? data.find(d => d["@type"] === "Product") : data["@type"] === "Product" ? data : null;
      if (product) {
        name = name || product.name;
        brand = brand || product.brand?.name;
        image = image || (Array.isArray(product.image) ? product.image[0] : product.image);
        description = description || product.description;
        if (product.offers) price = price || product.offers.price + " " + (product.offers.priceCurrency || "TL");
      }
    } catch {}
  });
  const stateMatch = html.match(/__PRODUCT_DETAIL_APP_INITIAL_STATE__\s*=\s*(\{.+?\});/s);
  if (stateMatch) {
    try {
      const state = JSON.parse(stateMatch[1]);
      const p = state?.product || state?.productDetail?.product;
      if (p) {
        name = name || p.name;
        brand = brand || p.brand?.name;
        image = image || p.images?.[0];
        price = price || (p.price?.discountedPrice ?? p.price?.originalPrice) + " TL";
        description = description || p.description;
        features = p.attributes?.map(a => `${a.key}: ${a.value}`) || [];
      }
    } catch {}
  }
  name = name || $('h1[class*="product-name"], h1').first().text().trim();
  brand = brand || $('[class*="brand-name"]').first().text().trim();
  price = price || $('[class*="prc-dsc"]').first().text().trim();
  image = image || $('img[class*="base-product-image"]').first().attr("src");
  if (!features.length) {
    $("table.detail-attr-table tr, .product-feature-list li").each((_, el) => {
      const text = $(el).text().replace(/\s+/g, " ").trim();
      if (text) features.push(text);
    });
  }
  return { name, brand, price, image, description, features };
}

function scrapeHepsiburada($, html) {
  let name = "", price = "", brand = "", image = "", description = "", features = [];
  $('script[type="application/ld+json"]').each((_, el) => {
    try {
      const data = JSON.parse($(el).html());
      if (data["@type"] === "Product") {
        name = data.name || name;
        brand = data.brand?.name || brand;
        image = (Array.isArray(data.image) ? data.image[0] : data.image) || image;
        description = data.description || description;
        price = data.offers?.price ? data.offers.price + " TL" : price;
      }
    } catch {}
  });
  name = name || $('h1[data-test-id="title"]').first().text().trim();
  price = price || $('[data-test-id="price-current-price"]').first().text().trim();
  image = image || $('[data-test-id="image-container"] img').first().attr("src");
  $(".technical-specifications tr").each((_, el) => {
    const text = $(el).text().replace(/\s+/g, " ").trim();
    if (text) features.push(text);
  });
  return { name, brand, price, image, description, features };
}

function scrapeAmazon($) {
  const name = $("#productTitle").text().trim();
  const brand = $("#bylineInfo").text().replace("Marka:", "").trim();
  const price = $(".a-price-whole").first().text().trim() + " TL";
  const image = $("#landingImage").attr("src");
  const features = [];
  $("#feature-bullets ul li span:not(.aok-hidden)").each((_, el) => {
    const t = $(el).text().trim();
    if (t) features.push(t);
  });
  const description = $("#productDescription p").text().trim();
  return { name, brand, price, image, description, features };
}

function scrapeGeneric($, html) {
  let name = "", price = "", brand = "", image = "", description = "", features = [];
  name = $('meta[property="og:title"]').attr("content") || "";
  description = $('meta[property="og:description"]').attr("content") || "";
  image = $('meta[property="og:image"]').attr("content") || "";
  $('script[type="application/ld+json"]').each((_, el) => {
    try {
      const data = JSON.parse($(el).html());
      const p = Array.isArray(data) ? data.find(d => d["@type"] === "Product") : data["@type"] === "Product" ? data : null;
      if (p) {
        name = name || p.name;
        description = description || p.description;
        image = image || (Array.isArray(p.image) ? p.image[0] : p.image);
        brand = brand || p.brand?.name;
        price = price || (p.offers?.price + " " + (p.offers?.priceCurrency || "TL"));
      }
    } catch {}
  });
  name = name || $("h1").first().text().trim();
  price = price || $('[class*="price"]').first().text().trim();
  return { name, brand, price, image, description, features };
}

async function analyzeImage(base64Image, mediaType, platform, tone) {
  const platformNotes = {
    trendyol: "Trendyol ürün sayfası. Marka adı başa konulur, teknik özellikler sıralanır.",
    shopify: "Shopify mağazası. Hikaye anlatımı önemli.",
    hepsiburada: "Hepsiburada ürün sayfası. Sade ve teknik odaklı açıklama.",
    amazon: "Amazon TR. Bullet point özellikler 5 madde.",
  };

  const prompt = `Sen deneyimli bir Türk e-ticaret içerik uzmanısın. Verilen ürün fotoğrafına bakarak profesyonel içerikler üret.

Platform: ${platform} — ${platformNotes[platform] || ""}
İstenen Ton: ${tone}

Fotoğraftaki ürünü dikkatlice incele: ne olduğunu, rengini, malzemesini, tahmini özelliklerini belirle.

Sadece JSON döndür, başka hiçbir şey yazma, markdown kullanma:
{
  "description": {
    "platform": "300-500 kelimelik ürün açıklaması",
    "short": "50-80 kelimelik kısa özet",
    "bullets": ["Özellik 1", "Özellik 2", "Özellik 3", "Özellik 4", "Özellik 5", "Özellik 6"]
  },
  "seo": {
    "title": "SEO title maks 60 karakter",
    "meta": "155 karakter meta açıklama",
    "keywords": ["kelime1", "kelime2", "kelime3", "kelime4", "kelime5", "kelime6"],
    "longtail": ["uzun kuyruk 1", "uzun kuyruk 2", "uzun kuyruk 3", "uzun kuyruk 4"],
    "trendyolTags": ["etiket1", "etiket2", "etiket3", "etiket4", "etiket5"]
  },
  "social": {
    "instagram": [
      { "text": "Instagram post", "hashtags": ["tag1","tag2","tag3","tag4","tag5"], "note": "En iyi saat: 19:00-21:00" },
      { "text": "Alternatif Instagram post", "hashtags": ["tag1","tag2","tag3"], "note": "Story için uygun" }
    ],
    "twitterx": [
      { "text": "280 karakter tweet", "hashtags": ["tag1","tag2"] },
      { "text": "Alternatif tweet", "hashtags": ["tag1","tag2"] }
    ],
    "facebook": [
      { "text": "Facebook post", "hashtags": ["tag1","tag2","tag3"], "note": "Link ekle" }
    ],
    "linkedin": [
      { "text": "LinkedIn post", "hashtags": ["tag1","tag2"], "note": "Mesai saatinde paylaş" }
    ]
  },
  "detectedProduct": { "name": "Tespit edilen ürün adı", "brand": "Tespit edilen marka (varsa)", "estimatedPrice": "Tahmini fiyat aralığı (varsa belirtme)" }
}`;

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-6",
      max_tokens: 4000,
      messages: [{
        role: "user",
        content: [
          { type: "image", source: { type: "base64", media_type: mediaType, data: base64Image } },
          { type: "text", text: prompt }
        ]
      }],
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Anthropic Vision API hatasi: ${err}`);
  }

  const data = await response.json();
  const raw = data.content?.[0]?.text || "";
  const jsonStr = raw.replace(/^```json\s*/i, "").replace(/\s*```\s*$/i, "").trim();
  return JSON.parse(jsonStr);
}
async function generateContent(product, platform, tone) {
  const platformNotes = {
    trendyol: "Trendyol ürün sayfası. Marka adı başa konulur, teknik özellikler sıralanır.",
    shopify: "Shopify mağazası. Hikaye anlatımı önemli.",
    hepsiburada: "Hepsiburada ürün sayfası. Sade ve teknik odaklı açıklama.",
    amazon: "Amazon TR. Bullet point özellikler 5 madde.",
  };

  const prompt = `Sen deneyimli bir Türk e-ticaret içerik uzmanısın. Verilen ürün bilgilerinden profesyonel içerikler üret.

ÜRÜN BİLGİLERİ:
- Ad: ${product.name || "Belirtilmemiş"}
- Marka: ${product.brand || "Belirtilmemiş"}
- Fiyat: ${product.price || "Belirtilmemiş"}
- Açıklama: ${product.description || "Yok"}
- Özellikler: ${product.features?.slice(0, 15).join(" | ") || "Yok"}
- Platform: ${platform} — ${platformNotes[platform] || ""}
- İstenen Ton: ${tone}

Sadece JSON döndür, başka hiçbir şey yazma, markdown kullanma:
{
  "description": {
    "platform": "300-500 kelimelik ürün açıklaması",
    "short": "50-80 kelimelik kısa özet",
    "bullets": ["Özellik 1", "Özellik 2", "Özellik 3", "Özellik 4", "Özellik 5", "Özellik 6"]
  },
  "seo": {
    "title": "SEO title maks 60 karakter",
    "meta": "155 karakter meta açıklama",
    "keywords": ["kelime1", "kelime2", "kelime3", "kelime4", "kelime5", "kelime6"],
    "longtail": ["uzun kuyruk 1", "uzun kuyruk 2", "uzun kuyruk 3", "uzun kuyruk 4"],
    "trendyolTags": ["etiket1", "etiket2", "etiket3", "etiket4", "etiket5"]
  },
  "social": {
    "instagram": [
      { "text": "Instagram post", "hashtags": ["tag1","tag2","tag3","tag4","tag5"], "note": "En iyi saat: 19:00-21:00" },
      { "text": "Alternatif Instagram post", "hashtags": ["tag1","tag2","tag3"], "note": "Story için uygun" }
    ],
    "twitterx": [
      { "text": "280 karakter tweet", "hashtags": ["tag1","tag2"] },
      { "text": "Alternatif tweet", "hashtags": ["tag1","tag2"] }
    ],
    "facebook": [
      { "text": "Facebook post", "hashtags": ["tag1","tag2","tag3"], "note": "Link ekle" }
    ],
    "linkedin": [
      { "text": "LinkedIn post", "hashtags": ["tag1","tag2"], "note": "Mesai saatinde paylaş" }
    ]
  }
}`;

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 4000,
      messages: [{ role: "user", content: prompt }],
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Anthropic API hatasi: ${err}`);
  }

  const data = await response.json();
  const raw = data.content?.[0]?.text || "";
  const jsonStr = raw.replace(/^```json\s*/i, "").replace(/\s*```\s*$/i, "").trim();
  return JSON.parse(jsonStr);
}

app.get("/api/kar-sablon", async (req, res) => {
  try {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Ürünler");

    worksheet.columns = [
      { header: "Ürün Adı", key: "urun", width: 30 },
      { header: "Alış Fiyatı", key: "alis", width: 15 },
      { header: "Satış Fiyatı", key: "satis", width: 15 },
      { header: "Komisyon (%)", key: "komisyon", width: 15 },
      { header: "Kargo (₺)", key: "kargo", width: 12 },
      { header: "KDV (%)", key: "kdv", width: 10 },
    ];

    const headerRow = worksheet.getRow(1);
    headerRow.eachCell(cell => {
      cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF0F172A" } };
      cell.font = { bold: true, color: { argb: "FFFFFFFF" }, size: 11 };
      cell.alignment = { horizontal: "center", vertical: "middle" };
      cell.border = {
        top: { style: "thin", color: { argb: "FF334155" } },
        bottom: { style: "thin", color: { argb: "FF334155" } },
        left: { style: "thin", color: { argb: "FF334155" } },
        right: { style: "thin", color: { argb: "FF334155" } },
      };
    });
    headerRow.height = 30;

    const samples = [
      { urun: "Örnek Ürün 1", alis: 100, satis: 200, komisyon: 15, kargo: 30, kdv: 20 },
      { urun: "Örnek Ürün 2", alis: 50, satis: 120, komisyon: "", kargo: "", kdv: "" },
      { urun: "Örnek Ürün 3", alis: 350, satis: 560, komisyon: 12, kargo: 25, kdv: 10 },
    ];

    samples.forEach((s, idx) => {
      const row = worksheet.addRow(s);
      row.height = 22;
      const bgColor = idx % 2 === 0 ? "FFF8FAFC" : "FFFFFFFF";
      row.eachCell(cell => {
        cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: bgColor } };
        cell.alignment = { vertical: "middle", horizontal: "center" };
        cell.border = {
          top: { style: "thin", color: { argb: "FFE2E8F0" } },
          bottom: { style: "thin", color: { argb: "FFE2E8F0" } },
          left: { style: "thin", color: { argb: "FFE2E8F0" } },
          right: { style: "thin", color: { argb: "FFE2E8F0" } },
        };
      });
    });

    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.setHeader("Content-Disposition", 'attachment; filename="icerikbot_sablon.xlsx"');
    await workbook.xlsx.write(res);
    res.end();
  } catch (err) {
    console.error("❌ Şablon hatası:", err.message);
    res.status(500).json({ error: err.message });
  }
});
app.get("/api/feed-sablon", async (req, res) => {
  try {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Ürünler");

    worksheet.columns = [
      { header: "Ürün Adı", key: "urun", width: 35 },
      { header: "Marka", key: "marka", width: 20 },
      { header: "Kategori", key: "kategori", width: 20 },
      { header: "Açıklama", key: "aciklama", width: 40 },
      { header: "Fiyat", key: "fiyat", width: 15 },
    ];

    const headerRow = worksheet.getRow(1);
    headerRow.eachCell(cell => {
      cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF0F172A" } };
      cell.font = { bold: true, color: { argb: "FFFFFFFF" }, size: 11 };
      cell.alignment = { horizontal: "center", vertical: "middle" };
      cell.border = {
        top: { style: "thin", color: { argb: "FF334155" } },
        bottom: { style: "thin", color: { argb: "FF334155" } },
        left: { style: "thin", color: { argb: "FF334155" } },
        right: { style: "thin", color: { argb: "FF334155" } },
      };
    });
    headerRow.height = 30;

    const samples = [
      { urun: "Pamuklu Erkek Tişört", marka: "Örnek Marka", kategori: "Giyim", aciklama: "Mevcut açıklama (varsa)", fiyat: "299 TL" },
      { urun: "Kablosuz Kulaklık", marka: "", kategori: "Elektronik", aciklama: "", fiyat: "899 TL" },
      { urun: "Seramik Kupa 350ml", marka: "", kategori: "Ev & Yaşam", aciklama: "", fiyat: "" },
    ];

    samples.forEach((s, idx) => {
      const row = worksheet.addRow(s);
      row.height = 22;
      const bgColor = idx % 2 === 0 ? "FFF8FAFC" : "FFFFFFFF";
      row.eachCell(cell => {
        cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: bgColor } };
        cell.alignment = { vertical: "middle" };
        cell.border = {
          top: { style: "thin", color: { argb: "FFE2E8F0" } },
          bottom: { style: "thin", color: { argb: "FFE2E8F0" } },
          left: { style: "thin", color: { argb: "FFE2E8F0" } },
          right: { style: "thin", color: { argb: "FFE2E8F0" } },
        };
      });
    });

    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.setHeader("Content-Disposition", 'attachment; filename="icerikbot_feed_sablon.xlsx"');
    await workbook.xlsx.write(res);
    res.end();
  } catch (err) {
    console.error("❌ Feed şablon hatası:", err.message);
    res.status(500).json({ error: err.message });
  }
});
app.post("/api/karloss-excel", upload.single("file"), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: "Dosya gerekli" });
  const { komisyon: defKomisyon = "15", kargo: defKargo = "30", kdv: defKdv = "20", ekstra: defEkstra = "0" } = req.body;

  try {
    const XLSX2 = await import("xlsx");
    const buffer = req.file.buffer;
    const wb = XLSX2.read(buffer, { type: "buffer" });
    const sheet = wb.Sheets[wb.SheetNames[0]];
    const rows = XLSX2.utils.sheet_to_json(sheet);

    const results = rows.map(row => {
      const alisF = parseFloat(row["Alış Fiyatı"] || row["alis"] || 0);
      const satisF = parseFloat(row["Satış Fiyatı"] || row["satis"] || 0);
      const komis = parseFloat(row["Komisyon (%)"] || row["komisyon"] || defKomisyon || 0);
      const kargo = parseFloat(row["Kargo (₺)"] || row["kargo"] || defKargo || 0);
      const kdv = parseFloat(row["KDV (%)"] || row["kdv"] || defKdv || 0);
      const ekstra = parseFloat(defEkstra || 0);
      const komisyonTutari = satisF * (komis / 100);
      const kdvTutari = satisF * (kdv / 100);
      const toplamMasraf = alisF + komisyonTutari + kdvTutari + kargo + ekstra;
      const netKar = satisF - toplamMasraf;
      const karMarji = satisF > 0 ? ((netKar / satisF) * 100).toFixed(1) : "0";
      return {
        urunAdi: row["Ürün Adı"] || row["urun"] || "",
        alisFiyati: alisF,
        satisFiyati: satisF,
        komisyonTutari: parseFloat(komisyonTutari.toFixed(2)),
        kdvTutari: parseFloat(kdvTutari.toFixed(2)),
        kargo,
        ekstra,
        toplamMasraf: parseFloat(toplamMasraf.toFixed(2)),
        netKar: parseFloat(netKar.toFixed(2)),
        karMarji: parseFloat(karMarji),
        durum: netKar >= 0 ? "KÂR" : "ZARAR",
      };
    });

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Kar-Zarar Analizi");

    // Başlıklar
    worksheet.columns = [
      { header: "Ürün Adı", key: "urunAdi", width: 30 },
      { header: "Alış Fiyatı (₺)", key: "alisFiyati", width: 16 },
      { header: "Satış Fiyatı (₺)", key: "satisFiyati", width: 16 },
      { header: "Komisyon Tutarı (₺)", key: "komisyonTutari", width: 20 },
      { header: "KDV Tutarı (₺)", key: "kdvTutari", width: 16 },
      { header: "Kargo (₺)", key: "kargo", width: 12 },
      { header: "Ekstra Masraf (₺)", key: "ekstra", width: 18 },
      { header: "Toplam Masraf (₺)", key: "toplamMasraf", width: 18 },
      { header: "Net Kar/Zarar (₺)", key: "netKar", width: 18 },
      { header: "Kar Marjı (%)", key: "karMarji", width: 14 },
      { header: "Durum", key: "durum", width: 12 },
    ];

    // Başlık satırı stilini ayarla
    const headerRow = worksheet.getRow(1);
    headerRow.eachCell(cell => {
      cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF0F172A" } };
      cell.font = { bold: true, color: { argb: "FFFFFFFF" }, size: 11 };
      cell.alignment = { horizontal: "center", vertical: "middle" };
      cell.border = {
        top: { style: "thin", color: { argb: "FF334155" } },
        bottom: { style: "thin", color: { argb: "FF334155" } },
        left: { style: "thin", color: { argb: "FF334155" } },
        right: { style: "thin", color: { argb: "FF334155" } },
      };
    });
    headerRow.height = 30;

    // Verileri ekle
    results.forEach((result, idx) => {
      const row = worksheet.addRow(result);
      row.height = 22;

      // Zebra renklendirme
      const bgColor = idx % 2 === 0 ? "FFF8FAFC" : "FFFFFFFF";
      row.eachCell(cell => {
        cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: bgColor } };
        cell.alignment = { vertical: "middle" };
        cell.border = {
          top: { style: "thin", color: { argb: "FFE2E8F0" } },
          bottom: { style: "thin", color: { argb: "FFE2E8F0" } },
          left: { style: "thin", color: { argb: "FFE2E8F0" } },
          right: { style: "thin", color: { argb: "FFE2E8F0" } },
        };
      });

      // Durum hücresi renklendirme
      const durumCell = row.getCell("durum");
      if (result.durum === "KÂR") {
        durumCell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFD1FAE5" } };
        durumCell.font = { bold: true, color: { argb: "FF065F46" } };
      } else {
        durumCell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFFEE2E2" } };
        durumCell.font = { bold: true, color: { argb: "FF991B1B" } };
      }
      durumCell.alignment = { horizontal: "center", vertical: "middle" };

      // Net kar hücresi renklendirme
      const netKarCell = row.getCell("netKar");
      if (result.netKar >= 0) {
        netKarCell.font = { bold: true, color: { argb: "FF065F46" } };
      } else {
        netKarCell.font = { bold: true, color: { argb: "FF991B1B" } };
      }
    });


    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.setHeader("Content-Disposition", `attachment; filename="kar_zarar_${Date.now()}.xlsx"`);
    await workbook.xlsx.write(res);
    res.end();

  } catch (err) {
    console.error("❌ Kar/zarar Excel hatası:", err.message);
    res.status(500).json({ error: err.message });
  }
});
app.post("/api/analyze-feed", upload.single("feed"), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: "Dosya gerekli" });
  const { platform = "trendyol", tone = "Profesyonel", userId } = req.body;

  try {
    const effectiveUserId = req.apiUserId || userId;
    // XML/Excel özelliği sadece pro/ajans planlarında
    await checkFeatureAccess(effectiveUserId, "feed");

    let products = [];
    const fileContent = req.file.buffer.toString("utf-8");
    const ext = req.file.originalname.split(".").pop().toLowerCase();

    if (ext === "xml") {
      const parsed = await parseStringPromise(fileContent, { explicitArray: false });
      const items = parsed?.products?.product || parsed?.feed?.entry || parsed?.rss?.channel?.item || [];
      const itemArray = Array.isArray(items) ? items : [items];
      products = itemArray.slice(0, 50).map(item => ({
        name: item.title || item.name || item["g:title"] || "Ürün",
        description: item.description || item["g:description"] || "",
        price: item.price || item["g:price"] || "",
        brand: item.brand || item["g:brand"] || "",
        category: item.category || item["g:product_type"] || "",
      }));
    } else if (ext === "xlsx" || ext === "xls") {
      const workbook = XLSX.read(req.file.buffer, { type: "buffer" });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json(sheet);
      products = rows.slice(0, 50).map(row => ({
        name: row["Ürün Adı"] || row["title"] || row["name"] || Object.values(row)[0] || "Ürün",
        description: row["Açıklama"] || row["description"] || "",
        price: row["Fiyat"] || row["price"] || "",
        brand: row["Marka"] || row["brand"] || "",
        category: row["Kategori"] || row["category"] || "",
      }));
    } else if (ext === "csv") {
      const rows = fileContent.split("\n");
      const headers = rows[0].split(",").map(h => h.trim().replace(/"/g, ""));
      products = rows.slice(1, 51).filter(r => r.trim()).map(row => {
        const values = row.split(",").map(v => v.trim().replace(/"/g, ""));
        const obj = {};
        headers.forEach((h, i) => obj[h] = values[i] || "");
        return {
          name: obj["Ürün Adı"] || obj["title"] || obj["name"] || values[0] || "Ürün",
          description: obj["Açıklama"] || obj["description"] || "",
          price: obj["Fiyat"] || obj["price"] || "",
          brand: obj["Marka"] || obj["brand"] || "",
          category: obj["Kategori"] || obj["category"] || "",
        };
      });
    }

    if (!products.length) return res.status(400).json({ error: "Dosyada ürün bulunamadı" });

    console.log(`📦 ${products.length} ürün işleniyor...`);
    const results = [];

    for (const product of products) {
      try {
        // Her ürün için 1 kredi düşür; biterse döngüyü durdur
        try {
          await checkAndUseCredit(effectiveUserId, "text");
        } catch (creditErr) {
          results.push({
            "Orijinal Ürün Adı": product.name,
            "SEO Başlık": "KREDİ BİTTİ",
            "Platform Açıklaması": "Kredi yetersiz - bu ürün işlenmedi",
            "Meta Title": "", "Meta Açıklama": "", "Anahtar Kelimeler": "", "Instagram Post": "",
          });
          continue;
        }
        const prompt = `Sen deneyimli bir Türk e-ticaret içerik uzmanısın. Aşağıdaki ürün için ${platform} platformuna uygun içerik üret.

Ürün Adı: ${product.name}
Marka: ${product.brand || "Belirtilmemiş"}
Kategori: ${product.category || "Belirtilmemiş"}
Mevcut Açıklama: ${product.description || "Yok"}
Fiyat: ${product.price || "Belirtilmemiş"}
İstenen Ton: ${tone}

Sadece JSON döndür:
{
  "title": "SEO uyumlu ürün başlığı (max 100 karakter)",
  "description": "300-400 kelimelik platform açıklaması",
  "metaTitle": "SEO title (max 60 karakter)",
  "metaDescription": "Meta açıklama (max 155 karakter)",
  "keywords": ["kelime1", "kelime2", "kelime3", "kelime4", "kelime5"],
  "instagram": "Instagram post metni ve hashtagler"
}`;

        const response = await fetch("https://api.anthropic.com/v1/messages", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-api-key": ANTHROPIC_API_KEY,
            "anthropic-version": "2023-06-01",
          },
          body: JSON.stringify({
            model: "claude-haiku-4-5-20251001",
            max_tokens: 1500,
            messages: [{ role: "user", content: prompt }],
          }),
        });

        const data = await response.json();
        const raw = data.content?.[0]?.text || "{}";
        const clean = raw.replace(/^```json\s*/i, "").replace(/\s*```\s*$/i, "").trim();
        const content = JSON.parse(clean);

        results.push({
          "Orijinal Ürün Adı": product.name,
          "SEO Başlık": content.title || "",
          "Platform Açıklaması": content.description || "",
          "Meta Title": content.metaTitle || "",
          "Meta Açıklama": content.metaDescription || "",
          "Anahtar Kelimeler": (content.keywords || []).join(", "),
          "Instagram Post": content.instagram || "",
        });
      } catch (e) {
        results.push({
          "Orijinal Ürün Adı": product.name,
          "SEO Başlık": "HATA",
          "Platform Açıklaması": e.message,
          "Meta Title": "",
          "Meta Açıklama": "",
          "Anahtar Kelimeler": "",
          "Instagram Post": "",
        });
      }
    }

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(results);
    XLSX.utils.book_append_sheet(wb, ws, "İçerikler");
    const buffer = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });

    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.setHeader("Content-Disposition", `attachment; filename="icerikbot_${Date.now()}.xlsx"`);
    res.send(buffer);

  } catch (err) {
    console.error("❌ Feed analiz hatası:", err.message);
    res.status(500).json({ error: err.message });
  }
});
app.post("/api/analyze-image", strictLimiter, upload.single("image"), async (req, res) => {
  const { platform = "trendyol", tone = "Profesyonel", userId } = req.body;
  if (!req.file) return res.status(400).json({ error: "Görsel gerekli" });
  try {
    const effectiveUserId = req.apiUserId || userId;
    const { remaining } = await checkAndUseCredit(effectiveUserId, "vision");

    const base64Image = req.file.buffer.toString("base64");
    const mediaType = req.file.mimetype;
    console.log(`📷 Görsel analiz ediliyor: ${req.file.originalname}`);
    const aiContent = await analyzeImage(base64Image, mediaType, platform, tone);
    console.log(`✅ Görsel içeriği üretildi (kalan vision: ${remaining})`);
    res.json({
      product: {
        name: aiContent.detectedProduct?.name || "Tespit edilemedi",
        brand: aiContent.detectedProduct?.brand || "",
        price: aiContent.detectedProduct?.estimatedPrice || "",
        image: `data:${mediaType};base64,${base64Image}`,
      },
      description: aiContent.description,
      seo: aiContent.seo,
      social: aiContent.social,
      remainingVisionCredits: remaining,
    });
  } catch (err) {
    console.error("❌ Görsel analiz hatası:", err.message);
    res.status(err.status || 500).json({ error: err.message });
  }
});
app.post("/api/analyze", strictLimiter, async (req, res) => {
  const { url, platform = "trendyol", tone = "Profesyonel", userId } = req.body;
  if (!url) return res.status(400).json({ error: "URL gerekli" });
  try {
    // API key ile geldiyse userId'yi oradan al, yoksa body'den
    const effectiveUserId = req.apiUserId || userId;
    const { remaining } = await checkAndUseCredit(effectiveUserId, "text");

    console.log(`🔍 Scraping: ${url}`);
    const product = await scrapeProduct(url);
    console.log(`✅ Ürün çekildi: ${product.name}`);
    console.log(`🤖 AI içerik üretiliyor...`);
    const aiContent = await generateContent(product, platform, tone);
    console.log(`✅ İçerik üretildi (kalan kredi: ${remaining})`);
    res.json({ product, ...aiContent, remainingCredits: remaining });
  } catch (err) {
    console.error("❌ Hata:", err.message);
    res.status(err.status || 500).json({ error: err.message });
  }
});
app.post("/api/analyze-bulk", strictLimiter, async (req, res) => {
  const { urls, platform = "trendyol", tone = "Profesyonel", userId } = req.body;
  if (!urls || !urls.length) return res.status(400).json({ error: "URL listesi gerekli" });

  try {
    const effectiveUserId = req.apiUserId || userId;
    // Toplu analiz özelliği kontrolü
    await checkFeatureAccess(effectiveUserId, "bulk");

    const results = [];
    for (const url of urls) {
      try {
        // Her ürün için 1 kredi düşür; kredi biterse döngüyü durdur
        await checkAndUseCredit(effectiveUserId, "text");
      } catch (creditErr) {
        results.push({ url, product: null, error: "Kredi bitti - kalan ürünler işlenmedi" });
        break;
      }
      try {
        console.log(`🔍 Scraping: ${url}`);
        const product = await scrapeProduct(url);
        console.log(`🤖 AI içerik üretiliyor: ${product.name}`);
        const aiContent = await generateContent(product, platform, tone);
        results.push({ url, product, ...aiContent, error: null });
      } catch (err) {
        console.error(`❌ Hata (${url}):`, err.message);
        results.push({ url, product: null, error: err.message });
      }
    }

    res.json({ results });
  } catch (err) {
    console.error("❌ Bulk hatası:", err.message);
    res.status(err.status || 500).json({ error: err.message });
  }
});
async function scrapeCompetitors(productName, platform) {
  return [];
}

app.post("/api/competitors", async (req, res) => {
  const { productName, platform = "trendyol" } = req.body;
  if (!productName) return res.status(400).json({ error: "Ürün adı gerekli" });
  try {
    const competitors = await scrapeCompetitors(productName, platform);
    // competitors boş olsa bile Claude analizi yap
   const prompt = `Sen bir Türk e-ticaret uzmanısın. Aşağıdaki ürün için kategori bilgisine dayanarak rakip analizi yap.

ÜRÜN: ${productName}
PLATFORM: ${platform}

Bu ürün kategorisinde Trendyol'daki rakipler genellikle nasıl bir strateji izler? Gerçekçi ve uygulanabilir analiz yap.

Sadece JSON döndür, başka hiçbir şey yazma:
{
  "commonKeywords": ["bu kategoride sık kullanılan kelime1", "kelime2", "kelime3", "kelime4", "kelime5"],
  "missingKeywords": ["ürün adında muhtemelen eksik olan kelime1", "kelime2", "kelime3"],
  "pricePosition": "Bu kategoride fiyatlandırma stratejisi hakkında 1 cümle",
  "titleSuggestion": "Bu ürün için optimize edilmiş örnek başlık",
  "insight": "Bu kategoride başarılı satıcıların yaptığı en önemli 2-3 şey"
}`;

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 1000,
        messages: [{ role: "user", content: prompt }],
      }),
    });
    const data = await response.json();
    const raw = data.content?.[0]?.text || "";
    const jsonStr = raw.replace(/^```json\s*/i, "").replace(/\s*```\s*$/i, "").trim();
    const analysis = JSON.parse(jsonStr);
    res.json({ competitors, analysis });
  } catch (err) {
    console.error("Rakip analizi hatası:", err.message);
    res.status(500).json({ error: err.message });
  }
});
const PLANS = {
  baslangic: { name: "Başlangıç Paketi", price: "349.00" },
  pro: { name: "Pro Paket", price: "699.00" },
  ajans: { name: "Ajans Paketi", price: "1499.00" },
};

app.post("/api/create-payment", (req, res) => {
  const { plan, userId, email } = req.body;
  const planInfo = PLANS[plan];
  if (!planInfo) return res.status(400).json({ error: "Geçersiz plan" });

  const orderId = `${userId}_${plan}_${Date.now()}`;
  const randomNr = Math.floor(Math.random() * 1000000);

  // Shopier imza algoritması
  const dataToSign = randomNr + orderId + planInfo.price + "TRY";
  const signature = crypto
    .createHmac("sha256", SHOPIER_API_SECRET)
    .update(dataToSign)
    .digest("base64");

  const formData = {
    API_key: SHOPIER_API_KEY,
    website_index: "1",
    platform_order_id: orderId,
    product_name: planInfo.name,
    product_type: "1", // dijital ürün
    buyer_name: "Kullanıcı",
    buyer_surname: "İçerikBot",
    buyer_email: email,
    buyer_account_age: "0",
    buyer_id_nr: userId,
    buyer_phone: "5555555555",
    billing_address: "Türkiye",
    billing_city: "İstanbul",
    billing_country: "Turkey",
    billing_postcode: "34000",
    shipping_address: "Türkiye",
    shipping_city: "İstanbul",
    shipping_country: "Turkey",
    shipping_postcode: "34000",
    total_order_value: planInfo.price,
    currency: "0", // 0 = TRY
    platform: "0",
    is_in_frame: "0",
    current_language: "1", // 1 = TR
    modul_version: "1.0.4",
    random_nr: randomNr,
    signature: signature,
  };

  res.json({ formData, paymentUrl: "https://www.shopier.com/ShowProduct/api_pay4.php" });
});

app.post("/api/shopier-callback", express.urlencoded({ extended: true }), async (req, res) => {
  const body = req.body;
  const { platform_order_id, status, signature, random_nr } = body;

  // İmza doğrulama
  const dataToSign = random_nr + platform_order_id;
  const expectedSignature = crypto
    .createHmac("sha256", SHOPIER_API_SECRET)
    .update(dataToSign)
    .digest("base64");

  if (signature !== expectedSignature) {
    console.error("❌ Shopier callback: geçersiz imza");
    return res.status(400).send("Invalid signature");
  }

  if (status === "success") {
    try {
      const [userId, plan] = platform_order_id.split("_");
      const planLimits = { baslangic: { c: 100, v: 30 }, pro: { c: 500, v: 100 }, ajans: { c: 1000, v: 300 } };
      const limits = planLimits[plan] || { c: 0, v: 0 };
      const credits = limits.c;
      const visionCredits = limits.v;

      // Plan 30 gün geçerli
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 30);

      console.log(`✅ Ödeme başarılı: user=${userId}, plan=${plan}, credits=${credits}, vision=${visionCredits}`);

      const { error } = await supabase
  .from("profiles")
  .update({ credits, vision_credits: visionCredits, plan, plan_expires_at: expiresAt.toISOString() })
  .eq("id", userId);

if (error) {
  console.error("❌ Supabase güncelleme hatası:", error.message);
} else {
  console.log(`✅ Kullanıcı güncellendi: ${userId} → ${plan} (${credits} kredi)`);
}
const planNames = { baslangic: "Başlangıç", pro: "Pro", ajans: "Ajans" };
const { data: userProfile } = await supabase.from("profiles").select("email").eq("id", userId).single();
if (userProfile?.email) {
  await sendEmail(
    userProfile.email,
    "Ödemen Alındı! 🎉",
    `<div style="font-family: sans-serif; max-width: 500px; margin: 0 auto;">
      <h2 style="color: #f97316;">Teşekkürler! 🎉</h2>
      <p><strong>${planNames[plan] || plan}</strong> paketin aktif edildi.</p>
      <p>Hesabına <strong>${credits} analiz hakkı</strong> tanımlandı.</p>
      <a href="https://icerikbot.vercel.app" style="display: inline-block; background: #f97316; color: white; padding: 12px 24px; border-radius: 12px; text-decoration: none; margin-top: 16px;">Hemen Kullan →</a>
    </div>`
  );
}
    } catch (err) {
      console.error("❌ Callback işleme hatası:", err.message);
    }
  }

  res.status(200).send("");
});
app.get("/api/health", (_, res) => res.json({ status: "ok" }));

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 İçerikBot Backend → http://localhost:${PORT}`);
  console.log("✅ karloss-excel endpoint aktif");
  console.log(`📋 Anthropic Key: ${ANTHROPIC_API_KEY ? "✓ Hazır" : "✗ EKSİK!"}`);
});