// ----- Simulation Parameters -----
const A = -40;      // Reference RSSI (dBm) at 1 meter
const n = 2;        // Path-loss exponent (typical indoor value)

// ----- Define ESP Board Positions on a Grid -----
const espBoards = [
  { node_id: 1, x: 0,  y: 0  },
  { node_id: 2, x: 0,  y: 10 },
  { node_id: 3, x: 10, y: 0  },
  { node_id: 4, x: 10, y: 10 }
];

// ----- Ground Truth for the Target Device -----
const targetDevice = { mac: "MACADRESS0000", x: 5, y: 5 };

// ----- Helper Functions -----
// Calculate Euclidean distance between two points.
function distance(x1, y1, x2, y2) {
  return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
}

// formula: rssi = A - 10 * n * log10(d)
function computeRSSI(d) {
  // Ensure a minimum distance of 1 meter to avoid math issues.
  d = Math.max(d, 1);
  return A - 10 * n * Math.log10(d);
}

function estimateDistance(rssi) {
  return Math.pow(10, (A - rssi) / (10 * n));
}

// ----- Simulate ESP Data -----
function simulateESPData() {
  const data = [];
  for (const board of espBoards) {
    const d = distance(board.x, board.y, targetDevice.x, targetDevice.y);
    // Add random noise (±~2.5 dBm)
    const noise = (Math.random() - 0.5) * 5;
    const rssi = computeRSSI(d) + noise;
    const boardData = {
      node_id: board.node_id,
      signals: [
        { device: targetDevice.mac, strength: rssi },
        { device: "OTHER_DEVICE_1", strength: -80 + Math.random() * 10 },
        { device: "OTHER_DEVICE_2", strength: -70 + Math.random() * 10 }
      ]
    };
    data.push(boardData);
  }
  return data;
}

// ----- Triangulation using Least Squares -----
function triangulateLocation(espData, targetMac) {
  const positions = [];
  for (const boardData of espData) {
    const reading = boardData.signals.find(signal => signal.device === targetMac);
    if (reading) {
      const board = espBoards.find(b => b.node_id === boardData.node_id);
      if (board) {
        const estDistance = estimateDistance(reading.strength);
        positions.push({ x: board.x, y: board.y, distance: estDistance });
      }
    }
  }
  
  if (positions.length < 3) {
    console.error("Not enough data for triangulation. Need at least 3 ESP boards.");
    return null;
  }
  
  const ref = positions[0];
  const A_matrix = [];
  const b_vector = [];
  
  for (let i = 1; i < positions.length; i++) {
    const p = positions[i];
    // Derived linear equation:
    // 2*(p.x - ref.x)*x + 2*(p.y - ref.y)*y = ref.distance² - p.distance² + p.x² - ref.x² + p.y² - ref.y²
    const a1 = 2 * (p.x - ref.x);
    const a2 = 2 * (p.y - ref.y);
    const b_val = (ref.distance ** 2 - p.distance ** 2) + (p.x ** 2 - ref.x ** 2) + (p.y ** 2 - ref.y ** 2);
    A_matrix.push([a1, a2]);
    b_vector.push(b_val);
  }
  
  return solveLeastSquares(A_matrix, b_vector);
}

// Solve for x in the least squares sense given A * x = b, where A is an m x 2 matrix.
// This uses the normal equations: x = inv(A^T A) * A^T * b.
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
    console.error("Determinant is too close to zero, cannot solve the system.");
    return null;
  }
  
  const inv_a11 = sum_a22 / det;
  const inv_a12 = -sum_a12 / det;
  const inv_a22 = sum_a11 / det;
  
  const x = inv_a11 * sum_a1b + inv_a12 * sum_a2b;
  const y = inv_a12 * sum_a1b + inv_a22 * sum_a2b;
  
  return { x: x, y: y };
}

// ----- Main Simulation and Triangulation Process -----
const simulatedData = simulateESPData();
console.log("Simulated ESP Data:", simulatedData);

const estimatedPosition = triangulateLocation(simulatedData, targetDevice.mac);
console.log("Estimated position for device", targetDevice.mac, ":", estimatedPosition);
