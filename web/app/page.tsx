"use client"

import { useState } from "react"
import FloorPlanViewer from "@/components/floor-plan-viewer"
import DeviceList from "@/components/device-list"

export default function Home() {
  // Sample device data with hard-coded positions
  const devices = [
    { id: 1, macAddress: "00:1A:2B:3C:4D:5E", type: "AP", position: [1, -1, 2] },
    { id: 2, macAddress: "00:5F:6E:7D:8C:9B", type: "AP", position: [-4, -1, -1] },
    { id: 3, macAddress: "AA:BB:CC:DD:EE:FF", type: "AP", position: [7, -1, 1] },
    { id: 4, macAddress: "AA:BB:CC:DD:EE:FF", type: "AP", position: [-7, -1, 6] },

    { id: 5, macAddress: "11:22:33:44:55:66", type: "Dev", position: [0, -0.5, 0] },
    { id: 6, macAddress: "AB:CD:EF:12:34:56", type: "AP", position: [7, -1, 5] },
  ]

  const [currentFloor, setCurrentFloor] = useState("floor1")

  return (
    <main className="flex h-screen">
      {/* 3D Floor Plan Viewer - takes up 75% of the width */}
      <div className="w-3/4 h-full relative">
        <FloorPlanViewer floorPlan={currentFloor} devices={devices} />
        <div className="absolute bottom-4 left-4 bg-white/80 p-2 rounded-md shadow-md">
          <button className="px-4 py-2 bg-blue-500 text-white rounded-md" onClick={() => setCurrentFloor("floor1")}>
            Floor 1
          </button>
        </div>
      </div>

      {/* Device List - takes up 25% of the width */}
      <div className="w-1/4 h-full border-l border-gray-300">
        <DeviceList devices={devices} />
      </div>
    </main>
  )
}
