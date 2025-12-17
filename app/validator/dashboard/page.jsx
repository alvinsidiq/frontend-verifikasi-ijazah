"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AppLayout from "../../../components/layout/AppLayout";
import RequireRole from "../../../components/auth/RequireRole";
import { apiGet } from "../../../lib/api";
import { clearAuth, getAuth, normalizeRole } from "../../../lib/auth";

export default function ValidatorDashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [ijazahMenunggu, setIjazahMenunggu] = useState([]);

  useEffect(() => {
    async function fetchIjazah() {
      const auth = getAuth();
      const role = normalizeRole(auth?.user?.role);

      if (!auth?.user || role !== "VALIDATOR") {
        // Jika role tidak sesuai, biarkan RequireRole yang mengarahkan
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setErrorMsg("");
        const res = await apiGet("/ijazah?status=MENUNGGU");
        setIjazahMenunggu(res.data || []);
      } catch (err) {
        console.error("Error load ijazah menunggu:", err);
        if (err.status === 401 || err.status === 403) {
          setErrorMsg(
            "Akses ditolak. Silakan login sebagai Validator untuk melihat dashboard ini."
          );
          clearAuth();
          router.replace("/login");
        } else {
          setErrorMsg(
            err.message ||
              "Gagal memuat ijazah yang menunggu validasi."
          );
        }
      } finally {
        setLoading(false);
      }
    }

    fetchIjazah();
  }, []);

  return (
    <RequireRole allowedRoles={["VALIDATOR"]}>
      <AppLayout>
        <h2 className="text-xl font-semibold mb-2">Dashboard Validator</h2>
        <p className="text-sm text-gray-600 mb-4">
          Daftar ijazah yang menunggu proses validasi.
        </p>

        {loading && (
          <div className="text-sm text-gray-500 mb-4">
            Memuat data ijazah...
          </div>
        )}

        {errorMsg && (
          <div className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">
            {errorMsg}
          </div>
        )}

        {!loading && !errorMsg && (
          <>
            <p className="text-sm text-gray-700 mb-2">
              Total menunggu:{" "}
              <span className="font-semibold">
                {ijazahMenunggu.length}
              </span>
            </p>

            {ijazahMenunggu.length === 0 ? (
              <p className="text-sm text-gray-500">
                Tidak ada ijazah yang menunggu validasi.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm bg-white rounded-lg shadow">
                  <thead>
                    <tr className="border-b bg-gray-50">
                      <th className="text-left px-3 py-2">Nomor Ijazah</th>
                      <th className="text-left px-3 py-2">Mahasiswa</th>
                      <th className="text-left px-3 py-2">Prodi</th>
                      <th className="text-left px-3 py-2">Tanggal Lulus</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ijazahMenunggu.slice(0, 10).map((ijz) => (
                      <tr key={ijz.id} className="border-t">
                        <td className="px-3 py-2">
                          {ijz.nomorIjazah}
                        </td>
                        <td className="px-3 py-2">
                          {ijz.mahasiswa?.nama} (
                          {ijz.mahasiswa?.nim})
                        </td>
                        <td className="px-3 py-2">
                          {ijz.mahasiswa?.prodi?.namaProdi}
                        </td>
                        <td className="px-3 py-2">
                          {formatDate(ijz.tanggalLulus)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </AppLayout>
    </RequireRole>
  );
}

function formatDate(dateStr) {
  if (!dateStr) return "-";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString("id-ID");
}
