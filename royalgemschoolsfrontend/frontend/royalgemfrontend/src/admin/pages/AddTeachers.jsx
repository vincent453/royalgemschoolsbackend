import Slidebar from "../components/layout/Slidebar";
import Topbar from "../components/layout/Topbar";
import StudentDetailsForm from "../components/ui/StudentDetailsForm";
import EducationDetailsForm from "../components/ui/EducationDetailsForm";

const AddStudent = () => {
  return (
    <div className="flex flex-col h-full bg-[#E6EBEE] overflow-hidden ">

      {/* Topbar — full width across the top */}
      <div className="sticky top-0 z-50 w-full">
        <Topbar />
      </div>

      {/* Below topbar: sidebar + content side by side */}
      <div className="flex flex-1 overflow-y-scroll h-full rounded-r-2xl shadow-sm">

        {/* Sidebar */}
        <div className="-mt-16 ">
        <Slidebar />
        </div>

        {/* Scrollable content */}
        <main className="flex-1 overflow-y-auto px-6 py-10 space-y-6">
          <StudentDetailsForm title="Personal Details" showParentInput={false} />
          <EducationDetailsForm />
          
        </main>

      </div>
    </div>
  );
};

export default AddStudent;