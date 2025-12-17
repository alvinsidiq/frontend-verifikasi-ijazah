"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { getAuth, normalizeRole } from "../../lib/auth";

export default function Sidebar() {
  const pathname = usePathname();
  const [role, setRole] = useState(null);

  useEffect(() => {
    const auth = getAuth();
    setRole(normalizeRole(auth?.user?.role) || null);
  }, []);

  return (
    <aside className="w-64 bg-white border-r min-h-screen hidden md:block">
      <div className="h-14 flex items-center justify-center border-b">
        <span className="font-bold text-sm">
          Verifikasi Ijazah
        </span>
      </div>

      <nav className="p-4 space-y-4 text-sm">
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase mb-1">
            Umum
          </p>
          <NavItem href="/verifikasi" label="Verifikasi Publik" activePath={pathname} />
        </div>

        {role === "ADMIN" && (
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase mb-1">
              Admin
            </p>
            <NavItem href="/admin/dashboard" label="Dashboard" activePath={pathname} />
            {/* Nanti ditambah: /admin/program-studi, /admin/mahasiswa, /admin/ijazah */}
          </div>
        )}

        {role === "VALIDATOR" && (
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase mb-1">
              Validator
            </p>
            <NavItem href="/validator/dashboard" label="Dashboard" activePath={pathname} />
          </div>
        )}

        {role === "MAHASISWA" && (
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase mb-1">
              Mahasiswa
            </p>
            <NavItem href="/mahasiswa/dashboard" label="Dashboard" activePath={pathname} />
          </div>
        )}

        {!role && (
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase mb-1">
              Akun
            </p>
            <NavItem href="/login" label="Login" activePath={pathname} />
          </div>
        )}
      </nav>
    </aside>
  );
}

function NavItem({ href, label, activePath }) {
  const isActive = activePath === href;

  return (
    <Link
      href={href}
      className={[
        "block px-3 py-2 rounded-md",
        isActive
          ? "bg-blue-50 text-blue-700 font-medium"
          : "hover:bg-gray-100 text-gray-700",
      ].join(" ")}
    >
      {label}
    </Link>
  );
}
