"use client";

import { useEffect, useState } from "react";
import AppLayout from "../../../components/layout/AppLayout";
import RequireRole from "../../../components/auth/RequireRole";
import { apiGet } from "../../../lib/api";

function formatDate(dateStr) {
  if (!dateStr) return "-";
  try {
    return new Date(dateStr).toISOString().slice(0, 10);
  } catch {
    return dateStr;
  }
}

function StatusBadge({ status }) {
  if (!status) {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] bg-gray-100 text-gray-700">
        -
      </span>
    );
  }

  const s = status.toUpperCase();
  let base = "inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium";

  if (s === "SUCCESS" || s === "ONCHAIN" || s === "TERBIT") {
    return <span className={`${base} bg-green-100 text-green-700`}>{s}</span>;
  }
  if (s === "PENDING") {
    return <span className={`${base} bg-yellow-100 text-yellow-700`}>{s}</span>;
  }
  if (s === "FAILED" || s === "DIBATALKAN" || s === "DITOLAK") {
    return <span className={`${base} bg-red-100 text-red-700`}>{s}</span>;
  }
  return <span className={`${base} bg-gray-100 text-gray-700`}>{s}</span>;
}

export default function MahasiswaDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [ijazahList, setIjazahList] = useState([]);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);
      setErrorMsg("");

      const [profileRes, ijzRes] = await Promise.all([apiGet("/mahasiswa/me"), apiGet("/ijazah/me")]);

      setProfile(profileRes.data || null);
      setIjazahList(ijzRes.data || []);
    } catch (err) {
      console.error("Gagal load dashboard mahasiswa:", err);
      setErrorMsg(err.message || "Gagal memuat data dashboard mahasiswa.");
    } finally {
      setLoading(false);
    }
  }

  const prodi = profile?.prodi;

  return (
    <RequireRole allowedRoles={["MAHASISWA"]}>
      <AppLayout>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-semibold text-black">Dashboard Mahasiswa</h2>
            <p className="text-sm text-black">Lihat profil dan status ijazah Anda.</p>
          </div>
          <button type="button" onClick={loadData} className="px-3 py-2 rounded-md border text-xs">
            Refresh
          </button>
        </div>

        {errorMsg && (
          <div className="mb-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">
            {errorMsg}
          </div>
        )}

        {/* Profil Mahasiswa */}
        <section className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 mb-4 text-sm text-black">
          <h3 className="text-xs font-semibold text-black mb-3">Profil Mahasiswa</h3>
          {profile ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              <div className="space-y-1">
                <div className="flex">
                  <span className="w-28 text-black">Nama</span>
                  <span className="flex-1">{profile.nama || "-"}</span>
                </div>
                <div className="flex">
                  <span className="w-28 text-black">NIM</span>
                  <span className="flex-1">{profile.nim || "-"}</span>
                </div>
                <div className="flex">
                  <span className="w-28 text-black">Prodi</span>
                  <span className="flex-1">{prodi ? `${prodi.namaProdi} (${prodi.jenjang || ""})` : "-"}</span>
                </div>
                <div className="flex">
                  <span className="w-28 text-black">Tahun Masuk</span>
                  <span className="flex-1">{profile.tahunMasuk || "-"}</span>
                </div>
                <div className="flex">
                  <span className="w-28 text-black">Tahun Lulus</span>
                  <span className="flex-1">{profile.tahunLulus || "-"}</span>
                </div>
              </div>
              <div className="space-y-1">
                <div className="flex">
                  <span className="w-32 text-black">Tempat Lahir</span>
                  <span className="flex-1">{profile.tempatLahir || "-"}</span>
                </div>
                <div className="flex">
                  <span className="w-32 text-black">Tanggal Lahir</span>
                  <span className="flex-1">{profile.tanggalLahir ? formatDate(profile.tanggalLahir) : "-"}</span>
                </div>
                <p className="text-[11px] text-black mt-2">Jika terdapat ketidaksesuaian data, harap menghubungi bagian akademik / admin sistem.</p>
              </div>
            </div>
          ) : (
            <p className="text-xs text-black">Data profil tidak ditemukan.</p>
          )}
        </section>

        {/* Ijazah Saya */}
        <section className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 text-sm text-black">
          <h3 className="text-xs font-semibold text-black mb-3">Ijazah Saya</h3>

          {loading && <p className="text-xs text-black">Memuat data...</p>}

          {!loading && ijazahList.length === 0 && <p className="text-xs text-black">Belum ada ijazah yang terdaftar untuk akun ini.</p>}

          {ijazahList.length > 0 && (
            <div className="space-y-3">
              {ijazahList.map((ijz) => {
                const bc = ijz.blockchainRecord || (Array.isArray(ijz.blockchainRecords) && ijz.blockchainRecords[0]);
                const statusOnchain = bc?.statusOnchain || bc?.status || "BELUM_ONCHAIN";

                return (
                  <div key={ijz.id} className="border rounded-lg p-3 text-xs flex flex-col md:flex-row md:justify-between gap-3">
                    <div className="space-y-1">
                      <div className="font-medium text-black">{ijz.nomorIjazah || "Tanpa nomor ijazah"}</div>
                      <div className="text-black">
                        <span className="font-semibold">{profile?.nama || "-"}</span> · {prodi ? `${prodi.namaProdi} (${prodi.jenjang || ""})` : "-"}
                      </div>
                      <div className="flex gap-4">
                        <div>
                          <span className="text-black">Tanggal Lulus:</span> {ijz.tanggalLulus ? formatDate(ijz.tanggalLulus) : "-"}
                        </div>
                        <div>
                          <span className="text-black">IPK:</span> {typeof ijz.ipk === "number" ? ijz.ipk.toFixed(2) : ijz.ipk || "-"}
                        </div>
                      </div>
                      {ijz.judulTA && (
                        <div>
                          <span className="text-black">Judul TA:</span> {ijz.judulTA}
                        </div>
                      )}
                    </div>

                    <div className="space-y-2 md:text-right">
                      <div className="flex md:justify-end gap-2">
                        <StatusBadge status={statusOnchain} />
                      </div>
                      {bc?.txHash && <div className="text-[11px] text-black break-all">Tx: {bc.txHash}</div>}
                      {bc?.explorerUrl && (
                        <a href={bc.explorerUrl} target="_blank" rel="noreferrer" className="inline-flex items-center text-[11px] text-black hover:underline">
                          Lihat di blockchain explorer
                        </a>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </AppLayout>
    </RequireRole>
  );
}
