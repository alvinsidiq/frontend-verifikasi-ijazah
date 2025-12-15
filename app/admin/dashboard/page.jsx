import AppLayout from "../../components/layout/AppLayout";

export default function AdminDashboardPage() {
  return (
    <AppLayout>
      <h2 className="text-xl font-semibold mb-2">Dashboard Admin</h2>
      <p className="text-sm text-black">
        Di sini nanti akan ada ringkasan jumlah program studi, mahasiswa, dan ijazah.
      </p>
    </AppLayout>
  );
}
