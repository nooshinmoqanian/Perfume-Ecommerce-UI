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


}
