function GlobeLights() {
  return (
    <>
      {/* Ambient */}
      <ambientLight intensity={0.8} />

      {/* Main Sun Light */}
      <directionalLight position={[5, 3, 5]} intensity={2} />

      {/* Blue Fill Light */}
      <pointLight position={[-3, -2, 4]} intensity={1.5} color="#60A5FA" />
    </>
  );
}

export default GlobeLights;
