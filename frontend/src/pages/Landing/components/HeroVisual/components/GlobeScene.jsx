import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import OrbitRing from "./OrbitRing";
import NetworkNodes from "./NetworkNodes";
import NetworkLinks from "./NetworkLinks";
import DataPackets from "./DataPackets";
import RadarPulse from "./RadarPulse";

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
          color="#2F6FAF"
          emissive="#06283D"
          emissiveIntensity={0.22}
          roughness={0.72}
          metalness={0.03}
        />
      </mesh>

      <mesh>
        <sphereGeometry args={[1.82, 48, 48]} />

        <meshBasicMaterial
          color="#7dd3fc"
          wireframe
          transparent
          opacity={0.06}
        />
      </mesh>

      {/* Atmosphere */}
      <mesh ref={atmosphereRef}>
        <sphereGeometry args={[1.9, 64, 64]} />

        <meshStandardMaterial
          color="#60A5FA"
          transparent
          opacity={0.06}
          emissive="#2563EB"
          emissiveIntensity={0.9}
          side={THREE.BackSide}
        />
      </mesh>

      <OrbitRing />
      <RadarPulse />
      <NetworkNodes />
      <NetworkLinks />
      <DataPackets />
    </>
  );
}

export default GlobeScene;
