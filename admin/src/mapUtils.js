export function hashStr(str = '') {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

// Dynamic real-time hazard overrides registry (populated by WebSocket alerts)
let dynamicHazardOverrides = {};

export function setHazardOverride(regionName, parameter = 'landslide', displayLevel = 'High') {
  if (!regionName) return;
  const key = cleanAdminName(regionName);
  dynamicHazardOverrides[key] = {
    regionName,
    parameter,
    displayLevel,
    timestamp: new Date().toISOString()
  };
}

export function clearHazardOverrides() {
  dynamicHazardOverrides = {};
}

export function getHazardOverrides() {
  return { ...dynamicHazardOverrides };
}

export function getRegionAnalytics(name = 'North East India') {
  const h = hashStr(name);
  const hazardLevels = ['High', 'Medium', 'Low', 'Very low'];
  const vegLevels = ['Dense Forest', 'Moderate Cover', 'Sparse / Shrub', 'Degraded / Grass'];
  const soilLevels = ['Clay Loam', 'Sandy Loam', 'Red / Laterite', 'Alluvial Silt'];
  const terrainLevels = ['Steep Mountain', 'High Ridge', 'Undulating Valley', 'Lowland Plain'];

  const cleanTarget = cleanAdminName(name);

  // Check if any WebSocket hazard override applies to this region
  let activeOverride = null;
  for (const [key, ovr] of Object.entries(dynamicHazardOverrides)) {
    if (cleanTarget.includes(key) || key.includes(cleanTarget)) {
      activeOverride = ovr;
      break;
    }
  }

  const scores = {
    landslide: hazardLevels[h % 3],
    river_flood: hazardLevels[(h + 1) % 4],
    earthquake: hazardLevels[(h + 2) % 3],
    vegetation: vegLevels[(h + 3) % 4],
    soil_type: soilLevels[(h + 4) % 4],
    terrain: terrainLevels[(h + 5) % 4],
  };

  if (activeOverride && activeOverride.parameter && activeOverride.displayLevel) {
    scores[activeOverride.parameter] = activeOverride.displayLevel;
  }

  const overallRisk = activeOverride ? activeOverride.displayLevel : hazardLevels[h % 3];

  return {
    scores,
    rainfall: `${(12 + (h % 46)).toFixed(1)} mm/h`,
    kiosks: `${3 + (h % 38)} Kiosks Active`,
    overallRisk,
  };
}

export function cleanAdminName(s) {
  return (s || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
    .trim();
}

const levelCache = {};
const inflight = {};

export async function fetchLevelFeatures(levelStr) {
  if (levelCache[levelStr]) return levelCache[levelStr];
  if (inflight[levelStr]) return inflight[levelStr];

  inflight[levelStr] = (async () => {
    try {
      const res = await fetch(`/geoBoundaries-IND-${levelStr}_simplified.geojson`);
      if (!res.ok) return [];
      const geojson = await res.json();
      levelCache[levelStr] = geojson.features || [];
      return levelCache[levelStr];
    } catch {
      return [];
    }
  })();

  const result = await inflight[levelStr];
  delete inflight[levelStr];
  return result;
}

export function featureBbox(feature) {
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  const walk = (coords) => {
    if (typeof coords[0] === 'number') {
      const [x, y] = coords;
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
    } else {
      coords.forEach(walk);
    }
  };
  walk(feature.geometry.coordinates);
  return [minX, minY, maxX, maxY];
}

export function featuresBbox(features) {
  if (!features?.length) return null;
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  features.forEach((f) => {
    const walk = (coords) => {
      if (typeof coords[0] === 'number') {
        if (coords[0] < minX) minX = coords[0];
        if (coords[0] > maxX) maxX = coords[0];
        if (coords[1] < minY) minY = coords[1];
        if (coords[1] > maxY) maxY = coords[1];
      } else {
        coords.forEach(walk);
      }
    };
    walk(f.geometry.coordinates);
  });
  return [[minX, minY], [maxX, maxY]];
}

export function pointInPolygon(point, vs) {
  let x = point[0], y = point[1];
  let inside = false;
  for (let i = 0, j = vs.length - 1; i < vs.length; j = i++) {
    let xi = vs[i][0], yi = vs[i][1];
    let xj = vs[j][0], yj = vs[j][1];
    let intersect = ((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
    if (intersect) inside = !inside;
  }
  return inside;
}

export function pointInGeom(point, geom) {
  if (!geom?.coordinates) return false;
  if (geom.type === 'Polygon') return pointInPolygon(point, geom.coordinates[0]);
  if (geom.type === 'MultiPolygon') {
    return geom.coordinates.some((poly) => pointInPolygon(point, poly[0]));
  }
  return false;
}

export function isFeatureInside(childFeature, parentFeature) {
  if (!parentFeature?.geometry || !childFeature?.geometry) return false;
  const [cMinX, cMinY, cMaxX, cMaxY] = featureBbox(childFeature);
  const [pMinX, pMinY, pMaxX, pMaxY] = featureBbox(parentFeature);
  if (cMaxX < pMinX || cMaxX > pMaxX || cMaxY < pMinY || cMaxY > pMaxY) return false;

  const pts = [];
  const walk = (coords) => {
    if (typeof coords[0] === 'number') pts.push(coords);
    else coords.forEach(walk);
  };
  walk(childFeature.geometry.coordinates);
  if (!pts.length) return false;

  const sumX = pts.reduce((acc, p) => acc + p[0], 0);
  const sumY = pts.reduce((acc, p) => acc + p[1], 0);
  if (pointInGeom([sumX / pts.length, sumY / pts.length], parentFeature.geometry)) return true;

  const step = Math.max(1, Math.floor(pts.length / 8));
  for (let i = 0; i < pts.length; i += step) {
    if (pointInGeom(pts[i], parentFeature.geometry)) return true;
  }
  return false;
}