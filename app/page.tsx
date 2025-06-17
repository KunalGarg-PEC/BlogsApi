// app/page.tsx
import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-8">
      <h1 className="text-4xl font-bold text-black mb-12">
        Qtrino Admin Panel
      </h1>

      <div className="flex flex-col sm:flex-row gap-6">
        <Link href="/job" passHref>
          <button className="px-6 py-3 bg-black text-white rounded-3xl hover:opacity-75">
            Upload Job
          </button>
        </Link>

        <Link href="/upload" passHref>
          <button className="px-6 py-3 bg-black text-white rounded-3xl hover:opacity-75">
            Upload Blogs
          </button>
        </Link>

        <Link href="/admin/applications" passHref>
          <button className="px-6 py-3 bg-black text-white rounded-3xl hover:opacity-75">
            All Applications
          </button>
        </Link>
      </div>
    </div>
  );
}
