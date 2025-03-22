import { type NextRequest, NextResponse } from "next/server";
import { triangulateLocation } from "@/utils/triangulation";

// Define the required AP MAC addresses (in uppercase) that must provide readings.
const requiredAPs = ["24:58:7C:E1:F7:9C", "3C:84:27:CC:7A:8C", "24:58:7C:E1:EE:70", "24:58:7C:CE:33:A8"];

// Global object to store sensor readings keyed by target MAC address.
const nodeReadings: { [key: string]: { targetMac: string; signals: { [apMac: string]: { mac: string; signal: number; timestamp: number } } } } = {};

// Global variable to store the last valid estimated location.
let lastEstimatedLocation: { x: number; y: number } | null = null;

export async function GET(request: NextRequest) {
  try {
    console.log("Received GET request for node readings");
    // For demonstration, we use a hard-coded target node MAC address.
    const targetMac = "EC:64:C9:9E:E2:3A";
    const sensorData = nodeReadings[targetMac];

    if (!sensorData) {
      return new Response(
        JSON.stringify({ error: "No sensor data available for the target device" }),
        { status: 404, headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" } }
      );
    }

    // Check if readings from all required APs are available.
    const availableAPs = Object.keys(sensorData.signals);
    const hasAll = requiredAPs.every(ap => availableAPs.includes(ap));
    if (!hasAll) {
      console.warn("Not all required AP readings available, skipping triangulation");
      if (lastEstimatedLocation) {
        return new Response(
          JSON.stringify({ estimatedLocation: lastEstimatedLocation }),
          { status: 200, headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" } }
        );
      } else {
        return new Response(
          JSON.stringify({ error: "Insufficient sensor data for triangulation." }),
          { status: 400, headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" } }
        );
      }
    }

    // Build a sensorReading object using the latest reading from each required AP.
    const sensorReading = {
      targetMac,
      signals: requiredAPs.map(ap => sensorData.signals[ap])
    };

    const estimatedLocation = triangulateLocation(sensorReading);
    if (!estimatedLocation) {
      console.warn("Triangulation failed. Not enough valid sensor data.");
      if (lastEstimatedLocation) {
        return new Response(
          JSON.stringify({ estimatedLocation: lastEstimatedLocation }),
          { status: 200, headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" } }
        );
      } else {
        return new Response(
          JSON.stringify({ error: "Triangulation failed. Insufficient or invalid data." }),
          { status: 400, headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" } }
        );
      }
    }

    lastEstimatedLocation = estimatedLocation;
    return new Response(
      JSON.stringify({ sensorData, estimatedLocation }),
      { status: 200, headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" } }
    );
  } catch (error) {
    console.error("Error processing GET request:", error);
    return new Response(
      JSON.stringify({ error: "Internal Server Error" }),
      { status: 500, headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" } }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log("Received POST request for node reading");
    const rawBody = await request.text();
    console.log("Raw request body:", rawBody);
    const { node_mac_address, signals } = JSON.parse(rawBody);

    if (!node_mac_address || !Array.isArray(signals) || signals.length === 0) {
      console.error("Invalid payload: missing or empty signals");
      return new Response(
        JSON.stringify({ error: "Invalid payload: missing or empty signals" }),
        { status: 400, headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" } }
      );
    }

    // Determine target device and the reporting AP.
    const targetMac = signals[0].mac.toUpperCase();
    const apMac = node_mac_address.toUpperCase();
    const timestamp = Date.now();
    const newSignal = { mac: apMac, signal: signals[0].signal, timestamp };

    // Initialize sensor readings object for the target if it doesn't exist.
    if (!nodeReadings[targetMac]) {
      nodeReadings[targetMac] = { targetMac, signals: {} };
    }
    // Update the latest reading for this AP.
    nodeReadings[targetMac].signals[apMac] = newSignal;
    console.log("Updated node readings:", JSON.stringify(nodeReadings, null, 2));

    // Check if readings from all required APs are available.
    const availableAPs = Object.keys(nodeReadings[targetMac].signals);
    const hasAll = requiredAPs.every(ap => availableAPs.includes(ap));
    if (!hasAll) {
      console.warn("Not all required AP readings available, skipping triangulation");
      if (lastEstimatedLocation) {
        return new Response(
          JSON.stringify({ estimatedLocation: lastEstimatedLocation }),
          { status: 200, headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" } }
        );
      } else {
        return new Response(
          JSON.stringify({ error: "Insufficient sensor data for triangulation." }),
          { status: 400, headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" } }
        );
      }
    }

    // Build a sensorReading object using the latest readings from the required APs.
    const sensorReading = {
      targetMac,
      signals: requiredAPs.map(ap => nodeReadings[targetMac].signals[ap])
    };

    const estimatedLocation = triangulateLocation(sensorReading);
    if (!estimatedLocation) {
      console.warn("Triangulation failed. Not enough valid sensor data.");
      if (lastEstimatedLocation) {
        return new Response(
          JSON.stringify({ estimatedLocation: lastEstimatedLocation }),
          { status: 200, headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" } }
        );
      } else {
        return new Response(
          JSON.stringify({ error: "Triangulation failed. Insufficient or invalid data." }),
          { status: 400, headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" } }
        );
      }
    }

    console.log("Estimated Location:", estimatedLocation);
    lastEstimatedLocation = estimatedLocation;

    return new Response(
      JSON.stringify({ estimatedLocation }),
      { status: 200, headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" } }
    );
  } catch (error) {
    console.error("Error processing POST request:", error);
    return new Response(
      JSON.stringify({ error: "Internal Server Error" }),
      { status: 500, headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" } }
    );
  }
}

export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}
