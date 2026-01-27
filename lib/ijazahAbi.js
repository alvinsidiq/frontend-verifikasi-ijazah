export const IJAZAH_ABI = [
  "function admin(address) view returns (bool)",
  "function validator(address) view returns (bool)",
  "function buatIjazah((string nomorIjazah,string nim,string programStudi,uint32 tanggalLulusYmd,string ipk,string predikat,string judulTA,string namaMahasiswa,string linkIjazah) d)",
  "function setujuiOlehAdmin(string nomorIjazah)",
  "function setujuiOlehValidator(string nomorIjazah)",
  "function publikasikan(string nomorIjazah) payable",
  "function hashNomorIjazah(string nomorIjazah) pure returns (bytes32)",
  "function statusIjazahByHash(bytes32 nomorIjazahHash) view returns (uint8)",
  "function ringkasIjazahByHash(bytes32 nomorIjazahHash) view returns (string)",
  "function detailIjazahByHash(bytes32 nomorIjazahHash) view returns (tuple(bytes32 nomorIjazahHash,bytes32 nimHash,bytes32 programStudiHash,bytes32 predikatHash,bytes32 judulTAHash,string namaMahasiswa,string ipk,string linkIjazah,uint32 tanggalLulusYmd,address dibuatOleh,uint64 dibuatPada,address disetujuiAdminOleh,uint64 disetujuiAdminPada,address disetujuiValidatorOleh,uint64 disetujuiValidatorPada,address dipublikasikanOleh,uint64 dipublikasikanPada,uint8 status))",
];
