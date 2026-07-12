import { motion } from "framer-motion";
import AnimatedCounter from "./AnimatedCounter";

export default function ThreatCard({ title, value, trend, icon, color, bg }) {
  return (
    <motion.div
      whileHover={{
        y: -3,
        scale: 1.02,
      }}
      transition={{
        duration: 0.2,
      }}
      className={`rounded-xl border p-4 ${bg}`}
    >
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-2">
          <span className="text-lg">{icon}</span>

          <span className={`text-sm ${color}`}>{title}</span>
        </div>

        <AnimatedCounter value={value} />
      </div>

      <motion.div
        animate={{
          opacity: [0.6, 1, 0.6],
        }}
        transition={{
          repeat: Infinity,
          duration: 2,
        }}
        className="mt-3 text-xs text-slate-400"
      >
        {trend}
      </motion.div>
    </motion.div>
  );
}
