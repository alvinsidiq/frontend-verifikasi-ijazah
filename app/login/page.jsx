// app/login/page.js
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { saveAuth, getAuth } from "../../lib/auth";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Kalau sudah login, langsung redirect ke dashboard sesuai role
  useEffect(() => {
    const auth = getAuth();
    if (auth?.user) {
      const role = auth.user.role;
      if (role === "ADMIN") {
        router.replace("/admin/dashboard");
      } else if (role === "VALIDATOR") {
        router.replace("/validator/dashboard");
      } else {
        router.replace("/mahasiswa/dashboard");
      }
    }
  }, [router]);

  async function handleSubmit(e) {
    e.preventDefault();
    setErrorMsg("");

    if (!email || !password) {
      setErrorMsg("Email dan password wajib diisi.");
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, password }),
        }
      );

      const json = await res.json();

      if (!res.ok || !json.success) {
        const msg =
          json?.message || "Login gagal. Periksa email dan password Anda.";
        setErrorMsg(msg);
        setIsLoading(false);
        return;
      }

      const { token, user } = json.data;

      // Simpan token & user di localStorage
      saveAuth(token, user);

      // Redirect berdasarkan role
      if (user.role === "ADMIN") {
        router.push("/admin/dashboard");
      } else if (user.role === "VALIDATOR") {
        router.push("/validator/dashboard");
      } else {
        router.push("/mahasiswa/dashboard");
      }
    } catch (err) {
      console.error("Error login:", err);
      setErrorMsg("Tidak dapat terhubung ke server. Coba lagi nanti.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="bg-blackrounded-xl shadow p-8 w-full max-w-sm">
        <h1 className="text-xl font-bold mb-2 text-black">
          Login Sistem Verifikasi Ijazah
        </h1>
        <p className="text-sm text-gray-500 mb-6">
          Masuk sebagai Admin, Validator, atau Mahasiswa.
        </p>

        {errorMsg && (
          <div className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-sm font-medium text-black">Email</label>
            <input
              type="email"
              className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring focus:ring-blue-100"
              placeholder="admin@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-black">Password</label>
            <input
              type="password"
              className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring focus:ring-blue-100"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-2 flex items-center justify-center px-4 py-2 rounded-md bg-blue-600 text-blacktext-sm font-medium hover:bg-blue-700 disabled:opacity-60"
          >
            {isLoading ? "Sedang login..." : "Login"}
          </button>
        </form>

        <p className="mt-4 text-xs text-gray-400">
          Backend API: {process.env.NEXT_PUBLIC_API_BASE_URL}
        </p>
      </div>
    </main>
  );
}
