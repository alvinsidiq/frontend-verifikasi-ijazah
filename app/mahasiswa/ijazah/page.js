"use client";

import { useEffect, useMemo, useState } from "react";
import AppLayout from "../../../components/layout/AppLayout";
import RequireRole from "../../../components/auth/RequireRole";
import { apiGet } from "../../../lib/api";
import { getAuth } from "../../../lib/auth";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL;
const API_URL = process.env.NEXT_PUBLIC_API_URL || API_BASE;

function formatDate(dateStr) {
  if (!dateStr) return "-";
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
}

function formatIpk(ipk) {
  if (typeof ipk === "number") return ipk.toFixed(2);
  return ipk || "-";
}

function resolvePredikat(ijz) {
  return ijz?.predikat || ijz?.predikatKelulusan || ijz?.predikatKelulusanText || "-";
}

function resolveStatusValidasi(ijz) {
  return ijz?.statusValidasi || ijz?.status || "-";
}

function getIjazahHash(ijz) {
  if (!ijz) return null;
  if (ijz.ijazahHash) return ijz.ijazahHash;
  if (ijz.blockchainRecord?.ijazahHash) return ijz.blockchainRecord.ijazahHash;
  if (Array.isArray(ijz.blockchainRecords) && ijz.blockchainRecords.length > 0) {
    return ijz.blockchainRecords[0].ijazahHash;
  }
  return null;
}

function buildVerificationUrl(hash) {
  if (!hash) return null;
  if (typeof window !== "undefined") {
    return `${window.location.origin}/verifikasi?hash=${hash}`;
  }
  return `/verifikasi?hash=${hash}`;
}

function getDownloadUrl(ijz) {
  if (!ijz) return null;

  // Prioritas: endpoint download resmi (Pilihan A: buka tab baru)
  if (ijz.id && API_URL) {
    return `${API_URL}/api/ijazah/${ijz.id}/download`;
  }

  // Fallback pakai URL yang mungkin sudah disediakan oleh API
  const urlFromData = ijz.fileUrl || ijz.fileIjazahUrl || ijz.file;
  if (urlFromData) {
    if (API_BASE && urlFromData.startsWith("/")) {
      return `${API_BASE}${urlFromData}`;
    }
    return urlFromData;
  }

  return null;
}

function getBlockchainRecord(ijz) {
  if (!ijz) return null;
  if (ijz.blockchainRecord) return ijz.blockchainRecord;
  if (Array.isArray(ijz.blockchainRecords) && ijz.blockchainRecords.length > 0) {
    return ijz.blockchainRecords[0];
  }
  return null;
}

