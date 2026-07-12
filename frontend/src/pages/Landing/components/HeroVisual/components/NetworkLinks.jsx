import { Line } from "@react-three/drei";
import { globeConnections } from "../data/globeConnections";

export default function NetworkLinks() {
  return (
    <>
      {globeConnections.map(([a, b], index) => {
        const dist = a.distanceTo(b);
        // shorter connections are stronger/brighter
        const opacity = Math.max(
          0.08,
          Math.min(0.5, 0.5 - (dist - 0.6) * 0.12),
        );
        const width = dist < 0.6 ? 2 : dist < 1.6 ? 1.4 : 1;

        return (
          <Line
            key={index}
            points={[a, b]}
            color="#60A5FA"
            transparent
            opacity={opacity}
            lineWidth={width}
          />
        );
      })}
    </>
  );
}
