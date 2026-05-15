import Slidebar from "../components/layout/Slidebar"
import Topbar from "../components/layout/Topbar"
import CalendarCard from "../components/ui/Calender"
import Overview from "../components/ui/Overview"
import Performance from "../components/ui/Performance"
import RecentResults from "../components/ui/RecentResult"
import Statcard from "../components/ui/Statcard"
import TeacherTable from "../components/ui/Table"

const AdminDashboard = () => {
  return (
    <div className="flex flex-col h-full bg-[#E6EBEE] overflow-hidden ">

      {/* Topbar — full width across the top */}
      <div className="sticky top-0 z-50 w-full">
        <Topbar />
      </div>

      {/* Below topbar: sidebar + content side by side */}
      <div className="flex flex-1 overflow-hidden h-full rounded-r-2xl shadow-sm">

        {/* Sidebar */}
        <div className="-mt-16">
        <Slidebar />
        </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
          {/* Stat Cards */}
      <div className=" p-6">
      <Statcard/>
      </div>
      <div className="px-6">
        <div className="flex gap-6">

          <div className="w-[50%]">
            <Performance />
          </div>

          <div className="w-[50%]">
            <Overview />
          </div>

        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 px-6 mt-6">
  
  {/* Calendar */}
  <div className="lg:col-span-1">
    <CalendarCard />
  </div>

  {/* Table */}
  <div className="lg:col-span-2">
    <TeacherTable />
  </div>

</div>
    <div className="px-[1.5rem] mt-5">
    <RecentResults />
    </div>
      </div>

    </div>
    </div>
    
  )
}

export default AdminDashboard