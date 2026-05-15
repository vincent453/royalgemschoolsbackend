import { useState, useEffect } from 'react'
import logo from '../../assets/img/logo.png'

const Loader = () => (
  <div className="fixed inset-0 z-[999] bg-white flex flex-col items-center justify-center gap-6">
    
    {/* Spinner ring + logo in center */}
    <div className="relative flex items-center justify-center">
      {/* Outer spinning ring */}
      <div className="w-24 h-24 rounded-full border-4 border-gray-100 border-t-[#A033A0] animate-spin" />
      
      {/* Inner static ring */}
      <div className="absolute w-16 h-16 rounded-full border-4 border-gray-100 border-b-[#525fe1] animate-spin [animation-direction:reverse] [animation-duration:1.5s]" />

      {/* Logo in center */}
      <img
        src={logo}
        alt="ROYAL GEM MATHEMATICS SCHOOL"
        className="absolute w-10 h-10 object-contain animate-pulse"
      />
    </div>

    {/* School name */}
    <div className="text-center">
      <h2 className="font-jost font-bold text-gray-900 text-xl">ROYAL GEM MATHEMATICS SCHOOL</h2>
      <p className="font-dm-sans text-gray-400 text-sm mt-1 animate-pulse">Please wait...</p>
    </div>

  </div>
)

// Full page loader wrapper
export const PageLoader = ({ children }) => {
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1000)
    return () => clearTimeout(timer)
  }, [])

  return loading ? <Loader /> : children
}

export default Loader