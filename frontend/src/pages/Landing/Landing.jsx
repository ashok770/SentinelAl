import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import DashboardShowcase from "./sections/DashboardShowcase";

function Landing() {
  return (
    <main className="min-h-screen bg-slate-950">
      <Navbar />
      <Hero />
      <DashboardShowcase />
    </main>
  );
}

export default Landing;
