type EmergencyStates = { [mac: string]: boolean };
let emergencyStates: EmergencyStates = {};

/**
 * Set the emergency state for a given device (by MAC address).
 */
export function setDeviceEmergencyState(mac: string, state: boolean) {
  emergencyStates[mac.toUpperCase()] = state;
}

/**
 * Get the emergency state for a given device (by MAC address).
 */
export function getDeviceEmergencyState(mac: string): boolean {
  return emergencyStates[mac.toUpperCase()] || false;
}

/**
 * (Optional) Get the emergency states for all devices.
 */
export function getAllEmergencyStates(): EmergencyStates {
  return emergencyStates;
}
