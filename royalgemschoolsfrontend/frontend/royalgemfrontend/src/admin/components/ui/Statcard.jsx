import { statCards } from "../../context/data/mockdata"

const Statcard = () => {
  return (
    <div className="grid grid-cols-4 mb-6 ">
      {statCards.map((card, i) => (
        <div
          key={card.id}
          style={{ animationDelay: `${i * 80}ms` }}
          className="bg-white p-5 shadow-sm flex items-center gap-4 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-default animate-fadeUp"
        >
          <div className={`w-13 h-13 ${card.bg} rounded-2xl flex items-center justify-center text-2xl flex-shrink-0 w-14 h-14`}>
            {card.icon}
          </div>
          <div>   
            <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide">{card.label}</p>
            <p className="text-2xl font-extrabold text-gray-800 tracking-tight leading-tight">{card.value}</p>
            <span className={`text-xs font-semibold ${card.up ? "text-emerald-500" : "text-red-400"}`}>
              {card.change} this week
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}

export default Statcard;