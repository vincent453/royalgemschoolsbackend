import { FaChalkboardTeacher, FaFlask, FaMusic, FaFutbol, FaBook, FaLaptop, FaPray, FaUtensils } from 'react-icons/fa'

const facilities = [
  {
    icon: <FaChalkboardTeacher />,
    title: "Modern Classrooms",
    description: "Spacious, well-ventilated classrooms equipped with smart boards and learning aids to create an ideal learning environment.",
    color: "bg-purple-50 text-[#A033A0]",
    border: "border-purple-100",
  },
  {
    icon: <FaFlask />,
    title: "Science Laboratory",
    description: "A fully equipped science lab where students explore practical experiments that bring classroom concepts to life.",
    color: "bg-blue-50 text-[#525fe1]",
    border: "border-blue-100",
  },
  {
    icon: <FaLaptop />,
    title: "ICT / Computer Lab",
    description: "A modern computer lab providing students with hands-on digital skills, coding practice, and internet-based learning.",
    color: "bg-green-50 text-green-500",
    border: "border-green-100",
  },
  {
    icon: <FaBook />,
    title: "Library",
    description: "A well-stocked library filled with textbooks, storybooks, and reference materials to nurture a love for reading.",
    color: "bg-yellow-50 text-yellow-500",
    border: "border-yellow-100",
  },
  {
    icon: <FaMusic />,
    title: "Music & Arts Room",
    description: "A dedicated space for creative expression through music, visual arts, and cultural performances.",
    color: "bg-pink-50 text-pink-500",
    border: "border-pink-100",
  },
  {
    icon: <FaFutbol />,
    title: "Sports Grounds",
    description: "Open sports facilities that promote physical fitness, teamwork, and healthy competition among students.",
    color: "bg-orange-50 text-orange-400",
    border: "border-orange-100",
  },
  {
    icon: <FaPray />,
    title: "Assembly Hall",
    description: "A large multipurpose hall used for morning assemblies, school events, graduations, and special programmes.",
    color: "bg-teal-50 text-teal-500",
    border: "border-teal-100",
  },
  {
    icon: <FaUtensils />,
    title: "Cafeteria",
    description: "A clean and hygienic cafeteria serving nutritious meals to keep students energised and focused throughout the day.",
    color: "bg-red-50 text-red-400",
    border: "border-red-100",
  },
]

const FacilityCard = ({ icon, title, description, color, border }) => (
  <div className={`bg-white rounded-2xl border ${border} shadow-sm hover:shadow-lg
                   transition-all duration-300 p-6 flex flex-col gap-4 w-full group
                   hover:-translate-y-1`}>
    {/* Icon */}
    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl ${color}
                     group-hover:scale-110 transition-transform duration-300`}>
      {icon}
    </div>

    {/* Title */}
    <h3 className="font-jost font-bold text-gray-900 text-lg">{title}</h3>

    {/* Animated divider */}
    <div className="w-10 h-0.5 bg-[#A033A0] group-hover:w-full transition-all duration-500" />

    {/* Description */}
    <p className="font-dm-sans text-gray-400 text-sm leading-relaxed">{description}</p>
  </div>
)

const Facilities = () => {
  return (
    <section className="py-16 px-6 md:px-[7rem] bg-white">
      <div className="max-w-7xl mx-auto flex flex-col gap-12">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-0.5 bg-[#A033A0]" />
              <span className="font-dm-sans text-[#A033A0] font-semibold text-sm uppercase tracking-widest">
                Our Facilities
              </span>
            </div>
            <h2 className="font-jost font-bold text-3xl md:text-4xl text-gray-900">
              A World-Class Environment <br className="hidden md:block" />
              <span className="text-[#A033A0]">Built for Learning</span>
            </h2>
          </div>
          <p className="font-dm-sans text-gray-500 text-base max-w-sm leading-relaxed">
            We provide modern, safe, and stimulating facilities designed to support every aspect of a child's growth and education.
          </p>
        </div>

        {/* Cards grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {facilities.map((item, index) => (
            <FacilityCard key={index} {...item} />
          ))}
        </div>

      </div>
    </section>
  )
}

export default Facilities