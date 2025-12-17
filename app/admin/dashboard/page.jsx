"use client";

import AppLayout from "../../../components/layout/AppLayout";
import RequireRole from "../../../components/auth/RequireRole";

export default function AdminDashboardPage() {
  return (
    <RequireRole allowedRoles={["ADMIN"]}>
      <AppLayout>
        <h2 className="text-xl font-semibold mb-2">Dashboard Admin</h2>
        <p className="text-sm text-gray-600 mb-4">
          Di sini nanti akan ada ringkasan jumlah program studi, mahasiswa, dan ijazah.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <DummyCard title="Program Studi" value="-" />
          <DummyCard title="Mahasiswa" value="-" />
          <DummyCard title="Ijazah Terverifikasi" value="-" />
        </div>
      </AppLayout>
    </RequireRole>
  );
}

function DummyCard({ title, value }) {
  return (
    <div className="bg-white rounded-lg shadow p-4">
      <p className="text-xs text-gray-500 uppercase">{title}</p>
      <p className="text-2xl font-semibold mt-1">{value}</p>
    </div>
  );
}
