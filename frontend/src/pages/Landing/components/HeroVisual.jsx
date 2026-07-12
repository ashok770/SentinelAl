import AnimatedGlobe from "./HeroVisual/AnimatedGlobe";
import DashboardPreview from "./HeroVisual/DashboardPreview";

function HeroVisual() {
  return (
    <div className="h-[400px] w-[400px]">
      <AnimatedGlobe />

      <div className="absolute right-4 top-1/2 -translate-y-1/2">
        <DashboardPreview />
      </div>
    </div>
  );
}

export default HeroVisual;
