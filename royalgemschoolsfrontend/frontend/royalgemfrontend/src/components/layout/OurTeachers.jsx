import SectionHeader from "../ui/SectionHeader"
import teacher1 from '../../assets/img/teacher1.jpg'
import teacher2 from '../../assets/img/teacher2.webp'
import teacher3 from '../../assets/img/teacher3.jpg'
import teacher4 from '../../assets/img/teacher4.jpg'

import TeacherCard from "../ui/TeacherCard"

const teachers = [
  {
    image:      teacher1,
    name:       "Mrs. Oluwatoyin Ariyo",
    subject:    "Mathematics Teacher",
    courses:    4,
    students:   120,
    twitterUrl: "https://twitter.com/",
    facebookUrl:"https://facebook.com/",
    linkedinUrl:"https://linkedin.com/",
  },
{  
    image:      teacher2,
    name:       "Mr. John Doe",
    subject:    "Science Teacher",
    courses:    3,
    students:   90,
    twitterUrl: "https://twitter.com/",
    facebookUrl:"https://facebook.com/",
    linkedinUrl:"https://linkedin.com/",    
    },  
    {
    image:      teacher3,
    name:       "Ms. Jane Smith",
    subject:    "English Teacher",
    courses:    5,
    students:   150,
    twitterUrl: "https://twitter.com/",
    facebookUrl:"https://facebook.com/",
    linkedinUrl:"https://linkedin.com/",    
    },
    {
    image:      teacher4,
    name:       "Mr. David Johnson",
    subject:    "History Teacher",
    courses:    4,
    students:   110,
    twitterUrl: "https://twitter.com/",
    facebookUrl:"https://facebook.com/",
    linkedinUrl:"https://linkedin.com/",    
    }
]
const OurTeachers = () => {
  return (              
    <div className="mt-[50px] py:mt-[173px] px-[0rem] py:px-[5rem] md:px-[5rem]">
        <SectionHeader title="Our Teachers" description="Meet our dedicated and experienced teaching staff who are committed to providing quality education and nurturing the potential of every student." />
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 px-6 md:px-14 py-14">
        {/* Teacher Cards */}
        {teachers.map((teacher, index) => (
          <TeacherCard key={index} {...teacher} />
        ))}
      </div>
    </div>
  )
}

export default OurTeachers