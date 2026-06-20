import RequestIdBadge from "./components/common/RequestIdBadge";
import ToastHost from "./components/common/ToastHost";
import { CartProvider } from "./hooks/useCart";
import AppRouter from "./router/AppRouter";

export default function App() {
  return (
    <CartProvider>
      <ToastHost />
      <AppRouter />
      <RequestIdBadge />
    </CartProvider>
  );
}
