import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { createOrder, getProductImageUrl, listProducts, reserveProduct } from "../api";
import ProductFilters from "../components/common/ProductFilters";
import { useCart } from "../hooks/useCart";
import { showToast } from "../hooks/useToast";
import { formatToman } from "../utils/format";

export default function ProductsPage() {
  const cart = useCart();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [brand, setBrand] = useState("all");
  const [gender, setGender] = useState("all");
  const [priceMin, setPriceMin] = useState("");
  const [priceMax, setPriceMax] = useState("");

  useEffect(() => {
    setLoading(true);
    listProducts()
      .then((data) => setProducts(Array.isArray(data) ? data : []))
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, []);

  const categories = useMemo(
    () => ["all", ...new Set(products.map((item) => item.category).filter(Boolean))],
    [products]
  );
  const brands = useMemo(
    () => ["all", ...new Set(products.map((item) => item.brand).filter(Boolean))],
    [products]
  );

  const filtered = useMemo(() => {
    return products.filter((item) => {
      const textMatch = query.trim()
        ? `${item.name || ""} ${item.sku || ""}`.toLowerCase().includes(query.trim().toLowerCase())
        : true;
      const categoryMatch = category === "all" ? true : item.category === category;
      const brandMatch = brand === "all" ? true : item.brand === brand;
      const genderMatch = gender === "all" ? true : (item.features || []).includes(gender);

      const price = Number(item.price || 0);
      const min = priceMin.trim() ? Number(priceMin) : Number.NaN;
      const max = priceMax.trim() ? Number(priceMax) : Number.NaN;
      const minMatch = Number.isNaN(min) ? true : price >= min;
      const maxMatch = Number.isNaN(max) ? true : price <= max;

      return textMatch && categoryMatch && brandMatch && genderMatch && minMatch && maxMatch;
    });
  }, [products, query, category, brand, gender, priceMin, priceMax]);

  const quickBuy = async (product) => {
    try {
      await reserveProduct({ productId: product.id, quantity: 1 });
      const phone = window.prompt("Enter phone number") || "";
      const shippingAddress = window.prompt("Enter shipping address") || "";
      if (!phone.trim() || !shippingAddress.trim()) {
        showToast("Phone and address are required", "error");
        return;
      }

      await createOrder({
        items: [{ productId: product.id, quantity: 1, price: Number(product.price || 0) }],
        total: Number(product.price || 0),
        phone,
        shippingAddress,
      });

      showToast("Order created", "success");
    } catch (error) {
      showToast(error.message || "Quick buy failed", "error");
    }
  };

  return (
    <div className="min-h-screen bg-violet-50 px-6 py-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link className="rounded bg-violet-100 px-3 py-1 text-violet-800" to="/">
              Back
            </Link>
            <h1 className="text-2xl font-bold text-violet-900">Products</h1>
          </div>
          <div className="text-sm text-gray-600">{filtered.length} items</div>
        </div>

        <div className="mb-5">
          <ProductFilters
            query={query}
            onQuery={setQuery}
            category={category}
            categories={categories}
            onCategory={setCategory}
            brand={brand}
            brands={brands}
            onBrand={setBrand}
            gender={gender}
            onGender={setGender}
            priceMin={priceMin}
            priceMax={priceMax}
            onPriceMin={setPriceMin}
            onPriceMax={setPriceMax}
            compact={false}
          />
        </div>

        {loading ? (
          <p>Loading products...</p>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((product) => (
              <div className="flex flex-col rounded-md border bg-white p-4 shadow-sm" key={product.id}>
                <div className="mb-3 h-40 overflow-hidden rounded bg-violet-50">
                  <img
                    src={product.imageId ? getProductImageUrl(product.id) : product.imageUrl || `https://picsum.photos/seed/${product.id}/400/300`}
                    alt={product.name}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="flex-1">
                  <div className="text-lg font-semibold">{product.name}</div>
                  <div className="text-sm text-violet-700">{product.category || "general"}</div>
                  <div className="text-sm text-gray-500">{product.sku || "-"}</div>
                  <div className="mt-2 text-lg font-semibold">{formatToman(product.price)}</div>
                </div>

                <div className="mt-3 grid gap-2">
                  <button
                    className="w-full rounded bg-emerald-100 px-4 py-2 text-emerald-900"
                    onClick={() => {
                      cart.add({ productId: product.id, name: product.name, price: Number(product.price || 0) });
                      showToast("Added to cart", "success");
                    }}
                  >
                    Add to cart
                  </button>

                  <button className="w-full rounded bg-amber-100 px-4 py-2 text-amber-900" onClick={() => quickBuy(product)}>
                    Quick buy
                  </button>

                  <Link className="w-full rounded bg-violet-50 px-4 py-2 text-center text-violet-900" to={`/products/${product.id}`}>
                    Details
                  </Link>
                </div>
              </div>
            ))}

            {!loading && filtered.length === 0 && <p className="text-sm text-gray-500">No products found.</p>}
          </div>
        )}
      </div>
    </div>
  );
}
