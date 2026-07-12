import { useEffect, useState } from "react";
import { AnimatePresence } from "framer-motion";
import AlertItem from "./AlertItem";

const alerts = [
  {
    title: "Unknown Device Login",
    user: "Rahul Sharma",
    location: "Mumbai • Chrome",
    severity: "Critical",
    time: "Just now",
    color: "red",
  },
  {
    title: "Impossible Travel",
    user: "Amit Verma",
    location: "Singapore",
    severity: "High",
    time: "15 sec ago",
    color: "orange",
  },
  {
    title: "VPN Detected",
    user: "Priya Singh",
    location: "Delhi",
    severity: "Medium",
    time: "32 sec ago",
    color: "yellow",
  },
  {
    title: "Password Reset",
    user: "Neha",
    location: "Chennai",
    severity: "Safe",
    time: "1 min ago",
    color: "green",
  },
];

export default function AlertFeed() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % alerts.length);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <AnimatePresence mode="wait">
      <AlertItem key={index} {...alerts[index]} />
    </AnimatePresence>
  );
}
