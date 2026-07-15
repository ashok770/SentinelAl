import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import DashboardShowcase from "./sections/DashboardShowcase";
import InvestigationFlow from "./sections/InvestigationFlow/InvestigationFlow";
import WorkflowComparison from "./sections/WorkflowComparison/WorkflowComparison";
import OutcomeComparison from "./sections/OutcomeComparison/OutcomeComparison";
import EnterpriseIntegration from "./sections/EnterpriseIntegration/EnterpriseIntegration";
import EnterpriseOperations from "./sections/EnterpriseOperations/EnterpriseOperations";
import FAQ from "./sections/FAQ/FAQ";
function Landing() {
  return (
    <main className="min-h-screen bg-slate-950">
      <Navbar />
      <Hero />
      <DashboardShowcase />
      <InvestigationFlow />
      <WorkflowComparison />
      <OutcomeComparison />
      <EnterpriseIntegration />
      <EnterpriseOperations />
      <FAQ />
    </main>
  );
}

export default Landing;
