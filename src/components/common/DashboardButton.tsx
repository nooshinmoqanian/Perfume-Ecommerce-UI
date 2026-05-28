import { getMe } from "../../api";
import { getAuthToken } from "../../hooks/useAuthToken";

export default function DashboardButton({ inline = false }) {
  const token = getAuthToken();
  if (!token) return null;

  const navigateToDashboard = async () => {
    try {
      const me = await getMe(token);
      if (me?.role === "admin") {
        window.location.assign("/admin");
        return;
      }
      window.location.assign("/orders");
    } catch {
      window.location.assign("/orders");
    }
  };

  const button = (
    <button
      onClick={navigateToDashboard}
      className={`relative flex items-center justify-center rounded-full border border-violet-200 bg-white text-violet-700 shadow-md transition hover:bg-violet-50 ${
        inline ? "h-10 w-10 p-2" : "h-12 w-12"
      }`}
      aria-label="Dashboard"
      title="Dashboard"
    >
      <svg width={inline ? 16 : 20} height={inline ? 16 : 20} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M3 13h8V3H3v10zM3 21h8v-6H3v6zM13 21h8V11h-8v10zM13 3v6h8V3h-8z" fill="currentColor" />
      </svg>
    </button>
  );

  return inline ? <>{button}</> : <div className="fixed left-20 top-4 z-[60]">{button}</div>;
}
