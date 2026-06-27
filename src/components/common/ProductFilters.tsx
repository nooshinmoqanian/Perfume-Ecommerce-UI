function categoryLabel(value) {
  if (value === "all") return "همه دسته‌ها";
  if (value === "general") return "عمومی";
  return value;
}

// Vertical, all-Persian filter panel used as a sidebar on the products page.
export default function ProductFilters({
  query,
  onQuery,
  category,
  categories,
  onCategory,
  priceMin,
  priceMax,
  onPriceMin,
  onPriceMax,
  onReset,
}) {
  const fieldClass = "w-full rounded border border-violet-200 px-3 py-2 focus:border-violet-500 focus:outline-none";

  return (
    <div className="w-full rounded-2xl border border-violet-100 bg-white p-4 shadow-sm" dir="rtl">
      <h2 className="mb-4 text-base font-semibold text-violet-900">فیلتر محصولات</h2>

      <div className="grid gap-4">
        <label className="grid gap-1 text-sm text-violet-900">
          جستجو
          <input
            value={query}
            onChange={(event) => onQuery(event.target.value)}
            placeholder="نام محصول..."
            className={fieldClass}
          />
        </label>

        <label className="grid gap-1 text-sm text-violet-900">
          دسته‌بندی
          <select value={category} onChange={(event) => onCategory(event.target.value)} className={fieldClass}>
            {categories.map((item) => (
              <option value={item} key={item}>
                {categoryLabel(item)}
              </option>
            ))}
          </select>
        </label>

        <div className="grid gap-1 text-sm text-violet-900">
          محدوده قیمت (تومان)
          <div className="grid grid-cols-2 gap-2">
            <input
              value={priceMin}
              onChange={(event) => onPriceMin(event.target.value)}
              placeholder="حداقل"
              inputMode="numeric"
              className={fieldClass}
            />
            <input
              value={priceMax}
              onChange={(event) => onPriceMax(event.target.value)}
              placeholder="حداکثر"
              inputMode="numeric"
              className={fieldClass}
            />
          </div>
        </div>

        <button
          type="button"
          onClick={onReset}
          className="mt-1 rounded border border-violet-200 px-3 py-2 text-sm text-violet-700 transition hover:bg-violet-50"
        >
          پاک کردن فیلترها
        </button>
      </div>
    </div>
  );
}
