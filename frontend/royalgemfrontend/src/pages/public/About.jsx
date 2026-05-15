import Benefit from "../../components/layout/Benefit"
import Navbar from "../../components/layout/Navbar"
import Section from "../../components/layout/Section"
import AboutUs from "../../components/layout/AboutUs"                             
import owner from '../../assets/img/owner.jpeg'
import VideoPlayer from "../../components/layout/VideoPlayer"
import videobg from '../../assets/img/video.jpeg'
import { FaUserGraduate } from "react-icons/fa"
import StatCard from "../../components/ui/RatingCard"
import MessionVission from "../../components/layout/MessionVission"
import FounderProfile from "../../components/layout/FounderProfile"
import Achievements from "../../components/layout/Acheivement"
import Facilities from "../../components/layout/Facilities"
import Footer from "../../components/layout/Foooter"

const About = () => {
  const stats = [
    {
      icon: <FaUserGraduate className="text-[#f26b65]" />,
      count: "300+",
      label: "Academic Programs",
    },
    {
      icon: <FaUserGraduate className="text-[#f26b65]" />,
      count: "1200+",
      label: "Students",
    },
    {
      icon: <FaUserGraduate className="text-[#f26b65]" />,
      count: "50+",
      label: "Teachers",
    },
    {
      icon: <FaUserGraduate className="text-[#f26b65]" />,
      count: "10+",
      label: "Years of Excellence",
    },
  ];
  
  return (
    <div>
        <Navbar />
        <Section />
        <Benefit />
        <AboutUs image={owner} />
        <VideoPlayer thumbnailImage={videobg} style={"px-[0rem] md:px-[0rem] py:px-[0rem]"} />
        <div>
            <div className="grid grid-cols-1 mt-14 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:-mt-12 z-10 relative px-6 md:px-14">
  {stats.map((item, index) => (
    <StatCard
      key={index}
      icon={item.icon}
      count={item.count}
      label={item.label}
    />
  ))}
</div>
        </div>
        <MessionVission />
        <FounderProfile
          image={owner}
          name="Dr. Oluwatoyin Ariyo-Ojeme"
          title="Founder & Executive Director"
          school="Royal Gem Nursery / Primary School"
          experience="30+"
          students="500+"
          years="20+"
        />
        <Achievements />
        <Facilities />
        <Footer />
    </div>
  )
}

export default About