import { FaPlay } from 'react-icons/fa'
import './PlayBtn.css'

const PlayButton = ({ onClick }) => {
  return (
    <button
      onClick={(e) => {
        e.stopPropagation()
        onClick?.()
      }}
      className="video-button relative flex items-center justify-center
                 w-16 h-16 rounded-full bg-[#A033A0] hover:bg-[#525fe1]
                 text-white shadow-2xl hover:scale-110 active:scale-95
                 transition-all duration-300 overflow-visible"
    >
      <FaPlay className="text-white text-lg ml-1 relative z-10" />
    </button>
  )
}

export default PlayButton