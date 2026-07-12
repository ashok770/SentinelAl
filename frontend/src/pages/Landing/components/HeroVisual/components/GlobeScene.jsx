import { useRef } from "react";
import { useFrame } from "@react-three/fiber";

function GlobeScene() {
  const globeRef = useRef();
  const atmosphereRef = useRef();

  useFrame(() => {
    if (globeRef.current) {
      globeRef.current.rotation.y += 0.0025;
    }

    if (atmosphereRef.current) {
      atmosphereRef.current.rotation.y += 0.0022;
    }
  });

  return (
    <group>
      {/* Earth */}
      <mesh ref={globeRef}>
        <sphereGeometry args={[1.8, 64, 64]} />

        <meshStandardMaterial
          color="#5EA2FF"
          emissive="#2563EB"
          emissiveIntensity={1.1}
          roughness={0.35}
          metalness={0.15}
        />
      </mesh>

      {/* Atmosphere */}
      <mesh ref={atmosphereRef} scale={1.08}>
        <sphereGeometry args={[1.8, 64, 64]} />

        <meshBasicMaterial
          color="#60A5FA"
          transparent
          opacity={0.12}
          side={2}
        />
      </mesh>
    </group>
  );
}

export default GlobeScene;
