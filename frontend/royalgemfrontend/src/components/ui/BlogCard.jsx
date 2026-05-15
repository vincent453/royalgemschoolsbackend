import { FiArrowUpRight } from 'react-icons/fi'

const BlogCard = ({
  image,
  date,
  category,
  categoryColor = "text-[#525fe1]",
  title,
  href = "#",
}) => {
  return (
    <div className="bg-white shadow-sm border border-gray-200 overflow-hidden group w-full max-w-[320px]">

      {/* Image */}
      <div className="overflow-hidden h-[220px]">
        <img
          src={image}
          alt={title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col gap-4">

        {/* Date + Category */}
        <div className="flex items-center gap-2 font-dm-sans text-sm text-gray-400">
          <span>{date}</span>
          <span>|</span>
          <span className={`font-semibold text-[17px] font-jost ${categoryColor}`}>{category}</span>
        </div>

        {/* Title */}
        <h3 className="font-jost font-bold text-[#702b70] text-lg leading-snug">
          {title}
        </h3>

        {/* Read More Button */}
        <a
          href={href}
          className="inline-flex items-center gap-2 bg-[#A033A0] hover:bg-[#525fe1]
                     text-white font-jost font-semibold text-sm
                     px-5 py-5 w-fit transition-colors duration-300"
        >
          Read More
          <FiArrowUpRight className="text-base" />
        </a>

      </div>
    </div>
  )
}

export default BlogCard