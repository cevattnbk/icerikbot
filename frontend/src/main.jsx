import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import Landing from "./Landing.jsx";
import Auth from "./Auth.jsx";
import { supabase } from "./supabase.js";
import Admin from "./Admin.jsx";
import "./index.css";

function Root() {
  const [started, setStarted] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
const [showAdmin, setShowAdmin] = useState(false);

useEffect(() => {
  if (user) {
    supabase
      .from("profiles")
      .select("is_admin")
      .eq("id", user.id)
      .single()
      .then(({ data }) => {
        if (data?.is_admin) setIsAdmin(true);
      });
  }
}, [user]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  if (loading) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!user && !started) return <Landing onStart={() => setStarted(true)} />;
if (!user) return <Auth onAuth={setUser} />;
if (showAdmin) return <Admin user={user} onBack={() => setShowAdmin(false)} />;
return <App user={user} onBack={() => setStarted(false)} onAdmin={isAdmin ? () => setShowAdmin(true) : null} />;
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>
);