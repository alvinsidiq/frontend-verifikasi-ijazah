"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import AppLayout from "../../../components/layout/AppLayout";
import RequireRole from "../../../components/auth/RequireRole";
import { apiGet, apiDelete, apiPost } from "../../../lib/api";
import WalletConnectButton from "../../../components/WalletConnectButton";
import { useWeb3 } from "../../../context/Web3Context";
import { getIjazahContract } from "../../../lib/ijazahContract";
import { buildInputIjazahFromDb } from "../../../lib/ijazahMapper";
import { sendTx } from "../../../lib/tx";

async function fetchNomorHash(nomorIjazah) {
  const res = await apiGet(`/ijazah/hash-nomor?nomor=${encodeURIComponent(nomorIjazah)}`);
  return res.data?.hash; // "0x..."
}

function formatDate(dateString) {
  if (!dateString) return "-";
  try {
    return new Date(dateString).toISOString().slice(0, 10);
  } catch {
    return dateString;
  }
}

function StatusBadge({ status }) {
  const s = (status || "").toUpperCase();
  const base =
    "inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium";

  if (s === "DRAFT") {
    return (
      <span className={`${base} bg-yellow-100 text-yellow-700`}>
        DRAFT
      </span>
    );
  }

  if (s === "APPROVED_ADMIN") {
    return (
      <span className={`${base} bg-blue-100 text-blue-700`}>
        Disetujui Admin (1/2)
      </span>
    );
  }

  if (s === "TERVALIDASI") {
    return (
      <span className={`${base} bg-green-100 text-green-700`}>
        TERVALIDASI (2/2)
      </span>
    );
  }

  if (s === "DITOLAK_ADMIN" || s === "DITOLAK_VALIDATOR") {
    return (
      <span className={`${base} bg-red-100 text-red-700`}>
        {s.replace("_", " ")}
      </span>
    );
  }

  return (
    <span className={`${base} bg-gray-100 text-gray-700`}>
      {s || "-"}
    </span>
  );
}

function OnchainBadge({ statusOnchain }) {
  if (!statusOnchain) {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] bg-gray-100 text-gray-600">
        BELUM
      </span>
    );
  }

  const s = statusOnchain.toUpperCase();
  const base =
    "inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium";

  if (s === "SUCCESS") {
    return <span className={`${base} bg-green-100 text-green-700`}>SUCCESS</span>;
  }
  if (s === "PENDING") {
    return <span className={`${base} bg-yellow-100 text-yellow-700`}>PENDING</span>;
  }
  if (s === "FAILED") {
    return <span className={`${base} bg-red-100 text-red-700`}>FAILED</span>;
  }
  return <span className={`${base} bg-gray-100 text-gray-700`}>{s}</span>;
}

function IpfsBadge({ status }) {
  const s = (status || "NOT_UPLOADED").toString().toUpperCase();
  const base = "px-2 py-1 rounded text-[11px] font-semibold";

  if (s === "READY") {
    return <span className={`${base} bg-green-100 text-green-700`}>IPFS READY</span>;
  }
  if (s === "UPLOADING") {
    return <span className={`${base} bg-blue-100 text-blue-700`}>UPLOADING</span>;
  }
  if (s === "FAILED") {
    return <span className={`${base} bg-red-100 text-red-700`}>FAILED</span>;
  }
  return <span className={`${base} bg-gray-100 text-gray-700`}>NOT UPLOADED</span>;
}

const STATUS_OPTIONS = [
  { value: "", label: "Semua" },
  { value: "DRAFT", label: "Draft" },
  { value: "APPROVED_ADMIN", label: "Menunggu Validator" },
  { value: "TERVALIDASI", label: "Tervalidasi" },
  { value: "DITOLAK_ADMIN", label: "Ditolak Admin" },
  { value: "DITOLAK_VALIDATOR", label: "Ditolak Validator" },
];

