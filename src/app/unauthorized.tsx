import Link from "next/link";

export default function UnauthorizedPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f7f8f9] px-4">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-[#ED1C24]">401</h1>
        <p className="mt-4 text-lg font-medium text-foreground">Tidak Terautentikasi</p>
        <p className="mt-2 text-sm text-[#667085]">Silakan masuk untuk mengakses halaman ini.</p>
        <Link
          href="/login"
          className="btn-primary-solid mx-auto mt-6 w-fit px-6 py-2.5 text-sm"
        >
          Masuk
        </Link>
      </div>
    </div>
  );
}
