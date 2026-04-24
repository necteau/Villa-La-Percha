/**
 * Map calibration helpers for the Providenciales reference image.
 *
 * We fit an affine transform between GPS space and image-pixel space using
 * the confirmed anchor points from the marked screenshot. This is a better fit
 * than the earlier corner-based bilinear placeholder because the 4 anchors are
 * real POIs, not perfect image corners.
 */

export type MapAnchor = {
  id: string;
  name: string;
  /** GPS latitude */
  lat: number;
  /** GPS longitude */
  lon: number;
  /** Pixel x on source image (from top-left) */
  px: number;
  /** Pixel y on source image (from top-left) */
  py: number;
  /** Optional provenance */
  source?: string;
};

/** Source image dimensions for /images/providenciales-map-reference.jpg */
export const MAP_IMAGE = { width: 1280, height: 764 };

type AffineCoefficients = {
  x: [number, number, number];
  y: [number, number, number];
};

function solve3x3(matrix: number[][], values: number[]): [number, number, number] | null {
  const m = matrix.map((row, i) => [...row, values[i]]);

  for (let col = 0; col < 3; col++) {
    let pivot = col;
    for (let row = col + 1; row < 3; row++) {
      if (Math.abs(m[row][col]) > Math.abs(m[pivot][col])) pivot = row;
    }

    if (Math.abs(m[pivot][col]) < 1e-12) return null;
    if (pivot !== col) [m[col], m[pivot]] = [m[pivot], m[col]];

    const pivotVal = m[col][col];
    for (let j = col; j < 4; j++) m[col][j] /= pivotVal;

    for (let row = 0; row < 3; row++) {
      if (row === col) continue;
      const factor = m[row][col];
      for (let j = col; j < 4; j++) m[row][j] -= factor * m[col][j];
    }
  }

  return [m[0][3], m[1][3], m[2][3]];
}

function fitAffine(anchors: MapAnchor[]): AffineCoefficients | null {
  if (anchors.length < 3) return null;

  // Least-squares fit for:
  // px = a*lon + b*lat + c
  // py = d*lon + e*lat + f
  let sLonLon = 0;
  let sLonLat = 0;
  let sLon = 0;
  let sLatLat = 0;
  let sLat = 0;
  const n = anchors.length;

  let sPxLon = 0;
  let sPxLat = 0;
  let sPx = 0;
  let sPyLon = 0;
  let sPyLat = 0;
  let sPy = 0;

  for (const anchor of anchors) {
    sLonLon += anchor.lon * anchor.lon;
    sLonLat += anchor.lon * anchor.lat;
    sLon += anchor.lon;
    sLatLat += anchor.lat * anchor.lat;
    sLat += anchor.lat;

    sPxLon += anchor.px * anchor.lon;
    sPxLat += anchor.px * anchor.lat;
    sPx += anchor.px;
    sPyLon += anchor.py * anchor.lon;
    sPyLat += anchor.py * anchor.lat;
    sPy += anchor.py;
  }

  const normal = [
    [sLonLon, sLonLat, sLon],
    [sLonLat, sLatLat, sLat],
    [sLon, sLat, n],
  ];

  const x = solve3x3(normal, [sPxLon, sPxLat, sPx]);
  const y = solve3x3(normal, [sPyLon, sPyLat, sPy]);
  if (!x || !y) return null;

  return { x, y };
}

function getCalibration(anchors: MapAnchor[]) {
  const coeffs = fitAffine(anchors);
  if (!coeffs) return null;

  const [[axLon, axLat, axC], [ayLon, ayLat, ayC]] = [coeffs.x, coeffs.y];
  const det = axLon * ayLat - axLat * ayLon;
  if (Math.abs(det) < 1e-12) return null;

  return {
    coeffs,
    inverse: {
      det,
      axLon,
      axLat,
      axC,
      ayLon,
      ayLat,
      ayC,
    },
  };
}

function clampPercent(value: number): number {
  return Math.max(0, Math.min(100, value));
}

export function gpsToSvg(lat: number, lon: number, anchors: MapAnchor[]): { x: number; y: number } | null {
  const calibration = getCalibration(anchors);
  if (!calibration) return null;

  const [axLon, axLat, axC] = calibration.coeffs.x;
  const [ayLon, ayLat, ayC] = calibration.coeffs.y;

  const pixelX = axLon * lon + axLat * lat + axC;
  const pixelY = ayLon * lon + ayLat * lat + ayC;

  return {
    x: clampPercent((pixelX / MAP_IMAGE.width) * 100),
    y: clampPercent((pixelY / MAP_IMAGE.height) * 100),
  };
}

export function svgToGps(svgX: number, svgY: number, anchors: MapAnchor[]): { lat: number; lon: number } | null {
  const calibration = getCalibration(anchors);
  if (!calibration) return null;

  const pixelX = (svgX / 100) * MAP_IMAGE.width;
  const pixelY = (svgY / 100) * MAP_IMAGE.height;

  const { det, axLon, axLat, axC, ayLon, ayLat, ayC } = calibration.inverse;
  const adjX = pixelX - axC;
  const adjY = pixelY - ayC;

  const lon = (adjX * ayLat - axLat * adjY) / det;
  const lat = (axLon * adjY - adjX * ayLon) / det;

  return { lat, lon };
}

// Confirmed via screenshot with colored arrows on Providenciales map.
// Image: 1280×764 px.
// Source: Google Maps GPS coordinates + pixel positions from marked screenshot.
export const provMapAnchors: MapAnchor[] = [
  {
    id: "nw-point",
    name: "NW Point Marine Park",
    lat: 21.86319,
    lon: -72.33275,
    px: 135,
    py: 16,
    source: "Google Maps GPS + marked screenshot",
  },
  {
    id: "da-conch-shack",
    name: "Da Conch Shack",
    lat: 21.79422,
    lon: -72.25998,
    px: 539,
    py: 441,
    source: "Google Maps GPS + marked screenshot",
  },
  {
    id: "hemingways",
    name: "Hemingway's on the Beach",
    lat: 21.79589,
    lon: -72.19001,
    px: 967,
    py: 433,
    source: "Google Maps GPS + marked screenshot",
  },
  {
    id: "villa-la-percha",
    name: "Villa La Percha",
    lat: 21.74749,
    lon: -72.29157,
    px: 372,
    py: 729,
    source: "Google Maps GPS + marked screenshot",
  },
];
