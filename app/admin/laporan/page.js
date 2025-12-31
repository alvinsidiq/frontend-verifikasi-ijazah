"use client";

import { useEffect, useRef, useState } from "react";
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

function resolvePredikat(ijazah) {
  if (!ijazah) return "-";
  const direct =
    ijazah.predikatKelulusan ||
    ijazah.predikat ||
    ijazah.predikatKelulusanText;
  if (direct) return direct;

  const ipk = typeof ijazah.ipk === "number" ? ijazah.ipk : null;
  if (ipk === null) return "-";
  if (ipk >= 3.51) return "Dengan Pujian";
  if (ipk >= 3.01) return "Sangat Memuaskan";
  if (ipk >= 2.76) return "Memuaskan";
  return "Lulus";
}

function resolveStatusValidasi(ijazah) {
  return ijazah.statusValidasi || ijazah.status || "-";
}

export default function LaporanIjazahPage() {
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [ijazahList, setIjazahList] = useState([]);
  const [lastUpdated, setLastUpdated] = useState(null);
  const tableRef = useRef(null);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);
      setErrorMsg("");
      const res = await apiGet("/ijazah");
      setIjazahList(res.data || []);
      setLastUpdated(new Date());
    } catch (err) {
      console.error("Gagal memuat laporan ijazah:", err);
      setErrorMsg(err.message || "Gagal memuat laporan ijazah.");
    } finally {
      setLoading(false);
    }
  }

  function handleDownloadPdf() {
    if (!tableRef.current) return;

    const printWindow = window.open("", "_blank", "width=1200,height=900");
    if (!printWindow) {
      alert("Izinkan pop-up untuk mengunduh laporan sebagai PDF.");
      return;
    }

    const styles = `
      * { font-family: Arial, sans-serif; box-sizing: border-box; }
      body { color: #000; padding: 24px; }
      h2 { margin: 0 0 12px 0; letter-spacing: 0.2px; }
      table { width: 100%; border-collapse: collapse; margin-top: 12px; }
      th, td { border: 1px solid #000; padding: 8px 10px; font-size: 12px; }
      th { background: #000; color: #fff; text-align: left; }
      .meta { display: flex; justify-content: space-between; align-items: center; font-size: 12px; }
    `;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Laporan Ijazah</title>
          <style>${styles}</style>
        </head>
        <body>
          ${tableRef.current.innerHTML}
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
  }

  return (
    <RequireRole allowedRoles={["ADMIN"]}>
      <AppLayout>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
          <div>
            <h2 className="text-xl font-semibold text-black">Laporan Ijazah</h2>
            <p className="text-sm text-black">
              Rekap ijazah mahasiswa beserta status validasinya.
            </p>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={loadData}
              className="px-3 py-2 text-xs border border-black bg-white text-black hover:bg-gray-50"
            >
              Refresh
            </button>
            <button
              type="button"
              onClick={handleDownloadPdf}
              className="px-4 py-2 text-xs border border-black bg-black text-white hover:bg-gray-900"
            >
              Download PDF
            </button>
          </div>
        </div>

        <section className="bg-white border border-gray-400 text-black">
          <div className="px-4 py-3 border-b border-gray-400 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold tracking-wide">LAPORAN IJAZAH</h3>
              {loading && <span className="text-xs">Memuat data...</span>}
            </div>
            <div className="text-[11px] text-gray-700">
              {lastUpdated ? `Diperbarui ${formatDate(lastUpdated)}` : "Menunggu data"}
            </div>
          </div>

          {errorMsg && (
            <div className="px-4 py-3 border-b border-gray-400">
              <div className="text-sm text-black bg-red-50 border border-red-200 rounded px-3 py-2">
                {errorMsg}
              </div>
            </div>
          )}

          <div className="p-4" ref={tableRef}>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-base font-semibold">Laporan Ijazah</h4>
              <div className="text-xs text-gray-700">
                Total data: {ijazahList.length}
              </div>
            </div>

            {ijazahList.length === 0 && !loading ? (
              <p className="text-sm text-black">
                Belum ada data ijazah untuk ditampilkan.
              </p>
            ) : (
              <div className="overflow-x-auto border border-gray-400">
                <table className="w-full text-xs border-collapse">
                  <thead>
                    <tr className="bg-black text-white">
                      <th className="border border-gray-400 px-3 py-2 text-left w-12">No</th>
                      <th className="border border-gray-400 px-3 py-2 text-left">Nama Mahasiswa</th>
                      <th className="border border-gray-400 px-3 py-2 text-left">NIM</th>
                      <th className="border border-gray-400 px-3 py-2 text-left">No Ijazah</th>
                      <th className="border border-gray-400 px-3 py-2 text-left">IPK</th>
                      <th className="border border-gray-400 px-3 py-2 text-left">Predikat</th>
                      <th className="border border-gray-400 px-3 py-2 text-left">Status Validasi</th>
                      <th className="border border-gray-400 px-3 py-2 text-left">Tanggal Lulus</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr>
                        <td colSpan={8} className="px-3 py-3 text-center text-black">
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
                            {ijz.nomorIjazah || "-"}
                          </td>
                          <td className="border border-gray-400 px-3 py-2">
                            {formatIpk(ijz.ipk)}
                          </td>
                          <td className="border border-gray-400 px-3 py-2">
                            {resolvePredikat(ijz)}
                          </td>
                          <td className="border border-gray-400 px-3 py-2">
                            {resolveStatusValidasi(ijz)}
                          </td>
                          <td className="border border-gray-400 px-3 py-2">
                            {formatDate(ijz.tanggalLulus)}
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
