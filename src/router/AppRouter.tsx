import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import NavBar from "../components/layout/NavBar";
import AboutPage from "../pages/AboutPage";
import AdminLoginPage from "../pages/AdminLoginPage";
import AdminPage from "../pages/AdminPage";
import HomePage from "../pages/HomePage";
import InspectorPage from "../pages/InspectorPage";
import LoginPage from "../pages/LoginPage";
import NotificationsPage from "../pages/NotificationsPage";
import NotFoundPage from "../pages/NotFoundPage";
import OrdersPage from "../pages/OrdersPage";
import ProductDetailsPage from "../pages/ProductDetailsPage";
import ProductsPage from "../pages/ProductsPage";
import RegisterPage from "../pages/RegisterPage";
import UserDashboard from "../pages/UserDashboard";
import { ADMIN_LOGIN_PATH } from "./paths";

export { ADMIN_LOGIN_PATH };

// Pages that render their own bar (home = scroll reveal) or are full-screen (auth/admin).
const NAVBAR_EXCLUDED = ["/", "/login", "/register", "/admin", ADMIN_LOGIN_PATH];

function AppRoutes() {
  const location = useLocation();
  const showNavBar = !NAVBAR_EXCLUDED.includes(location.pathname);

  return (
    <>
      {showNavBar && <NavBar className="sticky top-0 z-50" />}
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/products" element={<ProductsPage />} />
        <Route path="/account" element={<UserDashboard />} />
        <Route path="/products/:id" element={<ProductDetailsPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/orders" element={<OrdersPage />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path={ADMIN_LOGIN_PATH} element={<AdminLoginPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/notifications" element={<NotificationsPage />} />
        <Route path="/inspector" element={<InspectorPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </>
  );
}

export default function AppRouter() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}
