import { useMemo, useState } from "react";
import { getProductImageUrl, updateProduct } from "../../api";
import { showToast } from "../../hooks/useToast";
import { formatToman } from "../../utils/format";

type Product = {
  id: string;
  name: string;
  price?: number | string;
  imageId?: string;
  imageUrl?: string;
  discount?: number;
  specialOffer?: boolean;
};

type DiscountManagerProps = {
  products: Product[];
  onSaved: () => void;
};

function productImage(product: Product) {
  if (product.imageId) return getProductImageUrl(product.id);
  if (product.imageUrl) return product.imageUrl;
  return `https://picsum.photos/seed/${encodeURIComponent(product.id)}/120/120`;
}

function DiscountRow({ product, onSaved }: { product: Product; onSaved: () => void }) {
  const [discount, setDiscount] = useState(String(Number(product.discount || 0)));
  const [special, setSpecial] = useState(Boolean(product.specialOffer));
  const [saving, setSaving] = useState(false);

  const price = Number(product.price || 0);
  const clamped = Math.min(100, Math.max(0, Number(discount) || 0));
  const finalPrice = Math.max(0, Math.round(price * (1 - clamped / 100)));

  const save = async () => {
    setSaving(true);
    try {
      await updateProduct(product.id, { discount: clamped, specialOffer: special });
      showToast("تخفیف ذخیره شد", "success");
      onSaved();
    } catch (error) {
      showToast((error as Error)?.message || "ذخیره تخفیف ناموفق بود", "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-violet-100 bg-violet-50/40 p-3 md:flex-row md:items-center md:justify-between">
      <div className="flex items-center gap-3">
        <img src={productImage(product)} alt={product.name} className="h-14 w-14 rounded object-cover" />
        <div>
          <div className="font-medium text-violet-900">{product.name}</div>
          <div className="text-xs text-gray-500">قیمت: {formatToman(price)}</div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <label className="flex items-center gap-2 text-sm text-violet-900">
          درصد تخفیف
          <input
            type="number"
            min={0}
            max={100}
            className="w-20 rounded border border-violet-200 px-2 py-1"
            value={discount}
            onChange={(event) => setDiscount(event.target.value)}
          />
        </label>

        <label className="flex items-center gap-2 text-sm text-violet-900">
          <input
            type="checkbox"
            className="h-4 w-4 accent-violet-700"
            checked={special}
            onChange={(event) => setSpecial(event.target.checked)}
          />
          نمایش در تخفیفات ویژه‌ی صفحه اصلی
        </label>

        <div className="text-sm">
          {clamped > 0 ? (
            <span className="text-violet-800">
              <span className="text-gray-400 line-through">{formatToman(price)}</span> ← {formatToman(finalPrice)}
            </span>
          ) : (
            <span className="text-gray-400">بدون تخفیف</span>
          )}
        </div>

        <button
          onClick={save}
          disabled={saving}
          className="rounded bg-violet-700 px-4 py-1.5 text-sm text-white transition hover:bg-violet-600 disabled:opacity-70"
        >
          {saving ? "..." : "ذخیره"}
        </button>
      </div>
    </div>
  );
}

export default function DiscountManager({ products, onSaved }: DiscountManagerProps) {
  const [query, setQuery] = useState("");

  const activeOffers = useMemo(
    () => products.filter((p) => p.specialOffer || Number(p.discount) > 0),
    [products]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return products;
    return products.filter((p) => (p.name || "").toLowerCase().includes(q));
  }, [products, query]);

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold text-violet-900">تخفیفات ویژه</h2>
          <p className="mt-1 text-sm text-gray-500">
            برای هر محصول درصد تخفیف را تعیین کنید و مشخص کنید کدام‌ها در بخش «تخفیفات ویژه» صفحه اصلی نمایش داده شوند.
          </p>
        </div>
        <span className="rounded-full bg-violet-100 px-3 py-1 text-sm text-violet-800">
          {activeOffers.length} پیشنهاد ویژه فعال
        </span>
      </div>

      <input
        className="mb-4 w-full rounded border border-violet-200 px-3 py-2 md:w-72"
        placeholder="جستجوی محصول"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
      />

      {filtered.length === 0 ? (
        <p className="text-sm text-gray-500">محصولی یافت نشد.</p>
      ) : (
        <div className="space-y-3">
          {filtered.map((product) => (
            <DiscountRow key={product.id} product={product} onSaved={onSaved} />
          ))}
        </div>
      )}
    </div>
  );
}
