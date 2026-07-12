import DashboardHeader from "./components/DashboardHeader";
import DashboardStatus from "./components/DashboardStatus";
import ThreatCards from "./components/ThreatCards";
import AlertFeed from "./components/AlertFeed";
// import AIRiskGauge from "./components/AIRiskGauge";

function DashboardPreview() {
  return (
    <div className="w-72 rounded-3xl border border-slate-700/50 bg-slate-900/80 p-5 backdrop-blur-xl shadow-2xl">
      <DashboardHeader />

      <div className="space-y-4">
        <DashboardStatus />
        <ThreatCards />
        <AlertFeed />
        {/* <AIRiskGauge /> */}
      </div>
    </div>
  );
}

export default DashboardPreview;
