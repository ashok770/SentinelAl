import { useRef } from "react";
import { useFrame } from "@react-three/fiber";

function easeOutQuad(t) {
  return t * (2 - t);
}

export default function RadarPulse() {
  const ring = useRef();

  useFrame(({ clock }) => {
    const period = 4.0; // seconds between pulses
    const elapsed = clock.getElapsedTime();
    const phase = (elapsed % period) / period; // 0..1

    // scale 0.9 -> 2.2, fade out
    const s = 0.9 + easeOutQuad(phase) * 1.3;
    const opacity = Math.max(0, 0.45 * (1 - phase));

    if (ring.current) {
      ring.current.scale.set(s, s, s);
      ring.current.material.opacity = opacity;
    }
  });

  return (
    <group>
      <mesh ref={ring} rotation={[Math.PI / 4, 0, 0]}>
        <torusGeometry args={[2.18, 0.002, 8, 200]} />

        <meshBasicMaterial
          color="#7DD3FC"
          transparent
          opacity={0.1}
          toneMapped={false}
        />
      </mesh>
    </group>
  );
}
