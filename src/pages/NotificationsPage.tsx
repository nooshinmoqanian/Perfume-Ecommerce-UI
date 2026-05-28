import { useEffect, useState } from "react";
import { listNotifications } from "../api";

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchData = () => {
    setLoading(true);
    listNotifications(200)
      .then((data) => setNotifications(Array.isArray(data) ? data : []))
      .catch(() => setNotifications([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="p-8">
      <div className="mx-auto max-w-4xl">
        <header className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold">Notifications</h1>
          <button className="rounded bg-violet-100 px-3 py-1 text-violet-800" onClick={fetchData}>
            Reload
          </button>
        </header>

        {loading ? (
          <p>Loading notifications...</p>
        ) : (
          <div className="space-y-3">
            {notifications.length === 0 ? (
              <p className="text-sm text-gray-500">No notifications yet.</p>
            ) : (
              notifications.map((item) => (
                <div className="rounded border p-3" key={item.id || `${item.createdAt}-${item.message}`}>
                  <div className="text-xs text-gray-500">{new Date(item.createdAt).toLocaleString()}</div>
                  <div className="mt-1 font-medium">{item.message}</div>
                  <div className="mt-1 text-xs text-gray-400">{item.type}</div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
