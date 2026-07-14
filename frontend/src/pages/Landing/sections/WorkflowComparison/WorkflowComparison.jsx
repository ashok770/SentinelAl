import WorkflowHeader from "./components/WorkflowHeader";
import WorkflowColumn from "./components/WorkflowColumn";

import { traditionalWorkflow, sentinelWorkflow } from "./data/workflowData";

function WorkflowComparison() {
  return (
    <section className="bg-[#050816] py-32">
      <div className="mx-auto max-w-7xl px-6">
        <WorkflowHeader />

        <div className="grid grid-cols-2 gap-8">
          <WorkflowColumn
            title="Traditional Investigation"
            subtitle="Manual investigation across multiple tools."
            steps={traditionalWorkflow}
            accent="gray"
          />

          <WorkflowColumn
            title="SentinelAI Investigation"
            subtitle="AI-assisted investigation from alert to action."
            steps={sentinelWorkflow}
            accent="cyan"
          />
        </div>
      </div>
    </section>
  );
}

export default WorkflowComparison;
