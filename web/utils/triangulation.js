/**
 * Triangulate the target location using sensor readings and device positions.
 *
 * The sensorReadings payload should be an array of objects. Each object represents a sensor reading from an AP and must have:
 *  - id: (number) the identifier that corresponds to a device in the devices array.
 *  - signals: an array of signals. Each signal is an object with at least:
 *      • device: the target’s MAC address.
 *      • strength: the measured RSSI.
 *
 * The devices array is expected to have objects with:
 *  - id: (number) matches the sensor reading id.
 *  - macAddress: (string) the AP’s MAC (not used in triangulation).
 *  - type: (string) e.g., "AP".
 *  - position: an array [x, y, z]. For triangulation we use x (position[0]) and z (position[2]).
 *
 * @param {Array} sensorReadings - Sensor readings from the APs.
 * @param {string} targetMac - The MAC address of the target device.
 * @param {Array} devices - Array of device objects.
 * @param {number} [A=-40] - Reference RSSI (dBm) at 1 meter.
 * @param {number} [n=2] - Path-loss exponent.
 * @returns {Object|null} - The estimated target location as { x, y } (using x and z coordinates) or null if triangulation fails.
 */
export function triangulateLocation(sensorReadings, targetMac, devices, A = -40, n = 2) {
    const positions = [];
    // For each sensor reading, extract the target's signal and device position.
    sensorReadings.forEach(reading => {
      const targetSignal = reading.signals.find(signal => signal.device === targetMac);
      if (targetSignal) {
        // Match sensor reading to the corresponding device using id.
        const device = devices.find(dev => dev.id === reading.id);
        if (device && device.position && device.position.length >= 3) {
          // Use device.position[0] for x and device.position[2] for the y coordinate (assuming APs lie on an x–z plane).
          const xCoord = device.position[0];
          const yCoord = device.position[2];
          const distance = estimateDistance(targetSignal.strength, A, n);
          positions.push({ x: xCoord, y: yCoord, distance });
        }
      }
    });
  
    if (positions.length < 3) {
      console.error("Not enough data for triangulation. Need at least 3 sensor readings with the target signal.");
      return null;
    }
  
    // Use the first reading as the reference.
    const ref = positions[0];
    const A_matrix = [];
    const b_vector = [];
  
    // Build the system of equations for least squares.
    for (let i = 1; i < positions.length; i++) {
      const p = positions[i];
      const a1 = 2 * (p.x - ref.x);
      const a2 = 2 * (p.y - ref.y);
      const b_val =
        ref.distance ** 2 - p.distance ** 2 +
        p.x ** 2 - ref.x ** 2 +
        p.y ** 2 - ref.y ** 2;
      A_matrix.push([a1, a2]);
      b_vector.push(b_val);
    }
    return solveLeastSquares(A_matrix, b_vector);
  }
  
  /**
   * Estimate the distance based on the RSSI value using the log-distance path loss model.
   *
   * @param {number} rssi - Measured RSSI.
   * @param {number} A - Reference RSSI at 1 meter.
   * @param {number} n - Path-loss exponent.
   * @returns {number} The estimated distance.
   */
  function estimateDistance(rssi, A, n) {
    return Math.pow(10, (A - rssi) / (10 * n));
  }
  
  /**
   * Solves the over-determined linear system A * x = b using a least squares approach.
   *
   * @param {Array} A - 2D array representing the coefficients.
   * @param {Array} b - Array representing the constant terms.
   * @returns {Object|null} - The solution as { x, y } or null if the system cannot be solved.
   */
  function solveLeastSquares(A, b) {
    let sum_a11 = 0, sum_a12 = 0, sum_a22 = 0;
    let sum_a1b = 0, sum_a2b = 0;
    for (let i = 0; i < A.length; i++) {
      const a1 = A[i][0], a2 = A[i][1];
      sum_a11 += a1 * a1;
      sum_a12 += a1 * a2;
      sum_a22 += a2 * a2;
      sum_a1b += a1 * b[i];
      sum_a2b += a2 * b[i];
    }
    const det = sum_a11 * sum_a22 - sum_a12 * sum_a12;
    if (Math.abs(det) < 1e-6) {
      console.error("Determinant too close to zero, cannot solve the system.");
      return null;
    }
    const inv_a11 = sum_a22 / det;
    const inv_a12 = -sum_a12 / det;
    const inv_a22 = sum_a11 / det;
    const x = inv_a11 * sum_a1b + inv_a12 * sum_a2b;
    const y = inv_a12 * sum_a1b + inv_a22 * sum_a2b;
    return { x, y };
  }




// EXPORTS
// export default {
//     triangulateLocation,
// };
