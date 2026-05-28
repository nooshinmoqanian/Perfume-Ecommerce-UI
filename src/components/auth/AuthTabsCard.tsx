import { type FormEvent, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { login, register } from "../../api";
import { setAuthToken } from "../../hooks/useAuthToken";
import { normalizeNumberString } from "../../utils/format";

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

      setAuthToken(response.token);
      navigate("/admin");
    } catch (err) {
      const message = err instanceof Error ? err.message : "خطا در ارتباط با سرور";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#2b1055]" dir="rtl">
      <div className="absolute inset-0 bg-[linear-gradient(180deg,#5f1f88_0%,#b63f93_42%,#ea83a8_68%,#f3b4a3_100%)]" />

      <div className="absolute inset-x-0 bottom-0 h-[56vh] bg-[#5c237e]/70 [clip-path:polygon(0_65%,13%_58%,27%_66%,38%_55%,52%_64%,64%_53%,78%_61%,89%_52%,100%_58%,100%_100%,0_100%)]" />
      <div className="absolute inset-x-0 bottom-0 h-[42vh] bg-[#4b1f6d]/80 [clip-path:polygon(0_72%,14%_61%,29%_70%,41%_59%,57%_68%,73%_58%,86%_66%,100%_57%,100%_100%,0_100%)]" />
      <div className="absolute inset-x-0 bottom-0 h-[28vh] bg-[#3a1459]/85 [clip-path:polygon(0_74%,19%_66%,35%_74%,52%_65%,67%_74%,84%_66%,100%_72%,100%_100%,0_100%)]" />

      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-6xl flex-col px-6 py-8">
        <header className="mb-12 flex items-center justify-between text-white/90">
          <nav className="mx-auto hidden items-center gap-14 text-sm md:flex">
            <Link to="/" className="transition hover:text-white">
              خانه
            </Link>
            <Link to="/products" className="transition hover:text-white">
              فروشگاه
            </Link>
            <Link to="/about" className="transition hover:text-white">
              تماس با ما
            </Link>
            <Link to="/about" className="transition hover:text-white">
              درباره ما
            </Link>
          </nav>

          <Link
            to={mode === "register" ? "/login" : "/register"}
            className="rounded-md border border-white/60 px-4 py-1 text-xs text-white/90 transition hover:bg-white/10"
          >
            {mode === "register" ? "ورود" : "ثبت نام"}
          </Link>
        </header>

        <main className="mx-auto grid flex-1 place-items-center">
          <section className="w-full max-w-md rounded-2xl border border-white/35 bg-white/12 p-6 shadow-2xl backdrop-blur-md md:p-8">
            <div className="mb-5 grid grid-cols-2 rounded-xl border border-white/25 bg-white/10 p-1">
              <button
                type="button"
                onClick={() => {
                  setMode("register");
                  setError("");
                }}
                className={`rounded-lg px-4 py-2 text-sm transition ${
                  mode === "register" ? "bg-white/85 text-violet-900" : "text-white/80 hover:bg-white/10"
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
                  mode === "login" ? "bg-white/85 text-violet-900" : "text-white/80 hover:bg-white/10"
                }`}
              >
                ورود
              </button>
            </div>

            <h2 className="mb-6 text-center text-2xl font-bold text-white">{title}</h2>

            <form className="grid gap-4" onSubmit={submit}>
              {mode === "register" && (
                <label className="grid gap-2 text-sm text-white/90">
                  نام و نام خانوادگی
                  <input
                    className="h-11 rounded-xl border border-white/30 bg-white/15 px-4 text-white placeholder:text-white/60 focus:border-white/60 focus:outline-none"
                    placeholder="مثال: نازنین احمدی"
                    value={fullName}
                    onChange={(event) => setFullName(event.target.value)}
                  />
                </label>
              )}

              <label className="grid gap-2 text-sm text-white/90">
                ایمیل
                <input
                  className="h-11 rounded-xl border border-white/30 bg-white/15 px-4 text-white placeholder:text-white/60 focus:border-white/60 focus:outline-none"
                  placeholder="example@email.com"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                />
              </label>

              <label className="grid gap-2 text-sm text-white/90">
                رمز عبور
                <input
                  type="password"
                  className="h-11 rounded-xl border border-white/30 bg-white/15 px-4 text-white placeholder:text-white/60 focus:border-white/60 focus:outline-none"
                  placeholder="********"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                />
              </label>

              {mode === "register" && (
                <label className="mt-1 flex items-center gap-2 text-xs text-white/90">
                  <input
                    type="checkbox"
                    checked={agreeTerms}
                    onChange={(event) => setAgreeTerms(event.target.checked)}
                    className="h-4 w-4 accent-violet-700"
                  />
                  <span>قوانین و شرایط استفاده را می پذیرم</span>
                </label>
              )}

              {error && <div className="rounded-lg border border-red-300/50 bg-red-500/15 px-3 py-2 text-sm text-red-100">{error}</div>}

              <button
                className="mt-2 h-11 rounded-xl bg-gradient-to-r from-violet-800 via-purple-700 to-violet-900 text-sm font-semibold text-white shadow-lg transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-70"
                disabled={loading}
              >
                {loading ? "در حال پردازش..." : mode === "register" ? "ثبت نام" : "ورود"}
              </button>
            </form>

            <div className="mt-5 text-center text-xs text-white/85">
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
