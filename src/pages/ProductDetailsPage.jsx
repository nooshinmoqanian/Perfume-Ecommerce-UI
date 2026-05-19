import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { createOrder, getProduct, getProductImageUrl, reserveProduct } from "../api";
import { useCart } from "../hooks/useCart";
import { showToast } from "../hooks/useToast";
import { formatToman } from "../utils/format";

export default function ProductDetailsPage() {
  const { id } = useParams();
  const cart = useCart();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setError("");

    getProduct(id)
      .then((data) => setProduct(data))
      .catch((err) => setError(err.message || "Failed to load product"))
      .finally(() => setLoading(false));
  }, [id]);

  const price = useMemo(() => Number(product?.price || 0), [product]);

  if (loading) return <div className="p-8">Loading product...</div>;
  if (error) return <div className="p-8">Error: {error}</div>;
  if (!product) return <div className="p-8">Product not found</div>;

  const quickBuy = async () => {
    try {
      await reserveProduct({ productId: product.id, quantity: 1 });
      const phone = window.prompt("Enter phone number") || "";
      const shippingAddress = window.prompt("Enter shipping address") || "";

      if (!phone.trim() || !shippingAddress.trim()) {
        showToast("Phone and address are required", "error");
        return;
      }

      await createOrder({
        items: [{ productId: product.id, quantity: 1, price }],
        total: price,
        phone,
        shippingAddress,
      });

      showToast("Order created", "success");
    } catch (err) {
      showToast(err.message || "Quick buy failed", "error");
    }
  };

  return (
    <div className="min-h-screen bg-violet-50 p-8">
      <div className="mx-auto max-w-5xl">
        <div className="mb-4">
          <Link className="text-sm text-violet-700" to="/products">
            Back to products
          </Link>
        </div>

        <div className="flex flex-col gap-6 rounded bg-white p-6 shadow md:flex-row">
          <div className="w-full md:w-1/3">
            <div className="overflow-hidden rounded bg-violet-50">
              <img
                src={product.imageId ? getProductImageUrl(product.id) : product.imageUrl || `https://picsum.photos/seed/${product.id}/600/400`}
                alt={product.name}
                className="h-64 w-full object-cover"
              />
            </div>
          </div>

          <div className="flex-1">
            <h1 className="mb-2 text-2xl font-bold text-violet-900">{product.name}</h1>
            <div className="mb-2 text-sm text-violet-700">Category: {product.category || "general"}</div>
            <div className="mb-2 text-sm text-gray-500">SKU: {product.sku || "-"}</div>
            <div className="mb-3 text-sm text-gray-700">Stock: {product.stock}</div>
            <div className="mb-6 text-2xl font-semibold">{formatToman(price)}</div>

            <div className="flex flex-col gap-2 sm:flex-row">
              <button
                className="rounded bg-violet-100 px-4 py-2 text-violet-900"
                onClick={() => {
                  cart.add({ productId: product.id, name: product.name, price });
                  showToast("Added to cart", "success");
                }}
              >
                Add to cart
              </button>

              <button className="rounded bg-violet-700 px-4 py-2 text-white" onClick={quickBuy}>
                Quick buy
              </button>
            </div>

            {product.extraDescription && <p className="mt-6 text-sm text-gray-700">{product.extraDescription}</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
