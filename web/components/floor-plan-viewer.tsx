"use client";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, useGLTF, Environment } from "@react-three/drei";

// Floor Plan Model component
function FloorPlanModel({ url }: { url: string }) {
  const { scene } = useGLTF(url);
  return <primitive object={scene} scale={1} />;
}

// Component for a single device marker with conditional color and position
function DeviceMarker({
  device,
  estimatedPosition,
}: {
  device: { id: number; position: [number, number, number]; type: string };
  estimatedPosition: [number, number, number] | null;
}) {
  // If the device type is "Dev" and we have an estimated position, override the marker position.
  const markerPosition = device.type === "Dev" && estimatedPosition ? estimatedPosition : device.position;
  // Set color: for APs use red; for the Dev target, use magenta.
  const color = device.type === "Dev" ? "magenta" : "red";

  // Render a different geometry for the Dev target if desired.
  if (device.type === "Dev") {
    return (
      <mesh position={markerPosition}>
        <boxGeometry args={[1, 2, 1]} />
        <meshStandardMaterial color={color} />
      </mesh>
    );
  }
  return (
    <mesh position={markerPosition}>
      <sphereGeometry args={[0.2, 32, 32]} />
      <meshStandardMaterial color={color} />
    </mesh>
  );
}

// Component for mapping over multiple device markers.
function DeviceMarkers({
  devices,
  estimatedPosition,
}: {
  devices: Array<{ id: number; position: [number, number, number]; type: string }>;
  estimatedPosition: [number, number, number] | null;
}) {
  return (
    <>
      {devices.map((device) => (
        <DeviceMarker key={device.id} device={device} estimatedPosition={estimatedPosition} />
      ))}
    </>
  );
}

// Main Floor Plan Viewer component.
export default function FloorPlanViewer({
  floorPlan,
  devices,
  estimatedPosition,
}: {
  floorPlan: string;
  devices: Array<{ id: number; position: [number, number, number]; type: string }>;
  estimatedPosition: [number, number, number] | null;
}) {
  const modelUrl = "/johnatanassov.glb";
  return (
    <div className="w-full h-full">
      <Canvas camera={{ position: [5, 5, 5], fov: 50 }}>
        <ambientLight intensity={0.5} />
        <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} />
        <pointLight position={[-10, -10, -10]} />
        <FloorPlanModel url={modelUrl} />

        {/* Render device markers with the estimated position passed in */}
        <DeviceMarkers devices={devices} estimatedPosition={estimatedPosition} />

        <OrbitControls enableZoom enablePan enableRotate zoomSpeed={0.5} />
        <Environment preset="apartment" />
      </Canvas>
    </div>
  );
}
