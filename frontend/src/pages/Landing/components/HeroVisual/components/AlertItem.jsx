import { motion } from "framer-motion";
import { ShieldAlert, ShieldCheck, AlertTriangle, Laptop } from "lucide-react";

const iconMap = {
  red: <ShieldAlert size={18} />,
  orange: <AlertTriangle size={18} />,
  yellow: <Laptop size={18} />,
  green: <ShieldCheck size={18} />,
};

const colorMap = {
  red: "bg-red-500/10 border-red-500/20 text-red-400",
  orange: "bg-orange-500/10 border-orange-500/20 text-orange-400",
  yellow: "bg-yellow-500/10 border-yellow-500/20 text-yellow-400",
  green: "bg-emerald-500/10 border-emerald-500/20 text-emerald-400",
};

export default function AlertItem({
  title,
  user,
  location,
  severity,
  time,
  color,
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -18 }}
      transition={{ duration: 0.35 }}
      className={`rounded-xl border p-4 ${colorMap[color]}`}
    >
      <div className="flex items-center gap-2 font-medium">
        {iconMap[color]}
        <span>{title}</span>
      </div>

      <div className="mt-3 text-sm text-gray-300 space-y-1">
        <p>{user}</p>
        <p>{location}</p>
      </div>

      <div className="mt-3 flex justify-between text-xs">
        <span>{severity}</span>
        <span>{time}</span>
      </div>
    </motion.div>
  );
}
