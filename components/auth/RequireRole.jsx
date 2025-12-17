"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { getAuth } from "../../lib/auth";

export default function RequireRole({ allowedRoles, children }) {
  const router = useRouter();
  const pathname = usePathname();

  const [isChecking, setIsChecking] = useState(true);
  const [isAllowed, setIsAllowed] = useState(false);

  useEffect(() => {
    const auth = getAuth();

    // Belum login → paksa ke /login
    if (!auth || !auth.user) {
      router.replace("/login");
      return;
    }

    const role = auth.user.role;

    // Kalau allowedRoles tidak diisi, berarti cukup login saja
    if (!allowedRoles || allowedRoles.length === 0) {
      setIsAllowed(true);
      setIsChecking(false);
      return;
    }

    // Kalau role tidak ada di allowedRoles → redirect ke dashboard sesuai role
    if (!allowedRoles.includes(role)) {
      redirectToRoleDashboard(role, router);
      return;
    }

    setIsAllowed(true);
    setIsChecking(false);
  }, [router, pathname, allowedRoles]);

  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white rounded-xl shadow px-6 py-4 text-sm text-gray-600">
          Mengecek akses...
        </div>
      </div>
    );
  }

  if (!isAllowed) {
    // Secara teori sudah di-redirect, tapi untuk jaga-jaga
    return null;
  }

  return <>{children}</>;
}

function redirectToRoleDashboard(role, router) {
  if (role === "ADMIN") {
    router.replace("/admin/dashboard");
  } else if (role === "VALIDATOR") {
    router.replace("/validator/dashboard");
  } else {
    router.replace("/mahasiswa/dashboard");
  }
}
