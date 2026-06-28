import { useState } from "react";
import { supabase } from "./supabase";

export default function Auth({ onAuth }) {
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError(""); setSuccess("");
    try {
      if (mode === "login") {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        onAuth(data.user);
      } else {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        fetch("https://icerikbot-production.up.railway.app/api/send-welcome-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        }).then(r => r.json()).then(d => console.log("Email sonucu:", d)).catch(e => console.error("Email hatası:", e));
        setSuccess("Kayıt başarılı! Email adresine doğrulama linki gönderildi.");
      }
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0b121f] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex items-center gap-2 justify-center mb-8">
          <div className="w-9 h-9 rounded-lg bg-cyan-500 flex items-center justify-center text-[#0b121f] font-black">İ</div>
          <span className="font-bold text-xl text-white">İçerik<span className="text-cyan-400">Bot</span></span>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-8">
          <h2 className="text-xl font-bold text-white mb-1">
            {mode === "login" ? "Giriş Yap" : "Hesap Oluştur"}
          </h2>
          <p className="text-slate-400 text-sm mb-6">
            {mode === "login" ? "Hesabın yok mu? " : "Zaten hesabın var mı? "}
            <button onClick={() => { setMode(mode === "login" ? "register" : "login"); setError(""); setSuccess(""); }}
              className="text-cyan-400 hover:text-cyan-300 font-medium transition-colors">
              {mode === "login" ? "Kayıt ol" : "Giriş yap"}
            </button>
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">E-posta</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
                placeholder="ornek@email.com"
                className="w-full px-4 py-2.5 rounded-lg border border-slate-700 bg-slate-800 text-white text-sm placeholder:text-slate-600 focus:outline-none focus:border-cyan-500 transition-all" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Şifre</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} required
                placeholder="••••••••"
                className="w-full px-4 py-2.5 rounded-lg border border-slate-700 bg-slate-800 text-white text-sm placeholder:text-slate-600 focus:outline-none focus:border-cyan-500 transition-all" />
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
                ⚠ {error}
              </div>
            )}
            {success && (
              <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs">
                ✓ {success}
              </div>
            )}

            <button type="submit" disabled={loading}
              className="w-full py-3 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-[#0b121f] font-bold text-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-[0_0_15px_rgba(6,182,212,0.2)]">
              {loading ? "Lütfen bekleyin..." : mode === "login" ? "Giriş Yap" : "Kayıt Ol"}
            </button>
          </form>

          {mode === "register" && (
            <p className="text-xs text-slate-500 text-center mt-4">
              Kayıt olarak <span className="text-slate-400">Kullanım Koşulları</span>'nı kabul etmiş sayılırsınız.
            </p>
          )}
        </div>

        <p className="text-center text-slate-600 text-xs mt-6">
          © 2026 İçerikBot — Güvenli giriş
        </p>
      </div>
    </div>
  );
}