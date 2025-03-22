# 🛡️ SAFE – Smart Alert For Fall Emergencies

SAFE is a smart, wearable safety and monitoring device designed to detect falls and alert caregivers with speed and precision. It combines fall detection, indoor localization, and optional health monitoring into a single integrated system.

## What It Does

SAFE uses a combination of an Accelerometer & Gyroscope
to detect sudden movements and jolts that may indicate a fall. It provides a simple user interface to confirm or cancel alerts.

In addition, SAFE can be extended with **custom sensors** (e.g., heart rate, SpO₂, etc.) tailored to the patient's health monitoring needs.

## Indoor Localization

One of the key features of SAFE is its ability to **localize the user indoors**. Using a mesh of ESP32 microcontrollers positioned around a facility, the device measures the signal strength (RSSI) from nearby nodes to estimate its position.

This **trilateration-based positioning** allows SAFE to approximate the user’s location, so staff can be dispatched quickly to the right room or area in case of an emergency.

## How It Helps

- Real-time fall detection with customizable sensitivity
- Simple touch interface for confirming or canceling alerts
- Modular design for adding health monitoring sensors
- Indoor positioning for rapid emergency response

## 🛠️ Status

✅ Fall detection  
✅ Touchscreen UI  
✅ Indoor localization   
🚧 Health monitoring extensions (optional)

