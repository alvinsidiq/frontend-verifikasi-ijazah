"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AppLayout from "../../../components/layout/AppLayout";
import RequireRole from "../../../components/auth/RequireRole";
import { apiGet } from "../../../lib/api";
import { clearAuth, getAuth, normalizeRole } from "../../../lib/auth";

export default function AdminDashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  const [summary, setSummary] = useState({
    programStudiCount: 0,
    mahasiswaCount: 0,
    ijazahTervalidasiCount: 0,
    ijazahMenungguCount: 0,
  });

  useEffect(() => {
    async function fetchSummary() {
      const auth = getAuth();
      const role = normalizeRole(auth?.user?.role);

      if (!auth?.user || role !== "ADMIN") {
        // Jika role tidak sesuai, biarkan RequireRole yang mengarahkan
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setErrorMsg("");

        const [prodiRes, mhsRes, ijazahTervalidasiRes, ijazahMenungguRes] =
          await Promise.all([
            apiGet("/program-studi"),
            apiGet("/mahasiswa"),
            apiGet("/ijazah?status=TERVALIDASI"),
            apiGet("/ijazah?status=MENUNGGU"),
          ]);

        setSummary({
          programStudiCount: prodiRes.data.length,
          mahasiswaCount: mhsRes.data.length,
          ijazahTervalidasiCount: ijazahTervalidasiRes.data.length,
          ijazahMenungguCount: ijazahMenungguRes.data.length,
        });
      } catch (err) {
        console.error("Error load admin summary:", err);
        if (err.status === 401 || err.status === 403) {
          setErrorMsg(
            "Akses ditolak. Silakan login sebagai Admin untuk melihat dashboard ini."
          );
          clearAuth();
          router.replace("/login");
        } else {
          setErrorMsg(err.message || "Gagal memuat ringkasan.");
        }
      } finally {
        setLoading(false);
      }
    }

    fetchSummary();
  }, []);

  return (
    <RequireRole allowedRoles={["ADMIN"]}>
      <AppLayout>
        <h2 className="text-xl font-semibold mb-2">Dashboard Admin</h2>
        <p className="text-sm text-gray-600 mb-4">
          Ringkasan data program studi, mahasiswa, dan ijazah.
        </p>

        {loading && (
          <div className="text-sm text-gray-500 mb-4">
            Memuat data...
          </div>
        )}

        {errorMsg && (
          <div className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">
            {errorMsg}
          </div>
        )}

        {!loading && !errorMsg && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <StatCard
              title="Program Studi"
              value={summary.programStudiCount}
            />
            <StatCard
              title="Mahasiswa"
              value={summary.mahasiswaCount}
            />
            <StatCard
              title="Ijazah Terverifikasi"
              value={summary.ijazahTervalidasiCount}
            />
            <StatCard
              title="Ijazah Menunggu Validasi"
              value={summary.ijazahMenungguCount}
            />
          </div>
        )}
      </AppLayout>
    </RequireRole>
  );
}

function StatCard({ title, value }) {
  return (
    <div className="bg-white rounded-lg shadow p-4">
      <p className="text-xs text-gray-500 uppercase">
        {title}
      </p>
      <p className="text-2xl font-semibold mt-1">
        {value}
      </p>
    </div>
  );
}
