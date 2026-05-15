import { useEffect, useRef, useState } from "react";
import { overviewData } from "../../context/data/mockdata";
import { Chart, registerables } from "chart.js";
Chart.register(...registerables);

const TABS = ["Week", "Month", "Year", "All"];


const Overview = () => {

  const canvasRef = useRef(null);
  const chartRef  = useRef(null);
  const [activeTab, setActiveTab] = useState("Week");

  useEffect(() => {
    if (chartRef.current) chartRef.current.destroy();
    const ctx = canvasRef.current.getContext("2d");

    const revenueGrad = ctx.createLinearGradient(0, 0, 0, 180);
    revenueGrad.addColorStop(0, "rgba(16,185,129,0.5)");
    revenueGrad.addColorStop(1, "rgba(16,185,129,0)");

    chartRef.current = new Chart(ctx, {
      data: {
        labels: overviewData.labels,
        datasets: [
          {
            type: "bar",
            label: "Number of Enrollments",
            data: overviewData.enrollment,
            backgroundColor: "#5B4FE9",
            borderRadius: 6,
            barThickness: 10,
          },
          {
            type: "line",
            label: "Attendance",
            data: overviewData.attendance,
            borderColor: "#10B981",
            backgroundColor: revenueGrad,
            borderWidth: 2,
            pointRadius: 3,
            pointBackgroundColor: "#10B981",
            tension: 0.45,
            fill: true,
          },
          {
            type: "line",
            label: "Graduates",
            data: overviewData.graduates,
            borderColor: "#F43F5E",
            borderDash: [4, 4],
            borderWidth: 2,
            pointRadius: 0,
            tension: 0.45,
            fill: false,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: "#1E1B4B",
            titleColor: "#fff",
            bodyColor: "rgba(255,255,255,0.7)",
            padding: 10,
            cornerRadius: 10,
          },
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: { color: "#94a3b8", font: { size: 10, family: "'Plus Jakarta Sans', sans-serif" } },
            border: { display: false },
          },
          y: {
            grid: { color: "#f1f5f9" },
            ticks: { color: "#94a3b8", font: { size: 10 } },
            border: { display: false },
            max: 200,
          },
        },
      },
    });

    return () => chartRef.current?.destroy();
  }, [activeTab]);

  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm flex-1">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-gray-800 text-[15px]">School Overview</h3>
        <div className="flex gap-1 bg-gray-100 p-1 rounded-xl">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                activeTab === tab
                  ? "bg-white text-violet-600 shadow-sm"
                  : "text-gray-400 hover:text-gray-600"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Chart */}
      <div className="h-48">
        <canvas ref={canvasRef} />
      </div>

      {/* Legend */}
      <div className="flex items-center gap-5 mt-3">
        {[
          { color: "bg-violet-600", label: "Number of Enrollments" },
          { color: "bg-emerald-500", label: "Attendance" },
          { color: "bg-rose-500",   label: "Graduates" },
        ].map(({ color, label }) => (
          <div key={label} className="flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-full ${color}`} />
            <span className="text-[11px] text-gray-400">{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Overview;