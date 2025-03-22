"use client";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, useGLTF } from "@react-three/drei";

// Floor Plan Model component.
function FloorPlanModel({ url }: { url: string }) {
  const { scene } = useGLTF(url);
  return <primitive object={scene} scale={1} />;
}

// Component for a single device marker with conditional styling.
function DeviceMarker({
  device,
  estimatedPosition,
  emergency,
}: {
  device: { id: number; position: [number, number, number]; type: string };
  estimatedPosition: [number, number, number] | null;
  emergency: boolean;
}) {
  // For a "Good" device, if we have an estimated position, override the marker position.
  const markerPosition =
    device.type === "Good" && estimatedPosition ? estimatedPosition : device.position;
  
  if (device.type === "Good") {
    // Green when normal, red when in emergency.
    const color = emergency ? "red" : "green";
    return (
      <mesh position={markerPosition}>
        <boxGeometry args={[1, 2, 1]} />
        <meshStandardMaterial color={color} />
      </mesh>
    );
  }

  // Render AP devices as spheres with red color.
  return (
    <mesh position={markerPosition}>
      <sphereGeometry args={[0.2, 32, 32]} />
      <meshStandardMaterial color="red" />
    </mesh>
  );
}

// Component for mapping over multiple device markers.
function DeviceMarkers({
  devices,
  estimatedPosition,
  emergency,
}: {
  devices: Array<{ id: number; position: [number, number, number]; type: string }>;
  estimatedPosition: [number, number, number] | null;
  emergency: boolean;
}) {
  return (
    <>
      {devices.map((device) => (
        <DeviceMarker
          key={device.id}
          device={device}
          estimatedPosition={estimatedPosition}
          emergency={emergency}
        />
      ))}
    </>
  );
}

// Main Floor Plan Viewer component.
export default function FloorPlanViewer({
  floorPlan,
  devices,
  estimatedPosition,
  emergency,
}: {
  floorPlan: string;
  devices: Array<{ id: number; position: [number, number, number]; type: string }>;
  estimatedPosition: [number, number, number] | null;
  emergency: boolean;
}) {
  const modelUrl = "/lotconsult.glb";
  return (
    <div className="w-full h-full">
      <Canvas camera={{ position: [5, 5, 5], fov: 50 }}>
        <ambientLight intensity={0.5} />
        <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} />
        <pointLight position={[-10, -10, -10]} />
        <FloorPlanModel url={modelUrl} />

        {/* Render device markers with the estimated position and emergency status */}
        <DeviceMarkers
          devices={devices}
          estimatedPosition={estimatedPosition}
          emergency={emergency}
        />

        <OrbitControls enableZoom enablePan enableRotate zoomSpeed={0.5} />
      </Canvas>
    </div>
  );
}
