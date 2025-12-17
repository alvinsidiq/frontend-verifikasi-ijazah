"use client";

import AppLayout from "../../../components/layout/AppLayout";
import RequireRole from "../../../components/auth/RequireRole";

export default function ValidatorDashboardPage() {
  return (
    <RequireRole allowedRoles={["VALIDATOR"]}>
      <AppLayout>
        <h2 className="text-xl font-semibold mb-2">Dashboard Validator</h2>
        <p className="text-sm text-gray-600 mb-4">
          Di sini nanti ada daftar ijazah yang menunggu validasi.
        </p>
        <ul className="text-sm text-gray-600 list-disc ml-5">
          <li>Jumlah ijazah menunggu validasi</li>
          <li>Riwayat validasi terakhir</li>
        </ul>
      </AppLayout>
    </RequireRole>
  );
}
