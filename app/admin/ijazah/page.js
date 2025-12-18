"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import AppLayout from "../../../components/layout/AppLayout";
import RequireRole from "../../../components/auth/RequireRole";
import { apiGet, apiDelete } from "../../../lib/api";

export default function IjazahPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [listIjazah, setListIjazah] = useState([]);

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

  function formatDate(dateString) {
    if (!dateString) return "-";
    try {
      return new Date(dateString).toISOString().slice(0, 10);
    } catch {
      return dateString;
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
                      <th className="border border-gray-400 px-2 py-2 text-left w-24">AKSI</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr>
                        <td colSpan={9} className="px-2 py-2 text-center text-black">
                          Memuat data...
                        </td>
                      </tr>
                    ) : (
                      listIjazah.map((ijz) => (
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
                            {ijz.status || ijz.statusValidasi || "-"}
                          </td>
                          <td className="border border-gray-400 px-2 py-2">{ijz.judulTA || "-"}</td>
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
                      ))
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

