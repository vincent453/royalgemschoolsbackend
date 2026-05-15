import { navItems } from "../../context/data/mockdata";
import logo from "../../../assets/img/logo.png";
import {  NavLink } from "react-router-dom";

const Slidebar = () => {

  return (
     <aside className="w-[220px] h-full border flex flex-col mt-12 ">
      <div className=" bg-[#ffffff] h-full  ">
      {/* Logo */}
      <div className="flex items-center gap-3 justify-center  py-6 border-b border-white/10">
        <div className="w-[9rem] h-[9rem] bg-[#a13ea1]/10 rounded-lg flex items-center justify-center text-gray-500  flex-shrink-0">
          <img src={logo} alt="Logo" className="w-[10rem]" />
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 space-y-0.5">
        <p className="text-[10px] font-bold tracking-widest uppercase text-gray-500 px-2 pb-2 pt-1">
          Main Menu
        </p>

       {navItems.map((item) => (
  <NavLink
    key={item.id}
    to={item.href}
    className={({ isActive }) =>
      `w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150
      ${
        isActive
          ? "bg-[#a13ea1] text-white"
          : "text-gray-500 hover:text-[#a13ea1] hover:bg-[#a13ea1]/10"
      }`
    }
  >
    <span className="w-5 text-center text-base">{item.icon}</span>
    <span className="flex-1">{item.label}</span>
    <span className="text-xs opacity-40">›</span>
  </NavLink>
))}
      </nav>

      {/* Upgrade card
      <div className="p-3 m-3 rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-700 text-white">
        <p className="font-bold text-sm">Upgrade Plan</p>
        <p className="text-white/70 text-xs mt-0.5 mb-3">Unlock all premium features</p>
        <button className="w-full bg-white text-violet-700 text-xs font-bold py-1.5 rounded-lg hover:bg-white/90 transition-colors">
          Upgrade Now
        </button>
      </div> */}
      </div>
    </aside>
  )
}

export default Slidebar