import { useState, useEffect } from "react";
import { supabase } from "./supabase";

export default function Admin({ user, onBack }) {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

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
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const updateCredits = async (userId, credits) => {
    await supabase.from("profiles").update({ credits }).eq("id", userId);
    loadData();
  };

  if (loading) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center gap-3">
        <button onClick={onBack} className="text-slate-400 hover:text-slate-600 mr-2">← Geri</button>
        <div className="w-8 h-8 rounded-xl bg-orange-500 flex items-center justify-center text-white font-bold text-sm">A</div>
        <span className="font-bold text-slate-900">Admin Paneli</span>
        <button onClick={loadData} className="ml-auto text-xs text-slate-400 hover:text-orange-500">↻ Yenile</button>
      </header>

      <div className="max-w-5xl mx-auto px-6 py-8 space-y-6">
        {/* İstatistikler */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Toplam Kullanıcı", value: stats?.total, color: "bg-blue-50 text-blue-700" },
            { label: "Bugün Kayıt", value: stats?.today, color: "bg-green-50 text-green-700" },
            { label: "Bu Hafta", value: stats?.thisWeek, color: "bg-orange-50 text-orange-700" },
            { label: "Ücretli Plan", value: (stats?.baslangic || 0) + (stats?.pro || 0) + (stats?.ajans || 0), color: "bg-purple-50 text-purple-700" },
          ].map((s, i) => (
            <div key={i} className={`rounded-2xl p-5 ${s.color} border border-opacity-20`}>
              <p className="text-2xl font-bold">{s.value ?? 0}</p>
              <p className="text-xs font-medium mt-1 opacity-70">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Plan dağılımı */}
        <div className="bg-white rounded-2xl border border-slate-100 p-5">
          <h2 className="text-sm font-bold text-slate-700 mb-4">Plan Dağılımı</h2>
          <div className="grid grid-cols-4 gap-3">
            {[
              { label: "Ücretsiz", value: stats?.free, color: "bg-slate-100 text-slate-600" },
              { label: "Başlangıç", value: stats?.baslangic, color: "bg-orange-100 text-orange-700" },
              { label: "Pro", value: stats?.pro, color: "bg-blue-100 text-blue-700" },
              { label: "Ajans", value: stats?.ajans, color: "bg-purple-100 text-purple-700" },
            ].map((p, i) => (
              <div key={i} className={`rounded-xl p-3 text-center ${p.color}`}>
                <p className="text-xl font-bold">{p.value ?? 0}</p>
                <p className="text-xs font-medium mt-1">{p.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Kullanıcı listesi */}
        <div className="bg-white rounded-2xl border border-slate-100 p-5">
          <h2 className="text-sm font-bold text-slate-700 mb-4">Son Kullanıcılar</h2>
          <div className="space-y-2">
            {users.map((u, i) => (
              <div key={i} className="flex items-center gap-3 py-2 border-b border-slate-50 last:border-0">
                <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 text-xs font-bold flex-shrink-0">
                  {u.email?.[0]?.toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-slate-700 truncate">{u.email}</p>
                  <p className="text-xs text-slate-400">{new Date(u.created_at).toLocaleDateString("tr-TR")}</p>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${u.plan === "free" ? "bg-slate-100 text-slate-500" : "bg-orange-100 text-orange-600"}`}>
                  {u.plan}
                </span>
                <div className="flex items-center gap-1">
                  <span className="text-xs text-slate-500">{u.credits} kredi</span>
                  <button onClick={() => updateCredits(u.id, u.credits + 100)}
                    className="text-xs px-2 py-0.5 rounded-lg bg-green-50 text-green-600 hover:bg-green-100">
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