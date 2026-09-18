export interface KioskNode {
  id: string;
  name: string;
  state: string;
  district: string;
  subDivision?: string;
  adm5?: string;
  lat: number;
  lng: number;
  type: string;
  status: string;
  riskLevel?: string;
  sensorsActive: number;
}

export const NE_KIOSKS: KioskNode[] = [
  {
    id: 'KIO-MZ-040',
    name: 'Aizawl ADM5-Node 40',
    state: 'Mizoram',
    district: 'Aizawl',
    subDivision: 'Aizawl Sub-Division',
    adm5: 'Locality Block 40 - Aizawl',
    type: 'Seismic & Wind Sensor Post',
    status: 'Operational',
    riskLevel: 'Medium',
    lat: 23.3644,
    lng: 93.3005,
    sensorsActive: 5,
  },
  {
    id: 'KIO-MZ-048',
    name: 'Aizawl Central ADM5-Node 48',
    state: 'Mizoram',
    district: 'Aizawl',
    subDivision: 'Aizawl Sub-Division',
    adm5: 'Locality Block 48 - Aizawl Central',
    type: 'Geotechnical Landslide Node',
    status: 'Operational',
    riskLevel: 'High',
    lat: 22.9566,
    lng: 92.5118,
    sensorsActive: 8,
  },
  {
    id: 'KIO-MZ-050',
    name: 'Aizawl East ADM5-Node 50',
    state: 'Mizoram',
    district: 'Aizawl',
    subDivision: 'Aizawl Sub-Division',
    adm5: 'Locality Block 50 - Aizawl East',
    type: 'Geotechnical Landslide Node',
    status: 'Operational',
    riskLevel: 'High',
    lat: 22.9348,
    lng: 92.5857,
    sensorsActive: 5,
  },
  {
    id: 'KIO-SK-093',
    name: 'North Sikkim ADM5-Node 93',
    state: 'Sikkim',
    district: 'North Sikkim',
    subDivision: 'North Sikkim Sub-Division',
    adm5: 'Locality Block 93 - North Sikkim',
    type: 'Geotechnical Landslide Node',
    status: 'Operational',
    riskLevel: 'High',
    lat: 27.6328,
    lng: 88.9482,
    sensorsActive: 6,
  },
  {
    id: 'KIO-AS-001',
    name: 'Sonitpur ADM5-Node 1',
    state: 'Assam',
    district: 'Sonitpur',
    subDivision: 'Sonitpur Sub-Division',
    adm5: 'Locality Block 1 - Sonitpur',
    type: 'Multi-Hazard Telemetry Kiosk',
    status: 'Operational',
    riskLevel: 'High',
    lat: 26.1637,
    lng: 92.3619,
    sensorsActive: 4,
  },
  {
    id: 'KIO-ML-015',
    name: 'Shillong ADM5-Node 15',
    state: 'Meghalaya',
    district: 'East Khasi Hills',
    subDivision: 'Shillong Sub-Division',
    adm5: 'Locality Block 15 - Shillong',
    type: 'Hydrological & Flood Gauge',
    status: 'Operational',
    riskLevel: 'Medium',
    lat: 25.5788,
    lng: 91.8933,
    sensorsActive: 7,
  },
  {
    id: 'KIO-NL-025',
    name: 'Kohima ADM5-Node 25',
    state: 'Nagaland',
    district: 'Kohima',
    subDivision: 'Kohima Sub-Division',
    adm5: 'Locality Block 25 - Kohima',
    type: 'Seismic & Wind Sensor Post',
    status: 'Operational',
    riskLevel: 'High',
    lat: 25.6751,
    lng: 94.1086,
    sensorsActive: 6,
  }
];

export function getDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

export function findClosestKiosk(userLat?: number | null, userLng?: number | null): {
  kiosk: KioskNode;
  distanceKm: number;
} {
  // Default to Aizawl ADM5-Node 40 in Mizoram
  const defaultKiosk = NE_KIOSKS[0];

  if (!userLat || !userLng || isNaN(userLat) || isNaN(userLng)) {
    return { kiosk: defaultKiosk, distanceKm: 0.8 };
  }

  let closest = defaultKiosk;
  let minDistance = Infinity;

  for (const k of NE_KIOSKS) {
    const dist = getDistanceKm(userLat, userLng, k.lat, k.lng);
    if (dist < minDistance) {
      minDistance = dist;
      closest = k;
    }
  }

  return { kiosk: closest, distanceKm: minDistance };
}
