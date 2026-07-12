import { Canvas } from "@react-three/fiber";

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

        <GlobeScene />
      </Canvas>
    </div>
  );
}

export default AnimatedGlobe;
