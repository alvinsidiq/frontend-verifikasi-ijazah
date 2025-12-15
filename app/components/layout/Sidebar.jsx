// components/layout/Sidebar.jsx
"use client";

import Link from "next/link";

export default function Sidebar() {
  // Untuk sesi 0, menu masih statis (belum baca role)
  return (
    <aside className="w-64 bg-white border-r min-h-screen hidden md:block">
      <div className="h-14 flex items-center justify-center border-b">
        <span className="font-bold text-sm">
          Verifikasi Ijazah
        </span>
      </div>

      <nav className="p-4 space-y-2">
        <p className="text-xs font-semibold text-black uppercase">
          Umum
        </p>
        <NavItem href="/login" label="Login" />
        <NavItem href="/verifikasi" label="Verifikasi Publik" />

        <p className="text-xs font-semibold text-black uppercase mt-4">
          Contoh Dashboard
        </p>
        <NavItem href="/admin/dashboard" label="Admin Dashboard" />
        <NavItem href="/validator/dashboard" label="Validator Dashboard" />
        <NavItem href="/mahasiswa/dashboard" label="Mahasiswa Dashboard" />
      </nav>
    </aside>
  );
}

function NavItem({ href, label }) {
  return (
    <Link
      href={href}
      className="block px-3 py-2 rounded-md text-sm hover:bg-gray-100"
    >
      {label}
    </Link>
  );
}
