"use client";

import { useEffect, useState } from "react";
import AppLayout from "../../../components/layout/AppLayout";
import RequireRole from "../../../components/auth/RequireRole";
import { apiGet, apiPost } from "../../../lib/api";

function formatDate(dateStr) {
  if (!dateStr) return "-";
  try {
    return new Date(dateStr).toISOString().slice(0, 10);
  } catch {
    return dateStr;
  }
}

function StatusBadge({ status }) {
  if (!status) return null;
  const s = status.toUpperCase();
  const base = "inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium";

  if (s === "TERVALIDASI") {
    return <span className={`${base} bg-green-100 text-green-700`}>{s}</span>;
  }
  if (s === "DITOLAK_VALIDATOR" || s === "DITOLAK_ADMIN" || s === "DITOLAK" || s === "DIBATALKAN") {
    return <span className={`${base} bg-red-100 text-red-700`}>{s}</span>;
  }
  if (s === "APPROVED_ADMIN" || s === "PENDING" || s === "MENUNGGU_VALIDASI" || s === "DRAFT") {
    return <span className={`${base} bg-yellow-100 text-yellow-700`}>{s}</span>;
  }
  return <span className={`${base} bg-gray-100 text-gray-700`}>{s}</span>;
}

export default function ValidatorDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [validator, setValidator] = useState(null);
  const [pendingIjazah, setPendingIjazah] = useState([]);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);
      setErrorMsg("");
      setSuccessMsg("");

      const [valRes, ijzRes] = await Promise.all([apiGet("/validator/me"), apiGet("/ijazah/validasi/pending")]);

      setValidator(valRes.data || null);
      setPendingIjazah(ijzRes.data || []);
    } catch (err) {
      console.error("Gagal load dashboard validator:", err);
      setErrorMsg(err.message || "Gagal memuat data dashboard validator.");
    } finally {
      setLoading(false);
    }
  }

  async function handleUpdateStatus(ijazahId, action) {
    // action: "APPROVE" | "REJECT"
    const label = action === "APPROVE" ? "menerima" : "menolak";

    const ok = window.confirm(`Anda yakin ingin ${label} ijazah ini?`);
    if (!ok) return;

    const catatan = window.prompt("Masukkan catatan (opsional, bisa dikosongkan):", "") || "";

    try {
      setErrorMsg("");
      setSuccessMsg("");

      const endpoint =
        action === "APPROVE"
          ? `/ijazah/${ijazahId}/validasi/validator-approve`
          : `/ijazah/${ijazahId}/validasi/validator-reject`;

      await apiPost(endpoint, { catatan });

      setSuccessMsg(`Ijazah berhasil di-${label}.`);
      await loadData();
    } catch (err) {
      console.error("Gagal update status validasi:", err);
      setErrorMsg(err.message || "Gagal mengubah status validasi ijazah.");
    }
  }

  return (
    <RequireRole allowedRoles={["VALIDATOR"]}>
      <AppLayout>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-semibold text-black">Dashboard Validator</h2>
            <p className="text-sm text-black">Kelola dan validasi ijazah yang diajukan.</p>
          </div>
          <button type="button" onClick={loadData} className="px-3 py-2 text-xs border border-black">
            Refresh
          </button>
        </div>

        {errorMsg && (
          <div className="mb-3 text-sm text-black bg-red-50 border border-red-200 rounded-md px-3 py-2">
            {errorMsg}
          </div>
        )}

        {successMsg && (
          <div className="mb-3 text-sm text-black bg-green-50 border border-green-200 rounded-md px-3 py-2">
            {successMsg}
          </div>
        )}

        <section className="bg-white border border-gray-400 text-black p-4 mb-4 text-sm rounded-lg">
          <h3 className="text-xs font-semibold text-black mb-2">Profil Validator</h3>
          {validator ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
              <div className="space-y-1">
                <div className="flex">
                  <span className="w-28 text-black">Nama</span>
                  <span className="flex-1">{validator.nama || validator.user?.name || "-"}</span>
                </div>
                <div className="flex">
                  <span className="w-28 text-black">Jabatan</span>
                  <span className="flex-1">{validator.jabatan || "-"}</span>
                </div>
              </div>
              <div className="space-y-1">
                <div className="flex">
                  <span className="w-32 text-black">Unit / Bagian</span>
                  <span className="flex-1">{validator.unit || validator.departemen || "-"}</span>
                </div>
                <div className="flex">
                  <span className="w-32 text-black">Email</span>
                  <span className="flex-1">{validator.user?.email || "-"}</span>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-xs text-black">Data validator tidak ditemukan. Hubungi admin.</p>
          )}
        </section>

        <section className="bg-white border border-gray-400 text-black p-4 text-sm rounded-lg">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-semibold text-black">Ijazah Menunggu Validasi</h3>
            {loading && <span className="text-xs text-black">Memuat...</span>}
          </div>

          {!loading && pendingIjazah.length === 0 && <p className="text-xs text-black">Tidak ada ijazah yang menunggu validasi.</p>}

          {pendingIjazah.length > 0 && (
            <div className="overflow-x-auto border border-gray-400">
              <table className="w-full text-xs border-collapse">
                <thead>
                  <tr className="bg-black text-white">
                    <th className="border border-gray-400 px-3 py-2 text-left w-12">ID</th>
                    <th className="border border-gray-400 px-3 py-2 text-left">Nomor Ijazah</th>
                    <th className="border border-gray-400 px-3 py-2 text-left">NIM</th>
                    <th className="border border-gray-400 px-3 py-2 text-left">Nama</th>
                    <th className="border border-gray-400 px-3 py-2 text-left">Program Studi</th>
                    <th className="border border-gray-400 px-3 py-2 text-left">Tgl Lulus</th>
                    <th className="border border-gray-400 px-3 py-2 text-left">IPK</th>
                    <th className="border border-gray-400 px-3 py-2 text-left">Status Validasi</th>
                    <th className="border border-gray-400 px-3 py-2 text-left w-40">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingIjazah.map((ijz) => (
                    <tr key={ijz.id}>
                      <td className="border border-gray-400 px-3 py-2">{ijz.id}</td>
                      <td className="border border-gray-400 px-3 py-2">{ijz.nomorIjazah || "-"}</td>
                      <td className="border border-gray-400 px-3 py-2">{ijz.mahasiswa?.nim || "-"}</td>
                      <td className="border border-gray-400 px-3 py-2">{ijz.mahasiswa?.nama || "-"}</td>
                      <td className="border border-gray-400 px-3 py-2">{ijz.mahasiswa?.prodi?.namaProdi || "-"}</td>
                      <td className="border border-gray-400 px-3 py-2">{ijz.tanggalLulus ? formatDate(ijz.tanggalLulus) : "-"}</td>
                      <td className="border border-gray-400 px-3 py-2">{typeof ijz.ipk === "number" ? ijz.ipk.toFixed(2) : ijz.ipk || "-"}</td>
                      <td className="border border-gray-400 px-3 py-2">
                        <StatusBadge status={ijz.statusValidasi || ijz.status || "PENDING"} />
                      </td>
                      <td className="border border-gray-400 px-3 py-2">
                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            className="px-2 py-1 text-[11px] border border-black"
                            onClick={() => handleUpdateStatus(ijz.id, "APPROVE")}
                          >
                            Terima
                          </button>
                          <button
                            type="button"
                            className="px-2 py-1 text-[11px] border border-black"
                            onClick={() => handleUpdateStatus(ijz.id, "REJECT")}
                          >
                            Tolak
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </AppLayout>
    </RequireRole>
  );
}
