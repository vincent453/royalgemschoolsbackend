import { useEffect, useRef } from "react";
import { performanceData } from "../../context/data/mockdata";

// npm install chart.js  ← run this if not installed
import { Chart, registerables } from "chart.js";
Chart.register(...registerables);

const Performance = () => {
  const canvasRef = useRef(null);
  const chartRef  = useRef(null);

  useEffect(() => {
    if (chartRef.current) chartRef.current.destroy();

    const ctx = canvasRef.current.getContext("2d");

    // Gradient fills
    const gradientThis = ctx.createLinearGradient(0, 0, 0, 200);
    gradientThis.addColorStop(0, "rgba(91,79,233,0.25)");
    gradientThis.addColorStop(1, "rgba(91,79,233,0)");

    const gradientLast = ctx.createLinearGradient(0, 0, 0, 200);
    gradientLast.addColorStop(0, "rgba(249,115,22,0.20)");
    gradientLast.addColorStop(1, "rgba(249,115,22,0)");

    chartRef.current = new Chart(ctx, {
      type: "line",
      data: {
        labels: performanceData.labels,
        datasets: [
          {
            label: "This Term",
            data: performanceData.thisTerm.data,
            borderColor: "#5B4FE9",
            backgroundColor: gradientThis,
            borderWidth: 2.5,
            pointRadius: 4,
            pointBackgroundColor: "#5B4FE9",
            pointBorderColor: "#fff",
            pointBorderWidth: 2,
            tension: 0.45,
            fill: true,
          },
          {
            label: "Last Term",
            data: performanceData.lastTerm.data,
            borderColor: "#F97316",
            backgroundColor: gradientLast,
            borderWidth: 2.5,
            pointRadius: 4,
            pointBackgroundColor: "#F97316",
            pointBorderColor: "#fff",
            pointBorderWidth: 2,
            tension: 0.45,
            fill: true,
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
            ticks: { color: "#94a3b8", font: { size: 11, family: "'Plus Jakarta Sans', sans-serif" } },
            border: { display: false },
          },
          y: {
            grid: { color: "#f1f5f9" },
            ticks: {
              color: "#94a3b8",
              font: { size: 11, family: "'Plus Jakarta Sans', sans-serif" },
              callback: (v) => `${v / 1000}k`,
            },
            border: { display: false },
          },
        },
      },
    });

    return () => chartRef.current?.destroy();
  }, []);

  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm flex-1">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="font-bold text-gray-800 text-[15px]">School Performance</h3>
          <div className="flex items-center gap-5 mt-2">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-violet-600 inline-block" />
              <span className="text-xs text-gray-400">This Term</span>
              <span className="font-extrabold text-sm text-gray-800">{performanceData.thisTerm.value}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-orange-400 inline-block" />
              <span className="text-xs text-gray-400">Last Term</span>
              <span className="font-extrabold text-sm text-gray-800">{performanceData.lastTerm.value}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="h-48">
        <canvas ref={canvasRef} />
      </div>
    </div>
  );
}

export default Performance;