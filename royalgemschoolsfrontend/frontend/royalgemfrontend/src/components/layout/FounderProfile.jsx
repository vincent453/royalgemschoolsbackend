import { FaQuoteLeft } from 'react-icons/fa'
import logo from '../../assets/img/logo.png'

const FounderProfile = ({
  image,
  name = "Dr. Oluwatoyin Ariyo-Ojeme",
  title = "Founder & Executive Director",
  school = "Royal Gem Nursery / Primary School",
  tagline = "Nurturing to Flourish",
  quote = "Education is not just about academics — it is about building character, instilling values, and equipping every child to become a true Gem in society.",
  experience = "30+",
  students = "500+",
  years = "20+",
  profession = "Academic Researcher | Edupreneur | School Consultant"
}) => {
  return (
    <section className="py-16 px-6 md:px-14 bg-white">
      <div className="max-w-7xl mx-auto">

        {/* Section label */}
        <div className="flex items-center gap-3 mb-10">
          <div className="w-10 h-0.5 bg-[#A033A0]" />
          <span className="font-dm-sans text-[#A033A0] font-semibold text-sm uppercase tracking-widest">
            Meet the Founder
          </span>
        </div>

        <div className="flex flex-col lg:flex-row items-center gap-14">

          {/* Left — image */}
          <div className="w-full lg:w-2/5 flex justify-center">
            <div className="relative">

              {/* Decorative background blob */}
              <div className="absolute -inset-4 bg-[#A033A0]/10 rounded-[40%_60%_60%_40%/40%_40%_60%_60%] -z-10" />

              {/* Photo */}
              <img
                src={image}
                alt={name}
                className="w-72 h-80 md:w-80 md:h-96 object-cover object-top rounded-[30%_70%_70%_30%/30%_30%_70%_70%] shadow-xl"
              />

              {/* Logo badge */}
              <div className="absolute -bottom-5 -right-5 bg-white rounded-full shadow-lg p-2 border-2 border-[#A033A0]/20">
                <img src={logo} alt="Royal Gem Logo" className="w-14 h-14 object-contain" />
              </div>

            </div>
          </div>

          {/* Right — content */}
          <div className="w-full lg:w-3/5 flex flex-col gap-6">

            {/* Name + title */}
            <div>
              <h2 className="font-jost font-bold text-3xl md:text-4xl text-gray-900">
                {name}
              </h2>
           
              <p className="font-dm-sans text-[#525fe1] font-semibold mt-1">{title}</p>
              <p className="font-dm-sans text-gray-400 text-sm">{school}</p>
                 <p className="font-dm-sans text-gray-400 text-sm">{profession}</p>
            </div>

            {/* Quote */}
            <div className="relative bg-[#f0f1ff] rounded-2xl px-6 py-5">
              <FaQuoteLeft className="text-[#A033A0] text-2xl mb-3 opacity-60" />
              <p className="font-dm-sans text-gray-700 text-base md:text-lg leading-relaxed italic">
                {quote}
              </p>
            </div>

            {/* Bio */}
            <p className="font-dm-sans text-gray-500 text-base leading-relaxed">
                
With a career spanning over three decades, Dr. Oluwatoyin Ariyo-Ojeme is a distinguished educator and researcher dedicated to the advancement of mathematical education and institutional excellence. A passionate teacher since 1991, she holds a Ph.D. and a Masters degree from the University of Lagos in Research, Test & Measurement. Her academic foundation includes a Distinction in Mathematics and Integrated Science from the College of Education, Ikere-Ekiti, and a 2nd Class Upper degree in Mathematics/Education from the University of Nigeria, Nsukka. While her expertise as a Data Analyst and University Lecturer has taken her to global platforms—including presenting research at Harvard University, the University of Kansas (NCME), and the University of Maryland—her heart remains with foundational education. She established Royal Gem Nursery/ Primary School, Ikorodu, Lagos State as she was directed in a vision. After 30 years of teaching at the nursery and primary levels, Lagos State secondary schools, and Universities of Lagos & Jos, she founded the Royal Gem Mathematical School in Abuja, which recently joined Ikorodu school in celebrating her 20th anniversary. Dr. Oluwatoyin Ariyo-Ojeme is a lifelong learner, recently expanding her expertise into Montessori Education, Child Protection, Neuroscience, and Machine Learning to better understand the cognitive development of students. 
Today, she consults for both public and private schools on curriculum simplification, effective lesson plan/ note classroom management, and the development of professional conditions of service, ensuring the next generation of "Gems" is nurtured through evidence-based, hands-on experience.
            </p>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mt-2">
              {[
                { value: experience, label: "Years Experience" },
                { value: students,   label: "Students Impacted" },
                { value: years,      label: "Years of Impact"   },
              ].map(({ value, label }, i) => (
                <div
                  key={i}
                  className="flex flex-col items-center justify-center bg-gray-50
                             border border-gray-100 rounded-2xl py-4 px-2 text-center"
                >
                  <span className="font-jost font-bold text-2xl text-[#A033A0]">{value}</span>
                  <span className="font-dm-sans text-gray-400 text-xs mt-1">{label}</span>
                </div>
              ))}
            </div>

            {/* Tagline */}
            <p className="font-dm-sans text-sm text-gray-400 italic">
              ....{tagline}
            </p>

          </div>
        </div>
      </div>
    </section>
  )
}

export default FounderProfile