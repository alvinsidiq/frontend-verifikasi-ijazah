"use client";

import { useEffect, useMemo, useState } from "react";
import AppLayout from "../../../components/layout/AppLayout";
import RequireRole from "../../../components/auth/RequireRole";
import { apiGet } from "../../../lib/api";

const STATUS_FILTERS = [
  { value: "ALL", label: "Semua" },
  { value: "DRAFT", label: "Draft" },
  { value: "TERBIT", label: "Terbit" },
  { value: "DIBATALKAN", label: "Dibatalkan" },
  { value: "TERVALIDASI", label: "Tervalidasi" }, // kalau pakai enum ini di backend
];

function getStatusValidasi(ijz) {
  // sesuaikan dengan field di backend-mu
  return ijz.statusValidasi || ijz.status || "DRAFT";
}

function getStatusOnchain(ijz) {
  // kalau nanti di /ijazah sudah include relaasi blockchainRecord
  // sesuaikan nama relasi/field di sini
  if (ijz.blockchainRecord) {
    return ijz.blockchainRecord.statusOnchain || "ONCHAIN";
  }
  if (Array.isArray(ijz.blockchainRecords) && ijz.blockchainRecords.length > 0) {
    return ijz.blockchainRecords[0].statusOnchain || "ONCHAIN";
  }
  return "BELUM_ONCHAIN";
}

