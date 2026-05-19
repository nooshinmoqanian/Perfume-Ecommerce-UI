import { useEffect, useState } from "react";
import { getLastRequestId, setLastRequestId } from "../../api";

export default function RequestIdBadge() {
  const [requestId, setRequestId] = useState(getLastRequestId());

  useEffect(() => {
    const handler = (event) => {
      if (event.detail) {
        setRequestId(event.detail);
      }
    };
    window.addEventListener("request-id", handler);
    return () => window.removeEventListener("request-id", handler);
  }, []);

  if (!requestId) return null;

  return (
    <div className="fixed bottom-20 right-4 z-[60]">
      <div className="flex items-center gap-2 rounded-lg border bg-white px-3 py-2 text-xs shadow">
        <span className="text-gray-500">request id</span>
        <span className="font-mono text-sm">{requestId}</span>
        <button
          className="rounded bg-gray-100 px-2 py-1"
          onClick={() => {
            navigator.clipboard?.writeText(requestId);
          }}
        >
          Copy
        </button>
        <button
          className="rounded bg-red-100 px-2 py-1"
          onClick={() => {
            setLastRequestId(null);
            setRequestId(null);
          }}
        >
          Clear
        </button>
      </div>
    </div>
  );
}
