import { FaMapMarkerAlt, FaPhone, FaEnvelope } from 'react-icons/fa'

const contactCards = [
  {
    icon: <FaMapMarkerAlt />,
    title: "Our Location",
    lines: [
      "Ikorodu, Lagos State",
      "Abuja, FCT, Nigeria",
    ],
    bg: "bg-rose-50",
    iconBg: "bg-rose-100 text-rose-400",
    href: null,
  },
  {
    icon: <FaPhone />,
    title: "Telephone",
    lines: [
      "+234 800 000 0000",
      "+234 900 000 0000",
    ],
    bg: "bg-[#eef0ff]",
    iconBg: "bg-[#dde0ff] text-[#525fe1]",
    href: "tel:+2348000000000",
  },
  {
    icon: <FaEnvelope />,
    title: "Send Email",
    lines: [
      "info@royalgemschools.com",
      "admin@royalgemschools.com",
    ],
    bg: "bg-teal-50",
    iconBg: "bg-teal-100 text-teal-500",
    href: "mailto:info@royalgemschools.com",
  },
]

const ContactInfoCard = ({ icon, title, lines, bg, iconBg, href }) => (
  <div className={`${bg} flex flex-col items-center justify-center text-center
                   gap-5 py-6 px-8 w-full`}>

    {/* Icon */}
    <div className={`w-16 h-16 rounded-xl flex items-center justify-center text-2xl ${iconBg}`}>
      {icon}
    </div>

    {/* Title */}
    <h3 className="font-jost font-bold text-[#1a1a4b] text-xl">{title}</h3>

    {/* Lines */}
    <div className="flex flex-col gap-1">
      {lines.map((line, i) => (
        href ? (
          <a
            key={i}
            href={href}
            className="font-dm-sans text-gray-500 text-sm hover:text-[#A033A0] transition-colors duration-300"
          >
            {line}
          </a>
        ) : (
          <p key={i} className="font-dm-sans text-gray-500 text-sm">{line}</p>
        )
      ))}
    </div>
  </div>
)

const ContactInfo = () => {
  return (
    <div className="grid px-[7rem] mt-[5rem] grid-cols-1 sm:grid-cols-3 w-full">
      {contactCards.map((card, index) => (
        <ContactInfoCard key={index} {...card} />
      ))}
    </div>
  )
}

export default ContactInfo