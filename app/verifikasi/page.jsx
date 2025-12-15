export default function VerifikasiPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-100 text-black">
      <div className="bg-white rounded-xl shadow p-8 w-full max-w-lg space-y-4">
        <h1 className="text-xl font-bold">Verifikasi Ijazah</h1>
        <p className="text-sm text-black">
          Masukkan hash ijazah untuk memeriksa keasliannya.
          (Sesi berikutnya kita sambungkan ke endpoint /verifikasi.)
        </p>
        <div className="space-y-2">
          <label className="text-sm font-medium">Hash Ijazah</label>
          <input
            type="text"
            className="w-full border rounded-md px-3 py-2 text-sm"
            placeholder="0x..."
            disabled
          />
          <p className="text-xs text-black italic">
            Input masih dummy (disable) di sesi 0, hanya tampilan awal.
          </p>
        </div>
      </div>
    </main>
  );
}
