import FlowHeader from "./components/FlowHeader";
import InvestigationTimeline from "./components/InvestigationTimeline";
import DecisionCard from "./components/DecisionCard";

function InvestigationFlow() {
  return (
    <section id="how-it-works" className="relative bg-[#050816] py-32">
      <div className="max-w-7xl mx-auto px-6">
        <FlowHeader />

        <div className="mt-20 grid grid-cols-12 gap-8">
          <div className="col-span-6">
            <InvestigationTimeline />
          </div>

          <div className="col-span-6">
            <DecisionCard />
          </div>
        </div>
      </div>
    </section>
  );
}

export default InvestigationFlow;
