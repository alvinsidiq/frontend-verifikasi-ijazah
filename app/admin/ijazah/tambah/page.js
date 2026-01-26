"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AppLayout from "../../../../components/layout/AppLayout";
import RequireRole from "../../../../components/auth/RequireRole";
import { apiGet, apiPost } from "../../../../lib/api";

export default function IjazahTambahPage() {
  const router = useRouter();

  const [mahasiswaOptions, setMahasiswaOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const [mahasiswaId, setMahasiswaId] = useState("");
  const [nomorIjazah, setNomorIjazah] = useState("");
  const [tanggalLulus, setTanggalLulus] = useState("");
  const [ipk, setIpk] = useState("");
  const [judulTA, setJudulTA] = useState("");

  useEffect(() => {
    async function loadMahasiswa() {
      try {
        const res = await apiGet("/mahasiswa");
        setMahasiswaOptions(res.data || []);
      } catch (err) {
        console.error("Gagal load mahasiswa:", err);
        setErrorMsg(err.message || "Gagal memuat data mahasiswa.");
      }
    }
    loadMahasiswa();
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setErrorMsg("");

    const ipkValue = ipk.toString().trim();

    if (!mahasiswaId || !nomorIjazah || !tanggalLulus || !ipkValue) {
      setErrorMsg(
        "Mahasiswa, nomor ijazah, tanggal lulus, dan IPK wajib diisi."
      );
      return;
    }

    const payload = {
      mahasiswaId: Number(mahasiswaId),
      nomorIjazah,
      tanggalLulus,
      ipk: ipkValue,
      judul_ta: judulTA || null, // backend kebanyakan pakai snake_case
    };

    console.log("PAYLOAD IJAZAH:", payload);

    try {
      setLoading(true);
      await apiPost("/ijazah", payload);
      router.push(
        "/admin/ijazah?success=Data%20ijazah%20berhasil%20ditambahkan."
      );
    } catch (err) {
      console.error("Gagal tambah ijazah:", err);
      setErrorMsg(err.message || "Gagal menambahkan data ijazah.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <RequireRole allowedRoles={["ADMIN"]}>
      <AppLayout>
        <div className="bg-white border border-gray-400 text-black">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-400">
            <h3 className="text-lg font-semibold">Tambah Ijazah</h3>
            <button
              onClick={() => router.push("/admin/ijazah")}
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
              <FieldSelect
                label="Mahasiswa"
                value={mahasiswaId}
                onChange={setMahasiswaId}
                options={mahasiswaOptions.map((m) => ({
                  value: m.id,
                  label: `${m.nim} - ${m.nama}`,
                }))}
                placeholder="Pilih mahasiswa"
              />
              <FieldText
                label="Nomor Ijazah"
                value={nomorIjazah}
                onChange={setNomorIjazah}
                placeholder="Nomor ijazah"
              />
              <FieldText
                label="Tanggal Lulus / Wisuda"
                value={tanggalLulus}
                onChange={setTanggalLulus}
                placeholder=""
                type="date"
              />
              <FieldText
                label="IPK"
                value={ipk}
                onChange={setIpk}
                placeholder="3.50"
                type="number"
                step="0.01"
                min="0"
                max="4"
              />
              <FieldText
                label="Judul TA / Skripsi"
                value={judulTA}
                onChange={setJudulTA}
                placeholder="(opsional)"
                className="md:col-span-3"
              />

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
                  onClick={() => router.push("/admin/ijazah")}
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

function FieldText({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  step,
  min,
  max,
  className = "",
}) {
  return (
    <div className={["space-y-1", className].filter(Boolean).join(" ")}>
      <label className="font-medium text-black">{label}</label>
      <input
        type={type}
        step={step}
        min={min}
        max={max}
        className="w-full border border-gray-400 rounded-md px-3 py-2 text-black"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
    </div>
  );
}

function FieldSelect({ label, value, onChange, options, placeholder }) {
  return (
    <div className="space-y-1">
      <label className="font-medium text-black">{label}</label>
      <select
        className="w-full border border-gray-400 rounded-md px-3 py-2 bg-white text-black"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        <option value="">{placeholder || "Pilih opsi"}</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}
