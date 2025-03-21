import { type NextRequest, NextResponse } from "next/server"
// import { triangulateLocation } from "@/utils/triangulation"

// const devices = [
//     { id: 1, macAddress: "00:1A:2B:3C:4D:5E", type: "AP", position: [1, -1, 2] },
//     { id: 2, macAddress: "00:5F:6E:7D:8C:9B", type: "AP", position: [6.5, -1, 8] },
//     { id: 4, macAddress: "AA:BB:CC:DD:EE:FF", type: "AP", position: [-8, -1, 8] },
//     { id: 3, macAddress: "AA:BB:CC:DD:EE:FF", type: "AP", position: [6.5, -1, -3] },
//     { id: 6, macAddress: "AB:CD:EF:12:34:56", type: "AP", position: [-8, -1, -3] },
// ];

// // Global variable to store the last valid estimated location.
// let lastEstimatedLocation = null;



import { triangulateLocation } from "@/utils/triangulation";

// Known AP devices with their positions.
const devices = [
  { id: 1, macAddress: "00:1A:2B:3C:4D:5E", type: "AP", position: [1, -1, 2] },
  { id: 2, macAddress: "00:5F:6E:7D:8C:9B", type: "AP", position: [6.5, -1, 8] },
  { id: 4, macAddress: "AA:BB:CC:DD:EE:FF", type: "AP", position: [-8, -1, 8] },
  { id: 3, macAddress: "AA:BB:CC:DD:EE:FF", type: "AP", position: [6.5, -1, -3] },
  { id: 6, macAddress: "AB:CD:EF:12:34:56", type: "AP", position: [-8, -1, -3] },
];

// Global object to store sensor readings
const nodeReadings = {};

export async function GET(request) {
  try {
    console.log("Received request for node readings");

    // Specify the target device MAC address (for example, "11:22:33:44:55:66").
    const targetMac = "11:22:33:44:55:66";
    const sensorData = nodeReadings[targetMac];

    if (!sensorData) {
      return new Response(
        JSON.stringify({ error: "No sensor data available for the target device" }),
        { status: 404, headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" } }
      );
    }

    // console.log the response

    // Run the triangulation algorithm using the sensor signals.
    const estimatedLocation = triangulateLocation(sensorData.signals, targetMac, devices);

    // Return both the raw sensor data and the computed estimated location.
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

// Global variable to store the last valid estimated location.
let lastEstimatedLocation = null;

export async function POST(request) {
    try {
        console.log("Received triangulation request");
        // Expecting a JSON payload with targetMac and sensorReadings.
        const { targetMac, sensorReadings } = await request.json();

        if (!targetMac || !sensorReadings) {
            console.error("Invalid payload: missing targetMac or sensorReadings");
            return new Response(
                JSON.stringify({ error: "Invalid payload: missing targetMac or sensorReadings" }),
                { status: 400, headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" } }
            );
        }

        // Compute estimated location from the sensor data.
        const estimatedLocation = triangulateLocation(sensorReadings, targetMac, devices);

        if (!estimatedLocation) {
            console.warn("Triangulation failed. Not enough valid sensor data.");
            // If triangulation fails but we have a previous valid location, return that.
            if (lastEstimatedLocation) {
                console.log("Returning last valid estimated location:", lastEstimatedLocation);
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
        // Save this as the last known valid estimate.
        lastEstimatedLocation = estimatedLocation;

        return new Response(
            JSON.stringify({ estimatedLocation }),
            { status: 200, headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" } }
        );
    } catch (error) {
        console.error("Error processing triangulation request:", error);
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
            "Access-Control-Allow-Methods": "POST, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type",
        },
    });
}
