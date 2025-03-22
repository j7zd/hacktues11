import { NextResponse } from "next/server";
import { setDeviceEmergencyState } from "@/lib/emergencyState";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const mac = searchParams.get("mac");
  if (!mac) {
    return NextResponse.json({ error: "Missing mac address" }, { status: 400 });
  }
  setDeviceEmergencyState(mac, false);
  return NextResponse.json({ emergency: false, mac, message: "Emergency cleared" });
}

export async function POST(request: Request) {
  const { mac } = await request.json();
  if (!mac) {
    return NextResponse.json({ error: "Missing mac address" }, { status: 400 });
  }
  setDeviceEmergencyState(mac, false);
  return NextResponse.json({ emergency: false, mac, message: "Emergency cleared" });
}
