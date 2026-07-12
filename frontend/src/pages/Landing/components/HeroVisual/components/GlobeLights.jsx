function GlobeLights() {
  return (
    <>
      <ambientLight intensity={0.45} />

      <directionalLight position={[6, 4, 6]} intensity={1.2} />

      <pointLight position={[-5, -3, 3]} intensity={0.9} color="#3B82F6" />

      <pointLight position={[0, 5, -5]} intensity={0.5} color="#93C5FD" />
    </>
  );
}

export default GlobeLights;
