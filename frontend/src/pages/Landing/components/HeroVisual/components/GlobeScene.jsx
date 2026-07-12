import { useRef } from "react";
import { useFrame } from "@react-three/fiber";

function GlobeScene() {
  const globeRef = useRef();

  useFrame(() => {
    if (globeRef.current) {
      globeRef.current.rotation.y += 0.002;
    }
  });

  return (
    <group>
      {/* Earth */}
      <mesh ref={globeRef}>
        <sphereGeometry args={[1.8, 64, 64]} />

        <meshStandardMaterial
          color="#4F8CFF"
          emissive="#2563EB"
          emissiveIntensity={1.3}
          metalness={0.25}
          roughness={0.45}
        />
      </mesh>

      {/* Atmosphere */}
      <mesh scale={1.05}>
        <sphereGeometry args={[1.8, 64, 64]} />

        <meshBasicMaterial color="#60A5FA" transparent opacity={0.08} />
      </mesh>
    </group>
  );
}

export default GlobeScene;
