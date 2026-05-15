import AboutUs from "../../components/layout/AboutUs"
import Benefit from "../../components/layout/Benefit"
import Hero from "../../components/layout/Hero"
import Navbar from "../../components/layout/Navbar"
import PopularCategory from "../../components/layout/PopularCategory"
import VideoPlayer from "../../components/layout/VideoPlayer"
import videobg from '../../assets/img/video.jpeg'
import OurTeachers from "../../components/layout/OurTeachers"
import Testimonials from "../../components/layout/Testimonials"
import Blog from "../../components/layout/Blog"
import Footer from "../../components/layout/Foooter"
import shapeimage from '../../assets/img/shape-image.png'


const Home = () => {
  return (
    <div>

        <Navbar  />
        <Hero />
        <div className="mt-20">
        <Benefit />
        </div>
        <AboutUs image={shapeimage}  />
        <PopularCategory />
        <VideoPlayer thumbnailImage={videobg} />
        <OurTeachers />
        <Testimonials />
        <Blog />
        <Footer/>
    </div>
  )
}

export default Home