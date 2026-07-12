import { TrendingUp } from "lucide-react";

const data = [22, 35, 30, 50, 42, 60, 80];

function LoginTrendChart() {
  return (
    <div className="h-full rounded-3xl border border-slate-800 bg-[#0A1022] p-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h3 className="text-xl font-semibold text-white">Login Trend</h3>

          <p className="text-slate-400 text-sm">Last 7 Days</p>
        </div>

        <TrendingUp className="text-green-400" />
      </div>

      <div className="flex items-end justify-between h-48">
        {data.map((item, index) => (
          <div key={index} className="flex flex-col items-center">
            <div
              className="w-8 rounded-full bg-gradient-to-t from-blue-600 to-cyan-400 transition-all duration-500 hover:scale-110"
              style={{
                height: `${item * 1.6}px`,
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

export default LoginTrendChart;
