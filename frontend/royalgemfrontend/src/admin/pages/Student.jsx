import Slidebar from "../components/layout/Slidebar"
import Topbar from "../components/layout/Topbar"
import SearchHeader from "../components/ui/SearchHeader"
import StudentTable from "../components/ui/StudentTable"

const Student = () => {
  return (
    <div className="flex flex-col h-[100dvh] bg-[#E6EBEE] overflow-x-hidden">

      <div className="sticky top-0 z-50 w-full">
        <Topbar />
      </div>

      <div className="flex flex-1 overflow-hidden">
        <div className="-mt-16">
          <Slidebar />
        </div>
        <main className="w-full overflow-y-auto">
          <div className="flex flex-col gap-6 p-6 max-w-6xl mx-auto">
          <SearchHeader   />
            <div className=" mt-5">
         <StudentTable />
    </div>  
    </div>
    </main>
    </div>
    </div>
  )
}

export default Student