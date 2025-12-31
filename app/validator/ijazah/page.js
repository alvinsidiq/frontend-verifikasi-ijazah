"use client";

import { useEffect, useState } from "react";
import AppLayout from "../../../components/layout/AppLayout";
import RequireRole from "../../../components/auth/RequireRole";
import { apiGet, apiPut } from "../../../lib/api";

function formatDate(dateStr) {
  if (!dateStr) return "-";
  try {
    return new Date(dateStr).toISOString().slice(0, 10);
  } catch {
    return dateStr;
  }
}

function formatIpk(ipk) {
  if (typeof ipk === "number") return ipk.toFixed(2);
  return ipk || "-";
}

function resolvePredikat(ijz) {
  if (!ijz) return "-";
  const direct = ijz.predikatKelulusan || ijz.predikat || ijz.predikatKelulusanText;
  if (direct) return direct;

  const ipk = typeof ijz.ipk === "number" ? ijz.ipk : null;
  if (ipk === null) return "-";
  if (ipk >= 3.51) return "Dengan Pujian";
  if (ipk >= 3.01) return "Sangat Memuaskan";
  if (ipk >= 2.76) return "Memuaskan";
  return "Lulus";
}

function StatusBadge({ status }) {
  if (!status) return <span className="text-[11px] text-gray-700">-</span>;
  const s = status.toUpperCase();
  const base = "inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium";

  if (s === "TERVALIDASI") return <span className={`${base} bg-green-100 text-green-700`}>{s}</span>;
  if (s === "DITOLAK" || s === "DIBATALKAN") return <span className={`${base} bg-red-100 text-red-700`}>{s}</span>;
  if (s === "PENDING" || s === "MENUNGGU_VALIDASI" || s === "DRAFT")
    return <span className={`${base} bg-yellow-100 text-yellow-700`}>{s}</span>;
  return <span className={`${base} bg-gray-100 text-gray-700`}>{s}</span>;
}

export default function ValidatorIjazahPage() {
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [ijazahList, setIjazahList] = useState([]);
  const [processingId, setProcessingId] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);
      setErrorMsg("");
      setSuccessMsg("");

      const res = await apiGet("/ijazah");
      setIjazahList(res.data || []);
    } catch (err) {
      console.error("Gagal memuat daftar ijazah:", err);
      setErrorMsg(err.message || "Gagal memuat daftar ijazah.");
    } finally {
      setLoading(false);
      setProcessingId(null);
    }
  }

  async function handleUpdateStatus(ijazah, newStatus) {
    const label = newStatus === "TERVALIDASI" ? "Validasi" : "Tolak";
    const ok = window.confirm(`${label} ijazah ${ijazah.nomorIjazah || ijazah.id}?`);
    if (!ok) return;

    const catatan = window.prompt("Catatan (opsional)", "") || "";

    try {
      setProcessingId(ijazah.id);
      setErrorMsg("");
      setSuccessMsg("");

      await apiPut(`/ijazah/${ijazah.id}/validasi`, {
        statusValidasi: newStatus,
        catatan,
      });

      setSuccessMsg(`Berhasil ${label.toLowerCase()} ijazah.`);
      await loadData();
    } catch (err) {
      console.error("Gagal ubah status ijazah:", err);
      setErrorMsg(err.message || "Gagal mengubah status ijazah.");
    } finally {
      setProcessingId(null);
    }
  }

  return (
    <RequireRole allowedRoles={["VALIDATOR"]}>
      <AppLayout>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-semibold text-black">Lihat Ijazah Mahasiswa</h2>
            <p className="text-sm text-black">Daftar ijazah dan aksi validasi langsung.</p>
          </div>
          <button
            type="button"
            onClick={loadData}
            className="px-3 py-2 text-xs border border-black bg-white text-black hover:bg-gray-50"
          >
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

        <section className="bg-white border border-gray-400 text-black">
          <div className="px-4 py-3 border-b border-gray-400 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold tracking-wide">LIHAT IJAZAH MAHASISWA</h3>
              {loading && <span className="text-xs">Memuat data...</span>}
            </div>
            <div className="text-xs text-gray-700">Total data: {ijazahList.length}</div>
          </div>

          <div className="p-4">
            {ijazahList.length === 0 && !loading ? (
              <p className="text-sm text-black">Belum ada data ijazah untuk ditampilkan.</p>
            ) : (
              <div className="overflow-x-auto border border-gray-400">
                <table className="w-full text-xs border-collapse">
                  <thead>
                    <tr className="bg-black text-white">
                      <th className="border border-gray-400 px-3 py-2 text-left w-12">No</th>
                      <th className="border border-gray-400 px-3 py-2 text-left">Nama Mahasiswa</th>
                      <th className="border border-gray-400 px-3 py-2 text-left">NIM</th>
                      <th className="border border-gray-400 px-3 py-2 text-left">No Ijazah</th>
                      <th className="border border-gray-400 px-3 py-2 text-left">IPK</th>
                      <th className="border border-gray-400 px-3 py-2 text-left">Predikat</th>
                      <th className="border border-gray-400 px-3 py-2 text-left">Status Validasi</th>
                      <th className="border border-gray-400 px-3 py-2 text-left w-36">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr>
                        <td colSpan={8} className="px-3 py-3 text-center text-black">
                          Memuat data...
                        </td>
                      </tr>
                    ) : (
                      ijazahList.map((ijz, idx) => {
                        const status = ijz.statusValidasi || ijz.status || "PENDING";
                        return (
                          <tr key={ijz.id || idx}>
                            <td className="border border-gray-400 px-3 py-2">{idx + 1}</td>
                            <td className="border border-gray-400 px-3 py-2">{ijz.mahasiswa?.nama || "-"}</td>
                            <td className="border border-gray-400 px-3 py-2">{ijz.mahasiswa?.nim || "-"}</td>
                            <td className="border border-gray-400 px-3 py-2">{ijz.nomorIjazah || "-"}</td>
                            <td className="border border-gray-400 px-3 py-2">{formatIpk(ijz.ipk)}</td>
                            <td className="border border-gray-400 px-3 py-2">{resolvePredikat(ijz)}</td>
                            <td className="border border-gray-400 px-3 py-2">
                              <StatusBadge status={status} />
                            </td>
                            <td className="border border-gray-400 px-3 py-2">
                              <div className="flex flex-wrap gap-2">
                                <button
                                  type="button"
                                  className="px-2 py-1 text-[11px] border border-green-700 bg-green-600 text-white hover:bg-green-700 disabled:opacity-60"
                                  disabled={processingId === ijz.id}
                                  onClick={() => handleUpdateStatus(ijz, "TERVALIDASI")}
                                >
                                  Validasi
                                </button>
                                <button
                                  type="button"
                                  className="px-2 py-1 text-[11px] border border-red-700 bg-red-600 text-white hover:bg-red-700 disabled:opacity-60"
                                  disabled={processingId === ijz.id}
                                  onClick={() => handleUpdateStatus(ijz, "DITOLAK")}
                                >
                                  Tolak
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>
      </AppLayout>
    </RequireRole>
  );
}
