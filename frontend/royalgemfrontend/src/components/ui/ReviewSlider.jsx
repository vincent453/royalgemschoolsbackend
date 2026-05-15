import { useState, useRef } from 'react'
import ReviewCard from '../ui/ReviewCard'

const ReviewSlider = ({ reviews, className = "px-6 md:px-14 py-12" }) => {
  const [current, setCurrent] = useState(0)
  const startX = useRef(0)
  const isDragging = useRef(false)
  const threshold = 50

  const goTo = (index) => {
    if (index < 0 || index >= reviews.length) return
    setCurrent(index)
  }

  const onDragStart = (e) => {
    isDragging.current = true
    startX.current = e.type === 'touchstart'
      ? e.touches[0].clientX
      : e.clientX
  }

  const onDragEnd = (e) => {
    if (!isDragging.current) return
    isDragging.current = false
    const endX = e.type === 'touchend'
      ? e.changedTouches[0].clientX
      : e.clientX
    const diff = startX.current - endX
    if (diff > threshold) goTo(current + 1)
    else if (diff < -threshold) goTo(current - 1)
  }

  return (
    <div className={`w-full select-none ${className}`}>
      <div
        className="relative overflow-hidden cursor-grab active:cursor-grabbing"
        onMouseDown={onDragStart}
        onMouseUp={onDragEnd}
        onTouchStart={onDragStart}
        onTouchEnd={onDragEnd}
      >
        <div
          className="flex transition-transform duration-500 ease-in-out"
          style={{ transform: `translateX(-${current * 100}%)` }}
        >
          {reviews.map((review, index) => (
            <div key={index} className="min-w-full">
              <ReviewCard {...review} />
            </div>
          ))}
        </div>
      </div>

      {/* Dots */}
      <div className="flex justify-center gap-2 mt-6">
        {reviews.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            className={`h-2 rounded-full transition-all duration-300
                        ${current === i
                          ? 'w-6 bg-[#A033A0]'
                          : 'w-2 bg-gray-300 hover:bg-gray-400'}`}
          />
        ))}
      </div>
    </div>
  )
}

export default ReviewSlider