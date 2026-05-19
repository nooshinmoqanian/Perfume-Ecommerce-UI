import { Link } from "react-router-dom";

export default function NotFoundPage() {
  return (
    <div className="grid min-h-[70vh] place-items-center bg-violet-50 px-6">
      <div className="max-w-md rounded-xl border border-violet-100 bg-white p-6 text-center shadow-sm">
        <h1 className="text-3xl font-bold text-violet-900">404</h1>
        <p className="mt-2 text-sm text-gray-600">The page you requested does not exist.</p>
        <Link to="/" className="mt-4 inline-block rounded bg-violet-700 px-4 py-2 text-sm text-white hover:bg-violet-600">
          Back to home
        </Link>
      </div>
    </div>
  );
}
