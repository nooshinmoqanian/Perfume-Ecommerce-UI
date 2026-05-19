import { useEffect, useMemo, useState } from "react";
import { createOrder, listOrders, listProducts } from "../api";
import { useCart } from "../hooks/useCart";
import { formatToman } from "../utils/format";
import { showToast } from "../hooks/useToast";

export default function OrdersPage() {
  const cart = useCart();

  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [items, setItems] = useState([{ productId: "", quantity: 1 }]);

  useEffect(() => {
    setLoading(true);
    Promise.all([listOrders(), listProducts()])
      .then(([ordersData, productsData]) => {
        setOrders(Array.isArray(ordersData) ? ordersData : []);
        setProducts(Array.isArray(productsData) ? productsData : []);
      })
      .catch(() => {
        setOrders([]);
        setProducts([]);
      })
      .finally(() => setLoading(false));

    if (cart.items.length > 0) {
      setItems(cart.items.map((entry) => ({ productId: entry.productId, quantity: entry.quantity })));
    }
  }, [cart.items]);

  const total = useMemo(() => {
    return items.reduce((sum, item) => {
      const product = products.find((entry) => entry.id === item.productId);
      return sum + Number(product?.price || 0) * Number(item.quantity || 0);
    }, 0);
  }, [items, products]);

  const addItem = () => setItems((prev) => [...prev, { productId: "", quantity: 1 }]);
  const removeItem = (index) => setItems((prev) => prev.filter((_, i) => i !== index));
  const patchItem = (index, patch) => {
    setItems((prev) => prev.map((item, i) => (i === index ? { ...item, ...patch } : item)));
  };

  const submitOrder = async () => {
    if (items.length === 0 || !items[0].productId) {
      showToast("Add at least one order item", "error");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        items: items.map((item) => ({ productId: item.productId, quantity: Number(item.quantity || 1) })),
        total,
      };
      const response = await createOrder(payload);
      setOrders((prev) => [response, ...prev]);
      setItems([{ productId: "", quantity: 1 }]);
      cart.clear();
      showToast("Order created", "success");
    } catch (error) {
      showToast(error.message || "Failed to create order", "error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-violet-50 p-8">
      <h1 className="text-2xl font-bold text-violet-900">Orders</h1>

      {loading ? (
        <p className="mt-4">Loading...</p>
      ) : (
        <div className="mt-4">
          <div className="mb-6 rounded border bg-white p-4">
            <h2 className="mb-2 font-semibold">Create order</h2>

            {items.map((item, index) => (
              <div className="mb-2 flex items-center gap-2" key={`${item.productId}-${index}`}>
                <select
                  className="flex-1 rounded border px-2 py-1"
                  value={item.productId}
                  onChange={(event) => patchItem(index, { productId: event.target.value })}
                >
                  <option value="">Select product</option>
                  {products.map((product) => (
                    <option value={product.id} key={product.id}>
                      {product.name} - {formatToman(product.price)}
                    </option>
                  ))}
                </select>

                <input
                  type="number"
                  className="w-24 rounded border px-2 py-1"
                  min={1}
                  value={item.quantity}
                  onChange={(event) => patchItem(index, { quantity: Number(event.target.value) || 1 })}
                />

                <button className="rounded bg-red-500 px-3 py-1 text-white" onClick={() => removeItem(index)}>
                  Remove
                </button>
              </div>
            ))}

            <div className="mt-3 flex flex-wrap items-center gap-2">
              <button className="rounded bg-blue-600 px-3 py-1 text-white" onClick={addItem}>
                Add item
              </button>
              <div className="ml-auto font-semibold">Total: {formatToman(total)}</div>
              <button
                className="rounded bg-green-600 px-3 py-1 text-white disabled:opacity-70"
                onClick={submitOrder}
                disabled={submitting}
              >
                {submitting ? "Creating..." : "Place order"}
              </button>
            </div>
          </div>

          {orders.length === 0 ? (
            <p>No orders yet.</p>
          ) : (
            <ul className="space-y-2">
              {orders.map((order) => (
                <li className="rounded-md border bg-white p-4" key={order.id || order._id}>
                  <div className="flex justify-between">
                    <div>
                      <div className="font-semibold">Order {order.id || order._id}</div>
                      <div className="text-sm text-gray-600">{order.createdAt || "-"}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">{order.status || "-"}</div>
                      <div className="text-sm">Items: {(order.items || []).length}</div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
