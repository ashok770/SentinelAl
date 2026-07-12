import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

const STATES = [
  {
    color: "bg-emerald-400",
    text: "Monitoring User Activity",
  },
  {
    color: "bg-yellow-400",
    text: "Scanning Login Patterns",
  },
  {
    color: "bg-cyan-400",
    text: "AI Risk Analysis",
  },
  {
    color: "bg-orange-400",
    text: "Building Behaviour Profile",
  },
  {
    color: "bg-red-500",
    text: "Threat Score Updated",
  },
];

export default function DashboardStatus() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % STATES.length);
    }, 2500);

    return () => clearInterval(timer);
  }, []);

  const state = STATES[index];

  return (
    <div className="mb-6">
      <AnimatePresence mode="wait">
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.35 }}
          className="flex items-center gap-3"
        >
          <div
            className={`w-3 h-3 rounded-full ${state.color} animate-pulse`}
          />

          <span className="text-sm text-slate-300">{state.text}</span>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
