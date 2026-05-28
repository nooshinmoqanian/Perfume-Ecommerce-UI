import FloatingCartButton from "./components/cart/FloatingCartButton";
import DashboardButton from "./components/common/DashboardButton";
import RequestIdBadge from "./components/common/RequestIdBadge";
import ToastHost from "./components/common/ToastHost";
import { CartProvider } from "./hooks/useCart";
import AppRouter from "./router/AppRouter";

export default function App() {
  return (
    <CartProvider>
      <FloatingCartButton />
      <DashboardButton />
      <ToastHost />
      <AppRouter />
      <RequestIdBadge />
    </CartProvider>
  );
}
