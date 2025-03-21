"use client";

import { useState, useEffect } from "react";
import FloorPlanViewer from "@/components/floor-plan-viewer";
import DeviceList from "@/components/device-list";

export default function Home() {
  // Hard-coded devices array with a "Dev" device.
  const [devices] = useState([
    { id: 1, macAddress: "00:1A:2B:3C:4D:5E", type: "AP", position: [1, -1, 2] },
    { id: 2, macAddress: "00:5F:6E:7D:8C:9B", type: "AP", position: [6.5, -1, 8] },
    { id: 4, macAddress: "AA:BB:CC:DD:EE:FF", type: "AP", position: [-8, -1, 8] },
    { id: 3, macAddress: "AA:BB:CC:DD:EE:FF", type: "AP", position: [6.5, -1, -3] },
    { id: 6, macAddress: "AB:CD:EF:12:34:56", type: "AP", position: [-8, -1, -3] },
    { id: 5, macAddress: "11:22:33:44:55:66", type: "Dev", position: [0, -0.5, 0] } // This one will be updated
  ]);

  const [estimatedPosition, setEstimatedPosition] = useState<[number, number, number] | null>(null);
  const [currentFloor, setCurrentFloor] = useState("floor1");

  useEffect(() => {
    // Poll the API every 3 seconds.
    const interval = setInterval(async () => {
      try {
        // In a real scenario, you might send actual sensor data.
        // Here we send a dummy payload with the targetMac.
        const res = await fetch("/api/senddata", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            targetMac: "MACADRESS0000",
            // You could pass sensorReadings here if available.
            sensorReadings: []
          })
        });
        if (res.ok) {
          const data = await res.json();
          // Assume API returns { estimatedLocation: { x, y } } and convert that to a 3D position.
          // For example, we keep the y-axis (height) fixed at -0.5.
          const { estimatedLocation } = data;
          if (estimatedLocation) {
            setEstimatedPosition([estimatedLocation.x, -0.5, estimatedLocation.y]);
          }
        }
      } catch (error) {
        console.error("Error fetching estimated position", error);
      }
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <main className="flex h-screen">
      {/* Floor Plan Viewer takes up 75% of the width */}
      <div className="w-3/4 h-full relative">
        <FloorPlanViewer floorPlan={currentFloor} devices={devices} estimatedPosition={estimatedPosition} />
        <div className="absolute bottom-4 left-4 bg-white/80 p-2 rounded-md shadow-md">
          <button className="px-4 py-2 bg-blue-500 text-white rounded-md" onClick={() => setCurrentFloor("floor1")}>
            Floor 1
          </button>
        </div>
      </div>

      {/* Device List takes up 25% of the width */}
      <div className="w-1/4 h-full border-l border-gray-300">
        <DeviceList devices={devices} />
      </div>
    </main>
  );
}