export default function IjazahPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { address, isOnMonad, provider } = useWeb3();

  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [listIjazah, setListIjazah] = useState([]);
  const [publishingId, setPublishingId] = useState(null);
  const [statusFilter, setStatusFilter] = useState("");
  const [qrOpen, setQrOpen] = useState(false);
  const [qrValue, setQrValue] = useState("");

  useEffect(() => {
    loadData();
  }, [statusFilter]);

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
      const q = statusFilter ? `?status=${encodeURIComponent(statusFilter)}` : "";
      const res = await apiGet(`/ijazah${q}`);
      setListIjazah(res.data || []);
    } catch (err) {
      console.error("Gagal load ijazah:", err);
      setErrorMsg(err.message || "Gagal memuat data ijazah.");
    } finally {
      setLoading(false);
      setPublishingId(null);
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

  async function handleAdminApprove(ijazah) {
    const ok = window.confirm(`Validasi Admin untuk ijazah ${ijazah.nomorIjazah}?`);
    if (!ok) return;

    try {
      setErrorMsg("");
      setSuccessMsg("");
      await apiPost(`/ijazah/${ijazah.id}/validasi/admin-approve`, {});
      await loadData();
      setSuccessMsg("Berhasil validasi Admin (1/2).");
    } catch (err) {
      console.error("Gagal validasi admin:", err);
      const msg = err.message || "Gagal validasi Admin";
      setErrorMsg(msg);
      window.alert(msg);
    }
  }

  async function handleAdminReject(ijazah) {
    const ok = window.confirm(`Tolak (Admin) ijazah ${ijazah.nomorIjazah}?`);
    if (!ok) return;

    try {
      setErrorMsg("");
      setSuccessMsg("");
      await apiPost(`/ijazah/${ijazah.id}/validasi/admin-reject`, {});
      await loadData();
      setSuccessMsg("Ijazah ditolak oleh Admin.");
    } catch (err) {
      console.error("Gagal tolak admin:", err);
      const msg = err.message || "Gagal menolak ijazah (Admin)";
      setErrorMsg(msg);
      window.alert(msg);
    }
  }

  async function handleCreateOnChain(ijz) {
    try {
      if (!provider) {
        window.alert("MetaMask belum terdeteksi.");
        return;
      }
      if (!address) {
        window.alert("Wallet belum connect. Klik Connect Wallet dulu.");
        return;
      }
      if (!isOnMonad) {
        window.alert("Silakan switch ke Monad Testnet dulu.");
        return;
      }

      const ipfsStatus = (ijz.ipfsStatus || "NOT_UPLOADED").toString().toUpperCase();
      if (!ijz.ipfsUri || ipfsStatus !== "READY") {
        window.alert("IPFS belum READY. Upload IPFS dulu.");
        return;
      }

      const signer = await provider.getSigner();
      const contract = getIjazahContract(signer);
      const input = buildInputIjazahFromDb(ijz);

      if (!input.nomorIjazah) throw new Error("nomorIjazah kosong");
      if (!input.linkIjazah.startsWith("ipfs://")) {
        throw new Error("linkIjazah harus ipfs://CID");
      }

      const { tx } = await sendTx(contract.buatIjazah(input), {
        onHash: (h) => console.log("txHash buatIjazah:", h),
      });

      window.alert(`Sukses buatIjazah on-chain.\\nTx: ${tx.hash}`);
    } catch (e) {
      console.error(e);
      window.alert(e?.shortMessage || e?.message || String(e));
    }
  }

  async function handleApproveAdminOnChain(ijz) {
    try {
      if (!provider) {
        window.alert("MetaMask belum terdeteksi.");
        return;
      }
      if (!address) {
        window.alert("Wallet belum connect. Klik Connect Wallet dulu.");
        return;
      }
      if (!isOnMonad) {
        window.alert("Silakan switch ke Monad Testnet dulu.");
        return;
      }
      if (!ijz.nomorIjazah) {
        window.alert("Nomor ijazah kosong.");
        return;
      }

      const signer = await provider.getSigner();
      const contract = getIjazahContract(signer);
      const { tx } = await sendTx(contract.setujuiOlehAdmin(ijz.nomorIjazah), {
        onHash: (h) => console.log("txHash approve admin:", h),
      });

      window.alert(`Sukses setujuiOlehAdmin.\\nTx: ${tx.hash}`);
    } catch (e) {
      console.error(e);
      window.alert(e?.shortMessage || e?.message || String(e));
    }
  }

  async function handlePublishOnchain(ijazah) {
    const { id, nomorIjazah } = ijazah;
    const confirmPublish = window.confirm(
      `Publish ijazah ${nomorIjazah || id} ke blockchain?\nPastikan data sudah benar, karena hash akan permanen.`
    );
    if (!confirmPublish) return;

    try {
      setErrorMsg("");
      setSuccessMsg("");
      setPublishingId(id);

      const res = await apiPost(`/ijazah/${id}/publish-onchain`, {});
      await loadData();
      setSuccessMsg(res?.message || "Berhasil publish ijazah ke blockchain.");
    } catch (err) {
      console.error("Gagal publish ijazah ke blockchain:", err);
      setErrorMsg(err.message || "Gagal mempublish ijazah ke blockchain.");
    } finally {
      setPublishingId(null);
    }
  }

  async function handleUploadIpfs(ijz) {
    const ok = window.confirm(
      `Upload ijazah ${ijz.nomorIjazah || ijz.id} ke IPFS sekarang?`
    );
    if (!ok) return;

    try {
      setErrorMsg("");
      setSuccessMsg("");

      setListIjazah((prev) =>
        prev.map((x) =>
          x.id === ijz.id ? { ...x, ipfsStatus: "UPLOADING" } : x
        )
      );

      const res = await apiPost(`/ijazah/${ijz.id}/ipfs`, {});
      const data = res?.data || {};

      if (Object.keys(data).length > 0) {
        setListIjazah((prev) =>
          prev.map((x) => (x.id === ijz.id ? { ...x, ...data } : x))
        );
      } else {
        await loadData();
      }

      setSuccessMsg(
        data?.ipfsCid ? `Upload IPFS berhasil: ${data.ipfsCid}` : "Upload IPFS berhasil."
      );
    } catch (err) {
      console.error(err);
      setErrorMsg(err.message || "Gagal upload ke IPFS");
      await loadData();
    }
  }

  async function handleGenerateQR(ijz) {
    try {
      setErrorMsg("");
      const nomor = ijz.nomorIjazah;
      if (!nomor) {
        setErrorMsg("Nomor ijazah kosong, tidak bisa generate QR.");
        return;
      }

      const hash = await fetchNomorHash(nomor);
      if (!hash) {
        setErrorMsg("Gagal menghitung hash nomor ijazah.");
        return;
      }

      const verifyUrl = `${window.location.origin}/verifikasi?ref=${hash}`;

      setQrValue(verifyUrl);
      setQrOpen(true);
    } catch (err) {
      console.error(err);
      setErrorMsg(err.message || "Gagal membuat QR code.");
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
          <WalletConnectButton />
        </div>

        <div className="bg-white border border-gray-400 text-black">
          {/* header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-400">
            <h3 className="text-lg font-semibold tracking-wide">DATA IJAZAH</h3>
          <div className="flex items-center gap-2">
            <select
              className="px-3 py-2 text-xs border border-gray-300 rounded"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              {STATUS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <button className="px-4 py-2 text-xs border border-black" onClick={goToAdd}>
              TAMBAH DATA
            </button>
          </div>
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
                      <th className="border border-gray-400 px-2 py-2 text-left">IPFS</th>
                      <th className="border border-gray-400 px-2 py-2 text-left">STATUS ON-CHAIN</th>
                      <th className="border border-gray-400 px-2 py-2 text-left w-32">AKSI BLOCKCHAIN</th>
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
                    listIjazah.map((ijz) => {
                      const bc = ijz.blockchainRecord || null;
                      const statusOnchain = bc?.statusOnchain || null;
                      const alreadySuccess =
                        statusOnchain && statusOnchain.toUpperCase() === "SUCCESS";
                      const statusValidasi = (ijz.statusValidasi || ijz.status || "").toUpperCase();
                      const ipfsStatus = (ijz.ipfsStatus || "NOT_UPLOADED").toString().toUpperCase();
                      const canPublish =
                        statusValidasi === "TERVALIDASI" &&
                        ipfsStatus === "READY" &&
                        !!ijz.ipfsUri;
                      const canUploadIpfs =
                        statusValidasi === "TERVALIDASI" && ipfsStatus !== "READY";
                      const uploadingIpfs = ipfsStatus === "UPLOADING";
                      const isDraft = statusValidasi === "DRAFT";
                      const canCreateOnchain =
                        !!address && isOnMonad && ipfsStatus === "READY" && !!ijz.nomorIjazah;
                      const canApproveAdminOnchain =
                        !!address && isOnMonad && !!ijz.nomorIjazah;
                      const publishTitle =
                        !canPublish
                          ? statusValidasi !== "TERVALIDASI"
                            ? "Ijazah harus TERVALIDASI sebelum publish"
                            : ipfsStatus !== "READY"
                            ? "Upload IPFS dulu supaya link ijazah tersedia"
                            : "IPFS URI belum tersedia"
                          : "Publish ke blockchain";
                      const publishLabel = alreadySuccess
                        ? "Sudah On-Chain"
                        : !canPublish
                        ? statusValidasi !== "TERVALIDASI"
                          ? "Belum 2x Validasi"
                          : ipfsStatus !== "READY"
                          ? "IPFS belum siap"
                          : "IPFS URI kosong"
                        : publishingId === ijz.id
                        ? "Memproses..."
                        : "Publish ke Blockchain";

                      return (
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
                            <StatusBadge status={statusValidasi} />
                          </td>
                          <td className="border border-gray-400 px-2 py-2">{ijz.judulTA || ijz.judul_ta || "-"}</td>
                          <td className="border border-gray-400 px-2 py-2">
                            <div className="flex flex-col gap-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <IpfsBadge status={ipfsStatus} />
                                {ipfsStatus === "READY" && ijz.ipfsGatewayUrl && (
                                  <a
                                    href={ijz.ipfsGatewayUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="px-2 py-1 rounded bg-gray-200 text-[11px]"
                                  >
                                    Open
                                  </a>
                                )}
                                {ipfsStatus === "READY" && (
                                  <button
                                    className="px-2 py-1 rounded bg-gray-200 text-[11px]"
                                    onClick={() =>
                                      navigator.clipboard.writeText(ijz.ipfsUri || "")
                                    }
                                  >
                                    Copy ipfs://
                                  </button>
                                )}
                              </div>
                              {ijz.ipfsCid && (
                                <span className="text-[10px] text-gray-700 break-all">
                                  CID: {ijz.ipfsCid}
                                </span>
                              )}
                              {ijz.ipfsUri && (
                                <span className="text-[10px] text-gray-700 break-all">
                                  URI: {ijz.ipfsUri}
                                </span>
                              )}
                              {ipfsStatus === "FAILED" && ijz.ipfsError && (
                                <span className="text-[10px] text-red-600 break-all">
                                  {ijz.ipfsError}
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="border border-gray-400 px-2 py-2">
                            <div className="flex flex-col gap-1">
                              <OnchainBadge statusOnchain={statusOnchain} />
                              {bc?.blockNumber != null && (
                                <span className="text-[10px] text-gray-700">Block #{bc.blockNumber}</span>
                              )}
                            </div>
                          </td>
                          <td className="border border-gray-400 px-2 py-2">
                            <div className="flex flex-col gap-1">
                              {/* Aksi khusus Admin */}
                              {isDraft && (
                                <button
                                  onClick={() => handleAdminApprove(ijz)}
                                  className="px-2 py-1 border border-slate-900 text-[11px] hover:bg-slate-900 hover:text-white rounded mb-1"
                                >
                                  Validasi Admin (1/2)
                                </button>
                              )}
                              {isDraft && (
                                <button
                                  onClick={() => handleAdminReject(ijz)}
                                  className="px-2 py-1 border border-red-600 text-[11px] text-red-600 hover:bg-red-600 hover:text-white rounded"
                                >
                                  Tolak Admin
                                </button>
                              )}
                              <button
                                disabled={!canUploadIpfs || uploadingIpfs}
                                title={
                                  statusValidasi !== "TERVALIDASI"
                                    ? "Ijazah harus TERVALIDASI sebelum upload IPFS"
                                    : ipfsStatus === "READY"
                                    ? "Sudah READY di IPFS"
                                    : uploadingIpfs
                                    ? "Sedang upload..."
                                    : "Upload PDF final ke IPFS"
                                }
                                className={`px-2 py-1 rounded text-[11px] font-semibold transition ${
                                  canUploadIpfs && !uploadingIpfs
                                    ? "bg-emerald-600 text-white"
                                    : "bg-gray-200 text-gray-500 cursor-not-allowed"
                                }`}
                                onClick={() => handleUploadIpfs(ijz)}
                              >
                                {uploadingIpfs ? "Uploading..." : "Upload IPFS"}
                              </button>
                              <button
                                className={`px-2 py-1 rounded-md border text-[11px] font-semibold transition ${
                                  publishingId === ijz.id ||
                                  alreadySuccess ||
                                  !canPublish
                                    ? "border-gray-300 bg-gray-200 text-gray-500 cursor-not-allowed"
                                    : "border-slate-900 bg-slate-900 text-white hover:bg-black"
                                }`}
                                disabled={
                                  publishingId === ijz.id ||
                                  alreadySuccess ||
                                  !canPublish
                              }
                                onClick={() => canPublish && handlePublishOnchain(ijz)}
                                title={publishTitle}
                              >
                                {publishLabel}
                              </button>
                              <div className="mt-2 pt-2 border-t border-gray-200">
                                <div className="text-[10px] text-gray-500">
                                  On-chain (MetaMask)
                                </div>
                                <div className="flex flex-col gap-1 mt-1">
                                  <button
                                    className={`px-2 py-1 rounded text-[11px] font-semibold transition ${
                                      canCreateOnchain
                                        ? "bg-indigo-600 text-white hover:bg-indigo-700"
                                        : "bg-gray-200 text-gray-500 cursor-not-allowed"
                                    }`}
                                    disabled={!canCreateOnchain}
                                    onClick={() => handleCreateOnChain(ijz)}
                                    title={
                                      !address
                                        ? "Wallet belum connect"
                                        : !isOnMonad
                                        ? "Switch ke Monad Testnet"
                                        : ipfsStatus !== "READY"
                                        ? "IPFS belum READY"
                                        : "Buat ijazah di blockchain"
                                    }
                                  >
                                    Create On-chain
                                  </button>
                                  <button
                                    className={`px-2 py-1 rounded text-[11px] font-semibold transition ${
                                      canApproveAdminOnchain
                                        ? "bg-indigo-600 text-white hover:bg-indigo-700"
                                        : "bg-gray-200 text-gray-500 cursor-not-allowed"
                                    }`}
                                    disabled={!canApproveAdminOnchain}
                                    onClick={() => handleApproveAdminOnChain(ijz)}
                                    title={
                                      !address
                                        ? "Wallet belum connect"
                                        : !isOnMonad
                                        ? "Switch ke Monad Testnet"
                                        : "Setujui oleh Admin di blockchain"
                                    }
                                  >
                                    Approve Admin (On-chain)
                                  </button>
                                </div>
                              </div>
                              {bc?.txHash && (
                                <span className="text-[10px] text-gray-700 break-all">
                                  Tx: {bc.txHash}
                                </span>
                              )}
                            </div>
                          </td>
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
                              <button
                                className="px-2 py-1 text-[10px] border border-gray-600 text-gray-600 hover:bg-gray-100"
                                onClick={() => handleGenerateQR(ijz)}
                              >
                                QR
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
            )}
          </div>
        </div>

        {/* QR Code Modal */}
        {qrOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-xl text-black">
              <h4 className="text-lg font-semibold mb-4">QR Code Ijazah</h4>
              <div className="flex justify-center mb-4">
                {qrValue ? (
                  // Placeholder for QR Code component. User needs to ensure a QR library is installed, e.g., 'qrcode.react'
                  // <QRCode value={qrValue} size={256} level="H" />
                  <div className="w-64 h-64 bg-gray-200 flex items-center justify-center">
                    <p className="text-sm text-gray-500">QR Code will appear here</p>
                  </div>
                ) : (
                  <p>Tidak dapat membuat QR Code.</p>
                )}
              </div>
              <p className="text-xs text-center text-gray-700 mb-4 break-all">{qrValue}</p>
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => navigator.clipboard.writeText(qrValue)}
                  className="px-4 py-2 text-xs border border-black"
                >
                  Copy Link
                </button>
                <button
                  onClick={() => setQrOpen(false)}
                  className="px-4 py-2 text-xs border border-gray-500 text-black"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        )}
      </AppLayout>
    </RequireRole>
  );
}
