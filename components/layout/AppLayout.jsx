"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "./Sidebar";
import { getAuth, clearAuth, normalizeRole } from "../../lib/auth";

export default function AppLayout({ children }) {
  const router = useRouter();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const auth = getAuth();
    if (auth?.user) {
      setUser(auth.user);
    }
  }, []);

  function handleLogout() {
    clearAuth();
    router.replace("/login");
  }

  return (
    <div className="min-h-screen flex bg-gray-100">
      {/* Sidebar */}
      <Sidebar />

      {/* Main content */}
      <div className="flex-1 flex flex-col">
        {/* Topbar */}
        <header className="h-14 border-b bg-white flex items-center justify-between px-4">
          <h1 className="font-semibold text-lg">
            Sistem Verifikasi Ijazah
          </h1>

          <div className="flex items-center gap-3">
            {user && (
              <div className="text-right">
                <div className="text-sm font-medium">
                  {user.name}
                </div>
                <div className="text-xs text-gray-500">
                  {normalizeRole(user.role) || user.role}
                </div>
              </div>
            )}

            <button
              onClick={handleLogout}
              className="text-xs px-3 py-1 rounded-md border text-gray-700 hover:bg-gray-50"
            >
              Logout
            </button>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-4">{children}</main>
      </div>
    </div>
  );
}
