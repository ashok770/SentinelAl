import { useRef } from "react";
import { useFrame } from "@react-three/fiber";

function OrbitRing() {
  const ring = useRef();
  const inner = useRef();
  const outer = useRef();

  useFrame((state, delta) => {
    if (ring.current) {
      ring.current.rotation.y += delta * 0.18;
    }

    if (inner.current) {
      inner.current.rotation.z += delta * 0.45;
    }

    if (outer.current) {
      outer.current.rotation.x -= delta * 0.25;
    }
  });

  return (
    <group ref={ring} rotation={[Math.PI / 4, 0, 0]}>
      <mesh ref={inner}>
        <torusGeometry args={[2.18, 0.006, 16, 200]} />

        <meshBasicMaterial color="#60A5FA" transparent opacity={0.22} />
      </mesh>

      <mesh ref={outer} rotation={[Math.PI / 5.5, 0.15, 0]}>
        <torusGeometry args={[2.25, 0.0045, 16, 200]} />

        <meshBasicMaterial color="#7DD3FC" transparent opacity={0.12} />
      </mesh>

      <mesh rotation={[Math.PI / 4.6, -0.08, 0]}>
        <torusGeometry args={[2.32, 0.0035, 12, 200]} />

        <meshBasicMaterial color="#60A5FA" transparent opacity={0.08} />
      </mesh>
    </group>
  );
}

export default OrbitRing;
