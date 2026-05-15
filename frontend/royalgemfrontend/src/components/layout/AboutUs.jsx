import ImageTextSection from '../ui/ImageText'

const AboutUs = ({image}) => {
  return (
    <div>
<div className="flex flex-col lg:flex-row items-center gap-10 px-[1rem] py:px-[5rem] md:px-[5rem] py-12">
    <ImageTextSection 
      image={image}
      imageLeft={true}
      title="Brief History Of Our School"
      titleColor="text-[#A033A0]"
     paragraphs={[
     
      "Royal Gem Schools was founded by Dr. Oluwatoyin Ariyo-Ojeme, a seasoned educator with over three decades of experience in teaching, research, and educational development. Her passion for raising academically sound and morally upright students led to the establishment of Royal Gem Nursery and Primary School in Ikorodu, Lagos State",
      " Driven by a clear vision to transform foundational education, the school quickly gained recognition for its commitment to excellence, discipline, and innovative teaching methods. Building on this success, Royal Gem Mathematical School was later established in Abuja to extend the same standard of quality education to a wider community.",
      "Over the years, Royal Gem Schools have continued to grow, producing well-rounded students equipped with strong academic knowledge and critical thinking skills. Today, the institution stands as a symbol of excellence, combining experience, modern educational practices, and a deep commitment to nurturing future leaders.",
      "With over 20 years of impact, Royal Gem Schools remain dedicated to shaping minds and building futures through quality education and strong moral values."
    ]}
    />
</div>
    </div>
  )
}

export default AboutUs