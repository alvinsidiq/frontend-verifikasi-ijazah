// components/layout/AppLayout.jsx
"use client";

import Sidebar from "./Sidebar";

export default function AppLayout({ children }) {
  return (
    <div className="min-h-screen flex bg-gray-100 text-black">
      {/* Sidebar */}
      <Sidebar />

      {/* Main content */}
      <div className="flex-1 flex flex-col">
        {/* Topbar sederhana */}
        <header className="h-14 border-b bg-white flex items-center px-4">
          <h1 className="font-semibold text-lg">
            Sistem Verifikasi Ijazah
          </h1>
        </header>

        {/* Content */}
        <main className="flex-1 p-4">{children}</main>
      </div>
    </div>
  );
}
