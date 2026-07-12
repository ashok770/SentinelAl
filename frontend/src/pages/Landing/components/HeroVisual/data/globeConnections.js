import { globeNodes } from "./globeNodes";

export const globeConnections = [];

globeNodes.forEach((node, index) => {
  const nearest = globeNodes
    .map((other, otherIndex) => ({
      index: otherIndex,
      distance: node.distanceTo(other),
    }))
    .filter((item) => item.index !== index)
    .sort((a, b) => a.distance - b.distance);

  for (let i = 0; i < 2; i++) {
    globeConnections.push([node, globeNodes[nearest[i].index]]);
  }
});
