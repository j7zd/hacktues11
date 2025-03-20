"use client"
import { Canvas } from "@react-three/fiber"
import { OrbitControls, useGLTF, Environment } from "@react-three/drei"

// Floor Plan Model component
function FloorPlanModel({ url }: { url: string }) {
  const { scene } = useGLTF(url)

  return <primitive object={scene} scale={1} />
}

// Main Floor Plan Viewer component
export default function FloorPlanViewer({ floorPlan }: { floorPlan: string }) {
  const modelUrl = "/johnatanassov.glb"

  return (
    <div className="w-full h-full">
      <Canvas camera={{ position: [5, 5, 5], fov: 50 }}>
        <ambientLight intensity={0.5} />
        <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} />
        <pointLight position={[-10, -10, -10]} />

        <FloorPlanModel url={modelUrl} />

        {/* controls for zooming, panning, and rotating */}
        <OrbitControls enableZoom={true} enablePan={true} enableRotate={true} zoomSpeed={0.5} />

        {/* environment for better lighting */}
        <Environment preset="apartment" />
      </Canvas>
    </div>
  )
}

