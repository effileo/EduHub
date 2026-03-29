"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";

export type UserRole = "student" | "lecturer" | null;

interface User {
  id: string;
  name: string;
  role: UserRole;
  avatar: string;
}

interface AuthContextType {
  user: User | null;
  login: (role: UserRole) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  const login = (role: UserRole) => {
    setUser({
      id: role === "lecturer" ? "L-001" : "S-001",
      name: role === "lecturer" ? "Dr. Alan Turing" : "Alex Student",
      role,
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=" + role,
    });
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
