import { type NextRequest, NextResponse } from "next/server"
import { triangulateLocation } from "@/utils/triangulation"

const devices = [
    { id: 1, macAddress: "00:1A:2B:3C:4D:5E", type: "AP", position: [1, -1, 2] },
    { id: 2, macAddress: "00:5F:6E:7D:8C:9B", type: "AP", position: [6.5, -1, 8] },
    { id: 4, macAddress: "AA:BB:CC:DD:EE:FF", type: "AP", position: [-8, -1, 8] },
    { id: 3, macAddress: "AA:BB:CC:DD:EE:FF", type: "AP", position: [6.5, -1, -3] },
    { id: 6, macAddress: "AB:CD:EF:12:34:56", type: "AP", position: [-8, -1, -3] },
];
export async function POST(request) {
    try {

        console.log("Received triangulation request");
        // Expecting a JSON payload with targetMac and sensorReadings.
        const { targetMac, sensorReadings } = await request.json();

        if (!targetMac || !sensorReadings) {
            console.error("Invalid payload: missing targetMac or sensorReadings");
            // Return a 400 Bad Request response if the payload is invalid.
            return new Response(
                JSON.stringify({ error: "Invalid payload: missing targetMac or sensorReadings" }),
                { status: 400, headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" } }
            );
        }

        // Call the triangulation utility function.
        const estimatedLocation = triangulateLocation(sensorReadings, targetMac, devices);

        if (!estimatedLocation) {
            return new Response(
                JSON.stringify({ error: "Triangulation failed. Insufficient or invalid data." }),
                { status: 400, headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" } }
            );
        }

        console.log("Estimated Location:", estimatedLocation);

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