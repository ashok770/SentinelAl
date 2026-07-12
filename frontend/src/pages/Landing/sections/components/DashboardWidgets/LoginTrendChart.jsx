import React, { useState, useEffect } from "react";
import { TrendingUp } from "lucide-react";

const MAX = 120;

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

      <div className="mt-6 flex">
        <div className="flex flex-col justify-between text-xs text-slate-500 mr-3">
          <span>150</span>
          <span>100</span>
          <span>50</span>
          <span>0</span>
        </div>

        <div className="flex-1 flex flex-col">
          <div className="flex items-end justify-around h-44 border-b border-slate-600/70 pb-2">
            {loginData.map((item, idx) => (
              <div key={idx} className="group relative flex flex-col items-center">
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 hidden group-hover:flex flex-col items-center z-10">
                  <div className="bg-slate-800 border border-slate-700 rounded-lg px-2 py-1 text-center whitespace-nowrap">
                    <p className="text-slate-300 text-xs">{item.day}</p>
                    <p className="text-white text-xs font-semibold">{item.value} Logins</p>
                  </div>
                </div>
                <div
                  className="w-7 rounded-full bg-gradient-to-t from-blue-600 to-cyan-400 transition-all duration-1000 hover:brightness-110 hover:shadow-lg"
                  style={{
                    height: loaded ? `${(item.value / MAX) * 170}px` : "0px",
                  }}
                ></div>
              </div>
            ))}
          </div>

          <div className="flex justify-around mt-3 text-xs text-slate-500">
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
