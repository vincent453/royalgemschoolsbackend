const StatCard = ({ icon, count, label }) => {
  return (
    <div className="flex items-center gap-4 bg-white rounded-2xl shadow-md px-6 py-5 w-full">
      <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-50 shrink-0">
        {icon}
      </div>
      <div>
        <p className="font-jost font-bold text-3xl text-gray-900 leading-tight">{count}</p>
        <p className="font-dm-sans text-sm text-gray-400 mt-0.5">{label}</p>
      </div>
    </div>
  );
};

export default StatCard;