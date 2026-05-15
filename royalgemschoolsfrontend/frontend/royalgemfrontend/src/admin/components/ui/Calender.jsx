import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import  "./Calendar.css";

const CalendarCard = () => {
  return (
    <div className="bg-white p-5 rounded-xl shadow-sm w-full max-w-sm">
      <h2 className="font-semibold text-gray-800 mb-4">
        School Calendar
      </h2>

      <Calendar className="react-calendar-custom" />
    </div>
  );
};

export default CalendarCard;    