import { useEffect, useRef, useState } from "react";

export default function ToastHost() {
  const [toast, setToast] = useState(null);
  const timerRef = useRef(null);

  useEffect(() => {
    const handler = (event) => {
      const detail = event?.detail;
      if (!detail?.message) return;

      setToast(detail);
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      timerRef.current = setTimeout(() => setToast(null), 3200);
    };

    window.addEventListener("app-alert", handler);
    return () => {
      window.removeEventListener("app-alert", handler);
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  if (!toast) return null;

  const toneClass =
    toast.tone === "success"
      ? "border-emerald-200 bg-emerald-50 text-emerald-800"
      : toast.tone === "error"
        ? "border-red-200 bg-red-50 text-red-800"
        : "border-violet-200 bg-white text-violet-900";

  return (
    <div className="fixed bottom-6 left-4 z-[70]">
      <div className={`max-w-sm rounded-xl border px-4 py-3 shadow-lg ${toneClass}`}>
        <div className="flex items-start gap-3 text-sm">
          <div className="mt-0.5 h-2.5 w-2.5 rounded-full bg-current opacity-75" />
          <div className="leading-6">{toast.message}</div>
          <button className="ml-auto rounded px-2 py-0.5 text-xs hover:bg-black/5" onClick={() => setToast(null)}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
