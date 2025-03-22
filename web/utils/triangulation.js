
// const devices = [
//   { id: 3, macAddress: "24:58:7C:E1:F7:9C", type: "AP", position: [4.7, -1, -2.5] },
//   { id: 5, macAddress: "3C:84:27:CC:7A:8C", type: "AP", position: [4.7, -1, 3] },
//   { id: 2, macAddress: "24:58:7C:E1:EE:70", type: "AP", position: [1, -1, 0.5] },
//   { id: 1, macAddress: "24:58:7C:CE:33:A8", type: "AP", position: [1, -1, -2] },
// ];

const devices = [
  { id: 3, macAddress: "24:58:7C:E1:F7:9C", type: "AP", position: [4.7, -1, -2.5], rssiAt1m: -40 },
  { id: 4, macAddress: "3C:84:27:CB:0C:30", type: "AP", position: [3, -1, 2.4], rssiAt1m: -40 },
  // { id: 5, macAddress: "3C:84:27:CC:7A:8C", type: "AP", position: [4.7, -1, 3], rssiAt1m: -40 },
  { id: 2, macAddress: "24:58:7C:E1:EE:70", type: "AP", position: [1, -1, 0.5], rssiAt1m: -65 },
  { id: 1, macAddress: "24:58:7C:CE:33:A8", type: "AP", position: [1, -1, -2], rssiAt1m: -69 },
];

export function triangulateLocation(sensorReading, n = 3) {
  const positions = [];

  sensorReading.signals.forEach(signal => {
    if (signal.signal > 0 || signal.signal < -100) return;

    const device = devices.find(
      dev => dev.macAddress.toLowerCase() === signal.mac.toLowerCase()
    );
    if (device && device.position?.length >= 3) {
      const xCoord = device.position[0] + 2;
      const yCoord = device.position[2];

      const A = device.rssiAt1m ?? -70; 
      const distance = estimateDistance(signal.signal, A, n);

      if (distance < 0.1 || distance > 100) return;

      positions.push({ x: xCoord, y: yCoord, distance });
    }
  });

  if (positions.length < 3) {
    console.error("Not enough valid signals for triangulation.");
    return null;
  }

  const ref = positions[0];
  const A_matrix = [];
  const b_vector = [];

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

  const estimated = solveLeastSquares(A_matrix, b_vector);

  return estimated;
}


function estimateDistance(rssi, A, n) {
  return Math.pow(10, (A - rssi) / (10 * n));
}

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
