import { ShieldCheck, Activity, Users, Brain } from "lucide-react";

const insights = [
  {
    icon: ShieldCheck,
    title: "Threats Blocked",
    value: "98%",
    color: "text-green-400",
  },

  {
    icon: Users,
    title: "Active Users",
    value: "420",
    color: "text-cyan-400",
  },

  {
    icon: Brain,
    title: "AI Confidence",
    value: "98.7%",
    color: "text-blue-400",
  },

  {
    icon: Activity,
    title: "Behaviour Score",
    value: "94%",
    color: "text-orange-400",
  },
];

function AIInsights() {
  return (
    <div className="rounded-3xl border border-slate-800 bg-[#0A1022] p-6">
      <h3 className="text-xl font-semibold text-white mb-6">AI Insights</h3>

      <div className="space-y-5">
        {insights.map((item, index) => {
          const Icon = item.icon;

          return (
            <div key={index} className="flex justify-between items-center">
              <div className="flex items-center gap-4">
                <Icon className={item.color} />

                <span className="text-slate-300">{item.title}</span>
              </div>

              <span className="text-white font-bold">{item.value}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default AIInsights;
