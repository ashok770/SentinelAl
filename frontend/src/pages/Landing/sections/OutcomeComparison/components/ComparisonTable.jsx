import MetricRow from "./MetricRow";
import { comparisonMetrics } from "../data/outcomeData";

function ComparisonTable() {
  return (
    <div className="mt-20 rounded-3xl border border-slate-800 bg-[#0A1022] p-10">
      <div className="mb-12 text-center">
        <h3 className="text-3xl font-semibold text-white">
          The Difference You'll Feel Every Day
        </h3>

        <p className="mt-3 text-slate-400">
          Compare the investigation experience before and after adopting
          SentinelAI.
        </p>
      </div>

      <div>
        {comparisonMetrics.map((metric, index) => (
          <MetricRow
            key={index}
            label={metric.label}
            traditional={metric.traditional}
            sentinel={metric.sentinel}
          />
        ))}
      </div>
    </div>
  );
}

export default ComparisonTable;
