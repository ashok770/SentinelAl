import React, { useState, useEffect } from "react";
import { TrendingUp } from "lucide-react";

const loginData = [
  { day: "M", value: 28 },
  { day: "T", value: 46 },
  { day: "W", value: 39 },
  { day: "T", value: 64 },
  { day: "F", value: 52 },
  { day: "S", value: 74 },
  { day: "S", value: 92 },
];

function LoginTrendChart() {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setLoaded(true), 50);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="h-full rounded-3xl border border-slate-800 bg-[#0A1022] p-6">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-white font-semibold text-lg">Login Trend</h3>

          <p className="text-slate-400 text-sm">142 successful authentications today</p>
        </div>

        <div className="text-right">
          <div className="flex items-center justify-end gap-1 text-emerald-400">
            <TrendingUp size={14} />
            <span className="font-semibold">+18%</span>
          </div>

          <p className="text-slate-500 text-xs">vs last week</p>
        </div>
      </div>

      <div className="mt-4 flex">
        <div className="flex flex-col justify-between text-xs text-slate-500 mr-3">
          <span>120</span>
          <span>80</span>
          <span>40</span>
          <span>0</span>
        </div>

        <div className="flex-1 flex flex-col">
          <div className="flex justify-evenly items-end h-48 border-b border-slate-600/70 pb-2">
            {loginData.map((item, idx) => (
              <div key={idx} className="flex flex-col items-center">
                <div
                  className="w-5 rounded-full bg-gradient-to-t from-blue-600 to-cyan-400 transition-all duration-1000"
                  style={{
                    height: loaded ? `${item.value * 1.8}px` : "0px",
                  }}
                ></div>
              </div>
            ))}
          </div>

          <div className="flex justify-evenly mt-3 text-xs text-slate-500">
            {loginData.map((item, idx) => (
              <span key={idx}>{item.day}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginTrendChart;
