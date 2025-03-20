"use client"
import { Canvas } from "@react-three/fiber"
import { OrbitControls, useGLTF, Environment } from "@react-three/drei"

// Floor Plan Model component
function FloorPlanModel({ url }: { url: string }) {
  const { scene } = useGLTF(url)
  return <primitive object={scene} scale={1} />
}

// Component for a single device marker with conditional color
function DeviceMarker({ position, type }: { position: [number, number, number], type: string }) {
  const color = type === "Dev" ? "blue" : "red"
  // const size = type === "Dev" ? [0.2, 32, 32] : [0.2, 32, 32]
  // return (
  //   <mesh position={position}>
  //     <sphereGeometry args={size} />
  //     {/* <boxGeometry args={[0.2, 0.2, 0.2]} /> */}
  //     <meshStandardMaterial color={color} />
  //   </mesh>
  // )

  if (type === "Dev") {
    return (
      <mesh position={position}>
        <boxGeometry args={[1, 2, 1]} />
        <meshStandardMaterial color={color} />
      </mesh>
    )
  }
  return (
    <mesh position={position}>
      <sphereGeometry args={[0.2, 32, 32]} />
      <meshStandardMaterial color={color} />
    </mesh>
  )
}

// Component for mapping over multiple device markers
function DeviceMarkers({ devices }: { devices: Array<{ id: number; position: [number, number, number]; type: string }> }) {
  return (
    <>
      {devices.map((device) => (
        <DeviceMarker key={device.id} position={device.position} type={device.type} />
      ))}
    </>
  )
}

// Main Floor Plan Viewer component
export default function FloorPlanViewer({ floorPlan, devices }: { floorPlan: string; devices: Array<{ id: number; position: [number, number, number]; type: string }> }) {
  const modelUrl = "/johnatanassov.glb"

  return (
    <div className="w-full h-full">
      <Canvas camera={{ position: [5, 5, 5], fov: 50 }}>
        <ambientLight intensity={0.5} />
        <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} />
        <pointLight position={[-10, -10, -10]} />

        <FloorPlanModel url={modelUrl} />

        {/* Render device markers */}
        <DeviceMarkers devices={devices} />

        <OrbitControls enableZoom enablePan enableRotate zoomSpeed={0.5} />
        <Environment preset="apartment" />
      </Canvas>
    </div>
  )
}
