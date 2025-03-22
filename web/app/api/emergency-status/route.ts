import { NextResponse } from "next/server";
import { getDeviceEmergencyState, getAllEmergencyStates } from "@/lib/emergencyState";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const mac = searchParams.get("mac");
  if (mac) {
    const emergency = getDeviceEmergencyState(mac);
    return NextResponse.json({ mac, emergency });
  }
  // If no mac provided, return all states.
  return NextResponse.json({ emergencyStates: getAllEmergencyStates() });
}
