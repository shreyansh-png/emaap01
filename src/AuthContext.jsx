import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "./supabase";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!supabase) {
      // Supabase not configured — skip session loading
      setLoading(false);
      return;
    }

    // Get current session on mount
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) setUser(session.user);
      setLoading(false);
    });

    // Listen to auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (!session) setRole(null);
    });

    return () => subscription.unsubscribe();
  }, []);

  /**
   * Sign in with email + password via Supabase,
   * then validate the role via GET /api/auth/me.
   *
   * @param {string} email
   * @param {string} password
   * @param {string} selectedTab - "lmo" | "admin" | "user"
   * @returns {{ role: string }} on success
   * @throws {Error} on auth failure or role mismatch
   */
  const signIn = async (email, password, selectedTab) => {
    if (!supabase) {
      // ── DEV MODE: Supabase not configured, bypass auth ──
      console.warn("Supabase not configured. Bypassing auth in dev mode.");
      setRole(selectedTab);
      return { role: selectedTab };
    }

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;

    // ── Call your backend to get the real role ──
    // Uncomment and adjust the URL when your API is ready:
    //
    // const res = await fetch("/api/auth/me", {
    //   headers: { Authorization: `Bearer ${data.session.access_token}` },
    // });
    // if (!res.ok) {
    //   await supabase.auth.signOut();
    //   throw new Error("Failed to fetch user role from server.");
    // }
    // const me = await res.json();          // e.g. { role: "lmo" }
    // const backendRole = me.role;
    //
    // ── TEMPORARY: treat selectedTab as the real role ──
    const backendRole = selectedTab;

    if (backendRole !== selectedTab) {
      await supabase.auth.signOut();
      throw new Error(
        `Access Denied: You selected "${selectedTab}" portal but your account has "${backendRole}" privileges.`
      );
    }

    setRole(backendRole);
    return { role: backendRole };
  };

  const signOut = async () => {
    if (supabase) await supabase.auth.signOut();
    setRole(null);
  };

  return (
    <AuthContext.Provider value={{ session, user, role, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
