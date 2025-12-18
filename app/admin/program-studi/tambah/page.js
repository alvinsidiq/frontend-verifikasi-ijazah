"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import AppLayout from "../../../../components/layout/AppLayout";
import RequireRole from "../../../../components/auth/RequireRole";
import { apiPost } from "../../../../lib/api";

export default function ProgramStudiTambahPage() {
  const router = useRouter();
  const [kodeProdi, setKodeProdi] = useState("");
  const [namaProdi, setNamaProdi] = useState("");
  const [jenjang, setJenjang] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setErrorMsg("");

    if (!kodeProdi || !namaProdi || !jenjang) {
      setErrorMsg("Kode, nama, dan jenjang wajib diisi.");
      return;
    }

    try {
      setLoading(true);
      await apiPost("/program-studi", {
        kodeProdi,
        namaProdi,
        jenjang,
      });
      router.push(
        "/admin/program-studi?success=Program%20studi%20berhasil%20ditambahkan."
      );
    } catch (err) {
      console.error("Gagal tambah prodi:", err);
      setErrorMsg(err.message || "Gagal menambahkan program studi.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <RequireRole allowedRoles={["ADMIN"]}>
      <AppLayout>
        <div className="bg-white border border-gray-400 text-black">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-400">
            <h3 className="text-lg font-semibold text-black">Tambah Program Studi</h3>
            <button
              onClick={() => router.push("/admin/program-studi")}
              className="px-4 py-2 text-xs border border-black"
            >
              Kembali
            </button>
          </div>

          {errorMsg && (
            <div className="px-4 py-3 border-b border-gray-400">
              <div className="text-sm text-black bg-red-50 border border-red-200 rounded px-3 py-2">
                {errorMsg}
              </div>
            </div>
          )}

          <div className="px-4 py-4">
            <form
              onSubmit={handleSubmit}
              className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm"
            >
              <div className="space-y-1">
                <label className="font-medium text-black">Kode Prodi</label>
                <input
                  type="text"
                  className="w-full border border-gray-400 rounded-md px-3 py-2 text-black"
                  value={kodeProdi}
                  onChange={(e) => setKodeProdi(e.target.value)}
                  placeholder="TI-S1"
                />
              </div>

              <div className="space-y-1">
                <label className="font-medium text-black">Nama Prodi</label>
                <input
                  type="text"
                  className="w-full border border-gray-400 rounded-md px-3 py-2 text-black"
                  value={namaProdi}
                  onChange={(e) => setNamaProdi(e.target.value)}
                  placeholder="Teknik Informatika"
                />
              </div>

              <div className="space-y-1">
                <label className="font-medium text-black">Jenjang</label>
                <input
                  type="text"
                  className="w-full border border-gray-400 rounded-md px-3 py-2 text-black"
                  value={jenjang}
                  onChange={(e) => setJenjang(e.target.value)}
                  placeholder="S1 / D3 / D4"
                />
              </div>

              <div className="md:col-span-3 flex items-center gap-3 mt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 text-xs border border-black disabled:opacity-60"
                >
                  {loading ? "Menyimpan..." : "Simpan"}
                </button>
                <button
                  type="button"
                  onClick={() => router.push("/admin/program-studi")}
                  className="px-4 py-2 text-xs border border-gray-500 text-black"
                >
                  Batal
                </button>
              </div>
            </form>
          </div>
        </div>
      </AppLayout>
    </RequireRole>
  );
}
