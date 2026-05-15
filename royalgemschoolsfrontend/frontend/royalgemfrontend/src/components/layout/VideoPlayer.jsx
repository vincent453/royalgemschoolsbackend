import { useState } from 'react'
import { FaTimes } from 'react-icons/fa'
import PlayButton from '../ui/PlayButton'


const VideoPlayer = ({
  thumbnailImage,
  videoUrl = "https://www.youtube.com/embed/9MJFRr7mY-Y?si=0b4KGkWaPqipi63I",
  alt = "video thumbnail",
  showPlayButton = true,
  style,
}) => {
  const [isVideoOpen, setIsVideoOpen] = useState(false)

  const openVideo = () => setIsVideoOpen(true)
  const closeVideo = () => setIsVideoOpen(false)

  return (
    <>
      {/* Thumbnail */}
      <div
        className={`relative w-full mt-[6rem] ${style}  px-[0rem] py:px-[5rem] md:px-[5rem] cursor-pointer group`}
        onClick={openVideo}
      >
        {/* Image frame with border */}
        <div className='relative flex justify-center items-center w-full'>
        <div className="rounded-xl overflow-hidden border-[12px] border-[#eef0ff] shadow-xl">
          <div className="relative h-[250px]  sm:h-[350px] md:h-[450px] lg:h-[530px] w-full">
            <img
              src={thumbnailImage}
              alt={alt}
              className="w-[100vw] h-full object-cover"
            />
            {/* Dark overlay on hover */}
            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-all duration-300" />
          </div>
        </div>

        {/* Play Button centered over image */}
        {showPlayButton && (
          <div className="absolute inset-0 flex items-center justify-center">
            <PlayButton onClick={openVideo} />
          </div>
        )}
      </div>
      </div>

      {/* Video Modal */}
      <div
        className={`fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4
                    transition-opacity duration-300
                    ${isVideoOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        onClick={closeVideo}
      >
        {/* Close Button */}
        <button
          onClick={closeVideo}
          className="absolute top-4 right-4 md:top-8 md:right-8 bg-white/10 hover:bg-white/20
                     text-white p-3 rounded-full transition-colors duration-200 z-10"
        >
          <FaTimes className="text-2xl md:text-3xl" />
        </button>

        {/* Video Container */}
        <div
          className={`relative w-full max-w-6xl aspect-video transition-all duration-300
                      ${isVideoOpen ? 'scale-100 opacity-100' : 'scale-90 opacity-0'}`}
          onClick={(e) => e.stopPropagation()}
        >
          {isVideoOpen && (
            <iframe
              src={videoUrl}
              className="w-full h-full rounded-lg shadow-2xl"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              title="Video Player"
            />
          )}
        </div>
      </div>
    </>
  )
}

export default VideoPlayer