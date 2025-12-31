"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import AppLayout from "../../../components/layout/AppLayout";
import RequireRole from "../../../components/auth/RequireRole";
import { apiGet, apiDelete, apiPost } from "../../../lib/api";

function formatDate(dateString) {
  if (!dateString) return "-";
  try {
    return new Date(dateString).toISOString().slice(0, 10);
  } catch {
    return dateString;
  }
}

function StatusBadge({ status }) {
  const s = (status || "").toUpperCase();
  const base =
    "inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium";

  if (s === "DRAFT") {
    return (
      <span className={`${base} bg-yellow-100 text-yellow-700`}>
        DRAFT
      </span>
    );
  }

  if (s === "APPROVED_ADMIN") {
    return (
      <span className={`${base} bg-blue-100 text-blue-700`}>
        Disetujui Admin (1/2)
      </span>
    );
  }

  if (s === "TERVALIDASI") {
    return (
      <span className={`${base} bg-green-100 text-green-700`}>
        TERVALIDASI (2/2)
      </span>
    );
  }

  if (s === "DITOLAK_ADMIN" || s === "DITOLAK_VALIDATOR") {
    return (
      <span className={`${base} bg-red-100 text-red-700`}>
        {s.replace("_", " ")}
      </span>
    );
  }

  return (
    <span className={`${base} bg-gray-100 text-gray-700`}>
      {s || "-"}
    </span>
  );
}

function OnchainBadge({ statusOnchain }) {
  if (!statusOnchain) {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] bg-gray-100 text-gray-600">
        BELUM
      </span>
    );
  }

  const s = statusOnchain.toUpperCase();
  const base =
    "inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium";

  if (s === "SUCCESS") {
    return <span className={`${base} bg-green-100 text-green-700`}>SUCCESS</span>;
  }
  if (s === "PENDING") {
    return <span className={`${base} bg-yellow-100 text-yellow-700`}>PENDING</span>;
  }
  if (s === "FAILED") {
    return <span className={`${base} bg-red-100 text-red-700`}>FAILED</span>;
  }
  return <span className={`${base} bg-gray-100 text-gray-700`}>{s}</span>;
}

