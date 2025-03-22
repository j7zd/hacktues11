"use client"

import { useState } from "react"

interface Device {
  id: number
  macAddress: string
  type: "AP" | "Good"
}

interface DeviceListProps {
  devices: Device[]
  emergency: boolean
}

export default function DeviceList({ devices, emergency }: DeviceListProps) {
  const [selectedDevice, setSelectedDevice] = useState<number | null>(null)

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-gray-300">
        <h2 className="text-xl font-bold">Devices</h2>
      </div>

      <div className="flex-1 overflow-y-auto">
        <ul className="divide-y divide-gray-200">
          {devices.map((device) => (
            <li
              key={device.id}
              className={`p-4 cursor-pointer hover:bg-gray-50 ${selectedDevice === device.id ? "bg-gray-100" : ""}`}
              onClick={() => setSelectedDevice(device.id)}
            >
              <div className="flex items-center justify-between">
                <span className={`font-mono ${
                  device.type === "Good"
                    ? emergency
                      ? "text-red-600"
                      : "text-green-600"
                    : "text-gray-600"
                }`}>
                  {device.macAddress}
                </span>
                <span
                  className={`px-2 py-1 rounded-full text-xs ${
                    device.type === "Good"
                      ? emergency
                        ? "bg-red-100 text-red-800"
                        : "bg-green-100 text-green-800"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {device.type === "Good" && emergency ? "Needs Help" : device.type}
                </span>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
