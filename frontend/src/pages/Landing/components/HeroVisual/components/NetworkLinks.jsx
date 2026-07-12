import { Line } from "@react-three/drei";
import { globeConnections } from "../data/globeConnections";

export default function NetworkLinks() {
  return (
    <>
      {globeConnections.map(([a, b], index) => (
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
