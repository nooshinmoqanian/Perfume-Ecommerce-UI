import { type FormEvent, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getMe, listOrders, updateMe } from "../api";
import { DEV_ADMIN_TOKEN, getAuthToken, getAuthUser, setAuthUser } from "../hooks/useAuthToken";
import { showToast } from "../hooks/useToast";

type ProfileForm = {
  name: string;
  phone: string;
  address: string;
};

export default function UserDashboard() {
  const navigate = useNavigate();
  const token = getAuthToken();

  const [ready, setReady] = useState(false);
  const [active, setActive] = useState<"orders" | "support" | "profile">("orders");

  const [orders, setOrders] = useState<any[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  const [email, setEmail] = useState("");
  const [profile, setProfile] = useState<ProfileForm>({ name: "", phone: "", address: "" });
  const [savingProfile, setSavingProfile] = useState(false);

  // Guard: must be signed in; admins belong in the admin panel, not the user account.
  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }
    if (token === DEV_ADMIN_TOKEN || getAuthUser()?.role === "admin") {
      navigate("/admin");
      return;
    }

    let cancelled = false;
    getMe(token)
      .then((me) => {
        if (cancelled) return;
        if (me?.role === "admin") {
          navigate("/admin");
          return;
        }
        setEmail(me?.email || getAuthUser()?.email || "");
        setProfile({ name: me?.name || "", phone: me?.phone || "", address: me?.address || "" });
        setReady(true);
      })
      .catch(() => {
        if (cancelled) return;
        // Fall back to the locally cached identity if /me is unavailable.
        const cached = getAuthUser();
        setEmail(cached?.email || "");
        setProfile({ name: cached?.name || "", phone: cached?.phone || "", address: cached?.address || "" });
        setReady(true);
      });

    return () => {
      cancelled = true;
    };
  }, [token, navigate]);

  useEffect(() => {
    if (active !== "orders" || !ready) return;
    setLoadingOrders(true);
    listOrders()
      .then((data) => setOrders(Array.isArray(data) ? data : []))
      .catch(() => setOrders([]))
      .finally(() => setLoadingOrders(false));
  }, [active, ready]);

  const saveProfile = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!token) return;
    setSavingProfile(true);
    try {
      const updated = await updateMe(profile, token);
      setProfile({ name: updated?.name || "", phone: updated?.phone || "", address: updated?.address || "" });
      // Keep the cached identity (used by the nav bar) in sync.
      const cached = getAuthUser() || {};
      setAuthUser({ ...cached, name: updated?.name, phone: updated?.phone, address: updated?.address });
      showToast("پروفایل با موفقیت ذخیره شد", "success");
    } catch (error) {
      showToast((error as Error)?.message || "ذخیره پروفایل ناموفق بود", "error");
    } finally {
      setSavingProfile(false);
    }
  };

  if (!ready) {
    return (
      <div className="p-8" dir="rtl">
        در حال بارگذاری حساب کاربری...
      </div>
    );
  }

  const navItem = (key: typeof active, label: string) => (
    <button
      className={`w-full rounded px-3 py-2 text-right ${
        active === key ? "bg-violet-100 text-violet-900" : "hover:bg-gray-50"
      }`}
      onClick={() => setActive(key)}
    >
      {label}
    </button>
  );

  const fieldClass = "w-full rounded border border-violet-200 px-3 py-2 focus:border-violet-500 focus:outline-none";

  return (
    <div className="min-h-screen bg-violet-50 p-6" dir="rtl">
      <div className="mx-auto max-w-6xl lg:flex lg:gap-6">
        <aside className="mb-6 w-full shrink-0 lg:w-1/4">
          <div className="rounded-lg border bg-white p-4">
            <h3 className="mb-1 text-lg font-semibold text-violet-900">پنل کاربری</h3>
            {email && <p className="mb-3 truncate text-xs text-gray-500">{email}</p>}
            <ul className="space-y-2 text-sm">
              <li>{navItem("orders", "سفارش‌ها")}</li>
              <li>{navItem("profile", "پروفایل")}</li>
              <li>{navItem("support", "پشتیبانی")}</li>
            </ul>
          </div>
        </aside>

        <main className="w-full lg:flex-1">
          <div className="rounded-lg border bg-white p-6">
            {active === "orders" && (
              <div>
                <h2 className="mb-4 text-xl font-semibold">سفارش‌های شما</h2>
                {loadingOrders ? (
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

            {active === "profile" && (
              <div>
                <h2 className="mb-4 text-xl font-semibold">پروفایل</h2>
                <form className="grid max-w-lg gap-4" onSubmit={saveProfile}>
                  <label className="grid gap-1 text-sm text-violet-900">
                    ایمیل
                    <input className={`${fieldClass} bg-gray-50 text-gray-500`} value={email} disabled />
                  </label>
                  <label className="grid gap-1 text-sm text-violet-900">
                    نام و نام خانوادگی
                    <input
                      className={fieldClass}
                      placeholder="نام شما"
                      value={profile.name}
                      onChange={(event) => setProfile((prev) => ({ ...prev, name: event.target.value }))}
                    />
                  </label>
                  <label className="grid gap-1 text-sm text-violet-900">
                    شماره تماس
                    <input
                      className={fieldClass}
                      placeholder="مثال: 09123456789"
                      value={profile.phone}
                      onChange={(event) => setProfile((prev) => ({ ...prev, phone: event.target.value }))}
                    />
                  </label>
                  <label className="grid gap-1 text-sm text-violet-900">
                    آدرس
                    <textarea
                      className={fieldClass}
                      rows={3}
                      placeholder="آدرس کامل برای ارسال سفارش"
                      value={profile.address}
                      onChange={(event) => setProfile((prev) => ({ ...prev, address: event.target.value }))}
                    />
                  </label>
                  <div>
                    <button
                      className="rounded bg-violet-700 px-5 py-2 text-white transition hover:bg-violet-600 disabled:opacity-70"
                      disabled={savingProfile}
                    >
                      {savingProfile ? "در حال ذخیره..." : "ذخیره تغییرات"}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {active === "support" && (
              <div>
                <h2 className="mb-4 text-xl font-semibold">پشتیبانی</h2>
                <p className="text-sm text-gray-700">
                  در این بخش می‌توانید تیکت ارسال کنید یا با پشتیبانی تماس بگیرید. اینجا فعلاً نمایشی است؛ بعداً به بک‌اند وصل می‌کنیم.
                </p>
                <div className="mt-4">
                  <textarea className="w-full rounded border px-3 py-2" rows={6} placeholder="شرح مشکل یا درخواست شما" />
                  <div className="mt-3 flex justify-start">
                    <button className="rounded bg-violet-700 px-4 py-2 text-white">ارسال تیکت</button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
