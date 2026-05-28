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
  const [mainImage, setMainImage] = useState<string | null>(null);
  const [gallery, setGallery] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState("details");

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setError("");

    getProduct(id)
      .then((data) => setProduct(data))
      .catch((err) => setError(err.message || "Failed to load product"))
      .finally(() => setLoading(false));
  }, [id]);

  // build gallery when product loads
  useEffect(() => {
    if (!product) return;
    const primary = product.imageId ? getProductImageUrl(product.id) : product.imageUrl || `https://picsum.photos/seed/${product.id}/600/600`;
    const others = [
      primary,
      `https://picsum.photos/seed/${product.id}-1/600/600`,
      `https://picsum.photos/seed/${product.id}-2/600/600`,
    ].filter(Boolean) as string[];
    setGallery(others);
    setMainImage(others[0] || null);
  }, [product]);

  const price = useMemo(() => Number(product?.price || 0), [product]);

  if (loading) return <div className="p-8">در حال بارگذاری محصول...</div>;
  if (error) return <div className="p-8">خطا: {error}</div>;
  if (!product) return <div className="p-8">محصول یافت نشد</div>;

  const quickBuy = async () => {
    try {
      await reserveProduct({ productId: product.id, quantity: 1 });
      const phone = window.prompt("شماره تلفن را وارد کنید") || "";
      const shippingAddress = window.prompt("آدرس ارسال را وارد کنید") || "";

      if (!phone.trim() || !shippingAddress.trim()) {
        showToast("شماره تلفن و آدرس ارسال الزامی است", "error");
        return;
      }

      await createOrder({
        items: [{ productId: product.id, quantity: 1, price }],
        total: price,
        phone,
        shippingAddress,
      });

      showToast("سفارش ثبت شد", "success");
    } catch (err) {
      showToast(err.message || "خرید سریع انجام نشد", "error");
    }
  };

  return (
    <div dir="rtl" className="min-h-screen bg-violet-50 p-8">
      <div className="mx-auto max-w-5xl">
        <div className="mb-4">
          <Link className="text-sm text-violet-700" to="/products">
            بازگشت به محصولات
          </Link>
        </div>

        <div className="flex flex-col gap-6 rounded bg-white p-6 shadow md:flex-row">
          <div className="w-full md:w-1/3">
            <div className="rounded bg-violet-50 p-4">
              <div className="mb-3 flex items-center justify-center rounded bg-white p-2">
                {mainImage ? (
                  // show whole image without cropping
                  <img src={mainImage} alt={product.name} className="max-h-96 w-auto object-contain" />
                ) : (
                  <div className="h-64 w-full bg-gray-100" />
                )}
              </div>

              {/* thumbnails */}
              <div className="flex gap-2 overflow-x-auto">
                {gallery.map((g, i) => (
                  <button
                    key={i}
                    onClick={() => setMainImage(g)}
                    className={`flex-shrink-0 rounded border ${mainImage === g ? "ring-2 ring-violet-500" : ""}`}
                  >
                    <img src={g} alt={`${product.name}-${i}`} className="h-20 w-20 object-cover" />
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex-1 text-right">
            <h1 className="mb-2 text-2xl font-bold text-violet-900">{product.name}</h1>
            <div className="mb-2 text-sm text-violet-700">دسته‌بندی: {product.category || "عمومی"}</div>
            <div className="mb-2 text-sm text-gray-500">شناسه کالا (SKU): {product.sku || "-"}</div>
            <div className="mb-3 text-sm text-gray-700">موجودی: {product.stock}</div>
            <div className="mb-6 text-2xl font-semibold">{formatToman(price)}</div>

            <div className="flex flex-col gap-2 sm:flex-row">
              <button
                className="rounded bg-violet-100 px-4 py-2 text-violet-900"
                onClick={() => {
                  cart.add({ productId: product.id, name: product.name, price });
                  showToast("به سبد افزوده شد", "success");
                }}
              >
                افزودن به سبد
              </button>

              <button className="rounded bg-violet-700 px-4 py-2 text-white" onClick={quickBuy}>
                خرید سریع
              </button>
            </div>

            {product.extraDescription && <p className="mt-6 text-sm text-gray-700">{product.extraDescription}</p>}

            {/* tabs */}
            <div className="mt-6">
              <div className="mb-3 flex gap-2">
                <button
                  className={`px-3 py-1 rounded ${activeTab === "details" ? "bg-violet-700 text-white" : "bg-gray-100"}`}
                  onClick={() => setActiveTab("details")}
                >
                  توضیحات
                </button>
                <button
                  className={`px-3 py-1 rounded ${activeTab === "specs" ? "bg-violet-700 text-white" : "bg-gray-100"}`}
                  onClick={() => setActiveTab("specs")}
                >
                  مشخصات
                </button>
                <button
                  className={`px-3 py-1 rounded ${activeTab === "notes" ? "bg-violet-700 text-white" : "bg-gray-100"}`}
                  onClick={() => setActiveTab("notes")}
                >
                  ویژگی‌های عطر
                </button>
              </div>

              <div className="rounded border bg-white p-4">
                {activeTab === "details" && <div className="text-sm text-gray-700">{product.extraDescription || "توضیحاتی وجود ندارد."}</div>}
                {activeTab === "specs" && (
                  <div className="text-sm text-gray-700">
                    <div>دسته‌بندی: {product.category || "-"}</div>
                    <div>شناسه کالا: {product.sku || "-"}</div>
                    <div>قیمت: {formatToman(price)}</div>
                    <div>موجودی: {product.stock}</div>
                  </div>
                )}
                {activeTab === "notes" && (
                  <div className="text-sm text-gray-700">
                    {product.features && product.features.length ? (
                      <ul className="list-inside list-disc">
                        {product.features.map((f, idx) => (
                          <li key={idx}>{f}</li>
                        ))}
                      </ul>
                    ) : (
                      <div>ویژگی خاصی ثبت نشده است.</div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
