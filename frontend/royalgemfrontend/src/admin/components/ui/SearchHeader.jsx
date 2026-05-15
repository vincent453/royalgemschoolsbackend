import { Search } from "lucide-react";
import { Link } from "react-router-dom";

const SearchHeader = ({
  searchPlaceholder = "Search here...",
  searchValue = "",
  onSearchChange,
  sortValue = "newest",
  onSortChange,
  sortOptions = [
    { value: "newest", label: "Newest" },
    { value: "oldest", label: "Oldest" },
    { value: "name", label: "Name A-Z" },
  ],
  buttonText = "+ New Student",
  href="/admin/students/add"
}) => {
  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white p-4 rounded-xl shadow-sm">

      {/* Search */}
      <div className="relative w-full md:max-w-sm">
        <Search
          size={18}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
        />
        <input
          type="text"
          value={searchValue}
          onChange={(e) => onSearchChange && onSearchChange(e.target.value)}
          placeholder={searchPlaceholder}
          className="w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition"
        />
      </div>

      {/* Right side */}
      <div className="flex items-center gap-3">

        {/* Sort */}
        <select
          value={sortValue}
          onChange={(e) => onSortChange && onSortChange(e.target.value)}
          className="px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-indigo-500"
        >
          {sortOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        {/* Button */}
        <Link to={href}>
          <button
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 active:scale-95 transition"
          >
            {buttonText}
          </button>
        </Link>
    

      </div>
    </div>
  );
};

export default SearchHeader;