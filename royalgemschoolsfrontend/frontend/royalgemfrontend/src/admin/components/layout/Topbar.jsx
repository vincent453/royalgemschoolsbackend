import dark from "../../../assets/dark.svg";
import owner from "../../../assets/img/owner.jpeg";
const Topbar = () => {
  return (
    <header className="sticky top-0 z-40 bg-[#a13ea1] h-[70px] flex items-center px-7 gap-4 shadow-md">
      {/* Dots icon */}
      <div className="grid grid-cols-3 gap-[3px] mr-1">
        {Array(9).fill(0).map((_, i) => (
          <div key={i} className="w-1 h-1 rounded-full bg-white/60" />
        ))}
      </div>

      <h1 className="text-white font-bold text-xl tracking-tight flex-1">Dashboard</h1>

      {/* Actions */}
      <div className="flex items-center gap-2">
        {[
          { icon: "🔍", label: "Search" },
          { icon: "⊞",  label: "Grid" },
          { icon: <img src={dark} alt="Theme" />,  label: "Theme" },
          { icon: "⤢",  label: "Expand" },
          { icon: "💬",  label: "Chat" },
          { icon: "🔔",  label: "Notifications" },
          { icon: "⚙️",  label: "Settings" },
        ].map(({ icon, label }) => (
          <button
            key={label}
            title={label}
            className="w-[42px] h-[42px] rounded-md bg-white/15 hover:bg-white/25 text-white text-sm flex items-center justify-center transition-colors border border-transparent"
          >
            {icon}
          </button>
        ))}

        {/* Avatar */}
        <div className="w-10 h-10 flex items-center justify-center  font-bold cursor-pointer ml-1">
          <img src={owner} alt="Owner" className="rounded-md" />
        </div>
      </div>
    </header>
  );
}

export default Topbar