export default function LoginPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-100 text-black">
      <div className="bg-white rounded-xl shadow p-8 w-full max-w-sm">
        <h1 className="text-xl font-bold mb-4">Login</h1>
        <p className="text-sm text-black mb-4">
          (Sesi berikutnya kita isi form + koneksi ke API.)
        </p>
        <div className="space-y-3 text-sm text-black">
          <p>Email:</p>
          <p>Password:</p>
          <p className="italic text-xs text-black">
            Placeholder dulu - belum ada aksi.
          </p>
        </div>
      </div>
    </main>
  );
}
