import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import OrbitRing from "./OrbitRing";
import NetworkNodes from "./NetworkNodes";
import NetworkLinks from "./NetworkLinks";
import DataPackets from "./DataPackets";

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
    <>
      {/* Main Globe */}
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

      <mesh>
        <sphereGeometry args={[1.82, 64, 64]} />

        <meshBasicMaterial
          color="#7dd3fc"
          wireframe
          transparent
          opacity={0.08}
        />
      </mesh>

      {/* Atmosphere */}
      <mesh ref={atmosphereRef}>
        <sphereGeometry args={[1.9, 64, 64]} />

        <meshStandardMaterial
          color="#60A5FA"
          transparent
          opacity={0.08}
          emissive="#3b82f6"
          emissiveIntensity={2}
          side={THREE.BackSide}
        />
      </mesh>

      <OrbitRing />
      <NetworkNodes />
      <NetworkLinks />
      <DataPackets />
    </>
  );
}

export default GlobeScene;
