import { type FormEvent, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { login, register } from "../../api";
import { setAuthSession } from "../../hooks/useAuthToken";
import { normalizeNumberString } from "../../utils/format";
import Logo from "../layout/Logo";

type AuthMode = "login" | "register";

type AuthTabsCardProps = {
  defaultMode: AuthMode;
};

export default function AuthTabsCard({ defaultMode }: AuthTabsCardProps) {
  const navigate = useNavigate();
  const [mode, setMode] = useState<AuthMode>(defaultMode);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const title = useMemo(() => (mode === "register" ? "ثبت نام" : "ورود"), [mode]);

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

      if (mode === "register") {
        if (!fullName.trim()) {
          throw new Error("نام و نام خانوادگی را وارد کنید");
        }
        if (!agreeTerms) {
          throw new Error("لطفاً قوانین و شرایط را تایید کنید");
        }
      }

      const response =
        mode === "register"
          ? await register({ email: normalizedEmail, password: normalizedPassword, role: "user" })
          : await login({ email: normalizedEmail, password: normalizedPassword });

      const user = response?.user ?? { email: normalizedEmail, role: "user" as const };
      setAuthSession(response.token, {
        ...user,
        // Keep the typed name locally until the profile is loaded from the backend.
        name: mode === "register" ? fullName.trim() : user.name,
      });

      // Admins land on the panel; regular users go to their account.
      navigate(user.role === "admin" ? "/admin" : "/account");
    } catch (err) {
      const message = err instanceof Error ? err.message : "خطا در ارتباط با سرور";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "h-11 rounded-xl border border-violet-200 bg-white px-4 text-violet-900 placeholder:text-violet-300 focus:border-violet-500 focus:outline-none";

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#f9f2e4]" dir="rtl">
      {/* Soft cream → blush → pink wash that matches the storefront palette. */}
      <div className="absolute inset-0 bg-[linear-gradient(180deg,#f9f2e4_0%,#f7e6ec_45%,#f1d3e0_72%,#e9bcd2_100%)]" />
      <div className="absolute inset-x-0 bottom-0 h-[56vh] bg-[#f3d9e4]/70 [clip-path:polygon(0_65%,13%_58%,27%_66%,38%_55%,52%_64%,64%_53%,78%_61%,89%_52%,100%_58%,100%_100%,0_100%)]" />
      <div className="absolute inset-x-0 bottom-0 h-[42vh] bg-[#ecc2d6]/70 [clip-path:polygon(0_72%,14%_61%,29%_70%,41%_59%,57%_68%,73%_58%,86%_66%,100%_57%,100%_100%,0_100%)]" />
      <div className="absolute inset-x-0 bottom-0 h-[28vh] bg-[#e3a9c6]/60 [clip-path:polygon(0_74%,19%_66%,35%_74%,52%_65%,67%_74%,84%_66%,100%_72%,100%_100%,0_100%)]" />

      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-6xl flex-col px-6 py-8">
        <header className="mb-12 flex items-center justify-between text-violet-900">
          <Link to="/" aria-label="خانه">
            <Logo />
          </Link>

          <nav className="mx-auto hidden items-center gap-12 text-sm md:flex">
            <Link to="/" className="transition hover:text-violet-700">
              خانه
            </Link>
            <Link to="/products" className="transition hover:text-violet-700">
              فروشگاه
            </Link>
            <Link to="/about" className="transition hover:text-violet-700">
              درباره ما
            </Link>
          </nav>

          <Link
            to={mode === "register" ? "/login" : "/register"}
            className="rounded-md border border-violet-300 px-4 py-1 text-xs text-violet-800 transition hover:bg-white/60"
          >
            {mode === "register" ? "ورود" : "ثبت نام"}
          </Link>
        </header>

        <main className="mx-auto grid flex-1 place-items-center">
          <section className="w-full max-w-md rounded-2xl border border-white/70 bg-white/75 p-6 shadow-glass backdrop-blur-md md:p-8">
            <div className="mb-5 grid grid-cols-2 rounded-xl border border-violet-100 bg-violet-50/60 p-1">
              <button
                type="button"
                onClick={() => {
                  setMode("register");
                  setError("");
                }}
                className={`rounded-lg px-4 py-2 text-sm transition ${
                  mode === "register" ? "bg-violet-700 text-white shadow" : "text-violet-700 hover:bg-white/70"
                }`}
              >
                ثبت نام
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode("login");
                  setError("");
                }}
                className={`rounded-lg px-4 py-2 text-sm transition ${
                  mode === "login" ? "bg-violet-700 text-white shadow" : "text-violet-700 hover:bg-white/70"
                }`}
              >
                ورود
              </button>
            </div>

            <h2 className="mb-6 text-center text-2xl font-bold text-violet-900">{title}</h2>

            <form className="grid gap-4" onSubmit={submit}>
              {mode === "register" && (
                <label className="grid gap-2 text-sm text-violet-900">
                  نام و نام خانوادگی
                  <input
                    className={inputClass}
                    placeholder="مثال: نازنین احمدی"
                    value={fullName}
                    onChange={(event) => setFullName(event.target.value)}
                  />
                </label>
              )}

              <label className="grid gap-2 text-sm text-violet-900">
                ایمیل
                <input
                  className={inputClass}
                  placeholder="example@email.com"
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

              {mode === "register" && (
                <label className="mt-1 flex items-center gap-2 text-xs text-violet-800">
                  <input
                    type="checkbox"
                    checked={agreeTerms}
                    onChange={(event) => setAgreeTerms(event.target.checked)}
                    className="h-4 w-4 accent-violet-700"
                  />
                  <span>قوانین و شرایط استفاده را می پذیرم</span>
                </label>
              )}

              {error && (
                <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">{error}</div>
              )}

              <button
                className="mt-2 h-11 rounded-xl bg-gradient-to-r from-violet-700 to-[#8b1e55] text-sm font-semibold text-white shadow-lg transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-70"
                disabled={loading}
              >
                {loading ? "در حال پردازش..." : mode === "register" ? "ثبت نام" : "ورود"}
              </button>
            </form>

            <div className="mt-5 text-center text-xs text-violet-700">
              {mode === "register" ? (
                <button type="button" className="underline underline-offset-4" onClick={() => setMode("login")}>
                  حساب دارید؟ ورود
                </button>
              ) : (
                <button type="button" className="underline underline-offset-4" onClick={() => setMode("register")}>
                  حساب ندارید؟ ثبت نام
                </button>
              )}
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
