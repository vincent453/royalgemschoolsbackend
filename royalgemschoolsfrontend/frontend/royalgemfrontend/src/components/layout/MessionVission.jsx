import BannerCTA from "../ui/BannerCTA"
import missionImg from '../../assets/img/mission.jpeg'
import visionImg from '../../assets/img/vission.jpeg'
const MessionVission = () => {
  return (
    <div className="mt-[3rem] sm:px-0 py:px-9">
        
<BannerCTA
  image={missionImg}
  tagline="Our Mission"
  title="We are committed to transforming education by:"
  description1= "Establishing a solid technological foundation for quality and enduring learning. "
  description2="Instilling moral values that build character and shape each child into a true Gem."
  description3="Equipping every Gem with practical leadership skills for lifelong impact."
  buttonText="Learn More"
  buttonHref="#about"
/>


<BannerCTA
  image={visionImg}
  tagline="Our Vision"
  title="To be the premier choice in the educational sector for parents seeking a world-class foundation for their children."
  buttonText="Discover More"
  buttonHref="#admissions"
  overlayOpacity="bg-black/60"
/>
    </div>
  )
}

export default MessionVission