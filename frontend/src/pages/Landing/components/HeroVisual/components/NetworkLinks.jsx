import { Line } from "@react-three/drei";
import { globeNodes } from "../data/globeNodes";

export default function NetworkLinks() {
  const connections = [];

  globeNodes.forEach((node, index) => {
    const distances = globeNodes
      .map((other, otherIndex) => ({
        index: otherIndex,
        distance: node.distanceTo(other),
      }))
      .filter((item) => item.index !== index)
      .sort((a, b) => a.distance - b.distance);

    // Connect to the nearest two nodes
    for (let i = 0; i < 2; i++) {
      connections.push([node, globeNodes[distances[i].index]]);
    }
  });

  return (
    <>
      {connections.map(([a, b], index) => (
        <Line
          key={index}
          points={[a, b]}
          color="#60A5FA"
          transparent
          opacity={0.15}
          lineWidth={1}
        />
      ))}
    </>
  );
}
