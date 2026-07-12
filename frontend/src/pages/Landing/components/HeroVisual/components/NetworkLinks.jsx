import { Line } from "@react-three/drei";
import { useMemo } from "react";
import * as THREE from "three";

function randomPoint(radius = 2.15) {
  const theta = Math.random() * Math.PI * 2;
  const phi = Math.acos(2 * Math.random() - 1);

  return new THREE.Vector3(
    radius * Math.sin(phi) * Math.cos(theta),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta),
  );
}

export default function NetworkLinks() {
  const links = useMemo(() => {
    return Array.from({ length: 18 }, () => [randomPoint(), randomPoint()]);
  }, []);

  return (
    <>
      {links.map(([a, b], index) => (
        <Line
          key={index}
          points={[a, b]}
          color="#60A5FA"
          transparent
          opacity={0.18}
          lineWidth={1}
        />
      ))}
    </>
  );
}
