import { FaStar } from 'react-icons/fa'
import quote from '../../assets/img/quote.png'
const ReviewCard = ({
  review,
  name,
  company,
  avatar,
  rating = 5,
}) => {
  return (
    <div className="bg-white rounded-[7px] w-[516px] shadow-sm border border-gray-100 p-8 flex flex-col gap-5 ">

      {/* Star Rating */}
        <img src={quote} className='block w-[60px]' />
      <div className="flex flex-row items-center gap-1">
        {Array.from({ length: 5 }).map((_, i) => (
          <FaStar
            key={i}
            className={`text-[26px] ${i < rating ? 'text-[#FFB400]' : 'text-gray-200'}`}
          />
        ))}
      </div>

      {/* Review Text */}
      <p className="font-dm-sans text-gray-600 font-medium text-[22px] pr-7 text-left leading-relaxed">
        {review}
      </p>

      {/* Reviewer Info */}
      <div className="flex items-center gap-3 bg-gray-50 rounded-sm px-4 py-5">
        <img
          src={avatar}
          alt={name}
          className="w-12 h-12 rounded-full object-cover shrink-0"
        />
        <div>
          <h4 className="font-jost font-bold text-gray-900 text-sm">{name}</h4>
          <p className="font-dm-sans text-gray-400 text-xs mt-0.5">{company}</p>
        </div>
      </div>

    </div>
  )
}

export default ReviewCard