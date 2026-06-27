import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { createOrder, getProductImageUrl, listProducts, reserveProduct } from "../api";
import ProductFilters from "../components/common/ProductFilters";
import { useCart } from "../hooks/useCart";
import { showToast } from "../hooks/useToast";
import { formatToman, normalizeNumberString } from "../utils/format";

const toNumber = (value) => {
  const n = Number(normalizeNumberString(value));
  return Number.isFinite(n) ? n : Number.NaN;
};

export default function ProductsPage() {
  const cart = useCart();
  const [selectedImage, setSelectedImage] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
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

  const filtered = useMemo(() => {
    const text = query.trim().toLowerCase();
    const min = priceMin.trim() ? toNumber(priceMin) : Number.NaN;
    const max = priceMax.trim() ? toNumber(priceMax) : Number.NaN;

    return products.filter((item) => {
      const textMatch = text
        ? `${item.name || ""} ${item.sku || ""}`.toLowerCase().includes(text)
        : true;
      const categoryMatch = category === "all" ? true : item.category === category;

      const price = Number(item.price || 0);
      const minMatch = Number.isNaN(min) ? true : price >= min;
      const maxMatch = Number.isNaN(max) ? true : price <= max;

      return textMatch && categoryMatch && minMatch && maxMatch;
    });
  }, [products, query, category, priceMin, priceMax]);

  const resetFilters = () => {
    setQuery("");
    setCategory("all");
    setPriceMin("");
    setPriceMax("");
  };

  const quickBuy = async (product) => {
    try {
      await reserveProduct({ productId: product.id, quantity: 1 });
      const phone = window.prompt("شماره تلفن را وارد کنید") || "";
      const shippingAddress = window.prompt("آدرس ارسال را وارد کنید") || "";
      if (!phone.trim() || !shippingAddress.trim()) {
        showToast("تلفن و آدرس لازم است", "error");
        return;
      }

      await createOrder({
        items: [{ productId: product.id, quantity: 1, price: Number(product.price || 0) }],
        total: Number(product.price || 0),
        phone,
        shippingAddress,
      });

      showToast("سفارش ایجاد شد", "success");
    } catch (error) {
      showToast(error.message || "خرید سریع انجام نشد", "error");
    }
  };

  return (
    <>
      <div dir="rtl" className="min-h-screen bg-violet-50 px-4 py-8 md:px-6">
        <div className="mx-auto max-w-6xl">
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link className="rounded bg-violet-100 px-3 py-1 text-violet-800" to="/" aria-label="بازگشت">
                <span aria-hidden>→</span>
              </Link>
              <h1 className="text-2xl font-bold text-violet-900">محصولات</h1>
            </div>
            <div className="text-sm text-gray-600">{filtered.length} مورد</div>
          </div>

          <div className="lg:flex lg:items-start lg:gap-6">
            {/* Filters: right-hand sidebar (RTL) */}
            <aside className="mb-5 lg:mb-0 lg:sticky lg:top-20 lg:w-72 lg:shrink-0">
              <ProductFilters
                query={query}
                onQuery={setQuery}
                category={category}
                categories={categories}
                onCategory={setCategory}
                priceMin={priceMin}
                priceMax={priceMax}
                onPriceMin={setPriceMin}
                onPriceMax={setPriceMax}
                onReset={resetFilters}
              />
            </aside>

            {/* Results: on the left, reacting to the sidebar filters */}
            <main className="flex-1">
              {loading ? (
                <p>در حال بارگذاری محصولات...</p>
              ) : filtered.length === 0 ? (
                <p className="rounded-xl border border-violet-100 bg-white p-6 text-sm text-gray-500">
                  محصولی با این فیلترها یافت نشد.
                </p>
              ) : (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  {filtered.map((product) => (
                    <div className="flex flex-col rounded-md border bg-white p-4 shadow-sm" key={product.id}>
                      <div className="mb-3 flex h-40 items-center justify-center overflow-hidden rounded bg-violet-50">
                        <img
                          src={
                            product.imageId
                              ? getProductImageUrl(product.id)
                              : product.imageUrl || `https://picsum.photos/seed/${product.id}/400/300`
                          }
                          alt={product.name}
                          className="max-h-full max-w-full cursor-pointer object-contain"
                          onClick={() =>
                            setSelectedImage(
                              product.imageId
                                ? getProductImageUrl(product.id)
                                : product.imageUrl || `https://picsum.photos/seed/${product.id}/400/300`
                            )
                          }
                        />
                      </div>
                      <div className="flex-1">
                        <div className="text-lg font-semibold">{product.name}</div>
                        <div className="text-sm text-violet-700">
                          {product.category === "general" ? "عمومی" : product.category || "عمومی"}
                        </div>
                        <div className="text-sm text-gray-500">{product.sku || "-"}</div>
                        <div className="mt-2 text-lg font-semibold">{formatToman(product.price)}</div>
                      </div>

                      <div className="mt-3 grid gap-2">
                        <button
                          className="w-full rounded bg-violet-100 px-4 py-2 text-violet-900"
                          onClick={() => {
                            cart.add({ productId: product.id, name: product.name, price: Number(product.price || 0) });
                            showToast("افزودن به سبد خرید", "success");
                          }}
                        >
                          افزودن به سبد خرید
                        </button>

                        <button className="w-full rounded bg-violet-100 px-4 py-2 text-violet-900" onClick={() => quickBuy(product)}>
                          خرید سریع
                        </button>

                        <Link className="w-full rounded bg-violet-100 px-4 py-2 text-center text-violet-900" to={`/products/${product.id}`}>
                          جزئیات
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </main>
          </div>
        </div>
      </div>

      {selectedImage && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
          onClick={() => setSelectedImage(null)}
        >
          <img src={selectedImage} alt="محصول" className="max-h-[90vh] max-w-[90vw] rounded object-contain" />
        </div>
      )}
    </>
  );
}
