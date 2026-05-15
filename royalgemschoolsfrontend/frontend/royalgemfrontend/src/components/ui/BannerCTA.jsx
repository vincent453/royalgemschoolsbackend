import { FiArrowUpRight } from 'react-icons/fi'

const BannerCTA = ({
  image,
  tagline,
  title,
  description1,
  description2,
  description3,
  buttonText = "Learn More",
  buttonHref = "#",
  overlayOpacity = "bg-black/50",
}) => {
  return (
    <div className="px-6 md:px-14 py-12">
      <div
        className="relative w-full rounded-2xl overflow-hidden bg-cover bg-center min-h-[320px] flex items-center"
        style={{ backgroundImage: `url(${image})` }}
      >
        {/* Overlay */}
        <div className={`absolute inset-0 ${overlayOpacity}`} />

        {/* Content */}
        <div className="relative z-10 px-8 md:px-14 py-12 max-w-2xl flex flex-col gap-4">
          {tagline && (
            <span className="font-dm-sans text-gray-200 text-sm md:text-base">
              {tagline}
            </span>
          )}
          <h2 className="font-jost font-bold text-3xl md:text-4xl lg:text-5xl text-white leading-tight">
            {title}
          </h2>
          {description1 && (
            <p className="font-dm-sans text-gray-200 text-base md:text-lg leading-relaxed">
              {description1}
            </p>
          )}
          {description2 && (
            <p className="font-dm-sans text-gray-200 text-base md:text-lg leading-relaxed">
              {description2}
            </p>
          )}
          {description3 && (
            <p className="font-dm-sans text-gray-200 text-base md:text-lg leading-relaxed">
              {description3}
            </p>
          )}
        
          <a
            href={buttonHref}
            className="inline-flex items-center gap-2 bg-[#A033A0] hover:bg-[#525fe1]
                       text-white font-jost font-semibold px-6 py-3 w-fit
                       transition-colors duration-300 mt-2"
          >
            {buttonText}
            <FiArrowUpRight className="text-base" />
          </a>
        </div>
      </div>
    </div>
  )
}

export default BannerCTA