export default function IjazahPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [listIjazah, setListIjazah] = useState([]);
  const [publishingId, setPublishingId] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    const msg = searchParams.get("success");
    if (msg) {
      setSuccessMsg(msg);
    }
  }, [searchParams]);

  async function loadData() {
    try {
      setLoading(true);
      setErrorMsg("");
      const res = await apiGet("/ijazah");
      setListIjazah(res.data || []);
    } catch (err) {
      console.error("Gagal load ijazah:", err);
      setErrorMsg(err.message || "Gagal memuat data ijazah.");
    } finally {
      setLoading(false);
      setPublishingId(null);
    }
  }

  function goToAdd() {
    router.push("/admin/ijazah/tambah");
  }

  function goToEdit(id) {
    router.push(`/admin/ijazah/${id}/edit`);
  }

  async function handleDelete(id) {
    const ok = window.confirm("Yakin ingin menghapus data ijazah ini?");
    if (!ok) return;

    setErrorMsg("");
    setSuccessMsg("");

    try {
      await apiDelete(`/ijazah/${id}`);
      setSuccessMsg("Data ijazah berhasil dihapus.");
      await loadData();
    } catch (err) {
      console.error("Error hapus ijazah:", err);
      setErrorMsg(err.message || "Gagal menghapus data ijazah.");
    }
  }

  async function handleAdminApprove(ijazah) {
    const ok = window.confirm(`Validasi Admin untuk ijazah ${ijazah.nomorIjazah}?`);
    if (!ok) return;

    try {
      setErrorMsg("");
      setSuccessMsg("");
      await apiPost(`/ijazah/${ijazah.id}/validasi/admin-approve`, {});
      await loadData();
      setSuccessMsg("Berhasil validasi Admin (1/2).");
    } catch (err) {
      console.error("Gagal validasi admin:", err);
      const msg = err.message || "Gagal validasi Admin";
      setErrorMsg(msg);
      window.alert(msg);
    }
  }

  async function handleAdminReject(ijazah) {
    const ok = window.confirm(`Tolak (Admin) ijazah ${ijazah.nomorIjazah}?`);
    if (!ok) return;

    try {
      setErrorMsg("");
      setSuccessMsg("");
      await apiPost(`/ijazah/${ijazah.id}/validasi/admin-reject`, {});
      await loadData();
      setSuccessMsg("Ijazah ditolak oleh Admin.");
    } catch (err) {
      console.error("Gagal tolak admin:", err);
      const msg = err.message || "Gagal menolak ijazah (Admin)";
      setErrorMsg(msg);
      window.alert(msg);
    }
  }

  async function handlePublishOnchain(ijazah) {
    const { id, nomorIjazah } = ijazah;
    const confirmPublish = window.confirm(
      `Publish ijazah ${nomorIjazah || id} ke blockchain?\nPastikan data sudah benar, karena hash akan permanen.`
    );
    if (!confirmPublish) return;

    try {
      setErrorMsg("");
      setSuccessMsg("");
      setPublishingId(id);

      const res = await apiPost(`/ijazah/${id}/publish-onchain`, {});
      await loadData();
      setSuccessMsg(res?.message || "Berhasil publish ijazah ke blockchain.");
    } catch (err) {
      console.error("Gagal publish ijazah ke blockchain:", err);
      setErrorMsg(err.message || "Gagal mempublish ijazah ke blockchain.");
    } finally {
      setPublishingId(null);
    }
  }

  return (
    <RequireRole allowedRoles={["ADMIN"]}>
      <AppLayout>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-semibold text-black">Kelola Ijazah</h2>
            <p className="text-sm text-black">
              Lihat dan kelola data ijazah mahasiswa.
            </p>
          </div>
        </div>

        <div className="bg-white border border-gray-400 text-black">
          {/* header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-400">
            <h3 className="text-lg font-semibold tracking-wide">DATA IJAZAH</h3>
            <button className="px-4 py-2 text-xs border border-black" onClick={goToAdd}>
              TAMBAH DATA
            </button>
          </div>

          {/* notifikasi */}
          {(errorMsg || successMsg) && (
            <div className="px-4 py-3 border-b border-gray-400">
              {errorMsg && (
                <div className="mb-2 text-sm text-black bg-red-50 border border-red-200 rounded px-3 py-2">
                  {errorMsg}
                </div>
              )}
              {successMsg && (
                <div className="text-sm text-black bg-green-50 border border-green-200 rounded px-3 py-2">
                  {successMsg}
                </div>
              )}
            </div>
          )}

          {/* tabel */}
          <div className="p-4">
            {listIjazah.length === 0 && !loading ? (
              <p className="text-sm text-black">Belum ada data ijazah.</p>
            ) : (
              <div className="overflow-x-auto border border-gray-400">
                <table className="w-full text-xs border-collapse">
                  <thead>
                    <tr className="bg-black text-white">
                      <th className="border border-gray-400 px-2 py-2 w-10 text-left">ID</th>
                      <th className="border border-gray-400 px-2 py-2 text-left">NOMOR IJAZAH</th>
                      <th className="border border-gray-400 px-2 py-2 text-left">MAHASISWA</th>
                      <th className="border border-gray-400 px-2 py-2 text-left">PROGRAM STUDI</th>
                      <th className="border border-gray-400 px-2 py-2 text-left">TANGGAL LULUS</th>
                      <th className="border border-gray-400 px-2 py-2 text-left">IPK</th>
                      <th className="border border-gray-400 px-2 py-2 text-left">STATUS</th>
                      <th className="border border-gray-400 px-2 py-2 text-left">JUDUL TA</th>
                      <th className="border border-gray-400 px-2 py-2 text-left">STATUS ON-CHAIN</th>
                      <th className="border border-gray-400 px-2 py-2 text-left w-32">AKSI BLOCKCHAIN</th>
                      <th className="border border-gray-400 px-2 py-2 text-left w-24">AKSI</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr>
                        <td colSpan={11} className="px-2 py-2 text-center text-black">
                          Memuat data...
                        </td>
                      </tr>
                    ) : (
                    listIjazah.map((ijz) => {
                      const bc = ijz.blockchainRecord || null;
                      const statusOnchain = bc?.statusOnchain || null;
                      const alreadySuccess =
                        statusOnchain && statusOnchain.toUpperCase() === "SUCCESS";
                      const statusValidasi = (ijz.statusValidasi || ijz.status || "").toUpperCase();
                      const isFullyValidated = statusValidasi === "TERVALIDASI";
                      const isDraft = statusValidasi === "DRAFT";

                      return (
                        <tr key={ijz.id}>
                          <td className="border border-gray-400 px-2 py-2">{ijz.id}</td>
                          <td className="border border-gray-400 px-2 py-2">{ijz.nomorIjazah || "-"}</td>
                          <td className="border border-gray-400 px-2 py-2">
                            {ijz.mahasiswa
                              ? `${ijz.mahasiswa.nim} - ${ijz.mahasiswa.nama}`
                              : ijz.mahasiswaId || "-"}
                          </td>
                          <td className="border border-gray-400 px-2 py-2">
                            {ijz.mahasiswa?.prodi?.namaProdi || ijz.mahasiswa?.prodiId || "-"}
                          </td>
                          <td className="border border-gray-400 px-2 py-2">
                            {formatDate(ijz.tanggalLulus)}
                          </td>
                          <td className="border border-gray-400 px-2 py-2">
                            {typeof ijz.ipk === "number"
                              ? ijz.ipk.toFixed(2)
                              : ijz.ipk || "-"}
                          </td>
                          <td className="border border-gray-400 px-2 py-2">
                            <StatusBadge status={statusValidasi} />
                          </td>
                          <td className="border border-gray-400 px-2 py-2">{ijz.judulTA || ijz.judul_ta || "-"}</td>
                          <td className="border border-gray-400 px-2 py-2">
                            <div className="flex flex-col gap-1">
                              <OnchainBadge statusOnchain={statusOnchain} />
                              {bc?.blockNumber != null && (
                                <span className="text-[10px] text-gray-700">Block #{bc.blockNumber}</span>
                              )}
                            </div>
                          </td>
                          <td className="border border-gray-400 px-2 py-2">
                            <div className="flex flex-col gap-1">
                              {/* Aksi khusus Admin */}
                              {isDraft && (
                                <button
                                  onClick={() => handleAdminApprove(ijz)}
                                  className="px-2 py-1 border border-slate-900 text-[11px] hover:bg-slate-900 hover:text-white rounded mb-1"
                                >
                                  Validasi Admin (1/2)
                                </button>
                              )}
                              {isDraft && (
                                <button
                                  onClick={() => handleAdminReject(ijz)}
                                  className="px-2 py-1 border border-red-600 text-[11px] text-red-600 hover:bg-red-600 hover:text-white rounded"
                                >
                                  Tolak Admin
                                </button>
                              )}
                              <button
                                className="px-2 py-1 rounded-md border border-slate-900 text-[11px] text-slate-900 hover:bg-slate-900 hover:text-white disabled:opacity-50"
                                disabled={
                                  publishingId === ijz.id ||
                                  alreadySuccess ||
                                  !isFullyValidated
                                }
                                onClick={() => handlePublishOnchain(ijz)}
                              >
                                {alreadySuccess
                                  ? "Sudah On-Chain"
                                  : !isFullyValidated
                                  ? "Belum 2x Validasi"
                                  : publishingId === ijz.id
                                  ? "Memproses..."
                                  : "Publish ke Blockchain"}
                              </button>
                              {bc?.txHash && (
                                <span className="text-[10px] text-gray-700 break-all">
                                  Tx: {bc.txHash}
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="border border-gray-400 px-2 py-2">
                            <div className="flex gap-2">
                              <button
                                className="px-2 py-1 text-[10px] border border-black"
                                onClick={() => goToEdit(ijz.id)}
                              >
                                EDIT
                              </button>
                              <button
                                className="px-2 py-1 text-[10px] border border-black"
                                onClick={() => handleDelete(ijz.id)}
                              >
                                HAPUS
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
        </div>
      </AppLayout>
    </RequireRole>
  );
}
