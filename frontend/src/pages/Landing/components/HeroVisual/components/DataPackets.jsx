import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";

import { globeConnections } from "../data/globeConnections";

export default function DataPackets() {
  const packet = useRef();

  useFrame(({ clock }) => {
    if (!packet.current) return;

    const [start, end] = globeConnections[0];

    const t = (clock.getElapsedTime() * 0.35) % 1;

    packet.current.position.lerpVectors(start, end, t);
  });

  return (
    <mesh ref={packet}>
      <sphereGeometry args={[0.035, 16, 16]} />

      <meshBasicMaterial color="#38bdf8" toneMapped={false} />
    </mesh>
  );
}
