"use client"

import { useState } from "react"

interface Device {
  id: number
  macAddress: string
  type: "AP" | "Dev"
}

interface DeviceListProps {
  devices: Device[]
}

export default function DeviceList({ devices }: DeviceListProps) {
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
                <span className={`font-mono ${device.type === "Dev" ? "text-blue-600" : "text-gray-600"}`}>
                  {device.macAddress}
                </span>
                <span
                  className={`px-2 py-1 rounded-full text-xs ${
                    device.type === "Dev" ? "bg-blue-100 text-blue-800" : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {device.type}
                </span>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

