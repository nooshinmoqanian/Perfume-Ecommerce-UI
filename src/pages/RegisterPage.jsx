import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { register } from "../api";
import { setAuthToken } from "../hooks/useAuthToken";
import { normalizeNumberString } from "../utils/format";

export default function RegisterPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await register({
        email: email.trim().toLowerCase(),
        password: normalizeNumberString(password).trim(),
      });
      setAuthToken(response.token);
      navigate("/admin");
    } catch (err) {
      setError(err.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-[calc(100vh-68px)] overflow-hidden bg-[#1f1242]">
      <div className="absolute inset-0 bg-[radial-gradient(80%_70%_at_20%_30%,rgba(168,85,247,0.45),transparent_60%),radial-gradient(70%_60%_at_80%_20%,rgba(99,102,241,0.4),transparent_55%),linear-gradient(135deg,#23124e,#3b1d7a_45%,#5b21b6)]" />

      <div className="relative z-10 mx-auto grid min-h-[calc(100vh-68px)] w-full max-w-6xl grid-cols-1 items-center gap-10 px-6 py-10 lg:grid-cols-2">
        <section className="w-full max-w-md justify-self-end rounded-2xl border border-violet-200/25 bg-[#2a1354]/70 p-6 shadow-2xl backdrop-blur-sm md:p-8">
          <h2 className="mb-6 text-center text-2xl font-bold text-white">Register</h2>

          <form className="grid gap-4" onSubmit={submit}>
            <label className="grid gap-2 text-sm text-violet-100">
              Email
              <input
                className="h-11 rounded-full border border-violet-200/25 bg-white/20 px-4 text-white placeholder:text-violet-200 focus:border-violet-300 focus:outline-none"
                placeholder="example@email.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
            </label>

            <label className="grid gap-2 text-sm text-violet-100">
              Password
              <input
                type="password"
                className="h-11 rounded-full border border-violet-200/25 bg-white/20 px-4 text-white placeholder:text-violet-200 focus:border-violet-300 focus:outline-none"
                placeholder="********"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />
            </label>

            {error && <div className="rounded-lg border border-red-300/40 bg-red-500/10 px-3 py-2 text-sm text-red-100">{error}</div>}

            <button
              className="mt-2 h-11 rounded-full bg-gradient-to-r from-violet-400 via-violet-500 to-purple-700 text-sm font-semibold text-white shadow-lg shadow-violet-900/35 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-70"
              disabled={loading}
            >
              {loading ? "Creating account..." : "Register"}
            </button>

            <div className="mt-2 text-center text-sm text-violet-100/90">
              Already have an account?{" "}
              <Link className="font-semibold text-white underline decoration-violet-200/70 underline-offset-4" to="/login">
                Login
              </Link>
            </div>
          </form>
        </section>

        <section className="max-w-xl justify-self-start text-white lg:pr-6">
          <h1 className="text-5xl font-extrabold tracking-wide">Create Account</h1>
          <p className="mt-3 text-2xl font-medium text-violet-100">Start your journey with us.</p>
        </section>
      </div>
    </div>
  );
}
