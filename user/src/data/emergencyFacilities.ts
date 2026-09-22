export interface EmergencyFacility {
  id: string;
  name: string;
  type: 'hospital' | 'shelter' | 'rescue_camp' | 'phc';
  typeLabel: string;
  badgeBg: string;
  badgeTextColor: string;
  distanceKm: number;
  eta: string;
  lat: number;
  lng: number;
  address: string;
  capacity: string;
  contact: string;
  status: string;
  statusColor: string;
}

export const UNAKOTI_EMERGENCY_FACILITIES: EmergencyFacility[] = [
  {
    id: 'FAC-TR-HOSP-01',
    name: 'Unakoti District Hospital (Kailashahar)',
    type: 'hospital',
    typeLabel: 'DISTRICT HOSPITAL',
    badgeBg: 'bg-[#d93850]',
    badgeTextColor: 'text-white',
    distanceKm: 1.4,
    eta: '4 mins via Sector Arterial Road',
    lat: 24.3120,
    lng: 92.0220,
    address: 'Kailashahar Main Road, Unakoti Sector',
    capacity: '120 Beds • ICU Trauma Center • 108 Ambulance Unit',
    contact: '108 / +91 3824 222234',
    status: 'Operational • 24x7 Emergency Care Active',
    statusColor: 'text-emerald-700',
  },
  {
    id: 'FAC-TR-SHELTER-01',
    name: 'Kailashahar Town Hall Disaster Relief Shelter',
    type: 'shelter',
    typeLabel: 'EVACUATION SHELTER',
    badgeBg: 'bg-emerald-600',
    badgeTextColor: 'text-white',
    distanceKm: 1.1,
    eta: '3 mins via High Elevation Ridge',
    lat: 24.3285,
    lng: 92.0090,
    address: 'Administrative Complex, Kailashahar, Unakoti',
    capacity: '650 Persons • Clean Drinking Water & Rations Staged',
    contact: '1077 (District Disaster Control)',
    status: 'Intake Active • High Ground Secure',
    statusColor: 'text-emerald-700',
  },
  {
    id: 'FAC-TR-RESCUE-01',
    name: 'NDRF Sector Tactical Rescue Camp',
    type: 'rescue_camp',
    typeLabel: 'RESCUE BATTALION',
    badgeBg: 'bg-amber-600',
    badgeTextColor: 'text-white',
    distanceKm: 2.5,
    eta: '7 mins via Bypass Corridor',
    lat: 24.3050,
    lng: 92.0310,
    address: 'NH-8 Bypass Junction, Unakoti',
    capacity: '4 Quick Reaction Rescue Teams • Heavy Evacuation Trucks',
    contact: '112 (Disaster Response Escort)',
    status: 'High Readiness • Patrols Deployed',
    statusColor: 'text-amber-700',
  },
  {
    id: 'FAC-TR-PHC-01',
    name: 'PHC Unakoti Heritage Emergency Post',
    type: 'phc',
    typeLabel: 'FIRST AID / PHC',
    badgeBg: 'bg-sky-600',
    badgeTextColor: 'text-white',
    distanceKm: 0.9,
    eta: '2 mins via Heritage Access Gate',
    lat: 24.3260,
    lng: 92.0250,
    address: 'Archaeological Gate Sector, Unakoti',
    capacity: '30 Beds • Emergency First-Aid & Triage Post',
    contact: '+91 3824 222880',
    status: 'Operational • Emergency Triage Ready',
    statusColor: 'text-emerald-700',
  },
];
