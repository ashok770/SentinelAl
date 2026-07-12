import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";

function Globe() {
  return (
    <mesh>
      <sphereGeometry args={[1.8, 64, 64]} />
      <meshStandardMaterial
        color="#3b82f6"
        emissive="#1d4ed8"
        emissiveIntensity={1.2}
      />
    </mesh>
  );
}

function AnimatedGlobe() {
  return (
    <div className="h-[480px] w-[480px]">
      <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
        <ambientLight intensity={1.5} />

        <directionalLight position={[5, 5, 5]} intensity={2} />

        <Globe />

        <OrbitControls enableZoom={false} autoRotate autoRotateSpeed={0.4} />
      </Canvas>
    </div>
  );
}

export default AnimatedGlobe;
