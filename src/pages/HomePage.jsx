import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { getProductImageUrl, listCategories, listProducts } from "../api";
import CategoryPills from "../components/common/CategoryPills";
import { useCart } from "../hooks/useCart";
import { formatToman } from "../utils/format";
import { showToast } from "../hooks/useToast";

export default function HomePage() {
  const cart = useCart();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState("all");
  const [slideIndex, setSlideIndex] = useState(0);
  const timerRef = useRef(null);

  useEffect(() => {
    listProducts().then((data) => setProducts(Array.isArray(data) ? data : [])).catch(() => setProducts([]));
    listCategories()
      .then((data) => {
        const names = (Array.isArray(data) ? data : [])
          .map((item) => (typeof item === "string" ? item : item?.name))
          .filter(Boolean);
        setCategories(names);
      })
      .catch(() => setCategories([]));
  }, []);

  const topSlides = useMemo(() => products.slice(0, 3), [products]);

  useEffect(() => {
    if (topSlides.length < 2) return undefined;
    timerRef.current = window.setInterval(() => {
      setSlideIndex((prev) => (prev + 1) % topSlides.length);
    }, 4000);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [topSlides.length]);

  const visibleProducts = useMemo(() => {
    if (activeCategory === "all") return products.slice(0, 3);
    return products.filter((item) => item.category === activeCategory).slice(0, 3);
  }, [activeCategory, products]);

  const categoryItems = ["all", ...categories];

  return (
    <div className="min-h-screen bg-violet-50">
      <section className="relative h-screen overflow-hidden">
        {topSlides.length === 0 ? (
          <div className="grid h-full place-items-center bg-violet-300 text-white">No products for hero</div>
        ) : (
          <>
            {topSlides.map((item, index) => (
              <div
                key={item.id}
                className={`absolute inset-0 transition-opacity duration-700 ${index === slideIndex ? "opacity-100" : "opacity-0"}`}
              >
                <img
                  src={item.imageId ? getProductImageUrl(item.id) : item.imageUrl || `https://picsum.photos/seed/${item.id}/1920/1200`}
                  alt={item.name}
                  className="h-full w-full object-cover"
                />
              </div>
            ))}

            <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-black/20" />

            <div className="relative z-10 mx-auto flex h-full max-w-6xl flex-col justify-center px-6">
              <p className="mb-3 text-xs tracking-[0.24em] text-violet-100">FEATURED PERFUMES</p>
              <h1 className="max-w-2xl text-4xl font-semibold leading-tight text-white md:text-6xl">
                {topSlides[slideIndex]?.name || "Signature scents for every mood"}
              </h1>
              <p className="mt-4 max-w-xl text-sm text-white/90 md:text-base">
                Explore elegant fragrances with premium ingredients and modern blends.
              </p>
              <div className="mt-7 flex flex-wrap gap-3">
                <Link className="rounded bg-violet-700 px-5 py-3 text-sm font-semibold text-white hover:bg-violet-600" to="/products">
                  Browse all products
                </Link>
                <Link
                  className="rounded border border-white/40 bg-black/20 px-5 py-3 text-sm font-semibold text-white hover:bg-black/40"
                  to={`/products/${topSlides[slideIndex]?.id || ""}`}
                >
                  View product
                </Link>
              </div>

              <div className="mt-8 flex gap-2">
                {topSlides.map((item, index) => (
                  <button
                    key={item.id}
                    className={`h-3 w-3 rounded-full border ${index === slideIndex ? "border-violet-500" : "border-violet-200"}`}
                    onClick={() => setSlideIndex(index)}
                    aria-label={`Slide ${index + 1}`}
                  />
                ))}
              </div>
            </div>
          </>
        )}
      </section>

      <section className="mx-auto max-w-6xl px-6 py-8">
        <h2 className="mb-3 text-xl font-semibold text-violet-900">Categories</h2>
        <CategoryPills categories={categoryItems} active={activeCategory} onSelect={setActiveCategory} />
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-12">
        <h2 className="mb-4 text-xl font-semibold text-violet-900">Highlights</h2>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {visibleProducts.map((product) => (
            <div className="rounded-xl border border-violet-100 bg-white p-4 shadow-sm" key={product.id}>
              <div className="mb-3 h-44 overflow-hidden rounded bg-violet-50">
                <img
                  src={product.imageId ? getProductImageUrl(product.id) : product.imageUrl || `https://picsum.photos/seed/${product.id}/500/400`}
                  alt={product.name}
                  className="h-full w-full object-cover"
                />
              </div>

              <div className="text-lg font-semibold text-violet-900">{product.name}</div>
              <div className="text-sm text-violet-700">{product.category || "general"}</div>
              <div className="mt-2 font-bold text-violet-800">{formatToman(product.price ?? 0)}</div>

              <div className="mt-4 flex gap-2">
                <button
                  className="w-full rounded bg-violet-700 px-3 py-2 text-sm text-white hover:bg-violet-600"
                  onClick={() => {
                    cart.add({
                      productId: product.id,
                      name: product.name,
                      price: Number(product.price || 0),
                    });
                    showToast("Added to cart", "success");
                  }}
                >
                  Add to cart
                </button>
                <Link
                  className="w-full rounded border border-violet-700 px-3 py-2 text-center text-sm text-violet-700 hover:bg-violet-50"
                  to={`/products/${product.id}`}
                >
                  Details
                </Link>
              </div>
            </div>
          ))}

          {visibleProducts.length === 0 && (
            <div className="rounded border border-violet-100 bg-white p-4 text-sm text-gray-500 md:col-span-3">
              No products in this category yet.
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
