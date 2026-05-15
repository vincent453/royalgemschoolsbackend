import { FaTwitter, FaFacebookF, FaInstagram, FaLinkedinIn, FaMapMarkerAlt, FaPhone, FaWhatsapp, FaEnvelope } from 'react-icons/fa'
import { FiArrowUp } from 'react-icons/fi'
import logo from '../../assets/img/logo.png'
import { useEffect, useState } from 'react'

const aboutLinks = [
  { label: "About Us",               href: "#" },
  { label: "Instructor Registration",href: "#" },
  { label: "Become A Teacher",       href: "#" },
  { label: "All Instructors",        href: "#" },
  { label: "Asked Question",         href: "#" },
  { label: "Contact Us",             href: "#" },
]

const courseLinks = [
  { label: "After School Program",      href: "#" },
  { label: "Microsoft Excel Training",  href: "#" },
  { label: "Music Classes",             href: "#" },
  { label: "Coding Bootcamp",           href: "#" },
  { label: "Python Programming",        href: "#" },
  { label: "Graphic Design Course",     href: "#" },
]

const contactInfo = [
  { icon: <FaMapMarkerAlt />, text: "Ikorodu, Lagos State & Abuja, FCT, Nigeria", href: null },
  { icon: <FaPhone />,        text: "+234 800 000 0000",                           href: "tel:+2348000000000" },
  { icon: <FaWhatsapp />,     text: "Contact Whatsapp",                            href: "https://wa.me/2348000000000", colored: true },
  { icon: <FaEnvelope />,     text: "info@royalgemschools.com",                    href: "mailto:info@royalgemschools.com" },
]

const socials = [
  { icon: <FaTwitter />,   href: "#" },
  { icon: <FaFacebookF />, href: "#" },
  { icon: <FaInstagram />, href: "#" },
  { icon: <FaLinkedinIn />,href: "#" },
]



const Footer = () => {
      const [showScroll, setShowScroll] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setShowScroll(window.scrollY > 300)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' })
  return (
    <footer className="bg-[#f6def873] pt-16 pb-0">
      <div className="max-w-7xl mx-auto px-6 md:px-14">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 pb-14">

          {/* Col 1 — Brand */}
          <div className="lg:col-span-1 flex flex-col gap-5">
            <div className="flex items-center gap-2">
              <img src={logo} alt="Royal Gem Logo" className="h-10 object-contain" />
              <span className="font-jost font-bold text-[1.7rem] text-gray-900">Royal Gem</span>
            </div>
            <p className="font-dm-sans text-gray-500 text-md leading-relaxed">
              Nurturing future leaders through quality education, strong moral values, and innovative learning experiences.
            </p>
            {/* Socials */}
            <div className="flex items-center gap-3">
              {socials.map(({ icon, href }, i) => (
                <a
                  key={i}
                  href={href}
                  className="w-9 h-9 rounded-full border text-[1.2rem] border-gray-300 flex items-center justify-center
                             text-gray-500 hover:bg-[#A033A0] hover:text-white hover:border-[#A033A0]
                             transition-all duration-300 text-sm"
                >
                  {icon}
                </a>
              ))}
            </div>
          </div>

          {/* Col 2 — About */}
          <div className="flex flex-col gap-4">
            <h4 className="font-jost text-[1.5rem] font-bold text-gray-900  ">About Us</h4>
            <ul className="flex flex-col gap-2">
              {aboutLinks.map(({ label, href }, i) => (
                <li key={i}>
                  <a
                    href={href}
                    className="font-dm-sans text-gray-500 text-sm hover:text-[#A033A0] transition-colors duration-300"
                  >
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </div>



          {/* Col 4 — Contact */}
          <div className="flex flex-col gap-4">
            <h4 className="font-jost text-[1.5rem] font-bold text-gray-900">Contact Info</h4>
            <ul className="flex flex-col gap-3">
              {contactInfo.map(({ icon, text, href, colored }, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="text-[#A033A0] mt-0.5 shrink-0">{icon}</span>
                  {href ? (
                    <a
                      href={href}
                      className={`font-dm-sans text-md leading-snug transition-colors duration-300
                                  ${colored
                                    ? 'text-[#A033A0] hover:text-[#525fe1]'
                                    : 'text-gray-500 hover:text-[#525fe1]'} `}
                    >
                      {text}
                    </a>
                  ) : (
                    <span className="font-dm-sans text-gray-500 text-md leading-snug">{text}</span>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* Col 5 — Download App */}
          <div className="flex flex-col gap-4">
            <h4 className="font-jost text-[1.5rem] font-bold text-gray-900  ">Download App</h4>
            <p className="font-dm-sans text-gray-500 text-md leading-relaxed">
              Download our app from the App Store and Google Play Store.
            </p>
            {/* Google Play */}
            <a
              href="#"
              className="flex items-center gap-3 bg-[#525fe1] hover:bg-[#A033A0] text-white
                         px-4 py-2.5 rounded-lg transition-colors duration-300 w-fit"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M3.18 23.76a2 2 0 0 0 2.07-.22l11.37-6.57-2.84-2.84zM1 2.46v19.08l8.56-9.54zM20.4 10.1l-2.53-1.46-3.17 3.17 3.17 3.17 2.56-1.48a2 2 0 0 0 0-3.4zM5.25.46a2 2 0 0 0-2.07-.22L13.73 10.7l2.84-2.84z"/>
              </svg>
              <div>
                <p className="text-[10px] opacity-80 leading-none">Download on</p>
                <p className="text-sm font-jost font-bold leading-tight">Google Play</p>
              </div>
            </a>
            {/* App Store */}
            <a
              href="#"
              className="flex items-center gap-3 bg-gray-900 hover:bg-[#A033A0] text-white
                         px-4 py-2.5 rounded-lg transition-colors duration-300 w-fit"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
              </svg>
              <div>
                <p className="text-[10px] opacity-80 leading-none">Download on</p>
                <p className="text-sm font-jost font-bold leading-tight">App Store</p>
              </div>
            </a>
          </div>

        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-gray-200 bg-[#f3d2f7a4]">
        <div className="max-w-7xl mx-auto px-6 md:px-14 py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="font-dm-sans text-gray-500 text-sm text-center">
            © {new Date().getFullYear()} All Rights Reserved by{" "}
            <span className="font-bold text-gray-700">Royal Gem Schools</span>. 
            Built by{" "}
            <span className="font-bold text-gray-700">
              Vincent Web and App Development
            </span>
          </p>  

          {/* Scroll to top */}
             <button
            onClick={scrollToTop}
            className={`w-12 h-12 right-6 bottom-6 fixed z-50 rounded-full border-2 border-[#A033A0] text-[#A033A0]
                        flex items-center justify-center hover:bg-[#A033A0] hover:text-white
                        transition-all duration-300
                        ${showScroll
                          ? 'opacity-100 translate-y-0 pointer-events-auto'
                          : 'opacity-0 translate-y-4 pointer-events-none'}`}
          >
            <FiArrowUp className="text-sm" />
          </button>
        </div>
      </div>

    </footer>
  )
}

export default Footer