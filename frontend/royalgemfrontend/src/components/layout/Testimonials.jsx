import reviewImage1 from '../../assets/img/review.png'
import robot from '../../assets/img/robot.png'
import ReviewSlider from '../ui/ReviewSlider'

const reviews = [
  {
    review: "Royal Gem Schools has transformed my learning experience. The teachers are incredibly supportive, and the curriculum is engaging and relevant.",
    name: "Jane Doe",
    company: "Student at Royal Gem Schools",
    avatar: robot
  },
  {
    review: "I am so grateful for the education I received at Royal Gem Schools. The teachers are passionate and dedicated, and they truly care about their students' success.",
    name: "John Smith",
    company: "Student at Royal Gem Schools",
    avatar: robot
  },
  {
    review: "Royal Gem Schools has exceeded my expectations in every way. The teachers are knowledgeable and approachable, and the curriculum is well-rounded and challenging.",
    name: "Emily Johnson",
    company: "Student at Royal Gem Schools",
    avatar: robot
  }
]

const Testimonials = () => {
  return (
    <section className="py-16 px-[1rem] py:px-[5rem] md:px-[5rem] bg-gray-100">
      <div className="max-w-7xl mx-auto px-6 md:px-14">

        <div className="flex flex-col lg:flex-row items-center gap-12">

          {/* Left — image */}
          <div className="w-full lg:w-1/2 flex flex-col gap-6 justify-center">
           <h2 className="font-jost font-bold pr-[3rem] text-4xl md:text-4xl text-gray-900">
              What Our Students Say About Us
            </h2>
            <img
              src={reviewImage1}
              alt="Student Review"
              className="w-full max-w-full md:max-w-full object-contain"
            />
          </div>

          {/* Right — text + slider */}
          <div className="w-full lg:w-1/2 flex flex-col gap-6">
           
            <ReviewSlider reviews={reviews} className="py-4" />
          </div>

        </div>
      </div>
    </section>
  )
}

export default Testimonials