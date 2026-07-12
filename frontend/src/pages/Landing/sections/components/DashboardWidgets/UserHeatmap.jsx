const users = Array.from({ length: 24 });

function UserHeatmap() {
  return (
    <div className="rounded-3xl border border-slate-800 bg-[#0A1022] p-6">
      <h3 className="text-xl font-semibold text-white mb-6">
        User Activity Heatmap
      </h3>

      <div className="grid grid-cols-6 gap-3">
        {users.map((_, index) => (
          <div
            key={index}
            className={`h-10 rounded-lg transition-all duration-300 hover:scale-110

            ${
              Math.random() > 0.75
                ? "bg-red-500"
                : Math.random() > 0.5
                  ? "bg-yellow-500"
                  : "bg-cyan-500"
            }

            `}
          />
        ))}
      </div>
    </div>
  );
}

export default UserHeatmap;
