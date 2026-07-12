import { motion } from "framer-motion";

export default function DashboardHeader() {
  return (
    <div className="flex items-start justify-between mb-5">
      <div>
        <h3 className="text-white font-semibold text-lg">
          Today's Security Summary
        </h3>

        <p className="text-slate-400 text-xs mt-1">Last Scan • 2 sec ago</p>
      </div>

      <motion.div
        animate={{
          scale: [1, 1.08, 1],
        }}
        transition={{
          duration: 1.4,
          repeat: Infinity,
        }}
        className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-400/30 rounded-full px-3 py-1"
      >
        <motion.div
          animate={{
            opacity: [0.5, 1, 0.5],
          }}
          transition={{
            duration: 1,
            repeat: Infinity,
          }}
          className="w-2 h-2 rounded-full bg-emerald-400"
        />

        <span className="text-xs font-medium text-emerald-300">LIVE</span>
      </motion.div>
    </div>
  );
}
