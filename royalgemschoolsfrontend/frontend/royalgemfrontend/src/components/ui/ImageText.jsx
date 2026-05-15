const ImageTextSection = ({
  image,
  imageAlt = "section image",
  title,
  titleColor = "text-[#A033A0]",
  paragraphs = [],
  imageLeft = true,
  children,
}) => {
  const imageBlock = (
    <div className="w-full lg:w-[50%] flex justify-center">
      <img
        src={image}
        alt={imageAlt}
        className="w-full max-w-sm md:max-w-md lg:max-w-full object-contain"
      />
    </div>
  )

  const textBlock = (
    <div className="w-full lg:w-[50%] flex flex-col gap-4">
      <h2 className={`font-jost font-bold text-3xl md:text-4xl text-center lg:text-left ${titleColor}`}>
        {title}
      </h2>
      {paragraphs.map((text, i) => (
        <p key={i} className="font-dm-sans text-gray-700 text-base md:text-lg leading-relaxed">
          {text}
        </p>
      ))}
      {/* For any extra content like buttons, lists, etc. */}
      {children}
    </div>
  )

  return (
    <div className="flex flex-col lg:flex-row items-center gap-10  py-12">
      {imageLeft ? imageBlock : textBlock}
      {imageLeft ? textBlock : imageBlock}
    </div>
  )
}

export default ImageTextSection