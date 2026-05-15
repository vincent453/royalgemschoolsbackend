import { FaTwitter, FaFacebookF, FaLinkedinIn, FaBookOpen, FaUserGraduate } from 'react-icons/fa'

const TeacherCard = ({
  image,
  name,
  subject,
  courses,
  students,
  twitterUrl  = "#",
  facebookUrl = "#",
  linkedinUrl = "#",
}) => {
  return (
    <div className="bg-white rounded-2xl shadow-md overflow-hidden group w-full max-w-[280px] mx-auto">

      {/* Image + Social */}
      <div className="relative">
        <img
          src={image}
          alt={name}
          className="w-full h-[280px] object-cover object-top"
        />

        {/* Social Icons — slides in from left on hover */}
        <div className="absolute top-6 left-0 flex flex-col gap-2
                        -translate-x-full group-hover:translate-x-0
                        transition-transform duration-500 ease-in-out">
          {[
            { href: twitterUrl,  Icon: FaTwitter    },
            { href: facebookUrl, Icon: FaFacebookF  },
            { href: linkedinUrl, Icon: FaLinkedinIn },
          ].map(({ href, Icon }, i) => (
            <a
              key={i}
              href={href}
              onClick={(e) => e.stopPropagation()}
              className="w-9 h-9 bg-[#A033A0] hover:bg-[#525fe1] text-white
                         flex items-center justify-center
                         transition-colors duration-300"
            >
              <Icon className="text-sm" />
            </a>
          ))}
        </div>
      </div>

      {/* Info */}
      <div className="px-5 py-4">
        <h3 className="font-jost font-bold text-gray-900 text-lg">{name}</h3>
        <p className="font-dm-sans text-gray-400 text-sm mt-0.5">{subject}</p>

        {/* Divider */}
        <div className="border-t border-gray-100 mt-4 pt-3 flex items-center justify-between">
          <a href="#" className="flex items-center gap-1.5 text-[#525fe1] hover:text-[#A033A0]
                                  font-dm-sans text-sm font-medium underline underline-offset-2
                                  transition-colors duration-300">
            <FaBookOpen className="text-xs" />
            {String(courses).padStart(2, '0')} Courses
          </a>
          <a href="#" className="flex items-center gap-1.5 text-[#525fe1] hover:text-[#A033A0]
                                  font-dm-sans text-sm font-medium underline underline-offset-2
                                  transition-colors duration-300">
            <FaUserGraduate className="text-xs" />
            {String(students).padStart(2, '0')} Students
          </a>
        </div>
      </div>
    </div>
  )
}

export default TeacherCard