import { dashboardData } from "../../../data/dashboardData";

const colorMap = {
  blue: "bg-cyan-500",
  yellow: "bg-yellow-500",
  red: "bg-red-500",
};

function UserHeatmap() {
  return (
    <div className="rounded-3xl border border-slate-800 bg-[#0A1022] p-6">
      <h3 className="text-xl font-semibold text-white mb-6">
        User Activity Heatmap
      </h3>

      <div className="grid grid-cols-6 gap-3">
        {dashboardData.heatmap.flat().map((cell, index) => (
          <div
            key={index}
            className={`h-10 rounded-lg transition-all duration-300 hover:scale-110 ${colorMap[cell]}`}
          />
        ))}
      </div>
    </div>
  );
}

export default UserHeatmap;
