const FeatureCard = ({
  number,
  title,
  description,
  bgColor = "bg-red-100",
  textColor = "text-red-400",
}) => {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col gap-4 w-full hover:shadow-md transition-shadow duration-300">
      <div className="flex items-center gap-4">
        <div className={`flex items-center justify-center w-16 h-16 rounded-full ${bgColor} shrink-0`}>
          <span className={`font-jost font-medium text-[1.8rem] ${textColor}`}>{number}</span>
        </div>
        <h3 className="font-jost font-bold text-[#1a1a4b] text-[1.3rem] leading-snug">{title}</h3>
      </div>
      <p className="font-dm-sans text-gray-700 text-lg leading-relaxed">{description}</p>
    </div>
  );
};

export default FeatureCard;