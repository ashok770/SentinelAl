function GlobeLights() {
  return (
    <>
      <ambientLight intensity={0.55} />

      <directionalLight position={[6, 4, 6]} intensity={2.5} />

      <pointLight position={[-5, -3, 3]} intensity={1.5} color="#3B82F6" />

      <pointLight position={[0, 5, -5]} intensity={0.8} color="#93C5FD" />
    </>
  );
}

export default GlobeLights;
