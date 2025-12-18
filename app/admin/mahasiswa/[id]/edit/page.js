"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import AppLayout from "../../../../../components/layout/AppLayout";
import RequireRole from "../../../../../components/auth/RequireRole";
import { apiGet, apiPut } from "../../../../../lib/api";

export default function MahasiswaEditPage() {
  const router = useRouter();
  const params = useParams();
  const { id } = params;

  const [prodiOptions, setProdiOptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const [nim, setNim] = useState("");
  const [nama, setNama] = useState("");
  const [prodiId, setProdiId] = useState("");
  const [tahunMasuk, setTahunMasuk] = useState("");
  const [tahunLulus, setTahunLulus] = useState("");
  const [tempatLahir, setTempatLahir] = useState("");
  const [tanggalLahir, setTanggalLahir] = useState("");
  const [alamat, setAlamat] = useState("");
  const [noTelepon, setNoTelepon] = useState("");
  const [foto, setFoto] = useState("");
  const [status, setStatus] = useState("");

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [detailRes, prodiRes] = await Promise.all([
          apiGet(`/mahasiswa/${id}`),
          apiGet("/program-studi"),
        ]);
        const data = detailRes?.data;
        setNim(data?.nim || "");
        setNama(data?.nama || "");
        setProdiId(data?.prodiId || data?.prodi?.id || "");
        setTahunMasuk(data?.tahunMasuk || "");
        setTahunLulus(data?.tahunLulus || "");
        setTempatLahir(data?.tempatLahir || "");
        setTanggalLahir(data?.tanggalLahir ? data.tanggalLahir.slice(0, 10) : "");
        setAlamat(data?.alamat || "");
        setNoTelepon(data?.noTelepon || "");
        setFoto(data?.foto || "");
        setStatus(data?.status || "");
        setProdiOptions(prodiRes.data || []);
      } catch (err) {
        console.error("Gagal memuat detail mahasiswa:", err);
        setErrorMsg(err.message || "Gagal memuat detail mahasiswa.");
      } finally {
        setLoading(false);
      }
    }

    if (id) {
      loadData();
    }
  }, [id]);

  async function handleSubmit(e) {
    e.preventDefault();
    setErrorMsg("");

    if (!nim || !nama || !prodiId || !tahunMasuk) {
      setErrorMsg("NIM, nama, prodi, dan tahun masuk wajib diisi.");
      return;
    }

    const payload = {
      nim,
      nama,
      prodiId: Number(prodiId),
      tahunMasuk: Number(tahunMasuk),
      tahunLulus: tahunLulus ? Number(tahunLulus) : null,
      tempatLahir: tempatLahir || null,
      tanggalLahir: tanggalLahir || null,
      alamat: alamat || null,
      noTelepon: noTelepon || null,
      foto: foto || null,
      status: status || null,
    };

    console.log("PAYLOAD MAHASISWA:", payload);

    try {
      setSaving(true);
      await apiPut(`/mahasiswa/${id}`, payload);
      router.push(
        "/admin/mahasiswa?success=Data%20mahasiswa%20berhasil%20diperbarui."
      );
    } catch (err) {
      console.error("Gagal update mahasiswa:", err);
      setErrorMsg(err.message || "Gagal memperbarui data mahasiswa.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <RequireRole allowedRoles={["ADMIN"]}>
      <AppLayout>
        <div className="bg-white border border-gray-400 text-black">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-400">
            <h3 className="text-lg font-semibold">Edit Mahasiswa</h3>
            <button
              onClick={() => router.push("/admin/mahasiswa")}
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
            {loading ? (
              <p className="text-sm">Memuat detail...</p>
            ) : (
              <form
                onSubmit={handleSubmit}
                className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm"
              >
                <FieldText label="NIM" value={nim} onChange={setNim} placeholder="201801234" />
                <FieldText label="Nama" value={nama} onChange={setNama} placeholder="Nama Mahasiswa" />
                <FieldSelect
                  label="Program Studi"
                  value={prodiId}
                  onChange={setProdiId}
                  options={prodiOptions}
                />
                <FieldText
                  label="Tahun Masuk"
                  value={tahunMasuk}
                  onChange={setTahunMasuk}
                  placeholder="2018"
                  type="number"
                />
                <FieldText
                  label="Tahun Lulus"
                  value={tahunLulus}
                  onChange={setTahunLulus}
                  placeholder="2022 (opsional)"
                  type="number"
                />
                <FieldText
                  label="Tempat Lahir"
                  value={tempatLahir}
                  onChange={setTempatLahir}
                  placeholder="Kota"
                />
                <FieldText
                  label="Tanggal Lahir"
                  value={tanggalLahir}
                  onChange={setTanggalLahir}
                  placeholder=""
                  type="date"
                />
                <FieldText
                  label="Alamat"
                  value={alamat}
                  onChange={setAlamat}
                  placeholder="Alamat lengkap"
                />
                <FieldText
                  label="No Telepon"
                  value={noTelepon}
                  onChange={setNoTelepon}
                  placeholder="08123456789"
                />
                <FieldText
                  label="Foto"
                  value={foto}
                  onChange={setFoto}
                  placeholder="URL foto (opsional)"
                />
                <FieldText
                  label="Status"
                  value={status}
                  onChange={setStatus}
                  placeholder="Aktif / Lulus / Cuti"
                />

                <div className="md:col-span-3 flex items-center gap-3 mt-2">
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-4 py-2 text-xs border border-black disabled:opacity-60"
                  >
                    {saving ? "Menyimpan..." : "Update"}
                  </button>
                  <button
                    type="button"
                    onClick={() => router.push("/admin/mahasiswa")}
                    className="px-4 py-2 text-xs border border-gray-500 text-black"
                  >
                    Batal
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </AppLayout>
    </RequireRole>
  );
}

function FieldText({ label, value, onChange, placeholder, type = "text" }) {
  return (
    <div className="space-y-1">
      <label className="font-medium text-black">{label}</label>
      <input
        type={type}
        className="w-full border border-gray-400 rounded-md px-3 py-2 text-black"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
    </div>
  );
}

function FieldSelect({ label, value, onChange, options }) {
  return (
    <div className="space-y-1">
      <label className="font-medium text-black">{label}</label>
      <select
        className="w-full border border-gray-400 rounded-md px-3 py-2 bg-white text-black"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        <option value="">Pilih Prodi</option>
        {options.map((p) => (
          <option key={p.id} value={p.id}>
            {p.kodeProdi} - {p.namaProdi}
          </option>
        ))}
      </select>
    </div>
  );
}
