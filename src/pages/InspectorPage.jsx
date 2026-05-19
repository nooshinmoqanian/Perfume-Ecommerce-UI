import { useEffect, useState } from "react";
import { getKafkaStreamUrl, listKafkaMessages } from "../api";

export default function InspectorPage() {
  const [messages, setMessages] = useState([]);
  const [requestIdFilter, setRequestIdFilter] = useState("");

  const loadMessages = () => {
    listKafkaMessages(200)
      .then((data) => setMessages(Array.isArray(data) ? data : []))
      .catch(() => setMessages([]));
  };

  useEffect(() => {
    loadMessages();

    let eventSource = null;
    try {
      eventSource = new EventSource(getKafkaStreamUrl());
      eventSource.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data);
          setMessages((prev) => [payload, ...prev].slice(0, 300));
        } catch {
          // Ignore invalid SSE payloads.
        }
      };
      eventSource.onerror = () => {
        eventSource?.close();
      };
    } catch {
      // Ignore SSE connection errors.
    }

    return () => {
      eventSource?.close();
    };
  }, []);

  const filtered = messages.filter((message) => {
    if (!requestIdFilter) return true;

    if (message?.headers?.["x-request-id"] === requestIdFilter) {
      return true;
    }

    if (message?.headers?.["X-Request-Id"] === requestIdFilter) {
      return true;
    }

    if (message?.value?.meta?.requestId === requestIdFilter) {
      return true;
    }

    return false;
  });

  return (
    <div className="p-8">
      <div className="mx-auto max-w-6xl">
        <header className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold">Event inspector</h1>
          <button className="rounded bg-violet-100 px-3 py-1 text-violet-800" onClick={loadMessages}>
            Reload
          </button>
        </header>

        <section>
          <p className="text-sm text-gray-600">
            Follow raw Kafka events and filter all events by x-request-id.
          </p>

          <div className="mt-3 flex items-center gap-2">
            <input
              className="w-full rounded border px-3 py-1"
              placeholder="Filter by x-request-id"
              value={requestIdFilter}
              onChange={(event) => setRequestIdFilter(event.target.value)}
            />
          </div>

          <div className="mt-4 space-y-3">
            {filtered.map((item, index) => (
              <div className="rounded border p-3" key={item.id || item.offset || index}>
                <div className="text-xs text-gray-500">
                  {item.timestamp || "-"} - {item.topic || "-"} / partition {item.partition || "-"} / offset {item.offset || "-"}
                </div>
                <div className="mt-1 font-medium">{item.key || "(no key)"}</div>
                {item.headers && (
                  <div className="mt-1 text-xs text-gray-600">
                    Headers: {Object.entries(item.headers).map(([key, value]) => `${key}=${value}`).join(", ")}
                  </div>
                )}
                <pre className="mt-2 max-h-40 overflow-auto bg-gray-50 p-2 text-sm">{JSON.stringify(item.value, null, 2)}</pre>
              </div>
            ))}

            {filtered.length === 0 && <p className="text-sm text-gray-500">No event found.</p>}
          </div>
        </section>
      </div>
    </div>
  );
}
