import { useFrame } from "@react-three/fiber";
import { useRef } from "react";

function DataPackets() {
  const packet = useRef();

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime() * 0.5;

    const radius = 2.18;

    packet.current.position.x = Math.cos(t) * radius;

    packet.current.position.z = Math.sin(t) * radius;

    packet.current.position.y = Math.sin(t * 2) * 0.25;

    packet.current.lookAt(
      Math.cos(t + 0.05) * radius,
      Math.sin((t + 0.05) * 2) * 0.25,
      Math.sin(t + 0.05) * radius,
    );
  });

  return (
    <group ref={packet}>
      <>
        {/* Packet Head */}
        <mesh>
          <sphereGeometry args={[0.055, 16, 16]} />

          <meshBasicMaterial color="#7dd3fc" />
        </mesh>

        {/* Tail */}
        <mesh position={[-0.12, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.008, 0.022, 0.22, 8]} />

          <meshBasicMaterial color="#7dd3fc" transparent opacity={0.7} />
        </mesh>
      </>
    </group>
  );
}

export default DataPackets;
