import { useEffect, useState } from "react";
import { createOrder, reserveProduct } from "../../api";
import { useCart } from "../../hooks/useCart";
import { formatToman } from "../../utils/format";
import { showToast } from "../../hooks/useToast";

export default function CartModal({ open, onClose }) {
  const cart = useCart();
  const [loading, setLoading] = useState(false);
  const [recipientName, setRecipientName] = useState("");
  const [phone, setPhone] = useState("");
  const [shippingAddress, setShippingAddress] = useState("");
  const [postalCode, setPostalCode] = useState("");

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  const itemsCount = cart.items.reduce((sum, item) => sum + Number(item.quantity || 0), 0);

  const submitCheckout = async () => {
    if (cart.items.length === 0) {
      showToast("سبد خرید خالی است", "error");
      return;
    }

    if (!phone.trim() || !shippingAddress.trim()) {
      showToast("شماره تماس و آدرس الزامی است", "error");
      return;
    }

    setLoading(true);
    try {
      for (const item of cart.items) {
        await reserveProduct({ productId: item.productId, quantity: item.quantity });
      }

      const payload = {
        items: cart.items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          price: Number(item.price || 0),
        })),
        total: cart.total(),
        recipientName: recipientName || undefined,
        phone,
        shippingAddress,
        postalCode: postalCode || undefined,
      };

      const response = await createOrder(payload);
      cart.clear();
      showToast(`سفارش ثبت شد: ${response?.id || response?._id || "موفق"}`, "success");
      onClose();
    } catch (error) {
      showToast(error.message || "نهایی‌سازی سفارش ناموفق بود", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-5" dir="rtl">
      <div className="absolute inset-0 bg-[#2a153f]/55 backdrop-blur-[3px]" onClick={onClose} />

      <div className="relative w-full max-w-3xl overflow-hidden rounded-[28px] border border-violet-200/90 bg-gradient-to-b from-[#f8f4ff] via-[#fcf9ff] to-[#fff9ee] shadow-[0_25px_70px_-35px_rgba(46,16,101,0.55)]">
        <div className="border-b border-violet-200/70 bg-gradient-to-r from-violet-900 via-violet-800 to-[#7b5fc6] px-5 py-5 text-white md:px-7">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs tracking-[0.24em] text-violet-100/90">CHECKOUT</p>
              <h3 className="mt-2 text-xl font-semibold md:text-2xl">سبد خرید شما</h3>
              <p className="mt-1 text-sm text-violet-100/90">طراحی شده برای یک تجربه خرید سریع، شیک و حرفه‌ای</p>
            </div>

            <div className="rounded-2xl border border-white/30 bg-white/15 px-4 py-2 text-left backdrop-blur">
              <p className="text-[11px] text-violet-100">جمع کل</p>
              <p className="mt-1 text-sm font-semibold">{formatToman(cart.total())}</p>
            </div>
          </div>
        </div>

        <div className="max-h-[82vh] overflow-auto px-5 pb-5 pt-4 md:px-7 md:pb-7">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <div className="inline-flex items-center gap-2 rounded-full border border-violet-200 bg-white px-3 py-1 text-xs text-violet-800">
              <span className="inline-block h-2 w-2 rounded-full bg-[#d6b56f]" />
              {itemsCount} آیتم در سبد شما
            </div>

            <div className="flex items-center gap-2">
              <button
                className="rounded-full border border-violet-300 bg-white px-4 py-1.5 text-xs text-violet-800 transition hover:bg-violet-50"
                onClick={onClose}
              >
                بستن
              </button>
              <button
                className="rounded-full bg-[#8b1e55] px-4 py-1.5 text-xs text-white transition hover:bg-[#731949] disabled:opacity-70"
                onClick={cart.clear}
                disabled={cart.items.length === 0}
              >
                پاک کردن سبد
              </button>
            </div>
          </div>

          {cart.items.length === 0 ? (
            <div className="grid place-items-center rounded-2xl border border-dashed border-violet-300/80 bg-white/80 px-5 py-12 text-center">
              <div className="mb-4 grid h-16 w-16 place-items-center rounded-full bg-violet-100 text-2xl text-violet-800">🛍️</div>
              <p className="text-base font-medium text-violet-900">سبد خرید شما خالی است</p>
              <p className="mt-2 text-sm text-violet-800/80">محصولات دلخواهتان را اضافه کنید تا اینجا نمایش داده شوند.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {cart.items.map((item) => (
                <div
                  className="rounded-2xl border border-violet-200/80 bg-white/85 p-3 shadow-[0_8px_24px_-18px_rgba(76,29,149,0.55)] md:p-4"
                  key={item.productId}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-semibold text-violet-950 md:text-base">{item.name}</div>
                      <div className="mt-1 text-xs text-violet-800/80 md:text-sm">قیمت واحد: {formatToman(item.price || 0)}</div>
                    </div>

                    <button
                      className="rounded-full px-2 py-1 text-xs text-[#8b1e55] transition hover:bg-[#ffe6f1]"
                      onClick={() => cart.remove(item.productId)}
                    >
                      حذف
                    </button>
                  </div>

                  <div className="mt-3 flex items-center justify-between rounded-xl border border-violet-100 bg-[#fbf8ff] px-3 py-2">
                    <div className="flex items-center gap-2">
                      <button
                        className="grid h-8 w-8 place-items-center rounded-full border border-violet-300 bg-white text-violet-800 transition hover:bg-violet-50"
                        onClick={() => cart.update(item.productId, item.quantity + 1)}
                      >
                        +
                      </button>
                      <div className="min-w-8 text-center text-sm font-semibold text-violet-900">{item.quantity}</div>
                      <button
                        className="grid h-8 w-8 place-items-center rounded-full border border-violet-300 bg-white text-violet-800 transition hover:bg-violet-50"
                        onClick={() => cart.update(item.productId, Math.max(1, item.quantity - 1))}
                      >
                        -
                      </button>
                    </div>

                    <div className="text-xs text-violet-900 md:text-sm">
                      مبلغ آیتم: <span className="font-bold">{formatToman(Number(item.price || 0) * Number(item.quantity || 0))}</span>
                    </div>
                  </div>
                </div>
              ))}

              <div className="mt-2 rounded-2xl border border-violet-200 bg-gradient-to-r from-violet-50 to-[#f8f0df] px-4 py-3">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-violet-900">مجموع قابل پرداخت</div>
                  <div className="text-lg font-extrabold text-violet-900">{formatToman(cart.total())}</div>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
                <input
                  className="rounded-xl border border-violet-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-200"
                  placeholder="نام گیرنده (اختیاری)"
                  value={recipientName}
                  onChange={(event) => setRecipientName(event.target.value)}
                />
                <input
                  className="rounded-xl border border-violet-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-200"
                  placeholder="شماره تماس"
                  value={phone}
                  onChange={(event) => setPhone(event.target.value)}
                />
                <input
                  className="md:col-span-2 rounded-xl border border-violet-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-200"
                  placeholder="آدرس ارسال"
                  value={shippingAddress}
                  onChange={(event) => setShippingAddress(event.target.value)}
                />
                <input
                  className="rounded-xl border border-violet-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-200"
                  placeholder="کد پستی (اختیاری)"
                  value={postalCode}
                  onChange={(event) => setPostalCode(event.target.value)}
                />
              </div>

              <button
                className="mt-4 w-full rounded-xl bg-gradient-to-r from-violet-900 via-violet-800 to-[#7f5ec8] px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-700/25 transition hover:brightness-110 disabled:opacity-70"
                onClick={submitCheckout}
                disabled={loading}
              >
                {loading ? "در حال پردازش سفارش..." : "ثبت و نهایی‌سازی سفارش"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
