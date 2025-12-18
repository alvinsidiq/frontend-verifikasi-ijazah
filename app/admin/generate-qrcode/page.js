"use client";

import { useEffect, useState } from "react";
import AppLayout from "../../../components/layout/AppLayout";
import RequireRole from "../../../components/auth/RequireRole";
import { apiGet } from "../../../lib/api";
import QRCode from "react-qr-code";

function buildVerificationUrl(ijazahHash) {
  if (!ijazahHash) return "";
  if (typeof window !== "undefined") {
    return `${window.location.origin}/verifikasi?hash=${ijazahHash}`;
  }
  return `/verifikasi?hash=${ijazahHash}`;
}

export default function GenerateQrPage() {
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [ijazahList, setIjazahList] = useState([]);
  const [selectedIjazah, setSelectedIjazah] = useState(null);

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

  function handleSelect(ijz) {
    setSelectedIjazah(ijz);
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

  function renderSelectedInfo() {
    const ijazahHash = getIjazahHash(selectedIjazah);
    const verifUrl = buildVerificationUrl(ijazahHash);

    if (!ijazahHash) {
      return (
        <div className="text-sm text-black bg-red-50 border border-red-200 rounded px-3 py-2">
          Ijazah ini belum memiliki hash blockchain (ijazahHash). QR Code belum dapat dibuat. Pastikan proses pencatatan ke blockchain sudah dilakukan.
        </div>
      );
    }

    return (
      <>
        <div className="flex flex-col items-center gap-3">
          <div className="bg-white p-4 rounded-lg border inline-block">
            <QRCode value={verifUrl} size={180} />
          </div>
          <p className="text-xs text-black text-center">
            QR Code berisi URL verifikasi:
            <br />
            <span className="break-all">{verifUrl}</span>
          </p>
        </div>

        <div className="flex gap-2 text-xs">
          <button
            type="button"
            className="px-3 py-2 border border-black hover:bg-gray-50"
            onClick={() => {
              if (verifUrl) {
                navigator.clipboard.writeText(verifUrl).catch(() => {});
              }
            }}
          >
            Salin URL Verifikasi
          </button>
          <button
            type="button"
            className="px-3 py-2 border border-black hover:bg-gray-50"
            onClick={() => {
              window.print();
            }}
          >
            Cetak / Print QR
          </button>
        </div>
      </>
    );
  }

  return (
    <RequireRole allowedRoles={["ADMIN"]}>
      <AppLayout>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-semibold text-black">Generate QR Code Ijazah</h2>
            <p className="text-sm text-black">Pilih ijazah untuk menghasilkan QR Code verifikasi.</p>
          </div>
          <button type="button" onClick={loadData} className="px-3 py-2 text-xs border border-black">
            Refresh
          </button>
        </div>

        {errorMsg && (
          <div className="mb-3 text-sm text-black bg-red-50 border border-red-200 rounded px-3 py-2">
            {errorMsg}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <section className="bg-white border border-gray-400 text-black">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-400">
              <div>
                <h3 className="text-lg font-semibold tracking-wide">DAFTAR IJAZAH</h3>
                {loading && <span className="text-xs text-black">Memuat...</span>}
              </div>
            </div>

            <div className="p-4">
              {ijazahList.length === 0 && !loading ? (
                <p className="text-sm text-black">Belum ada data ijazah.</p>
              ) : (
                <div className="overflow-x-auto border border-gray-400">
                  <table className="w-full text-xs border-collapse">
                    <thead>
                      <tr className="bg-black text-white">
                        <th className="border border-gray-400 px-3 py-2 text-left w-12">ID</th>
                        <th className="border border-gray-400 px-3 py-2 text-left">Nomor Ijazah</th>
                        <th className="border border-gray-400 px-3 py-2 text-left">NIM</th>
                        <th className="border border-gray-400 px-3 py-2 text-left">Nama</th>
                        <th className="border border-gray-400 px-3 py-2 text-left w-24">Aksi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {loading ? (
                        <tr>
                          <td colSpan={5} className="px-3 py-2 text-center text-black">
                            Memuat data...
                          </td>
                        </tr>
                      ) : (
                        ijazahList.map((ijz) => (
                          <tr key={ijz.id}>
                            <td className="border border-gray-400 px-3 py-2">{ijz.id}</td>
                            <td className="border border-gray-400 px-3 py-2">{ijz.nomorIjazah || "-"}</td>
                            <td className="border border-gray-400 px-3 py-2">{ijz.mahasiswa?.nim || "-"}</td>
                            <td className="border border-gray-400 px-3 py-2">{ijz.mahasiswa?.nama || "-"}</td>
                            <td className="border border-gray-400 px-3 py-2">
                              <button
                                type="button"
                                onClick={() => handleSelect(ijz)}
                                className="px-2 py-1 text-[11px] border border-black"
                              >
                                Pilih
                              </button>
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

          <section className="bg-white border border-gray-400 text-black">
            <div className="px-4 py-3 border-b border-gray-400">
              <h3 className="text-lg font-semibold tracking-wide">PREVIEW QR CODE</h3>
            </div>
            <div className="p-4 space-y-4">
              {!selectedIjazah ? (
                <p className="text-sm text-black">Pilih salah satu ijazah di tabel untuk melihat QR Code.</p>
              ) : (
                <>
                  <div className="border rounded-lg p-3 text-sm bg-gray-50 text-black">
                    <p>
                      <span className="font-medium">Nomor Ijazah:</span> {selectedIjazah.nomorIjazah || "-"}
                    </p>
                    <p>
                      <span className="font-medium">NIM:</span> {selectedIjazah.mahasiswa?.nim || "-"}
                    </p>
                    <p>
                      <span className="font-medium">Nama:</span> {selectedIjazah.mahasiswa?.nama || "-"}
                    </p>
                    <p>
                      <span className="font-medium">Program Studi:</span> {selectedIjazah.mahasiswa?.prodi?.namaProdi || "-"}
                    </p>
                  </div>

                  {renderSelectedInfo()}
                </>
              )}
            </div>
          </section>
        </div>
      </AppLayout>
    </RequireRole>
  );
}
