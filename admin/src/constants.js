export const HAZARD_COLORS = {
  High: '#d93850',
  Medium: '#eb684c',
  Low: '#f3a663',
  'Very low': '#f6d274',
};

export const VEGETATION_COLORS = {
  'Dense Forest': '#1b5e20',
  'Moderate Cover': '#4caf50',
  'Sparse / Shrub': '#a3e635',
  'Degraded / Grass': '#fef08a',
};

export const SOIL_COLORS = {
  'Clay Loam': '#92400e',
  'Sandy Loam': '#b45309',
  'Red / Laterite': '#d97706',
  'Alluvial Silt': '#fcd34d',
};

export const TERRAIN_COLORS = {
  'Steep Mountain': '#475569',
  'High Ridge': '#64748b',
  'Undulating Valley': '#94a3b8',
  'Lowland Plain': '#cbd5e1',
};

export const PARAMETER_TYPES = [
  { id: 'landslide', label: 'Landslide', group: 'hazard', palette: HAZARD_COLORS },
  { id: 'river_flood', label: 'River flood', group: 'hazard', palette: HAZARD_COLORS },
  { id: 'earthquake', label: 'Earthquake', group: 'hazard', palette: HAZARD_COLORS },
  { id: 'vegetation', label: 'Vegetation', group: 'env', palette: VEGETATION_COLORS },
  { id: 'soil_type', label: 'Soil type', group: 'env', palette: SOIL_COLORS },
  { id: 'terrain', label: 'Terrain', group: 'env', palette: TERRAIN_COLORS },
];

export const LEVEL_LABELS = {
  1: 'State',
  2: 'District',
  3: 'Sub-district',
  4: 'Block',
  5: 'Village / Ward',
};

export const LEVEL_PADDING = {
  0: 30,
  1: 25,
  2: 20,
  3: 15,
  4: 10,
  5: 5,
};

export const NER_STATES = [
  'arunachalpradesh', 'arunachal', 'assam', 'manipur', 
  'meghalaya', 'mizoram', 'nagaland', 'sikkim', 'tripura'
];

export const DEFAULT_SAMPLE_KIOSK_ALERT = {
  type: 'KIOSK_ALERT_EVENT',
  timestamp: '2026-09-18T05:03:42Z',
  kiosk: {
    id: 'KIO-SK-093',
    name: 'North Sikkim ADM5-Node 93',
    state: 'Sikkim',
    district: 'North Sikkim',
    subDivision: 'North Sikkim Sub-Division',
    adm5: 'Locality Block 93 - North Sikkim',
    type: 'Geotechnical Landslide Node',
    status: 'Warning',
    riskLevel: 'High',
    lat: 27.6328,
    lng: 88.9482,
    sensorsActive: 6,
    lastPing: 'Just now',
  },
  hazardUpdate: {
    parameter: 'landslide',
    regionName: 'North Sikkim',
    displayLevel: 'High',
  },
  message: 'RAPID SHEAR STRAIN & PORE-PRESSURE SATURATION DETECTED',
};