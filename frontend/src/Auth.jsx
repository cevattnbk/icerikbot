import { useState } from "react";
import { supabase } from "./supabase";

export default function Auth({ onAuth }) {
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handle = async () => {
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      if (mode === "login") {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        onAuth(data.user);
      } else {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        setSuccess("Kayıt başarılı! Email adresine doğrulama linki gönderildi.");
      }
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
      <div className="w-full max-w-sm bg-white rounded-2xl border border-slate-100 p-8">
        <div className="flex items-center gap-2 mb-8">
          <div className="w-8 h-8 rounded-xl bg-orange-500 flex items-center justify-center text-white font-bold text-sm">İ</div>
          <span className="font-bold text-slate-900 text-lg">İçerik<span className="text-orange-500">Bot</span></span>
        </div>

        <h2 className="text-xl font-bold text-slate-900 mb-1">
          {mode === "login" ? "Giriş Yap" : "Hesap Oluştur"}
        </h2>
        <p className="text-sm text-slate-400 mb-6">
          {mode === "login" ? "Hesabın yok mu?" : "Zaten hesabın var mı?"}
          <button onClick={() => { setMode(mode === "login" ? "register" : "login"); setError(""); setSuccess(""); }}
            className="text-orange-500 font-medium ml-1 hover:underline">
            {mode === "login" ? "Kayıt ol" : "Giriş yap"}
          </button>
        </p>

        <div className="space-y-3">
          <input type="email" value={email} onChange={e => setEmail(e.target.value)}
            placeholder="Email"
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400/40 focus:border-orange-400" />
          <input type="password" value={password} onChange={e => setPassword(e.target.value)}
            placeholder="Şifre"
            onKeyDown={e => e.key === "Enter" && handle()}
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400/40 focus:border-orange-400" />
        </div>

        {error && <p className="text-xs text-red-500 mt-3">{error}</p>}
        {success && <p className="text-xs text-emerald-500 mt-3">{success}</p>}

        <button onClick={handle} disabled={loading || !email || !password}
          className="w-full mt-4 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-semibold text-sm disabled:opacity-40 transition-all">
          {loading ? "Yükleniyor..." : mode === "login" ? "Giriş Yap" : "Kayıt Ol"}
        </button>

        {mode === "register" && (
          <p className="text-xs text-slate-400 mt-4 text-center">
            Kayıt olarak 3 ücretsiz analiz hakkı kazanırsın.
          </p>
        )}
      </div>
    </div>
  );
}