const SectionHeader = ({
  title,
  description,
  align = "center",
  titleColor = "text-[#A033A0]",
  descColor = "text-gray-500",
}) => {
  return (
    <div className={`text-${align}`}>
      <h2 className={`font-jost font-bold text-3xl md:text-[2.5rem] ${titleColor}`}>
        {title}
      </h2>
      {description && (
        <p className={`font-dm-sans mt-4 text-base md:text-lg max-w-4xl ${descColor}
                      ${align === "center" ? "mx-auto" : ""}`}>
          {description}
        </p>
      )}
    </div>
  )
}

export default SectionHeader