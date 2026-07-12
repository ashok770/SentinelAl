import { useMemo } from "react";
import { globeNodes } from "../data/globeNodes";

function NetworkNodes() {
  const nodes = useMemo(() => globeNodes, []);

  return (
    <>
      {globeNodes.map((position, index) => (
        <mesh key={index} position={position}>
          <sphereGeometry args={[0.025, 16, 16]} />

          <meshBasicMaterial color="#7DD3FC" />
        </mesh>
      ))}
    </>
  );
}

export default NetworkNodes;
