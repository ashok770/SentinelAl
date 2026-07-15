import OutcomeHeader from "./components/OutcomeHeader";
import ComparisonTable from "./components/ComparisonTable";

function OutcomeComparison() {
  return (
    <section className="relative bg-[#050816] py-32">
      <div className="mx-auto max-w-7xl px-6">
        <OutcomeHeader />

        <ComparisonTable />
      </div>
    </section>
  );
}

export default OutcomeComparison;
