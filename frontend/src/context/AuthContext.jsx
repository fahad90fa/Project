import { createContext, useContext, useEffect, useState } from "react";
import api from "../api/axios";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("netguard-token");
    const cachedUser = localStorage.getItem("netguard-user");
    if (token && cachedUser) {
      setUser(JSON.parse(cachedUser));
    }
    setLoading(false);
  }, []);

  const persist = (token, userData) => {
    localStorage.setItem("netguard-token", token);
    localStorage.setItem("netguard-user", JSON.stringify(userData));
    setUser(userData);
  };

  const login = async (email, password) => {
    const { data } = await api.post("/auth/login", { email, password });
    persist(data.token, data.user);
    return data.user;
  };

  const register = async (payload) => {
    const { data } = await api.post("/auth/register", payload);
    persist(data.token, data.user);
    return data.user;
  };

  const logout = () => {
    localStorage.removeItem("netguard-token");
    localStorage.removeItem("netguard-user");
    setUser(null);
  };

  // Updates the cached user (e.g. after a profile edit) without requiring
  // a fresh login, so a saved change is reflected immediately in the UI.
  const refreshUser = (partialUser) => {
    setUser((prev) => {
      const next = { ...prev, ...partialUser };
      localStorage.setItem("netguard-user", JSON.stringify(next));
      return next;
    });
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
