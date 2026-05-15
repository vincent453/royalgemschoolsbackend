import aboutimg2 from '../../assets/img/aboutimg.jpeg';
import SectionHeader from '../ui/SectionHeader';

const Section = ({
  title = "About Us",
  description = "Home/About",
  img = aboutimg2
}) => {
  return (
    <div>
      <section
        className="relative w-full min-h-[500px] bg-cover bg-center flex items-center justify-evenly overflow-hidden pt-24"
        style={{ backgroundImage: `url(${img})` }}
      >
        {/* Dark overlay */}
        <div className="absolute inset-0 bg-black/60" />

        {/* Your content goes here — must be relative + z-10 to sit above overlay */}
        <div className="relative z-10">
          <SectionHeader title={title} description={description} descColor='text-white'  />
        </div>

      </section>
    </div>
  )
}

export default Section