"use client";

import { useState, useEffect } from "react";
import FloorPlanViewer from "@/components/floor-plan-viewer";
import DeviceList from "@/components/device-list";
import { Toaster, toast } from "sonner";

export default function Home() {
  // Hard-coded devices array with a "Good" device.
  const [devices] = useState([
    { id: 3, macAddress: "24:58:7C:E1:F7:9C", type: "AP", position: [4.7, -1, -2.5] },
    { id: 5, macAddress: "3C:84:27:CC:7A:8C", type: "AP", position: [4.7, -1, 3] },
    { id: 2, macAddress: "24:58:7C:E1:EE:70", type: "AP", position: [1, -1, 0.5] },
    { id: 1, macAddress: "24:58:7C:CE:33:A8", type: "AP", position: [1, -1, -2] },
    { id: 9, macAddress: "EC:64:C9:9E:E2:3A", type: "Good", position: [0, -0.5, 0] }
  ]);

  const [estimatedPosition, setEstimatedPosition] = useState<[number, number, number] | null>(null);
  const [currentFloor, setCurrentFloor] = useState("floor1");
  const [emergency, setEmergency] = useState(false);

  // Poll the API every 500ms to update the estimated location.
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch("/senddata", { method: "GET" });
        if (res.ok) {
          const data = await res.json();
          const { estimatedLocation } = data;
          if (estimatedLocation) {
            setEstimatedPosition([estimatedLocation.x, -0.5, estimatedLocation.y]);
          }
        }
      } catch (error) {
        console.error("Error fetching estimated position", error);
      }
    }, 500);
    return () => clearInterval(interval);
  }, []);

  // Poll the emergency status for the Good device every second.
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        // Use the Good device's MAC address in the query.
        const res = await fetch("/api/emergency-status?mac=EC:64:C9:9E:E2:3A");
        if (res.ok) {
          const data = await res.json();
          setEmergency(data.emergency);
        }
      } catch (error) {
        console.error("Error fetching emergency status", error);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Trigger a toast notification when emergency becomes active.
  useEffect(() => {
    if (emergency) {
      toast("Patient needs help");
    }
  }, [emergency]);

  return (
    <>
      <Toaster />
      <main className="flex h-screen">
        {/* Floor Plan Viewer takes up 75% of the width */}
        <div className="w-3/4 h-full relative">
          <FloorPlanViewer
            floorPlan={currentFloor}
            devices={devices}
            estimatedPosition={estimatedPosition}
            emergency={emergency}
          />
          <div className="absolute bottom-4 left-4 bg-white/80 p-2 rounded-md shadow-md">
            <button
              className="px-4 py-2 bg-blue-500 text-white rounded-md"
              onClick={() => setCurrentFloor("floor1")}
            >
              Floor 1
            </button>
          </div>
        </div>

        {/* Device List takes up 25% of the width */}
        <div className="w-1/4 h-full border-l border-gray-300">
          <DeviceList devices={devices} emergency={emergency} />
        </div>
      </main>
    </>
  );
}
