import { useMemo } from "react";

function NetworkNodes() {
  const nodes = useMemo(() => {
    return Array.from({ length: 18 }, () => {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);

      const radius = 2.02;

      return [
        radius * Math.sin(phi) * Math.cos(theta),
        radius * Math.cos(phi),
        radius * Math.sin(phi) * Math.sin(theta),
      ];
    });
  }, []);

  return (
    <>
      {nodes.map((position, index) => (
        <mesh key={index} position={position}>
          <sphereGeometry args={[0.025, 16, 16]} />

          <meshBasicMaterial color="#7DD3FC" />
        </mesh>
      ))}
    </>
  );
}

export default NetworkNodes;
