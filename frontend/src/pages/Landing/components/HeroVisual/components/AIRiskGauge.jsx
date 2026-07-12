import { motion } from "framer-motion";
import { ShieldAlert } from "lucide-react";

export default function AIRiskGauge() {
  const score = 94;

  return (
    <div className="rounded-2xl border border-slate-700/40 bg-[#0F172A]/70 backdrop-blur-xl p-6">
      <div className="flex items-center gap-2 mb-5">
        <ShieldAlert className="text-red-400" size={20} />
        <h3 className="font-semibold text-white">AI Risk Score</h3>
      </div>

      {/* Gauge */}

      <div className="relative w-48 h-48 mx-auto">
        <svg className="absolute inset-0" viewBox="0 0 200 200">
          {/* Background Circle */}

          <circle
            cx="100"
            cy="100"
            r="78"
            stroke="#23304a"
            strokeWidth="12"
            fill="none"
          />

          {/* Progress */}

          <motion.circle
            cx="100"
            cy="100"
            r="78"
            stroke="#ef4444"
            strokeWidth="12"
            fill="none"
            strokeLinecap="round"
            strokeDasharray={490}
            initial={{ strokeDashoffset: 490 }}
            animate={{
              strokeDashoffset: 490 - (490 * score) / 100,
            }}
            transition={{
              duration: 2,
              ease: "easeOut",
            }}
            transform="rotate(-90 100 100)"
          />
        </svg>

        {/* Percentage */}

        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.h1
            initial={{ scale: 0.7 }}
            animate={{ scale: 1 }}
            transition={{
              duration: 0.8,
            }}
            className="text-5xl font-bold text-white"
          >
            {score}%
          </motion.h1>

          <p className="text-red-400 text-sm mt-2">Critical Risk</p>
        </div>
      </div>

      {/* Confidence */}

      <div className="mt-6">
        <div className="flex justify-between text-sm">
          <span className="text-slate-400">AI Confidence</span>

          <span className="text-emerald-400">98.7%</span>
        </div>

        <div className="h-2 rounded-full bg-slate-800 mt-2 overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: "98.7%" }}
            transition={{
              duration: 2,
            }}
            className="h-full rounded-full bg-emerald-400"
          />
        </div>
      </div>
    </div>
  );
}
