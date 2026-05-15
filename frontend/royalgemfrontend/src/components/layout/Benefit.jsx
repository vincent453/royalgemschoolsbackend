
import FeatureCard from '../ui/FeatureCard';
import shape from '../../assets/img/shape-1.png'
import SectionHeader from '../ui/SectionHeader';
const features = [
  {
    number: "01",
    title: "Qualified Teachers",
    description: "Our experienced and certified teachers are dedicated to nurturing students academically and personally, ensuring every child reaches their full potential.",
    bgColor: "bg-red-100",
    textColor: "text-red-400"
  },
  {
    number: "02",
    title: "Quality Education",
    description: "We provide a well-structured and up-to-date curriculum that equips students with the knowledge and skills needed for academic excellence and future success.",
    bgColor: "bg-purple-100",
    textColor: "text-purple-400"
  },
  {
    number: "03",
    title: "Moral Values",
    description: "We instill strong moral principles, discipline, and respect, helping students grow into responsible and well-rounded individuals.",
    bgColor: "bg-blue-100",
    textColor: "text-blue-400"
  },
  {
    number: "04",
    title: "Modern Classrooms",
    description: "Our classrooms are equipped with modern learning tools and a conducive environment that enhances effective teaching and learning.",
    bgColor: "bg-teal-100",
    textColor: "text-teal-400"
  }
];

const Benefit = () => {
  return (
    <div className="w-full py-[5.5rem]  px-[1rem] py:px-[5rem] md:px-[5rem]" style={{backgroundImage: `url(${shape})`, backgroundPosition: 'center', backgroundRepeat: 'no-repeat', backgroundSize: 'cover'}}>
        <div>
            <SectionHeader 
                title="Why Choose Us?"
                description="Discover the unique benefits of our school and why we are the right choice for your child's education."
            />
        </div>
        <div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 py-12">
        {features.map((item, index) => (
        <FeatureCard key={index} {...item} />
        ))}
  </div>

        </div>
    </div>
  )
}

export default Benefit