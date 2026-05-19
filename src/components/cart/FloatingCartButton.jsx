import { useState } from "react";
import CartModal from "./CartModal";

export default function FloatingCartButton({ inline = false }) {
  const [open, setOpen] = useState(false);

  const button = (
    <button
      onClick={() => setOpen(true)}
      className={`relative flex items-center justify-center rounded-full border border-violet-200 bg-white text-violet-700 shadow-md transition hover:bg-violet-50 ${
        inline ? "h-10 w-10 p-2" : "h-12 w-12"
      }`}
      aria-label="Cart"
      title="Cart"
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
    </button>
  );

  return (
    <>
      {inline ? <>{button}</> : <div className="fixed left-4 top-4 z-[60]">{button}</div>}
      <CartModal open={open} onClose={() => setOpen(false)} />
    </>
  );
}
