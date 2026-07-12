import { Canvas } from "@react-three/fiber";
import { Stars } from "@react-three/drei";

import GlobeScene from "./components/GlobeScene";
import GlobeLights from "./components/GlobeLights";

function AnimatedGlobe() {
  return (
    <div className="h-[400px] w-[400px]">
      <Canvas
        camera={{
          position: [0, 0, 5],
          fov: 45,
        }}
      >
        <GlobeLights />
        <Stars
          radius={80}
          depth={40}
          count={4000}
          factor={4}
          saturation={0}
          fade
          speed={0.4}
        />

        <GlobeScene />
      </Canvas>
    </div>
  );
}

export default AnimatedGlobe;
