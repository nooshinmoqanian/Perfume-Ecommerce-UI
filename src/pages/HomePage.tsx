import { useEffect, useMemo, useRef, useState } from "react";
import Header from "../components/layout/Header";
import { Link } from "react-router-dom";
import { getProductImageUrl, listProducts } from "../api";
import { useCart } from "../hooks/useCart";
import { formatToman } from "../utils/format";
import { showToast } from "../hooks/useToast";

type Product = {
  id: string;
  name: string;
  category?: string;
  price?: number | string;
  imageId?: string;
  imageUrl?: string;
  extraDescription?: string;
};

const fallbackImage = (seed: string) => `https://picsum.photos/seed/${encodeURIComponent(seed)}/1200/900`;

const resolveImage = (product: Product, fallbackSeed: string) => {
  if (product.imageId) return getProductImageUrl(product.id);
  if (product.imageUrl) return product.imageUrl;
  // Prefer a local static image placed in `public/images/` (e.g. row-<id>.jpg).
  // The <img> elements have an onError handler that will fallback to an external placeholder.
  return `/images/${fallbackSeed}.jpg`;
};

export default function HomePage() {
  const cart = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [slideIndex, setSlideIndex] = useState(0);
  const timerRef = useRef<number | null>(null);
  const [cycles, setCycles] = useState(0);

  useEffect(() => {
    listProducts().then((data) => setProducts(Array.isArray(data) ? data : [])).catch(() => setProducts([]));
  }, []);

  const topSlides = useMemo(() => products.slice(0, 4), [products]);
  const editorialRows = useMemo(() => products.slice(0, 4), [products]);

  const discountCards = useMemo(
    () =>
      products.slice(0, 6).map((product, index) => {
        const off = [15, 20, 25, 30, 35, 40][index] || 15;
        const price = Number(product.price || 0);
        const finalPrice = Math.max(0, Math.round(price * (1 - off / 100)));
        return { product, off, finalPrice, price };
      }),
    [products]
  );

  useEffect(() => {
    if (topSlides.length < 2) return undefined;
    timerRef.current = window.setInterval(() => {
      setSlideIndex((prev) => {
        const next = (prev + 1) % topSlides.length;
        if (next === 0) setCycles((c) => c + 1);
        return next;
      });
    }, 4000);

    return () => {
      if (timerRef.current !== null) {
        clearInterval(timerRef.current);
      }
    };
  }, [topSlides.length]);

  const activeSlide = topSlides[slideIndex];
  const separatorImage =
    editorialRows[1] || editorialRows[0] || ({ id: "separator", name: "separator" } as Product);

  return (
    <div className="min-h-screen bg-[#f6f2ff] text-violet-950">
      {cycles > 0 && <Header />}
      <section className="border-b border-violet-200/50 bg-gradient-to-b from-[#f5eeff] to-[#f9f2e4]">
        {topSlides.length === 0 ? (
          <div className="grid h-[70vh] place-items-center text-violet-900">در حال بارگذاری محصولات...</div>
        ) : (
          <div className="mx-auto grid min-h-[76vh] w-full max-w-7xl grid-cols-1 items-center gap-8 px-6 py-10 md:grid-cols-[1.05fr_1fr] md:px-10">
            <div className="order-2 md:order-1">
              <p className="mb-4 text-xs tracking-[0.32em] text-violet-700/80">ESSENCE COLLECTION</p>
              <h1 className="max-w-xl font-serif text-4xl uppercase leading-[1.1] md:text-6xl">
                {activeSlide?.name || "Cafeies Bloom"}
              </h1>
              <p className="mt-4 max-w-lg text-sm leading-7 text-violet-900/75 md:text-base">
                ترکیبی از رایحه های لوکس با حس گرم و مدرن. دقیقاً همان فضایی که از یک عطر امضادار انتظار دارید.
              </p>

              <div className="mt-7 flex flex-wrap gap-3">
                <Link
                  to="/products"
                  className="rounded-sm border border-violet-900 bg-violet-900 px-6 py-3 text-sm tracking-wide text-white transition hover:bg-violet-800"
                >
                  مشاهده محصولات
                </Link>
                <Link
                  to={`/products/${activeSlide?.id || ""}`}
                  className="rounded-sm border border-violet-700 px-6 py-3 text-sm tracking-wide text-violet-900 transition hover:bg-violet-100/60"
                >
                  جزئیات رایحه
                </Link>
              </div>

              <div className="mt-8 flex items-center gap-2">
                {topSlides.map((item, index) => (
                  <button
                    key={item.id}
                    className={`h-2.5 w-2.5 rounded-full border transition ${
                      index === slideIndex ? "border-violet-900 bg-violet-900" : "border-violet-500/50"
                    }`}
                    onClick={() => setSlideIndex(index)}
                    aria-label={`Slide ${index + 1}`}
                  />
                ))}
              </div>
            </div>

            <div className="order-1 md:order-2">
              <div className="relative overflow-visible rounded-[22px] p-4">
                <img
                  src={resolveImage(activeSlide || ({ id: "hero", name: "hero" } as Product), `hero-${activeSlide?.id || "default"}`)}
                  alt={activeSlide?.name || "hero perfume"}
                  className="relative z-[3] -translate-y-6 h-[52vh] w-full object-contain drop-shadow-[0_24px_18px_rgba(22,8,40,0.28)] md:h-[64vh]"
                  onError={(event) => {
                    event.currentTarget.src = fallbackImage(`hero-fallback-${activeSlide?.id || "default"}`);
                  }}
                />
                <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[2] h-40 rounded-b-[22px] bg-gradient-to-t from-violet-950/25 via-violet-900/5 to-transparent" />
                <div className="pointer-events-none absolute -bottom-5 left-[11%] right-[11%] z-[1] h-8 rounded-full bg-violet-950/25 blur-2xl" />
                <button
                  className="absolute right-4 top-1/2 z-[4] -translate-y-1/2 rounded-full border border-violet-200/80 bg-white/80 p-2 text-violet-900 shadow"
                  onClick={() => setSlideIndex((prev) => (prev + 1) % topSlides.length)}
                  aria-label="next slide"
                >
                  ▷
                </button>
              </div>
            </div>
          </div>
        )}
      </section>

      <section className="mx-auto w-full max-w-7xl px-6 py-16 md:px-10">
        <div className="space-y-14">
          {editorialRows.map((product, index) => {
            const reverse = index % 2 === 1;
            return (
              <article key={product.id} className={`grid grid-cols-1 items-center gap-8 md:grid-cols-2 ${reverse ? "" : ""}`}>
                <div className={reverse ? "md:order-2" : "md:order-1"}>
                  <div className="relative overflow-hidden rounded-[20px]">
                    <img
                      src={resolveImage(product, `row-${product.id}`)}
                      alt={product.name}
                      className="relative z-[1] h-[320px] w-full object-contain p-4"
                      onError={(event) => {
                        event.currentTarget.src = fallbackImage(`row-fallback-${product.id}`);
                      }}
                    />
                    <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[2] h-28 rounded-b-[20px] bg-gradient-to-t from-violet-950/20 via-violet-900/5 to-transparent" />
                  </div>
                </div>

                <div className={reverse ? "md:order-1" : "md:order-2"}>
                  <h2 className="font-serif text-4xl uppercase leading-tight md:text-5xl">{product.name}</h2>
                  <p className="mt-4 max-w-lg text-sm leading-7 text-violet-900/75 md:text-base">
                    {product.extraDescription ||
                      "رایحه ای متعادل با شروع درخشان، قلب عمیق و ماندگاری بالا برای استایل های روزانه و رسمی."}
                  </p>
                  <div className="mt-5 flex items-center gap-3">
                    <Link
                      to={`/products/${product.id}`}
                      className="rounded-sm border border-violet-800 px-5 py-2 text-sm text-violet-900 hover:bg-violet-100/70"
                    >
                      مشاهده
                    </Link>
                    <button
                      className="rounded-sm bg-violet-900 px-5 py-2 text-sm text-white hover:bg-violet-800"
                      onClick={() => {
                        cart.add({
                          productId: product.id,
                          name: product.name,
                          price: Number(product.price || 0),
                        });
                        showToast("به سبد خرید اضافه شد", "success");
                      }}
                    >
                      افزودن به سبد
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-6 pb-16 md:px-10">
        <div className="mb-6 flex items-center justify-between">
          <h3 className="font-serif text-3xl text-violet-950">تخفیفات ویژه</h3>
          <Link to="/products" className="text-sm text-violet-700 hover:text-violet-900">
            مشاهده همه
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {discountCards.slice(0, 3).map(({ product, off, finalPrice, price }) => (
            <article key={`${product.id}-discount`} className="rounded-sm border border-violet-200/60 bg-white p-4 shadow-sm">
              <div className="relative mb-4 overflow-hidden rounded-[20px]">
                <img
                  src={resolveImage(product, `discount-${product.id}`)}
                  alt={product.name}
                  className="relative z-[1] h-56 w-full object-contain p-3"
                  onError={(event) => {
                    event.currentTarget.src = fallbackImage(`discount-fallback-${product.id}`);
                  }}
                />
                <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[2] h-24 rounded-b-[20px] bg-gradient-to-t from-violet-950/22 via-violet-900/5 to-transparent" />
                <span className="absolute left-3 top-3 z-[3] rounded bg-violet-900 px-3 py-1 text-xs text-white">{off}% تخفیف</span>
              </div>

              <h4 className="font-serif text-2xl uppercase">{product.name}</h4>
              <p className="mt-1 text-sm text-violet-900/70">{product.category || "مجموعه ویژه"}</p>

              <div className="mt-4 flex items-center gap-3">
                <span className="text-sm text-gray-500 line-through">{formatToman(price)}</span>
                <span className="text-lg font-bold text-violet-900">{formatToman(finalPrice)}</span>
              </div>

              <Link
                to={`/products/${product.id}`}
                className="mt-4 inline-block rounded-sm border border-violet-800 px-4 py-2 text-sm text-violet-900 hover:bg-violet-100/70"
              >
                خرید با تخفیف
              </Link>
            </article>
          ))}
        </div>
      </section>

      <section className="relative my-4 h-36 w-full overflow-hidden border-y border-violet-300/50 bg-violet-100/40 md:h-44">
        <img
          src={resolveImage(separatorImage, "pic1")}
          alt="separator perfume"
          className="absolute inset-0 h-full w-full object-cover opacity-20"
          onError={(event) => {
            event.currentTarget.src = fallbackImage("separator-fallback");
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-violet-200/30 via-white/10 to-violet-200/30" />
        <div className="absolute inset-0 border-y-8 border-violet-900/20" />
      </section>

      <section className="mx-auto w-full max-w-7xl px-6 py-12 md:px-10">
        <h3 className="font-serif text-3xl text-violet-950 mb-6">سوالات متداول</h3>
        <div className="space-y-3">
          <details className="rounded border p-3">
            <summary className="cursor-pointer font-medium">چگونه سفارش بدهم؟</summary>
            <p className="mt-2 text-sm text-gray-700">برای سفارش، به صفحه محصول رفته و آن را به سبد اضافه یا از خرید سریع استفاده کنید.</p>
          </details>

          <details className="rounded border p-3">
            <summary className="cursor-pointer font-medium">زمان ارسال چقدر است؟</summary>
            <p className="mt-2 text-sm text-gray-700">معمولا 1-3 روز کاری بسته به منطقه شما.</p>
          </details>

          <details className="rounded border p-3">
            <summary className="cursor-pointer font-medium">روش‌های پرداخت چیست؟</summary>
            <p className="mt-2 text-sm text-gray-700">پرداخت آنلاین و پرداخت در محل (در مناطق تحت پوشش) پشتیبانی می‌شود.</p>
          </details>
        </div>
      </section>

      <footer className="mt-12 border-t border-violet-200/50 bg-[#f6efe3]">
        <div className="mx-auto grid w-full max-w-7xl grid-cols-1 gap-10 px-6 py-14 md:grid-cols-4 md:px-10">
          <div className="md:col-span-2">
            <h4 className="font-serif text-3xl text-violet-950">پرفسور پرفیوم</h4>
            <p className="mt-4 max-w-xl text-sm leading-7 text-violet-900/75">
              فروشگاه تخصصی عطر با مجموعه ای انتخاب شده از رایحه های خاص. ارسال سریع، پشتیبانی دقیق و تجربه خرید لوکس.
            </p>
            <div className="mt-5 flex gap-2">
              <input
                type="email"
                placeholder="ایمیل شما برای پیشنهادهای ویژه"
                className="w-full max-w-sm rounded-sm border border-violet-300 bg-white px-4 py-2 text-sm outline-none focus:border-violet-600"
              />
              <button className="rounded-sm bg-violet-900 px-4 py-2 text-sm text-white hover:bg-violet-800">ارسال</button>
            </div>
          </div>

          <div>
            <h5 className="mb-3 text-sm uppercase tracking-[0.2em] text-violet-700">لینک سریع</h5>
            <ul className="space-y-2 text-sm text-violet-900/80">
              <li>
                <Link to="/products" className="hover:text-violet-950">
                  محصولات
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-violet-950">
                  درباره ما
                </Link>
              </li>
              <li>
                <Link to="/orders" className="hover:text-violet-950">
                  سفارش ها
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h5 className="mb-3 text-sm uppercase tracking-[0.2em] text-violet-700">پشتیبانی</h5>
            <ul className="space-y-2 text-sm text-violet-900/80">
              <li>۰۲۱-۱۲۳۴۵۶۷۸</li>
              <li>info@professor-perfume.ir</li>
              <li>تهران، خیابان عطر، پلاک ۲۴</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-violet-200/60 px-6 py-4 text-center text-xs text-violet-800/80 md:px-10">
          © 2026 Professor Perfume. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
