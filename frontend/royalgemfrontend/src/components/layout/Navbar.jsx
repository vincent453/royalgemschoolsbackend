import { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import logo from "../../assets/img/logo.png";
import { FaSearch } from "react-icons/fa";

const navLinks = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Admissions", href: "/admissions" },
  { label: "Portal", href: "/portal" },
  { label: "YearBook", href: "/yearbook" },
  { label: "News/Events", href: "/news-events" },
  { label: "Contact", href: "/contact" },
];

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={`
        w-full fixed top-0 left-0 z-50
        transition-all duration-500 ease-in-out
        ${
          scrolled
            ? "bg-white/95 backdrop-blur-sm shadow-md h-16"
            : "bg-white border-b border-gray-300 h-24"
        }
      `}
    >
      {/* Main bar */}
      <div className="flex items-center justify-between px-6 md:px-14 h-full">

        {/* Logo + Brand */}
        <NavLink to="/" className="flex items-center gap-3">
          <img
            src={logo}
            alt="Logo"
            className={`transition-all duration-500 ${
              scrolled ? "h-9" : "h-12 md:h-16"
            }`}
          />
          <h2
            className={`font-jost font-bold transition-all duration-500 ${
              scrolled ? "text-lg" : "text-xl md:text-2xl"
            }`}
          >
            Royal Gem
          </h2>
        </NavLink>

        {/* Desktop Nav */}
        <div className="hidden lg:flex items-center gap-6">
          <ul className="flex gap-4 text-[15px] uppercase font-bold font-dm-sans">

            {navLinks.map(({ label, href }) => (
              <NavLink
                key={label}
                to={href}
                className={({ isActive }) =>
                  `transition-colors duration-300 ${
                    isActive
                      ? "text-[#A033A0]"
                      : "hover:text-[#A033A0]"
                  }`
                }
              >
                {label}
              </NavLink>
            ))}

          </ul>
        </div>

        {/* Search Button */}
        <div className="hidden lg:flex gap-4">
          <button
            type="button"
            className={`font-jost text-[15px] flex items-center gap-2 text-black font-semibold transition-all duration-500 ${
              scrolled ? "py-2 px-4" : "py-3 px-6"
            }`}
          >
            <FaSearch /> SEARCH
          </button>
        </div>

        {/* Hamburger */}
        <button
          className="lg:hidden flex flex-col gap-1.5 p-2"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <span className={`block w-6 h-0.5 bg-gray-800 transition ${menuOpen ? "rotate-45 translate-y-2" : ""}`} />
          <span className={`block w-6 h-0.5 bg-gray-800 transition ${menuOpen ? "opacity-0" : ""}`} />
          <span className={`block w-6 h-0.5 bg-gray-800 transition ${menuOpen ? "-rotate-45 -translate-y-2" : ""}`} />
        </button>
      </div>

      {/* Mobile Menu */}
      <div
        className={`lg:hidden overflow-hidden transition-all duration-300 bg-white ${
          menuOpen ? "max-h-screen py-6" : "max-h-0"
        }`}
      >
        <ul className="flex flex-col items-center gap-4 text-[15px] uppercase font-bold font-dm-sans pb-4 border-b border-gray-200">

          {navLinks.map(({ label, href }) => (
            <NavLink
              key={label}
              to={href}
              onClick={() => setMenuOpen(false)}
              className={({ isActive }) =>
                `transition-colors duration-300 ${
                  isActive
                    ? "text-[#A033A0]"
                    : "hover:text-[#A033A0]"
                }`
              }
            >
              {label}
            </NavLink>
          ))}

        </ul>

        <div className="flex flex-col items-center gap-4 pt-4">
          <button className="font-jost flex items-center gap-2 text-black font-semibold">
            <FaSearch /> SEARCH
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;