import { useState } from "react";
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

  if (!open) return null;

  const submitCheckout = async () => {
    if (cart.items.length === 0) {
      showToast("Cart is empty", "error");
      return;
    }

    if (!phone.trim() || !shippingAddress.trim()) {
      showToast("Phone and address are required", "error");
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
      showToast(`Order created: ${response?.id || response?._id || "success"}`, "success");
      onClose();
    } catch (error) {
      showToast(error.message || "Checkout failed", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative m-4 max-h-[80vh] w-full max-w-2xl overflow-auto rounded bg-white p-4 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold">Your cart</h3>
          <div className="flex items-center gap-2">
            <button className="text-sm text-gray-600" onClick={onClose}>Close</button>
            <button className="rounded bg-red-600 px-2 py-1 text-sm text-white" onClick={cart.clear}>Clear</button>
          </div>
        </div>

        {cart.items.length === 0 ? (
          <p className="text-sm text-gray-500">Your cart is empty.</p>
        ) : (
          <div className="space-y-3">
            {cart.items.map((item) => (
              <div className="flex items-center justify-between rounded border p-2" key={item.productId}>
                <div className="flex-1">
                  <div className="font-medium">{item.name}</div>
                  <div className="text-sm text-gray-500">{formatToman(item.price || 0)}</div>
                </div>

                <div className="flex items-center gap-2">
                  <button className="rounded border px-2 py-1" onClick={() => cart.update(item.productId, Math.max(1, item.quantity - 1))}>-</button>
                  <div className="px-3">{item.quantity}</div>
                  <button className="rounded border px-2 py-1" onClick={() => cart.update(item.productId, item.quantity + 1)}>+</button>
                  <button className="ml-3 text-sm text-red-600" onClick={() => cart.remove(item.productId)}>Remove</button>
                </div>
              </div>
            ))}

            <div className="flex items-center justify-between border-t pt-3">
              <div className="font-semibold">Total</div>
              <div className="font-bold">{formatToman(cart.total())}</div>
            </div>

            <div className="mt-3 grid gap-2">
              <input
                className="rounded border px-2 py-1"
                placeholder="Recipient name (optional)"
                value={recipientName}
                onChange={(event) => setRecipientName(event.target.value)}
              />
              <input
                className="rounded border px-2 py-1"
                placeholder="Phone"
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
              />
              <input
                className="rounded border px-2 py-1"
                placeholder="Shipping address"
                value={shippingAddress}
                onChange={(event) => setShippingAddress(event.target.value)}
              />
              <input
                className="rounded border px-2 py-1"
                placeholder="Postal code (optional)"
                value={postalCode}
                onChange={(event) => setPostalCode(event.target.value)}
              />
            </div>

            <button
              className="w-full rounded bg-violet-700 px-4 py-2 text-white disabled:opacity-70"
              onClick={submitCheckout}
              disabled={loading}
            >
              {loading ? "Processing..." : "Submit order"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
