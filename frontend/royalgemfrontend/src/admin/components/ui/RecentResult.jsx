import { useState } from "react";
import { results } from "../../context/data/mockdata";
import { MoreHorizontal, Printer } from "lucide-react";

const RecentResults = () => {
    const [currentPage, setCurrentPage] = useState(1)
    const itemPerpage = 5;
    const totalItems = results.length;
    const totalPages = Math.ceil(totalItems / itemPerpage);

    const startIndex = (currentPage - 1) * itemPerpage;
    const endIndex = startIndex + itemPerpage;

    const currentData = results.slice(startIndex, endIndex);
  return (
    <div className="bg-white p-5 rounded-xl shadow-sm ">

      <h2 className="font-semibold text-gray-800 mb-4">
        Recently Added Results
      </h2>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">

          {/* Header */}
          <thead>
            <tr className="text-left text-gray-400 border-b">
              <th className="py-3">Name</th>
              <th>ID</th>
              <th>Class</th>
              <th>Fees</th>
              <th>Rank</th>
              <th>Action</th>
            </tr>
          </thead>

          {/* Body */}
          <tbody>
            {currentData.map((item) => (
              <tr key={item.id} className="border-b hover:bg-gray-50">

                {/* Name + Avatar */}
                <td className="py-4 flex items-center gap-3">
                  <img
                    src={item.img}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <span className="font-medium text-gray-700">
                    {item.name}
                  </span>
                </td>

                {/* ID */}
                <td className="text-blue-600 font-medium">
                  ID {item.studentId}
                </td>

                {/* Class */}
                <td>
                  <span className="bg-orange-100 text-orange-600 px-3 py-1 rounded-full text-xs">
                    {item.class}
                  </span>
                </td>

                {/* Fee */}
                <td className="font-semibold text-gray-700">
                  $ {item.fee}
                </td>

                {/* Rank */}
                <td className="text-gray-500">
                  {item.rank}
                </td>

                {/* Actions */}
                <td className="flex items-center gap-3 text-gray-400">
                  <Printer size={16} className="cursor-pointer hover:text-gray-600" />
                  <MoreHorizontal size={16} className="cursor-pointer hover:text-gray-600" />
                </td>

              </tr>
            ))}
          </tbody>

        </table>
      </div>

      {/* Footer */}
      <div className="flex justify-between items-center mt-4 text-sm text-gray-500">
           <p className="text-sm text-gray-500 mt-3">
        Showing {startIndex + 1} to{" "}
        {Math.min(endIndex, totalItems)} of {totalItems} entries
        </p>
        <div className="flex items-center gap-2">
     <button
    disabled={currentPage === 1}
    onClick={() => setCurrentPage((p) => p - 1)}
    className="px-3 py-1 border rounded disabled:opacity-50"
  >
    Prev
  </button>

  <button
    disabled={currentPage === totalPages}
    onClick={() => setCurrentPage((p) => p + 1)}
    className="px-3 py-1 border rounded disabled:opacity-50"
  >
    Next
  </button>
        </div>
      </div>

    </div>
  );
};

export default RecentResults;