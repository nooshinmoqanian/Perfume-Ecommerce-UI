import { useState, useEffect } from "react";
import { listOrders } from "../api";

export default function UserDashboard() {
  const [active, setActive] = useState("orders");
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (active === "orders") {
      setLoading(true);
      listOrders()
        .then((data) => setOrders(Array.isArray(data) ? data : []))
        .catch(() => setOrders([]))
        .finally(() => setLoading(false));
    }
  }, [active]);

  return (
    <div className="min-h-screen bg-violet-50 p-6" dir="rtl">
      <div className="mx-auto max-w-6xl lg:flex lg:gap-6">
        <aside className="mb-6 w-full shrink-0 lg:w-1/4">
          <div className="rounded-lg border bg-white p-4">
            <h3 className="mb-3 text-lg font-semibold">پنل کاربری</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <button
                  className={`w-full text-right rounded px-3 py-2 ${active === "orders" ? "bg-violet-100 text-violet-900" : "hover:bg-gray-50"}`}
                  onClick={() => setActive("orders")}
                >
                  سفارش‌ها
                </button>
              </li>
              <li>
                <button
                  className={`w-full text-right rounded px-3 py-2 ${active === "support" ? "bg-violet-100 text-violet-900" : "hover:bg-gray-50"}`}
                  onClick={() => setActive("support")}
                >
                  پشتیبانی
                </button>
              </li>
              <li>
                <button
                  className={`w-full text-right rounded px-3 py-2 ${active === "profile" ? "bg-violet-100 text-violet-900" : "hover:bg-gray-50"}`}
                  onClick={() => setActive("profile")}
                >
                  پروفایل
                </button>
              </li>
            </ul>
          </div>
        </aside>

        <main className="w-full lg:flex-1">
          <div className="rounded-lg border bg-white p-6">
            {active === "orders" && (
              <div>
                <h2 className="mb-4 text-xl font-semibold">سفارش‌های شما</h2>
                {loading ? (
                  <p>در حال بارگذاری سفارش‌ها...</p>
                ) : orders.length === 0 ? (
                  <p className="text-sm text-gray-500">سفارشی ثبت نشده است.</p>
                ) : (
                  <ul className="space-y-3">
                    {orders.map((o) => (
                      <li key={o.id || o._id} className="rounded border p-3">
                        <div className="font-medium text-violet-900">سفارش {o.id || o._id}</div>
                        <div className="text-sm text-gray-700">وضعیت: {o.status || "نامشخص"}</div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}

            {active === "support" && (
              <div>
                <h2 className="mb-4 text-xl font-semibold">پشتیبانی</h2>
                <p className="text-sm text-gray-700">در این بخش می‌توانید تیکت ارسال کنید یا با پشتیبانی تماس بگیرید. اینجا فعلاً نمایشی است؛ بعداً به بک‌اند وصل می‌کنیم.</p>
                <div className="mt-4">
                  <textarea className="w-full rounded border px-3 py-2" rows={6} placeholder="شرح مشکل یا درخواست شما" />
                  <div className="mt-3 flex justify-start">
                    <button className="rounded bg-violet-700 px-4 py-2 text-white">ارسال تیکت</button>
                  </div>
                </div>
              </div>
            )}

            {active === "profile" && (
              <div>
                <h2 className="mb-4 text-xl font-semibold">پروفایل</h2>
                <p className="text-sm text-gray-700">اطلاعات کاربری و تاریخچه سفارش‌ها در اینجا نمایش داده می‌شود.</p>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
