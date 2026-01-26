"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { apiGet } from "../../lib/api";

function formatDate(dateStr) {
  if (!dateStr) return "-";
  try {
    return new Date(dateStr).toISOString().slice(0, 10);
  } catch {
    return dateStr;
  }
}

function StatusPill({ label, variant = "default" }) {
  const base =
    "inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium";
  if (variant === "success") {
    return <span className={`${base} bg-green-100 text-green-700`}>{label}</span>;
  }
  if (variant === "error") {
    return <span className={`${base} bg-red-100 text-red-700`}>{label}</span>;
  }
  if (variant === "warning") {
    return <span className={`${base} bg-yellow-100 text-yellow-700`}>{label}</span>;
  }
  return <span className={`${base} bg-gray-100 text-gray-700`}>{label}</span>;
}

export default function VerifikasiPage() {
  const searchParams = useSearchParams();
  const [hashInput, setHashInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null); // blockchainRecord + ijazah
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    const hashFromUrl = searchParams.get("hash");
    if (hashFromUrl && !hashInput) {
      setHashInput(hashFromUrl);
      handleCheck(hashFromUrl, { fromEffect: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  async function handleSubmit(e) {
    e.preventDefault();
    await handleCheck(hashInput);
  }

  async function handleCheck(hashValue, opts = {}) {
    const val = (hashValue || "").trim();
    if (!val) {
      setErrorMsg("Hash ijazah wajib diisi.");
      setResult(null);
      return;
    }

    try {
      setLoading(true);
      setErrorMsg("");
      setResult(null);

      const res = await apiGet(`/verifikasi?hash=${encodeURIComponent(val)}`);
      setResult(res.data || null);
    } catch (err) {
      console.error("Gagal verifikasi:", err);
      setResult(null);
      setErrorMsg(err.message || "Gagal memverifikasi ijazah. Coba lagi.");
    } finally {
      setLoading(false);
    }
  }

  const ijazah = result?.ijazah || null;
  const mahasiswa = result?.mahasiswa || null;
  const prodi = mahasiswa?.prodi || null;

  const reason = result?.reason;
  const reasonMessage = (() => {
    if (!reason) return null;
    if (reason === "INVALID_HASH_FORMAT")
      return "Format hash tidak valid. Pastikan 0x + 64 karakter hex.";
    if (reason === "HASH_NOT_FOUND") return "Hash tidak ditemukan di sistem.";
    if (reason === "DATA_INCOMPLETE")
      return "Data ditemukan tapi tidak lengkap di database.";
    return `Verifikasi gagal: ${reason}`;
  })();

  const statusValidasi = ijazah?.statusValidasi || ijazah?.status;
  const statusOnchain = result?.blockchain?.statusOnchain || null;

  function renderStatusValidasi() {
    if (!statusValidasi) return <StatusPill label="BELUM DISET" />;
    const s = String(statusValidasi).toUpperCase();
    if (s === "TERVALIDASI") {
      return <StatusPill label="TERVALIDASI" variant="success" />;
    }
    if (s === "DITOLAK" || s === "DIBATALKAN") {
      return <StatusPill label={s} variant="error" />;
    }
    return <StatusPill label={s} variant="warning" />;
  }

  function renderStatusOnchain() {
    if (!statusOnchain) {
      return <StatusPill label="BELUM TERCATAT" />;
    }
    const s = String(statusOnchain).toUpperCase();
    if (s === "SUCCESS") {
      return <StatusPill label="SUCCESS" variant="success" />;
    }
    if (s === "PENDING") {
      return <StatusPill label="PENDING" variant="warning" />;
    }
    if (s === "FAILED") {
      return <StatusPill label="FAILED" variant="error" />;
    }
    return <StatusPill label={s} />;
  }

  const isValidIjazah = result?.valid === true;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="border-b border-slate-200 bg-white">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div>
            <h1 className="text-base font-semibold text-slate-900">
              Sistem Verifikasi Ijazah
            </h1>
            <p className="text-xs text-slate-500">
              Halaman verifikasi publik – cek keaslian ijazah melalui hash / QR Code.
            </p>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <div className="max-w-4xl mx-auto px-4 py-6 space-y-4">
          <section className="bg-white border border-slate-200 rounded-2xl shadow-sm p-4">
            <h2 className="text-sm font-semibold text-slate-900 mb-3">Masukkan Hash Ijazah</h2>

            <form onSubmit={handleSubmit} className="space-y-3 text-sm">
              <div className="space-y-1">
                <label htmlFor="hashIjazah" className="text-xs font-medium text-slate-700">
                  Hash Ijazah / Data dari QR Code
                </label>
                <input
                  id="hashIjazah"
                  type="text"
                  value={hashInput}
                  onChange={(e) => setHashInput(e.target.value)}
                  placeholder="contoh: 0x1a76b6... (hash ijazah)"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900"
                />
                <p className="text-[11px] text-slate-500">
                  Jika Anda membuka link dari QR Code, hash akan terisi otomatis dari URL.
                </p>
              </div>

              {errorMsg && (
                <div className="text-[11px] text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">
                  {errorMsg}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center px-3 py-2 rounded-lg text-xs font-medium border border-slate-900 text-slate-900 hover:bg-slate-900 hover:text-white disabled:opacity-60"
              >
                {loading ? "Memeriksa..." : "Periksa Ijazah"}
              </button>
            </form>
          </section>

          <section className="bg-white border border-slate-200 rounded-2xl shadow-sm p-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-slate-900">Hasil Verifikasi</h2>
              {result && (
                <div className="flex items-center gap-2">
                  <span className="text-slate-500 text-xs">Hash Input: </span>
                  <span className="font-mono text-xs break-all">{result.hashInput || "-"}</span>
                  <button
                    onClick={() => navigator.clipboard.writeText(result?.hashInput || "")}
                    className="px-2 py-1 rounded bg-gray-100 text-[10px] text-slate-700 hover:bg-gray-200"
                  >
                    Copy
                  </button>
                </div>
              )}
            </div>

            {isValidIjazah ? (
              <StatusPill label="IJAZAH DITEMUKAN & VALID" variant="success" />
            ) : result && !isValidIjazah && reasonMessage ? (
              <div className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">
                {reasonMessage}
              </div>
            ) : result && !isValidIjazah && !reasonMessage && !ijazah ? (
              <div className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">
                Data blockchain ditemukan tetapi data ijazah tidak lengkap di sistem.
              </div>
            ) : (
              <StatusPill label="BELUM ADA HASIL" />
            )}

            {!result && !errorMsg && (
              <p className="text-xs text-slate-500 mt-2">
                Masukkan hash ijazah lalu klik <span className="font-semibold">Periksa Ijazah</span>.
                Sistem akan menampilkan data ijazah jika hash terdaftar.
              </p>
            )}

            {isValidIjazah && (
              <div className="space-y-4 text-xs mt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <div className="text-[11px] text-slate-500">Nama Mahasiswa</div>
                    <div className="text-sm font-semibold">{mahasiswa?.nama || "-"}</div>

                    <div className="flex items-center gap-2 mt-1">
                      <StatusPill label={`NIM: ${mahasiswa?.nim || "-"}`} />
                      {renderStatusValidasi()}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="text-[11px] text-slate-500">Program Studi</div>
                    <div className="text-sm font-semibold">{prodi?.namaProdi || "-"}</div>
                    <div className="text-[11px] text-slate-500">{prodi?.jenjang || "-"}</div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-slate-100 pt-3">
                  <div className="space-y-1">
                    <div>
                      <span className="text-slate-500">Nomor Ijazah:</span>{" "}
                      <span className="font-mono">{ijazah.nomorIjazah || "-"}</span>
                    </div>
                    <div>
                      <span className="text-slate-500">Tanggal Lulus:</span>{" "}
                      {formatDate(ijazah.tanggalLulus)}
                    </div>
                    {typeof ijazah.ipk !== "undefined" && (
                      <div>
                        <span className="text-slate-500">IPK:</span>{" "}
                        {typeof ijazah.ipk === "number" ? ijazah.ipk.toFixed(2) : ijazah.ipk}
                      </div>
                    )}
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-slate-500">Status On-Chain:</span>
                      {renderStatusOnchain()}
                    </div>
                    <div>
                      <span className="text-slate-500">Hash Ijazah:</span>{" "}
                      <span className="font-mono break-all">{result?.blockchain?.ijazahHash || "-"}</span>
                    </div>
                    <div>
                      <span className="text-slate-500">Tx Hash:</span>{" "}
                      <span className="font-mono break-all">{result?.blockchain?.txHash || "-"}</span>
                    </div>
                    <div>
                      <span className="text-slate-500">Block #:</span> {result?.blockchain?.blockNumber ?? "-"}
                    </div>
                    <div>
                      <span className="text-slate-500">Network:</span> {result?.blockchain?.network || "-"}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {errorMsg && (
              <p className="mt-2 text-xs text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">
                {errorMsg}
              </p>
            )}
          </section>
        </div>
      </main>

      <footer className="border-t border-slate-200 bg-white">
        <div className="max-w-4xl mx-auto px-4 py-2">
          <p className="text-[10px] text-slate-500">
            Sistem Verifikasi Ijazah – data ijazah dikelola oleh institusi, hash dicatat di
            blockchain untuk keaslian.
          </p>
        </div>
      </footer>
    </div>
  );
}