function IjazahPreviewCard({ kampusName, ijazah, mahasiswa, prodi, blockchain }) {
  if (!ijazah) {
    return (
      <div className="border border-dashed border-gray-400 rounded-xl p-6 text-sm text-black">
        Pilih ijazah untuk melihat pratinjau.
      </div>
    );
  }

  const tahunLulus = ijazah?.tanggalLulus ? new Date(ijazah.tanggalLulus).getFullYear() : "-";
  const ipk = typeof ijazah?.ipk === "number" ? ijazah.ipk.toFixed(2) : ijazah?.ipk || "-";
  const predikat = resolvePredikat(ijazah);
  const hash = getIjazahHash(ijazah);

  return (
    <div className="bg-white rounded-2xl border border-gray-400 shadow-sm p-5 flex flex-col text-black">
      <div className="flex items-center justify-between mb-2 text-[11px] text-black">
        <span>Preview Ijazah</span>
        <span>Ukuran: A4 (210 × 297 mm)</span>
      </div>

      <div className="flex-1 flex justify-center items-center">
        <div className="bg-white border border-gray-400 shadow-sm rounded-xl px-10 py-8 w-[580px] h-[780px] relative">
          <div className="text-center mb-6">
            <div className="text-[11px] tracking-[0.24em] text-black uppercase">
              {kampusName || "Nama Perguruan Tinggi"}
            </div>
            <div className="text-lg font-semibold tracking-[0.15em] text-black mt-2">
              IJAZAH SARJANA ({prodi?.jenjang || "S1"})
            </div>
            <div className="mt-1 text-[11px] text-black">
              Nomor: {ijazah?.nomorIjazah || "-"}
            </div>
          </div>

          <div className="text-center text-[11px] text-black mb-5">
            Dengan ini menyatakan bahwa:
          </div>

          <div className="flex gap-6">
            <div className="flex-1 text-[11px]">
              <div className="flex mb-1">
                <div className="w-24 text-black">Nama</div>
                <div className="flex-1 font-semibold text-black">
                  {mahasiswa?.nama || mahasiswa?.name || "-"}
                </div>
              </div>
              <div className="flex mb-1">
                <div className="w-24 text-black">NIM</div>
                <div className="flex-1">{mahasiswa?.nim || "-"}</div>
              </div>
              <div className="flex mb-1">
                <div className="w-24 text-black">Program Studi</div>
                <div className="flex-1">{prodi?.namaProdi || prodi?.nama || "-"}</div>
              </div>
              <div className="flex mb-1">
                <div className="w-24 text-black">IPK</div>
                <div className="flex-1">{ipk}</div>
              </div>
              <div className="flex mb-1">
                <div className="w-24 text-black">Predikat</div>
                <div className="flex-1">{predikat}</div>
              </div>
              <div className="flex mb-1">
                <div className="w-24 text-black">Tahun Lulus</div>
                <div className="flex-1">{tahunLulus}</div>
              </div>
            </div>

            {/* area QR / verifikasi */}
            <div className="w-32 h-40 border border-gray-400 rounded-md flex flex-col justify-center items-center text-[10px] text-black">
              <div className="uppercase tracking-[0.15em] text-black mb-1">
                Verifikasi
              </div>
              <div className="w-20 h-20 border border-dashed border-gray-400 rounded" />
              <div className="mt-2 text-center px-1">
                Scan QR untuk verifikasi
              </div>
            </div>
          </div>

          <div className="mt-6 text-[10px] text-black leading-relaxed">
            Berhak memperoleh ijazah Sarjana dan semua hak yang melekat
            padanya. Ditetapkan di Denpasar pada tanggal{" "}
            {ijazah?.tanggalLulus ? formatDate(ijazah.tanggalLulus) : "-"}.
          </div>

          <div className="absolute bottom-16 left-0 right-0 px-10 flex justify-between text-[10px] mt-6">
            <div className="text-center">
              <div>Kepala Perguruan Tinggi</div>
              <div className="mt-10 font-semibold">
                {ijazah?.namaPenandatangan1 || "[Nama Pejabat 1]"}
              </div>
            </div>
            <div className="text-center">
              <div>Wakil Ketua I Bidang Akademik</div>
              <div className="mt-10 font-semibold">
                {ijazah?.namaPenandatangan2 || "[Nama Pejabat 2]"}
              </div>
            </div>
          </div>

          {/* Info blockchain kecil di kanan bawah */}
          <div className="absolute bottom-4 right-6 text-[9px] text-black text-right">
            <div>Contract: {blockchain?.contractAddress || "-"}</div>
            <div>Hash: {blockchain?.ijazahHash || blockchain?.txHash || "-"}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function IjazahInfoPanel({ kampusName, ijazah, mahasiswa, prodi, blockchain }) {
  const tahunLulus = ijazah?.tanggalLulus ? new Date(ijazah.tanggalLulus).getFullYear() : "";
  const ipk = typeof ijazah?.ipk === "number" ? ijazah.ipk.toFixed(2) : ijazah?.ipk || "";

  return (
    <div className="bg-white rounded-2xl border border-gray-400 shadow-sm p-4 text-xs w-full max-w-xs text-black">
      <div className="flex items-center justify-between mb-3">
        <div>
          <div className="text-[11px] font-semibold text-black">
            Editor Template
          </div>
          <div className="text-[10px] text-black">
            Mode baca (hanya untuk preview)
          </div>
        </div>
        <div className="flex flex-col items-end gap-1">
          <span className="inline-flex px-2 py-1 border border-gray-300 rounded-lg text-[10px]">
            Tema: Default
          </span>
          <span className="inline-flex px-2 py-1 border border-gray-300 rounded-lg text-[10px]">
            Aksen: Indigo
          </span>
        </div>
      </div>

      <div className="space-y-4">
        {/* Identitas kampus */}
        <section>
          <div className="text-[10px] font-semibold text-black mb-1">
            Identitas Kampus & Dokumen
          </div>
          <div className="space-y-1">
            <input
              readOnly
              className="w-full rounded-md border border-gray-300 px-2 py-1 text-[11px] bg-white text-black"
              value={kampusName || ""}
            />
            <input
              readOnly
              className="w-full rounded-md border border-gray-300 px-2 py-1 text-[11px] bg-white text-black"
              value={ijazah?.judulIjazah || "IJAZAH SARJANA (S1)"}
            />
            <div className="flex gap-2">
              <input
                readOnly
                className="flex-1 rounded-md border border-gray-300 px-2 py-1 text-[11px] bg-white text-black"
                value={ijazah?.nomorIjazah || ""}
              />
              <input
                readOnly
                className="w-20 rounded-md border border-gray-300 px-2 py-1 text-[11px] bg-white text-black"
                value={tahunLulus || ""}
              />
            </div>
          </div>
        </section>

        {/* Data mahasiswa */}
        <section>
          <div className="text-[10px] font-semibold text-black mb-1">
            Data Mahasiswa
          </div>
          <div className="space-y-1">
            <input
              readOnly
              className="w-full rounded-md border border-gray-300 px-2 py-1 text-[11px] bg-white text-black"
              value={mahasiswa?.nama || mahasiswa?.name || ""}
            />
            <div className="flex gap-2">
              <input
                readOnly
                className="flex-1 rounded-md border border-gray-300 px-2 py-1 text-[11px] bg-white text-black"
                value={mahasiswa?.nim || ""}
              />
              <input
                readOnly
                className="flex-1 rounded-md border border-gray-300 px-2 py-1 text-[11px] bg-white text-black"
                value={prodi?.namaProdi || prodi?.nama || ""}
              />
            </div>
            <div className="flex gap-2">
              <input
                readOnly
                className="flex-1 rounded-md border border-gray-300 px-2 py-1 text-[11px] bg-white text-black"
                value={ipk}
              />
              <input
                readOnly
                className="flex-1 rounded-md border border-gray-300 px-2 py-1 text-[11px] bg-white text-black"
                value={ijazah?.predikat || ijazah?.predikatKelulusan || ""}
              />
            </div>
            <input
              readOnly
              className="w-full rounded-md border border-gray-300 px-2 py-1 text-[11px] bg-white text-black"
              value={ijazah?.tanggalLulus ? formatDate(ijazah.tanggalLulus) : ""}
            />
          </div>
        </section>

        {/* Penandatangan */}
        <section>
          <div className="text-[10px] font-semibold text-black mb-1">
            Penandatangan
          </div>
          <div className="space-y-1">
            <input
              readOnly
              className="w-full rounded-md border border-gray-300 px-2 py-1 text-[11px] bg-white text-black"
              value={ijazah?.namaPenandatangan1 || "Ketua STMIK Bandung Bali"}
            />
            <input
              readOnly
              className="w-full rounded-md border border-gray-300 px-2 py-1 text-[11px] bg-white text-black"
              value={ijazah?.namaPenandatangan2 || "Wakil Ketua I Bidang Akademik"}
            />
          </div>
        </section>

        {/* Blockchain */}
        <section>
          <div className="text-[10px] font-semibold text-black mb-1">
            Informasi Blockchain
          </div>
          <div className="space-y-1">
            <input
              readOnly
              className="w-full rounded-md border border-gray-300 px-2 py-1 text-[11px] font-mono bg-white text-black"
              value={blockchain?.contractAddress || ""}
            />
            <input
              readOnly
              className="w-full rounded-md border border-gray-300 px-2 py-1 text-[11px] font-mono bg-white text-black"
              value={blockchain?.ijazahHash || blockchain?.txHash || ""}
            />
          </div>
        </section>

        <button
          type="button"
          className="w-full mt-2 text-[11px] border border-slate-300 rounded-full py-1 hover:bg-slate-100"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        >
          Ke Atas
        </button>
      </div>
    </div>
  );
}

function MahasiswaIjazahPageInner() {
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [ijazahList, setIjazahList] = useState([]);
  const [profile, setProfile] = useState(null);
  const [selectedId, setSelectedId] = useState(null);
  const [downloadingId, setDownloadingId] = useState(null);
  const selectedIjazah = useMemo(() => {
    if (selectedId) {
      return ijazahList.find((item) => item.id === selectedId) || null;
    }
    return ijazahList[0] || null;
  }, [ijazahList, selectedId]);

  const blockchain = useMemo(() => getBlockchainRecord(selectedIjazah), [selectedIjazah]);
  const prodi =
    selectedIjazah?.mahasiswa?.prodi ||
    selectedIjazah?.mahasiswa?.programStudi ||
    profile?.prodi ||
    null;
  const kampusName =
    selectedIjazah?.kampusName ||
    selectedIjazah?.namaKampus ||
    selectedIjazah?.namaPerguruanTinggi ||
    process.env.NEXT_PUBLIC_KAMPUS_NAME ||
    "STMIK Bandung Bali";

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);
      setErrorMsg("");

      const [profileRes, ijRes] = await Promise.all([apiGet("/mahasiswa/me"), apiGet("/ijazah/me")]);

      setProfile(profileRes?.data ?? profileRes ?? null);

      const ijRaw = ijRes?.data ?? ijRes ?? null;
      const list = Array.isArray(ijRaw) ? ijRaw : ijRaw ? [ijRaw] : [];
      setIjazahList(list);
      setSelectedId((prev) => prev ?? (list[0]?.id || null));
    } catch (err) {
      console.error("Gagal memuat ijazah mahasiswa:", err);
      setErrorMsg(err.message || "Gagal memuat ijazah Anda.");
    } finally {
      setLoading(false);
    }
  }

  function handlePreview(ijz) {
    setSelectedId(ijz?.id || null);
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  function handleDownload(ijz) {
    const target = getDownloadUrl(ijz);
    if (!target) {
      window.alert("Link unduhan ijazah belum tersedia.");
      return;
    }

    const auth = getAuth();
    const token = auth?.token || localStorage.getItem("token");

    setDownloadingId(ijz?.id || null);
    setErrorMsg("");

    fetch(target, {
      method: "GET",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
      .then(async (res) => {
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.message || "Gagal download ijazah.");
        }
        return res.blob();
      })
      .then((blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${ijz?.nomorIjazah || ijz?.id || "ijazah"}.pdf`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
      })
      .catch((err) => {
        console.error("Gagal download ijazah:", err);
        window.alert(err.message || "Gagal download ijazah.");
      })
      .finally(() => setDownloadingId(null));
  }

  return (
    <AppLayout>
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-xl font-semibold text-black">Ijazah Saya</h2>
          <p className="text-sm text-black">
            Daftar ijazah yang terdaftar untuk akun ini. Gunakan aksi untuk melihat atau mengunduh PDF.
          </p>
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

      <section className="bg-white border border-gray-400 rounded-xl shadow-sm text-sm text-black">
        <div className="px-4 py-3 border-b border-gray-400">
          <h3 className="text-xs font-semibold text-black">Daftar Ijazah</h3>
          {loading && <p className="text-[11px] text-black mt-1">Memuat data...</p>}
        </div>

        <div className="overflow-x-auto border border-gray-400">
          <table className="w-full text-xs border-collapse text-black">
            <thead>
              <tr className="bg-black text-white">
                <th className="px-3 py-2 text-left border border-gray-400">No</th>
                <th className="px-3 py-2 text-left border border-gray-400">Nomor Ijazah</th>
                <th className="px-3 py-2 text-left border border-gray-400">Nama</th>
                <th className="px-3 py-2 text-left border border-gray-400">NIM</th>
                <th className="px-3 py-2 text-left border border-gray-400">Program Studi</th>
                <th className="px-3 py-2 text-left border border-gray-400">IPK</th>
                <th className="px-3 py-2 text-left border border-gray-400">Predikat</th>
                <th className="px-3 py-2 text-left border border-gray-400">Tanggal Lulus</th>
                <th className="px-3 py-2 text-left border border-gray-400">Status</th>
                <th className="px-3 py-2 text-left border border-gray-400">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={10} className="px-3 py-3 text-center text-black border border-gray-400">
                    Memuat data ijazah...
                  </td>
                </tr>
              ) : ijazahList.length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-3 py-3 text-center text-black border border-gray-400">
                    Belum ada ijazah terdaftar untuk akun ini.
                  </td>
                </tr>
              ) : (
                ijazahList.map((ijz, idx) => {
                  const nama = ijz?.mahasiswa?.nama || profile?.nama || "-";
                  const nim = ijz?.mahasiswa?.nim || profile?.nim || "-";
                  const prodi = ijz?.mahasiswa?.prodi || profile?.prodi;
                  const prodiText = prodi ? `${prodi.namaProdi || prodi.nama || "-"}${prodi.jenjang ? ` (${prodi.jenjang})` : ""}` : "-";
                  const hash = getIjazahHash(ijz);
                  const status = resolveStatusValidasi(ijz);

                  return (
                    <tr key={ijz.id || idx} className="border border-gray-400">
                      <td className="px-3 py-2 border border-gray-400">{idx + 1}</td>
                      <td className="px-3 py-2 border border-gray-400">{ijz.nomorIjazah || "-"}</td>
                      <td className="px-3 py-2 border border-gray-400">{nama}</td>
                      <td className="px-3 py-2 border border-gray-400">{nim}</td>
                      <td className="px-3 py-2 border border-gray-400">{prodiText}</td>
                      <td className="px-3 py-2 border border-gray-400">{formatIpk(ijz.ipk)}</td>
                      <td className="px-3 py-2 border border-gray-400">{resolvePredikat(ijz)}</td>
                      <td className="px-3 py-2 border border-gray-400">{ijz.tanggalLulus ? formatDate(ijz.tanggalLulus) : "-"}</td>
                      <td className="px-3 py-2 border border-gray-400">{status}</td>
                      <td className="px-3 py-2 border border-gray-400">
                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            className="px-3 py-1 border border-gray-400 rounded-md text-[11px] hover:bg-gray-100 text-black"
                            onClick={() => handlePreview(ijz)}
                          >
                            Lihat
                          </button>
                          <button
                            type="button"
                            className="px-3 py-1 border border-black bg-black text-white rounded-md text-[11px] hover:bg-gray-900 disabled:opacity-50"
                            onClick={() => handleDownload(ijz)}
                            disabled={downloadingId === ijz.id}
                          >
                            {downloadingId === ijz.id ? "Mengunduh..." : "Download PDF"}
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
      </section>

      <section className="mt-4">
        <div className="grid lg:grid-cols-[2fr_1fr] gap-4">
          <IjazahPreviewCard
            kampusName={kampusName}
            ijazah={selectedIjazah}
            mahasiswa={selectedIjazah?.mahasiswa || profile}
            prodi={prodi}
            blockchain={blockchain}
          />
          <div className="hidden lg:block">
            <IjazahInfoPanel
              kampusName={kampusName}
              ijazah={selectedIjazah}
              mahasiswa={selectedIjazah?.mahasiswa || profile}
              prodi={prodi}
              blockchain={blockchain}
            />
          </div>
        </div>
      </section>
    </AppLayout>
  );
}

export default function MahasiswaIjazahPage() {
  return (
    <RequireRole allowedRoles={["MAHASISWA"]}>
      <MahasiswaIjazahPageInner />
    </RequireRole>
  );
}
