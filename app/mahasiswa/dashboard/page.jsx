"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AppLayout from "../../../components/layout/AppLayout";
import RequireRole from "../../../components/auth/RequireRole";
import { apiGet } from "../../../lib/api";
import { clearAuth, getAuth, normalizeRole } from "../../../lib/auth";

export default function MahasiswaDashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  const [profil, setProfil] = useState(null);
  const [ijazahList, setIjazahList] = useState([]);

  useEffect(() => {
    async function fetchData() {
      const auth = getAuth();
      const role = normalizeRole(auth?.user?.role);

      if (!auth?.user || role !== "MAHASISWA") {
        // Jika role tidak sesuai, biarkan RequireRole yang mengarahkan
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setErrorMsg("");

        const [mhsRes, ijzRes] = await Promise.all([
          apiGet("/mahasiswa/me"),
          apiGet("/ijazah/me"),
        ]);

        // asumsi backend /mahasiswa/me mengembalikan 1 object
        setProfil(mhsRes.data);
        setIjazahList(ijzRes.data || []);
      } catch (err) {
        console.error("Error load data mahasiswa:", err);
        if (err.status === 401 || err.status === 403) {
          setErrorMsg(
            "Akses ditolak. Silakan login sebagai Mahasiswa untuk melihat dashboard ini."
          );
          clearAuth();
          router.replace("/login");
        } else {
          setErrorMsg(
            err.message || "Gagal memuat data mahasiswa dan ijazah."
          );
        }
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  return (
    <RequireRole allowedRoles={["MAHASISWA"]}>
      <AppLayout>
        <h2 className="text-xl font-semibold mb-2">
          Dashboard Mahasiswa
        </h2>

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
          <div className="space-y-6">
            {/* Profil Mahasiswa */}
            <section className="bg-white rounded-lg shadow p-4">
              <h3 className="font-semibold mb-3 text-sm">
                Profil Mahasiswa
              </h3>
              {profil ? (
                <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2 text-sm">
                  <InfoItem label="Nama" value={profil.nama} />
                  <InfoItem label="NIM" value={profil.nim} />
                  <InfoItem
                    label="Program Studi"
                    value={profil.prodi?.namaProdi}
                  />
                  <InfoItem
                    label="Jenjang"
                    value={profil.prodi?.jenjang}
                  />
                  <InfoItem
                    label="Tahun Masuk"
                    value={profil.tahunMasuk}
                  />
                  <InfoItem
                    label="Tahun Lulus"
                    value={profil.tahunLulus || "-"}
                  />
                </dl>
              ) : (
                <p className="text-sm text-gray-500">
                  Data mahasiswa belum tersedia.
                </p>
              )}
            </section>

            {/* Ijazah Mahasiswa */}
            <section className="bg-white rounded-lg shadow p-4">
              <h3 className="font-semibold mb-3 text-sm">
                Ijazah Saya
              </h3>

              {ijazahList.length === 0 ? (
                <p className="text-sm text-gray-500">
                  Belum ada ijazah yang terdaftar.
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead>
                      <tr className="border-b bg-gray-50">
                        <th className="text-left px-3 py-2">
                          Nomor Ijazah
                        </th>
                        <th className="text-left px-3 py-2">
                          Tanggal Lulus
                        </th>
                        <th className="text-left px-3 py-2">
                          Status Validasi
                        </th>
                        <th className="text-left px-3 py-2">
                          Catatan
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {ijazahList.map((ijz) => (
                        <tr key={ijz.id} className="border-t">
                          <td className="px-3 py-2">
                            {ijz.nomorIjazah}
                          </td>
                          <td className="px-3 py-2">
                            {formatDate(ijz.tanggalLulus)}
                          </td>
                          <td className="px-3 py-2">
                            {ijz.statusValidasi}
                          </td>
                          <td className="px-3 py-2 text-xs text-gray-600">
                            {ijz.catatanValidasi || "-"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          </div>
        )}
      </AppLayout>
    </RequireRole>
  );
}

function InfoItem({ label, value }) {
  return (
    <>
      <dt className="text-gray-500">{label}</dt>
      <dd className="font-medium text-gray-800">
        {value ?? "-"}
      </dd>
    </>
  );
}

function formatDate(dateStr) {
  if (!dateStr) return "-";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString("id-ID");
}
