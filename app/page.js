// app/page.js
import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gray-100 text-black">
      <div className="bg-white rounded-xl shadow p-8 max-w-md w-full text-center space-y-4">
        <h1 className="text-2xl font-bold">
          Sistem Verifikasi Ijazah Berbasis Blockchain
        </h1>
        <p className="text-sm text-black">
          Silakan login sebagai admin, validator, atau mahasiswa untuk mengelola data.
          Atau gunakan halaman verifikasi publik untuk memeriksa keaslian ijazah.
        </p>
        <div className="flex gap-4 justify-center">
          <Link
            href="/login"
            className="px-4 py-2 rounded-md bg-blue-600 text-white text-sm"
          >
            Login
          </Link>
          <Link
            href="/verifikasi"
            className="px-4 py-2 rounded-md border text-sm"
          >
            Verifikasi Publik
          </Link>
        </div>
      </div>
    </main>
  );
}
