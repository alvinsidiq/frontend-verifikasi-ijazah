function toYmdNumber(dateStrOrDate) {
  if (typeof dateStrOrDate === "number") return dateStrOrDate;

  const d = new Date(dateStrOrDate);
  if (Number.isNaN(d.getTime())) return 0;

  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return Number(`${y}${m}${day}`);
}

function ipkToString(ipk) {
  const n = Number(ipk);
  if (!Number.isFinite(n)) return String(ipk ?? "");
  return n.toFixed(2);
}

export function buildInputIjazahFromDb(ijz) {
  const nomorIjazah = ijz.nomorIjazah;
  const nim = ijz.mahasiswa?.nim || ijz.nim || "";
  const programStudi =
    ijz.mahasiswa?.prodi?.namaProdi ||
    ijz.programStudi ||
    ijz.prodi ||
    "";

  const tanggalLulusYmd =
    ijz.tanggalLulusYmd ||
    (ijz.tanggalLulus ? toYmdNumber(ijz.tanggalLulus) : 0);

  const ipk = ipkToString(ijz.ipk);
  const predikat = ijz.predikat || ijz.labelPredikat || "Cum Laude";
  const judulTA = ijz.judulTA || ijz.judul || "-";
  const namaMahasiswa = ijz.mahasiswa?.nama || ijz.namaMahasiswa || "";
  const linkIjazah = ijz.ipfsUri || "";

  return {
    nomorIjazah,
    nim,
    programStudi,
    tanggalLulusYmd,
    ipk,
    predikat,
    judulTA,
    namaMahasiswa,
    linkIjazah,
  };
}
