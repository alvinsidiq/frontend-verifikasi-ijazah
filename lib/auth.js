// lib/auth.js

// Key yang dipakai di localStorage
const TOKEN_KEY = "auth_token";
const USER_KEY = "auth_user";

export function saveAuth(token, user) {
  if (typeof window === "undefined") return;

  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function getAuth() {
  if (typeof window === "undefined") return null;

  const token = localStorage.getItem(TOKEN_KEY);
  const userRaw = localStorage.getItem(USER_KEY);

  if (!token || !userRaw) return null;

  try {
    const user = JSON.parse(userRaw);
    return { token, user };
  } catch {
    return null;
  }
}

export function clearAuth() {
  if (typeof window === "undefined") return;

  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

// Normalisasi role untuk konsistensi (hapus prefix ROLE_ dan uppercase)
export function normalizeRole(role) {
  if (!role || typeof role !== "string") return null;
  const upper = role.toUpperCase();
  return upper.startsWith("ROLE_") ? upper.slice(5) : upper;
}
