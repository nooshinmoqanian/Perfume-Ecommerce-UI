import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { clearAuthToken, getAuthToken } from "../../hooks/useAuthToken";
import { useMemo } from "react";

export default function Header() {
  const location = useLocation();
  const navigate = useNavigate();
  const token = useMemo(() => getAuthToken(), [location.pathname]);

  const isRoot = location.pathname === "/";
  const navClass = ({ isActive }) =>
    `rounded-md px-3 py-2 text-sm transition ${
      isActive ? "bg-violet-700 text-white" : "text-violet-900 hover:bg-violet-100"
    }`;

  const handleLogout = () => {
    clearAuthToken();
    navigate("/");
  };

  return (
    <header
      className={`${isRoot ? "fixed" : "sticky"} top-0 z-40 border-b border-violet-100 bg-white/90 backdrop-blur`}
    >
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3">
          <Link to="/" className="rounded-md px-2 py-1 text-base font-semibold text-violet-900 hover:bg-violet-50">
            Professor Perfume
          </Link>
          <nav className="hidden items-center gap-1 sm:flex">
            <NavLink to="/products" className={navClass}>
              Products
            </NavLink>
            <NavLink to="/about" className={navClass}>
              About
            </NavLink>
          </nav>
        </div>

        <div className="flex items-center gap-2">
          {token ? (
            <button
              className="rounded-md bg-violet-100 px-3 py-2 text-sm text-violet-900 hover:bg-violet-200"
              onClick={handleLogout}
            >
              Logout
            </button>
          ) : (
            <>
              <Link className="rounded-md bg-violet-100 px-3 py-2 text-sm text-violet-800 hover:bg-violet-200" to="/login">
                Login
              </Link>
              <Link className="rounded-md bg-violet-700 px-3 py-2 text-sm text-white hover:bg-violet-600" to="/register">
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
