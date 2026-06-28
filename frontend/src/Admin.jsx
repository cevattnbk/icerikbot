import { useState, useEffect } from "react";
import { supabase } from "./supabase";

export default function Admin({ user, onBack }) {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const { data: profiles } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });

      if (profiles) {
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
        setStats({
          total: profiles.length,
          today: profiles.filter(p => new Date(p.created_at) >= today).length,
          thisWeek: profiles.filter(p => new Date(p.created_at) >= weekAgo).length,
          free: profiles.filter(p => p.plan === "free").length,
          baslangic: profiles.filter(p => p.plan === "baslangic").length,
          pro: profiles.filter(p => p.plan === "pro").length,
          ajans: profiles.filter(p => p.plan === "ajans").length,
        });
        setUsers(profiles.slice(0, 20));
      }
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const updateCredits = async (userId, credits) => {
    await supabase.from("profiles").update({ credits }).eq("id", userId);
    loadData();
  };

  if (loading) return (
    <div className="min-h-screen bg-[#0b121f] flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0b121f] text-white">
      <header className="border-b border-slate-800 bg-[#0b121f]/90 backdrop-blur-md px-6 py-4 flex items-center gap-3 sticky top-0 z-10">
        <button onClick={onBack} className="text-slate-500 hover:text-white text-sm transition-colors mr-2">← Geri Dön</button>
        <div className="w-8 h-8 rounded-lg bg-cyan-500 flex items-center justify-center text-[#0b121f] font-black text-sm">A</div>
        <span className="font-bold text-white">Admin Paneli</span>
        <button onClick={loadData} className="ml-auto text-xs text-slate-500 hover:text-cyan-400 transition-colors">↻ Yenile</button>
      </header>

      <div className="max-w-5xl mx-auto px-6 py-8 space-y-6">
        {/* İstatistikler */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Toplam Kullanıcı", value: stats?.total, color: "border-blue-500/20 bg-blue-500/5 text-blue-400" },
            { label: "Bugün Kayıt", value: stats?.today, color: "border-emerald-500/20 bg-emerald-500/5 text-emerald-400" },
            { label: "Bu Hafta", value: stats?.thisWeek, color: "border-cyan-500/20 bg-cyan-500/5 text-cyan-400" },
            { label: "Ücretli Plan", value: (stats?.baslangic || 0) + (stats?.pro || 0) + (stats?.ajans || 0), color: "border-purple-500/20 bg-purple-500/5 text-purple-400" },
          ].map((s, i) => (
            <div key={i} className={`rounded-2xl p-5 border ${s.color}`}>
              <p className="text-2xl font-bold">{s.value ?? 0}</p>
              <p className="text-xs font-medium mt-1 opacity-70 text-slate-400">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Plan dağılımı */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5">
          <h2 className="text-sm font-bold text-white mb-4">Plan Dağılımı</h2>
          <div className="grid grid-cols-4 gap-3">
            {[
              { label: "Ücretsiz", value: stats?.free, color: "border-slate-700 bg-slate-800 text-slate-300" },
              { label: "Başlangıç", value: stats?.baslangic, color: "border-orange-500/20 bg-orange-500/10 text-orange-400" },
              { label: "Pro", value: stats?.pro, color: "border-cyan-500/20 bg-cyan-500/10 text-cyan-400" },
              { label: "Ajans", value: stats?.ajans, color: "border-purple-500/20 bg-purple-500/10 text-purple-400" },
            ].map((p, i) => (
              <div key={i} className={`rounded-xl p-3 text-center border ${p.color}`}>
                <p className="text-xl font-bold">{p.value ?? 0}</p>
                <p className="text-xs font-medium mt-1 opacity-70">{p.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Kullanıcı listesi */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5">
          <h2 className="text-sm font-bold text-white mb-4">Son Kullanıcılar</h2>
          <div className="space-y-2">
            {users.map((u, i) => (
              <div key={i} className="flex items-center gap-3 py-3 border-b border-slate-800 last:border-0">
                <div className="w-8 h-8 rounded-full bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 text-xs font-bold flex-shrink-0">
                  {u.email?.[0]?.toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white truncate">{u.email}</p>
                  <p className="text-xs text-slate-500">{new Date(u.created_at).toLocaleDateString("tr-TR")}</p>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium border ${u.plan === "free" ? "border-slate-700 bg-slate-800 text-slate-400" : "border-cyan-500/30 bg-cyan-500/10 text-cyan-400"}`}>
                  {u.plan}
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400">{u.credits} kredi</span>
                  <button onClick={() => updateCredits(u.id, u.credits + 100)}
                    className="text-xs px-2 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20 transition-all">
                    +100
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}