export default function StatusValidasiPage() {
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [ijazahList, setIjazahList] = useState([]);
  const [filterStatus, setFilterStatus] = useState("ALL");

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);
      setErrorMsg("");

      const res = await apiGet("/ijazah");
      setIjazahList(res.data || []);
    } catch (err) {
      console.error("Gagal load data ijazah:", err);
      setErrorMsg(err.message || "Gagal memuat data ijazah.");
    } finally {
      setLoading(false);
    }
  }

  const filteredIjazah = useMemo(() => {
    if (filterStatus === "ALL") return ijazahList;
    return ijazahList.filter((ijz) => getStatusValidasi(ijz) === filterStatus);
  }, [filterStatus, ijazahList]);

  function formatDate(dateStr) {
    if (!dateStr) return "-";
    try {
      return new Date(dateStr).toISOString().slice(0, 10);
    } catch {
      return dateStr;
    }
  }

  function renderBadge(status) {
    const s = status.toUpperCase();
    let base = "inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium";
    if (s === "TERBIT" || s === "TERVALIDASI") {
      return <span className={`${base} bg-green-100 text-green-700`}>{s}</span>;
    }
    if (s === "DIBATALKAN" || s === "DITOLAK") {
      return <span className={`${base} bg-red-100 text-red-700`}>{s}</span>;
    }
    return <span className={`${base} bg-gray-100 text-gray-700`}>{s}</span>;
  }

  function renderOnchainBadge(status) {
    const s = status.toUpperCase();
    let base = "inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium";
    if (s === "ONCHAIN" || s === "SUCCESS") {
      return <span className={`${base} bg-blue-100 text-blue-700`}>{s}</span>;
    }
    if (s === "PENDING") {
      return <span className={`${base} bg-yellow-100 text-yellow-700`}>{s}</span>;
    }
    if (s === "FAILED") {
      return <span className={`${base} bg-red-100 text-red-700`}>{s}</span>;
    }
    return <span className={`${base} bg-gray-100 text-gray-700`}>{s}</span>;
  }

  return (
    <RequireRole allowedRoles={["ADMIN"]}>
      <AppLayout>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-semibold text-black">Status Validasi Ijazah</h2>
            <p className="text-sm text-black">Pantau status validasi dan pencatatan ijazah mahasiswa.</p>
          </div>
          <button type="button" onClick={loadData} className="px-3 py-2 text-xs border border-black">
            Refresh
          </button>
        </div>

        <section className="bg-white border border-gray-400 text-black">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 px-4 py-3 border-b border-gray-400">
            <div>
              <h3 className="text-lg font-semibold tracking-wide">STATUS VALIDASI IJAZAH</h3>
              {loading && <span className="text-xs text-black">Memuat...</span>}
            </div>
            <div className="flex flex-wrap gap-2 text-xs">
              <span className="px-2 py-1 border border-gray-400 rounded-sm bg-gray-50">
                Total: <strong>{ijazahList.length}</strong>
              </span>
              <span className="px-2 py-1 border border-gray-400 rounded-sm bg-gray-50">
                Terfilter: <strong>{filteredIjazah.length}</strong>
              </span>
            </div>
          </div>

          {errorMsg && (
            <div className="px-4 py-3 border-b border-gray-400">
              <div className="text-sm text-black bg-red-50 border border-red-200 rounded px-3 py-2">
                {errorMsg}
              </div>
            </div>
          )}

          <div className="px-4 py-3 border-b border-gray-400">
            <div className="flex flex-wrap gap-2 text-xs">
              {STATUS_FILTERS.map((f) => (
                <button
                  key={f.value}
                  type="button"
                  onClick={() => setFilterStatus(f.value)}
                  className={`px-3 py-1 border border-black ${
                    filterStatus === f.value ? "bg-black text-white" : "bg-white text-black hover:bg-gray-50"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          <div className="p-4">
            {filteredIjazah.length === 0 && !loading ? (
              <p className="text-sm text-black">Belum ada data ijazah untuk ditampilkan.</p>
            ) : (
              <div className="overflow-x-auto border border-gray-400">
                <table className="w-full text-xs border-collapse">
                  <thead>
                    <tr className="bg-black text-white">
                      <th className="border border-gray-400 px-3 py-2 text-left w-12">No</th>
                      <th className="border border-gray-400 px-3 py-2 text-left">Nomor Ijazah</th>
                      <th className="border border-gray-400 px-3 py-2 text-left">NIM</th>
                      <th className="border border-gray-400 px-3 py-2 text-left">Nama</th>
                      <th className="border border-gray-400 px-3 py-2 text-left">Program Studi</th>
                      <th className="border border-gray-400 px-3 py-2 text-left">Tgl Lulus</th>
                      <th className="border border-gray-400 px-3 py-2 text-left">Status Validasi</th>
                      <th className="border border-gray-400 px-3 py-2 text-left">Status Onchain</th>
                      <th className="border border-gray-400 px-3 py-2 text-left w-44">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr>
                        <td colSpan={9} className="px-3 py-2 text-center text-black">
                          Memuat data...
                        </td>
                      </tr>
                    ) : (
                      filteredIjazah.map((ijz, idx) => {
                        const statusValidasi = getStatusValidasi(ijz);
                        const statusOnchain = getStatusOnchain(ijz);
                        return (
                          <tr key={ijz.id}>
                            <td className="border border-gray-400 px-3 py-2">{idx + 1}</td>
                            <td className="border border-gray-400 px-3 py-2">{ijz.nomorIjazah || "-"}</td>
                            <td className="border border-gray-400 px-3 py-2">{ijz.mahasiswa?.nim || "-"}</td>
                            <td className="border border-gray-400 px-3 py-2">{ijz.mahasiswa?.nama || "-"}</td>
                            <td className="border border-gray-400 px-3 py-2">{ijz.mahasiswa?.prodi?.namaProdi || "-"}</td>
                            <td className="border border-gray-400 px-3 py-2">{formatDate(ijz.tanggalLulus)}</td>
                            <td className="border border-gray-400 px-3 py-2">{renderBadge(statusValidasi)}</td>
                            <td className="border border-gray-400 px-3 py-2">{renderOnchainBadge(statusOnchain)}</td>
                            <td className="border border-gray-400 px-3 py-2">
                              <div className="flex flex-wrap gap-2">
                                <button
                                  type="button"
                                  className="px-2 py-1 text-[11px] border border-black"
                                  onClick={() =>
                                    alert(
                                      `Detail sederhana:\nNIM: ${ijz.mahasiswa?.nim || "-"}\nNama: ${ijz.mahasiswa?.nama || "-"}\nNomor Ijazah: ${ijz.nomorIjazah || "-"}`
                                    )
                                  }
                                >
                                  Detail
                                </button>
                                <button
                                  type="button"
                                  className="px-2 py-1 text-[11px] border border-black"
                                  onClick={() => {
                                    if (ijz.nomorIjazah) {
                                      navigator.clipboard.writeText(ijz.nomorIjazah).catch(() => {});
                                    }
                                  }}
                                >
                                  Salin Nomor
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
