import HeroContent from "./HeroContent";
import HeroVisual from "./HeroVisual";

function Hero() {
  return (
    <section id="hero" className="relative min-h-screen bg-slate-950">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-8 pt-36">
        {/* Left Side */}
        <HeroContent />

        {/* Right Side */}
        <HeroVisual />
      </div>
    </section>
  );
}

export default Hero;
