"use client";

import AppLayout from "../../../components/layout/AppLayout";
import RequireRole from "../../../components/auth/RequireRole";

export default function MahasiswaDashboardPage() {
  return (
    <RequireRole allowedRoles={["MAHASISWA"]}>
      <AppLayout>
        <h2 className="text-xl font-semibold mb-2">Dashboard Mahasiswa</h2>
        <p className="text-sm text-gray-600 mb-4">
          Di sini nanti tampil profil mahasiswa dan daftar ijazah miliknya.
        </p>
        <p className="text-sm text-gray-500">
          Sesi berikutnya kita akan ambil data dari endpoint <code>/mahasiswa/me</code>{" "}
          dan <code>/ijazah/me</code>.
        </p>
      </AppLayout>
    </RequireRole>
  );
}
