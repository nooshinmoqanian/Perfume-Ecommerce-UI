import { type FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../api";
import { clearAuthToken, setAuthSession } from "../hooks/useAuthToken";
import { normalizeNumberString } from "../utils/format";
import Logo from "../components/layout/Logo";

// Minimal, unlinked staff login. Reachable only via its direct (obscure) URL.
export default function AdminLoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const normalizedEmail = email.trim().toLowerCase();
      const normalizedPassword = normalizeNumberString(password).trim();
      if (!normalizedEmail || !normalizedPassword) {
        throw new Error("ایمیل و رمز عبور الزامی است");
      }

      const response = await login({ email: normalizedEmail, password: normalizedPassword });
      const user = response?.user;

      if (user?.role !== "admin") {
        // Authenticated, but not an admin — do not keep the session here.
        clearAuthToken();
        throw new Error("این حساب دسترسی مدیریت ندارد");
      }

      setAuthSession(response.token, user);
      navigate("/admin");
    } catch (err) {
      const message = err instanceof Error ? err.message : "خطا در ارتباط با سرور";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "h-11 w-full rounded-xl border border-violet-200 bg-white px-4 text-violet-900 placeholder:text-violet-300 focus:border-violet-500 focus:outline-none";

  return (
    <div
      className="grid min-h-screen place-items-center bg-[linear-gradient(180deg,#f9f2e4_0%,#f7e6ec_55%,#f1d3e0_100%)] px-6"
      dir="rtl"
    >
      <section className="w-full max-w-sm rounded-2xl border border-white/70 bg-white/80 p-7 shadow-glass backdrop-blur-md">
        <div className="mb-6 flex flex-col items-center gap-3 text-center">
          <Logo />
          <div>
            <h1 className="text-xl font-bold text-violet-900">ورود مدیریت</h1>
            <p className="mt-1 text-xs text-violet-500">دسترسی فقط برای پرسنل مجاز</p>
          </div>
        </div>

        <form className="grid gap-4" onSubmit={submit}>
          <label className="grid gap-2 text-sm text-violet-900">
            ایمیل مدیر
            <input
              className={inputClass}
              placeholder="admin@email.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </label>

          <label className="grid gap-2 text-sm text-violet-900">
            رمز عبور
            <input
              type="password"
              className={inputClass}
              placeholder="********"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </label>

          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">{error}</div>
          )}

          <button
            className="mt-1 h-11 rounded-xl bg-gradient-to-r from-violet-700 to-[#8b1e55] text-sm font-semibold text-white shadow-lg transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-70"
            disabled={loading}
          >
            {loading ? "در حال بررسی..." : "ورود به پنل"}
          </button>
        </form>
      </section>
    </div>
  );
}
