export default function CategoryPills({ categories, active, onSelect }) {
  return (
    <div className="relative py-2">
      <div className="flex items-center gap-3 overflow-x-auto px-2 pb-1">
        {categories.map((category) => {
          const isActive = category === active;
          return (
            <button
              key={category}
              onClick={() => onSelect(category)}
              className={`shrink-0 whitespace-nowrap rounded-full px-5 py-2 text-sm font-medium transition-all ${
                isActive
                  ? "bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white shadow-md"
                  : "border border-violet-100 bg-white text-violet-700 hover:shadow"
              }`}
            >
              {category}
            </button>
          );
        })}
      </div>
    </div>
  );
}
