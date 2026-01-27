"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { getPublicProvider } from "../../lib/publicRpc";
import { getIjazahContract } from "../../lib/ijazahContract";
import { normalizeRefHash } from "../../lib/ref";

function statusLabel(n) {
  const x = Number(n);
  if (x === 0) return "TIDAK_ADA";
  if (x === 1) return "DIBUAT";
  if (x === 2) return "DISETUJUI_ADMIN";
  if (x === 3) return "DISETUJUI_VALIDATOR";
  if (x === 4) return "DIPUBLIKASIKAN";
  return `UNKNOWN(${x})`;
}

function toGatewayUrl(ipfsUri) {
  if (!ipfsUri) return null;
  const s = ipfsUri.toString().trim();
  if (!s.startsWith("ipfs://")) return s;

  const cid = s.replace("ipfs://", "");
  const gateway =
    process.env.NEXT_PUBLIC_IPFS_GATEWAY_BASE || "https://gateway.pinata.cloud";
  return `${gateway.replace(/\/$/, "")}/ipfs/${cid}`;
}

export default function VerifikasiPage() {
  const search = useSearchParams();
  const refFromQuery = search.get("ref") || search.get("hash");

  const [refInput, setRefInput] = useState(refFromQuery || "");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [data, setData] = useState(null);

  const refHash = useMemo(() => normalizeRefHash(refInput), [refInput]);

  const verify = async () => {
    setErr("");
    setData(null);

    if (!refHash) {
      setErr("Ref/hash tidak valid. Harus 0x + 64 hex.");
      return;
    }

    setLoading(true);
    try {
      const provider = getPublicProvider();
      const contract = getIjazahContract(provider);

      const d = await contract.detailIjazahByHash(refHash);
      const st = Number(d.status);

      const out = {
        nomorIjazahHash: d.nomorIjazahHash,
        namaMahasiswa: d.namaMahasiswa,
        ipk: d.ipk,
        linkIjazah: d.linkIjazah,
        tanggalLulusYmd: Number(d.tanggalLulusYmd),
        status: st,
        dibuatOleh: d.dibuatOleh,
        dibuatPada: Number(d.dibuatPada),
        disetujuiAdminOleh: d.disetujuiAdminOleh,
        disetujuiAdminPada: Number(d.disetujuiAdminPada),
        disetujuiValidatorOleh: d.disetujuiValidatorOleh,
        disetujuiValidatorPada: Number(d.disetujuiValidatorPada),
        dipublikasikanOleh: d.dipublikasikanOleh,
        dipublikasikanPada: Number(d.dipublikasikanPada),
      };

      if (st === 0) {
        setData(null);
        setErr("Data tidak ditemukan di blockchain untuk hash ini.");
        return;
      }

      setData(out);

      if (st !== 4) {
        setErr(
          `Ijazah ditemukan, tapi status belum DIPUBLIKASIKAN (status: ${statusLabel(st)}).`
        );
      }
    } catch (e) {
      console.error(e);
      setErr(
        e?.message === "NEXT_PUBLIC_CONTRACT_ADDRESS belum diset"
          ? "Contract address belum diset. Isi NEXT_PUBLIC_CONTRACT_ADDRESS di .env.local"
          : "Data tidak ditemukan di blockchain atau contract belum dipublish untuk hash ini."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (refFromQuery) verify();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refFromQuery]);

  const gatewayUrl = data?.linkIjazah ? toGatewayUrl(data.linkIjazah) : null;

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-2">Verifikasi Ijazah (On-chain)</h1>
      <p className="text-sm text-gray-600 mb-6">
        Masukkan <b>hash nomor ijazah</b> (bytes32) dari QR untuk membaca data
        langsung dari smart contract.
      </p>

      <div className="flex gap-2 mb-3">
        <input
          value={refInput}
          onChange={(e) => setRefInput(e.target.value)}
          placeholder="0x... (64 hex)"
          className="flex-1 border rounded px-3 py-2"
        />
        <button
          onClick={verify}
          disabled={loading}
          className="px-4 py-2 rounded bg-black text-white disabled:bg-gray-300"
        >
          {loading ? "Memeriksa..." : "Verifikasi"}
        </button>
      </div>

      {err && (
        <div className="mb-4 p-3 rounded bg-yellow-50 text-yellow-800 text-sm">
          {err}
        </div>
      )}

      {data && (
        <div className="border rounded p-4">
          <div className="text-sm text-gray-600 mb-2">
            Status: <b>{statusLabel(data.status)}</b>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <div className="text-xs text-gray-500">Nama</div>
              <div className="font-semibold">{data.namaMahasiswa}</div>
            </div>
            <div>
              <div className="text-xs text-gray-500">IPK</div>
              <div className="font-semibold">{data.ipk}</div>
            </div>

            <div className="md:col-span-2">
              <div className="text-xs text-gray-500">Nomor Ijazah Hash</div>
              <div className="font-mono text-xs break-all">{refHash}</div>
            </div>

            <div className="md:col-span-2">
              <div className="text-xs text-gray-500">Link Ijazah (ipfs://)</div>
              <div className="font-mono text-xs break-all">{data.linkIjazah}</div>
            </div>
          </div>

          {gatewayUrl && (
            <div className="mt-4 flex gap-2">
              <a
                href={gatewayUrl}
                target="_blank"
                rel="noreferrer"
                className="px-3 py-2 rounded bg-emerald-600 text-white text-sm"
              >
                Buka PDF (Gateway)
              </a>
              <button
                className="px-3 py-2 rounded bg-gray-200 text-sm"
                onClick={() => navigator.clipboard.writeText(data.linkIjazah)}
              >
                Copy ipfs://
              </button>
            </div>
          )}

          <div className="mt-4 text-xs text-gray-500">
            Publikasi oleh: <span className="font-mono">{data.dipublikasikanOleh}</span>
          </div>
        </div>
      )}
    </div>
  );
}
