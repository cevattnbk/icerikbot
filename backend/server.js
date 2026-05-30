import "dotenv/config";
import express from "express";
import cors from "cors";
import * as cheerio from "cheerio";

const app = express();
app.use(cors({
  origin: ["https://icerikbot.vercel.app", "http://localhost:5173"]
}));
app.use(express.json());

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

async function scrapeProduct(url) {
  const headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
    "Accept-Language": "tr-TR,tr;q=0.9,en;q=0.8",
    Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
    "Cache-Control": "no-cache",
  };
  const res = await fetch(url, { headers });
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

app.post("/api/analyze", async (req, res) => {
  const { url, platform = "trendyol", tone = "Profesyonel" } = req.body;
  if (!url) return res.status(400).json({ error: "URL gerekli" });
  try {
    console.log(`🔍 Scraping: ${url}`);
    const product = await scrapeProduct(url);
    console.log(`✅ Ürün çekildi: ${product.name}`);
    console.log(`🤖 AI içerik üretiliyor...`);
    const aiContent = await generateContent(product, platform, tone);
    console.log(`✅ İçerik üretildi`);
    res.json({ product, ...aiContent });
  } catch (err) {
    console.error("❌ Hata:", err.message);
    res.status(500).json({ error: err.message });
  }
});
app.post("/api/analyze-bulk", async (req, res) => {
  const { urls, platform = "trendyol", tone = "Profesyonel" } = req.body;
  if (!urls || !urls.length) return res.status(400).json({ error: "URL listesi gerekli" });

  const results = [];
  for (const url of urls) {
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
});
app.get("/api/health", (_, res) => res.json({ status: "ok" }));

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 İçerikBot Backend → http://localhost:${PORT}`);
  console.log(`📋 Anthropic Key: ${ANTHROPIC_API_KEY ? "✓ Hazır" : "✗ EKSİK!"}`);
});