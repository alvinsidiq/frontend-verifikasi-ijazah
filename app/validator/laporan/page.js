"use client";

import { useEffect, useState } from "react";
import AppLayout from "../../../components/layout/AppLayout";
import RequireRole from "../../../components/auth/RequireRole";
import { apiGet } from "../../../lib/api";

function formatDate(dateString) {
  if (!dateString) return "-";
  try {
    return new Date(dateString).toISOString().slice(0, 10);
  } catch {
    return dateString;
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

function resolveStatus(ijz) {
  return ijz.statusValidasi || ijz.status || "-";
}

function resolveTahunAkademik(ijz) {
  return (
    ijz.tahunAkademik ||
    ijz.tahunAkademikLulus ||
    ijz.tahunLulus ||
    ijz.tahunMasuk ||
    "-"
  );
}

function resolveTanggalVerifikasi(ijz) {
  return (
    ijz.tanggalVerifikasi ||
    ijz.validatedAt ||
    ijz.updatedAt ||
    ijz.tanggalLulus ||
    null
  );
}

export default function ValidatorLaporanPage() {
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [ijazahList, setIjazahList] = useState([]);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);
      setErrorMsg("");
      const res = await apiGet("/ijazah?status=TERVALIDASI");
      setIjazahList(res.data || []);
    } catch (err) {
      console.error("Gagal memuat laporan ijazah:", err);
      setErrorMsg(err.message || "Gagal memuat laporan ijazah terverifikasi.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <RequireRole allowedRoles={["VALIDATOR"]}>
      <AppLayout>
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-xl font-semibold text-black">Laporan Ijazah Terverifikasi</h2>
            <p className="text-sm text-black">Daftar ijazah yang sudah divalidasi.</p>
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

        <section className="bg-white border border-gray-400 text-black">
          <div className="px-4 py-3 border-b border-gray-400 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold tracking-wide">LAPORAN IJAZAH TERVERIFIKASI</h3>
              {loading && <span className="text-xs">Memuat data...</span>}
            </div>
            <div className="text-xs text-gray-700">Total data: {ijazahList.length}</div>
          </div>

          <div className="p-4">
            {ijazahList.length === 0 && !loading ? (
              <p className="text-sm text-black">Belum ada ijazah terverifikasi.</p>
            ) : (
              <div className="overflow-x-auto border border-gray-400">
                <table className="w-full text-xs border-collapse">
                  <thead>
                    <tr className="bg-black text-white">
                      <th className="border border-gray-400 px-3 py-2 text-left w-12">No</th>
                      <th className="border border-gray-400 px-3 py-2 text-left">Nama Mahasiswa</th>
                      <th className="border border-gray-400 px-3 py-2 text-left">NIM</th>
                      <th className="border border-gray-400 px-3 py-2 text-left">Program Studi</th>
                      <th className="border border-gray-400 px-3 py-2 text-left">IPK</th>
                      <th className="border border-gray-400 px-3 py-2 text-left">Predikat</th>
                      <th className="border border-gray-400 px-3 py-2 text-left">Tahun Akademik</th>
                      <th className="border border-gray-400 px-3 py-2 text-left">Status Validasi</th>
                      <th className="border border-gray-400 px-3 py-2 text-left">Tanggal Verifikasi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr>
                        <td colSpan={9} className="px-3 py-3 text-center text-black">
                          Memuat data...
                        </td>
                      </tr>
                    ) : (
                      ijazahList.map((ijz, idx) => (
                        <tr key={ijz.id || idx}>
                          <td className="border border-gray-400 px-3 py-2">{idx + 1}</td>
                          <td className="border border-gray-400 px-3 py-2">
                            {ijz.mahasiswa?.nama || "-"}
                          </td>
                          <td className="border border-gray-400 px-3 py-2">
                            {ijz.mahasiswa?.nim || "-"}
                          </td>
                          <td className="border border-gray-400 px-3 py-2">
                            {ijz.mahasiswa?.prodi?.namaProdi || "-"}
                          </td>
                          <td className="border border-gray-400 px-3 py-2">
                            {formatIpk(ijz.ipk)}
                          </td>
                          <td className="border border-gray-400 px-3 py-2">
                            {resolvePredikat(ijz)}
                          </td>
                          <td className="border border-gray-400 px-3 py-2">
                            {resolveTahunAkademik(ijz)}
                          </td>
                          <td className="border border-gray-400 px-3 py-2">
                            {resolveStatus(ijz)}
                          </td>
                          <td className="border border-gray-400 px-3 py-2">
                            {formatDate(resolveTanggalVerifikasi(ijz))}
                          </td>
                        </tr>
                      ))
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
