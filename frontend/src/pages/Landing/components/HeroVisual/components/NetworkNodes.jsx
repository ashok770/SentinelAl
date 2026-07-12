import { useMemo } from "react";
import { globeNodes } from "../data/globeNodes";

function NetworkNodes() {
  const nodes = useMemo(() => globeNodes, []);

  return (
    <>
      {nodes.map((position, index) => {
        // Determine security severity color: 0 => critical, 1-2 => warning, else safe
        const severity = index % 6;
        const color =
          severity === 0 ? "#FB7185" : severity <= 2 ? "#F59E0B" : "#34D399";
        const size = 0.02 + (index % 4) * 0.006; // varied sizes for depth

        return (
          <mesh key={index} position={position}>
            <sphereGeometry args={[size, 12, 12]} />

            <meshStandardMaterial
              color={color}
              emissive={color}
              emissiveIntensity={0.18}
              roughness={0.6}
            />
          </mesh>
        );
      })}
    </>
  );
}

export default NetworkNodes;
