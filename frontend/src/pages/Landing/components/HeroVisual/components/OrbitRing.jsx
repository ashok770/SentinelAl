import { useRef } from "react";
import { useFrame } from "@react-three/fiber";

function OrbitRing() {
  const ring = useRef();

  useFrame((_, delta) => {
    if (ring.current) {
      ring.current.rotation.y += delta * 0.25;
    }
  });

  return (
    <group ref={ring} rotation={[Math.PI / 4, 0, 0]}>
      <mesh>
        <torusGeometry args={[2.35, 0.01, 16, 200]} />

        <meshBasicMaterial color="#60A5FA" transparent opacity={0.45} />
      </mesh>
    </group>
  );
}

export default OrbitRing;
