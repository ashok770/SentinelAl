import TimelineStep from "./TimelineStep";
import { investigationSteps } from "../data/investigationData";

import { LogIn, Laptop, Brain, GitBranch, ShieldAlert } from "lucide-react";

const icons = {
  login: <LogIn size={20} />,
  device: <Laptop size={20} />,
  behaviour: <Brain size={20} />,
  correlation: <GitBranch size={20} />,
  decision: <ShieldAlert size={20} />,
};

function InvestigationTimeline() {
  return (
    <div className="rounded-3xl border border-slate-800 bg-[#0A1022] p-8">
      {investigationSteps.map((step, index) => (
        <TimelineStep
          key={index}
          icon={icons[step.icon]}
          time={step.time}
          title={step.title}
          description={step.description}
          status={step.status}
          isLast={index === investigationSteps.length - 1}
        />
      ))}
    </div>
  );
}

export default InvestigationTimeline;
