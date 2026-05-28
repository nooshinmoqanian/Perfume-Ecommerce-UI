import { useState } from "react";
import CartModal from "./CartModal";
import { useCart } from "../../hooks/useCart";

export default function FloatingCartButton({ inline = false }) {
  const [open, setOpen] = useState(false);
  const cart = useCart();
  const cartCount = cart.items.reduce((sum, item) => sum + Number(item.quantity || 0), 0);

  const button = (
    <button
      onClick={() => setOpen(true)}
      className={`group relative flex items-center justify-center rounded-full border border-violet-200/90 bg-gradient-to-br from-white via-[#f7f1ff] to-[#f5e9d2] text-violet-800 shadow-[0_12px_28px_-16px_rgba(76,29,149,0.7)] transition hover:-translate-y-0.5 hover:shadow-[0_18px_34px_-18px_rgba(76,29,149,0.75)] ${
        inline ? "h-10 w-10 p-2" : "h-12 w-12"
      }`}
      aria-label="سبد خرید"
      title="سبد خرید"
    >
      <svg width={inline ? 18 : 22} height={inline ? 18 : 22} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
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
  );

  return (
    <>
      {inline ? <>{button}</> : <div className="fixed left-4 top-4 z-[60]">{button}</div>}
      <CartModal open={open} onClose={() => setOpen(false)} />
    </>
  );
}
