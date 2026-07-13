import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import DashboardShowcase from "./sections/DashboardShowcase";
import InvestigationFlow from "./sections/InvestigationFlow/InvestigationFlow";

function Landing() {
  return (
    <main className="min-h-screen bg-slate-950">
      <Navbar />
      <Hero />
      <DashboardShowcase />
      <InvestigationFlow />
    </main>
  );
}

export default Landing;
