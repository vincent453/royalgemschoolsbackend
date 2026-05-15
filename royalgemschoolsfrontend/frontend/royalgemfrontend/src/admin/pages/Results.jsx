import Slidebar from "../components/layout/Slidebar"
import Topbar from "../components/layout/Topbar"
import SearchHeader from "../components/ui/SearchHeader"
import ResultTable  from "../components/ui/ResultTable"

const Results = () => {
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
          <SearchHeader buttonText = "+ Upload Result" href="/admin/upload" />
            <div className=" mt-5">
         <ResultTable />
   </div>
   </div>
   </main>
      </div>
      </div>

  )
}

export default Results