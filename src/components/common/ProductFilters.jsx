export default function ProductFilters({
  query,
  onQuery,
  category,
  categories,
  onCategory,
  brand,
  brands,
  onBrand,
  gender,
  onGender,
  priceMin,
  priceMax,
  onPriceMin,
  onPriceMax,
  compact,
}) {
  if (compact) {
    return (
      <div className="w-full rounded-full bg-white p-2 shadow-sm">
        <input
          value={query}
          onChange={(event) => onQuery(event.target.value)}
          placeholder="Search"
          className="w-full rounded-full border border-violet-200 px-3 py-2"
        />
      </div>
    );
  }

  return (
    <div className="w-full rounded bg-white p-3 shadow-sm">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
        <input
          value={query}
          onChange={(event) => onQuery(event.target.value)}
          placeholder="Search"
          className="col-span-2 rounded border border-violet-200 px-3 py-2 lg:col-span-3"
        />

        <select
          value={category}
          onChange={(event) => onCategory(event.target.value)}
          className="rounded border border-violet-200 px-3 py-2"
        >
          {categories.map((item) => (
            <option value={item} key={item}>
              {item}
            </option>
          ))}
        </select>

        <select
          value={brand}
          onChange={(event) => onBrand(event.target.value)}
          className="rounded border border-violet-200 px-3 py-2"
        >
          {brands.map((item) => (
            <option value={item} key={item}>
              {item}
            </option>
          ))}
        </select>

        <select
          value={gender}
          onChange={(event) => onGender(event.target.value)}
          className="rounded border border-violet-200 px-3 py-2"
        >
          <option value="all">All</option>
          <option value="female">Female</option>
          <option value="male">Male</option>
          <option value="unisex">Unisex</option>
        </select>

        <input
          value={priceMin}
          onChange={(event) => onPriceMin(event.target.value)}
          placeholder="Min price"
          className="rounded border border-violet-200 px-3 py-2"
        />

        <input
          value={priceMax}
          onChange={(event) => onPriceMax(event.target.value)}
          placeholder="Max price"
          className="rounded border border-violet-200 px-3 py-2"
        />
      </div>
    </div>
  );
}
