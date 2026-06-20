import { useMemo, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { clearAuthToken, DEV_ADMIN_TOKEN, getAuthToken, getAuthUser } from "../../hooks/useAuthToken";
import { useCart } from "../../hooks/useCart";
import CartModal from "../cart/CartModal";
import Logo from "./Logo";

type NavBarProps = {
  // Extra classes for positioning (e.g. sticky on inner pages, fixed on the homepage reveal).
  className?: string;
};

// Single shared top bar used on every page so the homepage and inner pages stay identical.
// Layout (RTL): nav links + auth actions on the right, brand logo + cart on the left.
export default function NavBar({ className = "" }: NavBarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const cart = useCart();
  const [cartOpen, setCartOpen] = useState(false);

  // Re-read auth on every navigation so login/logout reflects without a full reload.
  const token = useMemo(() => getAuthToken(), [location.pathname, location.key]);
  const user = useMemo(() => getAuthUser(), [location.pathname, location.key]);
  const isAdmin = token === DEV_ADMIN_TOKEN || user?.role === "admin";
  const cartCount = cart.items.reduce((sum, item) => sum + Number(item.quantity || 0), 0);

  const handleLogout = () => {
    clearAuthToken();
    navigate("/");
  };

  const navClass = ({ isActive }: { isActive: boolean }) =>
    `rounded-md px-3 py-2 text-sm transition ${
      isActive ? "bg-violet-700 text-white" : "text-violet-900 hover:bg-violet-100"
    }`;

  return (
    <div dir="rtl" className={`w-full border-b border-violet-100 bg-white/90 backdrop-blur ${className}`}>
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4">
        {/* Right side (RTL start): navigation + auth actions */}
        <div className="flex items-center gap-1">
          <nav className="hidden items-center gap-1 sm:flex">
            <NavLink to="/products" className={navClass}>
              محصولات
            </NavLink>
            <NavLink to="/about" className={navClass}>
              درباره ما
            </NavLink>
          </nav>

          <span className="mx-1 hidden h-6 w-px bg-violet-100 sm:block" />

          {token ? (
            <>
              {isAdmin ? (
                <Link
                  to="/admin"
                  className="rounded-md bg-violet-700 px-3 py-2 text-sm text-white transition hover:bg-violet-600"
                >
                  پنل مدیریت
                </Link>
              ) : (
                <Link
                  to="/account"
                  className="rounded-md bg-violet-100 px-3 py-2 text-sm text-violet-900 transition hover:bg-violet-200"
                >
                  حساب من
                </Link>
              )}
              <button
                onClick={handleLogout}
                className="rounded-md px-3 py-2 text-sm text-violet-700 transition hover:bg-violet-50"
              >
                خروج
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="rounded-md bg-violet-100 px-3 py-2 text-sm text-violet-800 transition hover:bg-violet-200"
              >
                ورود
              </Link>
              <Link
                to="/register"
                className="rounded-md bg-violet-700 px-3 py-2 text-sm text-white transition hover:bg-violet-600"
              >
                ثبت‌نام
              </Link>
            </>
          )}
        </div>

        {/* Left side (RTL end): brand logo + cart */}
        <div className="flex items-center gap-3">
          <Link to="/" aria-label="خانه">
            <Logo />
          </Link>
          <button
            onClick={() => setCartOpen(true)}
            className="relative grid h-11 w-11 place-items-center rounded-full border border-violet-200/90 bg-gradient-to-br from-white via-[#f7f1ff] to-[#f5e9d2] text-violet-800 shadow-[0_12px_28px_-16px_rgba(76,29,149,0.7)] transition hover:-translate-y-0.5"
            aria-label="سبد خرید"
            title="سبد خرید"
          >
            <svg width={22} height={22} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M3 5H5L7 14H18L20 7H8"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <circle cx="10" cy="19" r="1.4" fill="currentColor" />
              <circle cx="17" cy="19" r="1.4" fill="currentColor" />
            </svg>
            {cartCount > 0 && (
              <span className="absolute -right-1 -top-1 grid min-h-5 min-w-5 place-items-center rounded-full bg-[#8b1e55] px-1 text-[11px] font-bold leading-none text-white shadow">
                {cartCount > 99 ? "99+" : cartCount}
              </span>
            )}
          </button>
        </div>
      </div>

      <CartModal open={cartOpen} onClose={() => setCartOpen(false)} />
    </div>
  );
}
