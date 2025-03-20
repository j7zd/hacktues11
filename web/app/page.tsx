"use client"

import { useState } from "react"
import FloorPlanViewer from "@/components/floor-plan-viewer"
import DeviceList from "@/components/device-list"

export default function Home() {
  // Sample device data
  const devices = [
    { id: 1, macAddress: "00:1A:2B:3C:4D:5E", type: "AP" },
    { id: 2, macAddress: "00:5F:6E:7D:8C:9B", type: "AP" },
    { id: 3, macAddress: "AA:BB:CC:DD:EE:FF", type: "AP" },
    { id: 4, macAddress: "11:22:33:44:55:66", type: "Dev" },
    { id: 5, macAddress: "AB:CD:EF:12:34:56", type: "AP" },
  ]

  const [currentFloor, setCurrentFloor] = useState("floor1")

  return (
    <main className="flex h-screen">
      {/* 3D Floor Plan Viewer - takes up 75% of the width */}
      <div className="w-3/4 h-full relative">
        <FloorPlanViewer floorPlan={currentFloor} />
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

