"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import AppLayout from "../../../components/layout/AppLayout";
import RequireRole from "../../../components/auth/RequireRole";
import { apiGet, apiDelete } from "../../../lib/api";

export default function ProgramStudiPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const [listProdi, setListProdi] = useState([]);

  useEffect(() => {
    loadProdi();
  }, []);

  useEffect(() => {
    const msg = searchParams.get("success");
    if (msg) {
      setSuccessMsg(msg);
    }
  }, [searchParams]);

  async function loadProdi() {
    try {
      setLoading(true);
      setErrorMsg("");
      const res = await apiGet("/program-studi");
      setListProdi(res.data || []);
    } catch (err) {
      console.error("Gagal load program studi:", err);
      setErrorMsg(err.message || "Gagal memuat program studi.");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id) {
    const ok = window.confirm(
      "Yakin ingin menghapus program studi ini?"
    );
    if (!ok) return;

    setErrorMsg("");
    setSuccessMsg("");

    try {
      await apiDelete(`/program-studi/${id}`);
      setSuccessMsg("Program studi berhasil dihapus.");
      await loadProdi();
    } catch (err) {
      console.error("Error hapus prodi:", err);
      setErrorMsg(err.message || "Gagal menghapus program studi.");
    }
  }

  function goToAdd() {
    router.push("/admin/program-studi/tambah");
  }

  function goToEdit(id) {
    router.push(`/admin/program-studi/${id}/edit`);
  }

  return (
    <RequireRole allowedRoles={["ADMIN"]}>
      <AppLayout>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-semibold text-black">
              Kelola Program Studi
            </h2>
            <p className="text-sm text-black">
              Tambah, edit, dan hapus data program studi.
            </p>
          </div>
        </div>

        <div className="bg-white border border-gray-400 text-black">
          {/* header atas */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-400">
            <div>
              <h3 className="text-lg font-semibold text-black">Data Program Studi</h3>
              {loading && (
                <span className="text-xs text-black">Memuat...</span>
              )}
            </div>
            <button
              onClick={goToAdd}
              className="px-4 py-2 text-xs border border-black"
            >
              Tambah Data
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

          {/* Tabel Program Studi */}
          <div className="px-4 py-4">
            {listProdi.length === 0 && !loading ? (
              <p className="text-sm text-black">
                Belum ada data program studi.
              </p>
            ) : (
              <div className="overflow-x-auto border border-gray-400">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="bg-gray-100 text-black">
                      <th className="border border-gray-400 px-3 py-2 w-12 text-left">
                        ID
                      </th>
                      <th className="border border-gray-400 px-3 py-2 text-left">
                        Kode Program Studi
                      </th>
                      <th className="border border-gray-400 px-3 py-2 text-left">
                        Nama Program Studi
                      </th>
                      <th className="border border-gray-400 px-3 py-2 text-left">
                        Jenjang
                      </th>
                      <th className="border border-gray-400 px-3 py-2 text-left w-32">
                        Aksi
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {listProdi.map((prodi) => (
                      <tr key={prodi.id}>
                        <td className="border border-gray-400 px-3 py-2">
                          {prodi.id}
                        </td>
                        <td className="border border-gray-400 px-3 py-2">
                          {prodi.kodeProdi}
                        </td>
                        <td className="border border-gray-400 px-3 py-2">
                          {prodi.namaProdi}
                        </td>
                        <td className="border border-gray-400 px-3 py-2">
                          {prodi.jenjang}
                        </td>
                        <td className="border border-gray-400 px-3 py-2">
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => goToEdit(prodi.id)}
                              className="px-2 py-1 text-xs border border-black"
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDelete(prodi.id)}
                              className="px-2 py-1 text-xs border border-black"
                            >
                              Hapus
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
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
