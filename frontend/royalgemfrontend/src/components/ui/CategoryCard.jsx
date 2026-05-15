const CategoryCard = ({ icon, label }) => {
  return (
    <div className="flex items-center gap-3 bg-white rounded-full px-5 py-3 shadow-sm border border-gray-100 hover:shadow-md hover:border-[#A033A0]/30 transition-all duration-300 cursor-pointer w-fit">
      <img src={icon} alt={label} className="w-10 h-10 object-contain shrink-0" />
      <span className="font-jost font-semibold text-gray-700 whitespace-nowrap">{label}</span>
    </div>
  );
};

export default CategoryCard;