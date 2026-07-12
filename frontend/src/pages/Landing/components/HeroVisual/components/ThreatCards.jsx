import ThreatCard from "./ThreatCard";

const cards = [
  {
    title: "Critical Users",
    value: 2,
    trend: "+1 Today",
    icon: "🛡",
    color: "text-red-300",
    bg: "bg-red-500/10 border border-red-500/20",
  },
  {
    title: "High Risk",
    value: 5,
    trend: "+2 Today",
    icon: "⚠",
    color: "text-orange-300",
    bg: "bg-orange-500/10 border border-orange-500/20",
  },
  {
    title: "Low Risk",
    value: 420,
    trend: "-18 Today",
    icon: "✓",
    color: "text-emerald-300",
    bg: "bg-emerald-500/10 border border-emerald-500/20",
  },
];

export default function ThreatCards() {
  return (
    <div className="space-y-3">
      {cards.map((card) => (
        <ThreatCard key={card.title} {...card} />
      ))}
    </div>
  );
}
