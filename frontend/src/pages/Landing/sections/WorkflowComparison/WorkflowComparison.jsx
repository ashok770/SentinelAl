import WorkflowHeader from "./components/WorkflowHeader";
import WorkflowTimeline from "./components/WorkflowTimeline";

import { traditionalWorkflow, sentinelWorkflow } from "./data/workflowData";

function WorkflowComparison() {
  return (
    <section className="relative bg-[#050816] py-32">
      <div className="mx-auto max-w-7xl px-6">
        {/* Header */}
        <WorkflowHeader />

        {/* Two Workflows */}
        <div className="mt-20 grid grid-cols-1 gap-8 lg:grid-cols-2">
          <WorkflowTimeline
            title="Today's Investigation"
            subtitle="Security teams manually correlate evidence across multiple tools."
            steps={traditionalWorkflow}
            accentColor="slate"
          />

          <WorkflowTimeline
            title="SentinelAI Investigation"
            subtitle="AI correlates evidence and explains every security decision."
            steps={sentinelWorkflow}
            accentColor="cyan"
          />
        </div>
      </div>
    </section>
  );
}

export default WorkflowComparison;
