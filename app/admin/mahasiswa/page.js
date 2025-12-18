"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import AppLayout from "../../../components/layout/AppLayout";
import RequireRole from "../../../components/auth/RequireRole";
import { apiGet, apiDelete } from "../../../lib/api";

export default function MahasiswaPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [listMahasiswa, setListMahasiswa] = useState([]);

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
      const mhsRes = await apiGet("/mahasiswa");
      setListMahasiswa(mhsRes.data || []);
    } catch (err) {
      console.error("Gagal load mahasiswa:", err);
      setErrorMsg(err.message || "Gagal memuat data mahasiswa.");
    } finally {
      setLoading(false);
    }
  }

  function goToAdd() {
    router.push("/admin/mahasiswa/tambah");
  }

  function goToEdit(id) {
    router.push(`/admin/mahasiswa/${id}/edit`);
  }

  async function handleDelete(id) {
    const ok = window.confirm("Yakin ingin menghapus data mahasiswa ini?");
    if (!ok) return;

    setErrorMsg("");
    setSuccessMsg("");

    try {
      await apiDelete(`/mahasiswa/${id}`);
      setSuccessMsg("Data mahasiswa berhasil dihapus.");
      await loadData();
    } catch (err) {
      console.error("Error hapus mahasiswa:", err);
      setErrorMsg(err.message || "Gagal menghapus data mahasiswa.");
    }
  }

  return (
    <RequireRole allowedRoles={["ADMIN"]}>
      <AppLayout>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-semibold text-black">Kelola Mahasiswa</h2>
            <p className="text-sm text-black">
              Tambah, edit, dan hapus data mahasiswa.
            </p>
          </div>
        </div>

        <div className="bg-white border border-gray-400 text-black">
          {/* header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-400">
            <h3 className="text-lg font-semibold tracking-wide">DATA MAHASISWA</h3>
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
            {listMahasiswa.length === 0 && !loading ? (
              <p className="text-sm text-black">Belum ada data mahasiswa.</p>
            ) : (
              <div className="overflow-x-auto border border-gray-400">
                <table className="w-full text-xs border-collapse">
                  <thead>
                    <tr className="bg-black text-white">
                      <th className="border border-gray-400 px-2 py-2 w-8 text-left">ID</th>
                      <th className="border border-gray-400 px-2 py-2 text-left">NIM</th>
                      <th className="border border-gray-400 px-2 py-2 text-left">NAMA</th>
                      <th className="border border-gray-400 px-2 py-2 text-left">
                        TEMPAT/ TANGGAL LAHIR
                      </th>
                      <th className="border border-gray-400 px-2 py-2 text-left">ALAMAT</th>
                      <th className="border border-gray-400 px-2 py-2 text-left">EMAIL</th>
                      <th className="border border-gray-400 px-2 py-2 text-left">NO TELEPON</th>
                      <th className="border border-gray-400 px-2 py-2 text-left">FOTO</th>
                      <th className="border border-gray-400 px-2 py-2 text-left">TANGGAL MASUK</th>
                      <th className="border border-gray-400 px-2 py-2 text-left">STATUS</th>
                      <th className="border border-gray-400 px-2 py-2 text-left">PROGRAM STUDI</th>
                      <th className="border border-gray-400 px-2 py-2 text-left w-24">AKSI</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr>
                        <td colSpan={12} className="px-2 py-2 text-center text-black">
                          Memuat data...
                        </td>
                      </tr>
                    ) : (
                      listMahasiswa.map((mhs) => (
                        <tr key={mhs.id}>
                          <td className="border border-gray-400 px-2 py-2">{mhs.id}</td>
                          <td className="border border-gray-400 px-2 py-2">{mhs.nim}</td>
                          <td className="border border-gray-400 px-2 py-2">{mhs.nama}</td>
                          <td className="border border-gray-400 px-2 py-2">
                            {formatTTL(mhs.tempatLahir, mhs.tanggalLahir)}
                          </td>
                          <td className="border border-gray-400 px-2 py-2">{mhs.alamat || "-"}</td>
                          <td className="border border-gray-400 px-2 py-2">{mhs.email || "-"}</td>
                          <td className="border border-gray-400 px-2 py-2">{mhs.noTelepon || "-"}</td>
                          <td className="border border-gray-400 px-2 py-2">{mhs.foto || "-"}</td>
                          <td className="border border-gray-400 px-2 py-2">
                            {mhs.tanggalMasuk || mhs.tahunMasuk || "-"}
                          </td>
                          <td className="border border-gray-400 px-2 py-2">{mhs.status || "-"}</td>
                          <td className="border border-gray-400 px-2 py-2">
                            {mhs.prodi?.namaProdi || mhs.prodiId || "-"}
                          </td>
                          <td className="border border-gray-400 px-2 py-2">
                            <div className="flex gap-2">
                              <button
                                className="px-2 py-1 text-[10px] border border-black"
                                onClick={() => goToEdit(mhs.id)}
                              >
                                EDIT
                              </button>
                              <button
                                className="px-2 py-1 text-[10px] border border-black"
                                onClick={() => handleDelete(mhs.id)}
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

function formatTTL(tempat, tanggal) {
  if (!tempat && !tanggal) return "-";
  const tgl = tanggal ? tanggal : "";
  return [tempat, tgl].filter(Boolean).join(", ");
}
