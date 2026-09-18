import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { Map as MapLibreMap, Marker } from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import {
  PARAMETER_TYPES,
  LEVEL_PADDING,
  NER_STATES
} from '../constants';
import {
  getRegionAnalytics,
  cleanAdminName,
  fetchLevelFeatures,
  isFeatureInside,
  featuresBbox
} from '../mapUtils';
import kioskData from '../data/kioskData.json';
import AlertMarquee from '../components/riskmap/AlertMarquee';
import HazardSidebar from '../components/riskmap/HazardSidebar';
import BreadcrumbBar from '../components/riskmap/BreadcrumbBar';
import KioskFlyoutCard from '../components/riskmap/KioskFlyoutCard';
import MapLegend from '../components/riskmap/MapLegend';
import RegionDetailsDialog from '../components/riskmap/RegionDetailsDialog';

import { useAlert } from '../context/AlertContext';

// Helper to construct a GeoJSON FeatureCollection from kiosk data
function buildKioskGeoJson(kiosks = []) {
  return {
    type: 'FeatureCollection',
    features: kiosks.map((k) => ({
      type: 'Feature',
      id: k.id,
      properties: { ...k },
      geometry: {
        type: 'Point',
        coordinates: [k.lng, k.lat]
      }
    }))
  };
}

const kioskGeoJson = buildKioskGeoJson(kioskData);

// Spatial Point-in-Polygon (Ray-casting) algorithm for accurate ADM4/ADM5 kiosk counting
function isPointInRing(point, ring) {
  const [x, y] = point;
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const xi = ring[i][0], yi = ring[i][1];
    const xj = ring[j][0], yj = ring[j][1];
    const intersect = ((yi > y) !== (yj > y)) && (x < ((xj - xi) * (y - yi)) / (yj - yi) + xi);
    if (intersect) inside = !inside;
  }
  return inside;
}

function isPointInPolygon(point, polygonCoords) {
  if (!polygonCoords || polygonCoords.length === 0) return false;
  if (!isPointInRing(point, polygonCoords[0])) return false;
  for (let i = 1; i < polygonCoords.length; i++) {
    if (isPointInRing(point, polygonCoords[i])) return false;
  }
  return true;
}

function isPointInGeometry(point, geometry) {
  if (!geometry) return false;
  if (geometry.type === 'Polygon') {
    return isPointInPolygon(point, geometry.coordinates);
  }
  if (geometry.type === 'MultiPolygon') {
    return geometry.coordinates.some((polyCoords) => isPointInPolygon(point, polyCoords));
  }
  return false;
}

// Robust check to determine if child district/subdivision belongs to parent state/district
function checkChildBelongsToParent(childFeature, parentFeature, parentNodeName) {
  if (!childFeature) return false;

  const childProps = childFeature.properties || {};
  const cleanParent = cleanAdminName(parentNodeName || parentFeature?.properties?.shapeName || '').toLowerCase();

  const attrCandidates = [
    childProps.shapeGroup,
    childProps.parent,
    childProps.parentName,
    childProps.STATE,
    childProps.state,
    childProps.adm1_name,
    childProps.ADM1_EN
  ];

  for (const candidate of attrCandidates) {
    if (candidate) {
      const cleanCandidate = cleanAdminName(candidate).toLowerCase();
      if (cleanCandidate === cleanParent || cleanCandidate.includes(cleanParent) || cleanParent.includes(cleanCandidate)) {
        return true;
      }
    }
  }

  const childName = cleanAdminName(childProps.shapeName || childProps.shapeGroup || '').toLowerCase();
  if (cleanParent.includes('sikkim')) {
    if (
      childName.includes('sikkim') ||
      childName.includes('gangtok') ||
      childName.includes('namchi') ||
      childName.includes('gyalshing') ||
      childName.includes('mangan') ||
      childName.includes('pakyong') ||
      childName.includes('soreng')
    ) {
      return true;
    }
  }

  if (cleanParent.includes('arunachal')) {
    const arunachalDistricts = [
      'tawang', 'kameng', 'subansiri', 'siang', 'papum', 'kurung', 'dibang',
      'lohit', 'anjaw', 'changlang', 'tirap', 'longding', 'itanagar', 'kra daadi'
    ];
    if (arunachalDistricts.some(d => childName.includes(d))) {
      return true;
    }
  }

  if (parentFeature && isFeatureInside(childFeature, parentFeature)) {
    return true;
  }

  if (parentFeature?.geometry && childFeature.geometry) {
    let testPoint = null;
    if (childFeature.geometry.type === 'Polygon' && childFeature.geometry.coordinates?.[0]?.[0]) {
      testPoint = childFeature.geometry.coordinates[0][0];
    } else if (childFeature.geometry.type === 'MultiPolygon' && childFeature.geometry.coordinates?.[0]?.[0]?.[0]) {
      testPoint = childFeature.geometry.coordinates[0][0][0];
    }
    if (testPoint && isPointInGeometry(testPoint, parentFeature.geometry)) {
      return true;
    }
  }

  return false;
}

export default function RiskMap() {
  const location = useLocation();
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const isMapLoadedRef = useRef(false);

  // Ref to hold exact kiosk center coordinates when navigating from Stations
  const targetKioskCenterRef = useRef(null);

  // Ref for simulated alert marker on map
  const alertMarkerRef = useRef(null);

  const [drillStack, setDrillStack] = useState([{ level: 0, id: 'NER', name: 'North East India', feature: null }]);
  const [activeParam, setActiveParam] = useState('landslide');
  const [hoveredFeature, setHoveredFeature] = useState(null);
  const [, setStatus] = useState('loading');

  // Option to show kiosks on map or not
  const [showKiosks, setShowKiosks] = useState(true);

  // Accordion toggle for legend box
  const [isLegendExpanded, setIsLegendExpanded] = useState(true);

  // Kiosk time window telemetry toggle: 1h vs 24h
  const [timeWindow, setTimeWindow] = useState('24h');

  // Real-time Alert & Kiosk State from AlertContext
  const {
    activeAlert,
    dynamicKiosks,
    triggerSimulatedAlert,
    dismissAlert,
  } = useAlert();

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);

  const [dialogFeature, setDialogFeature] = useState(null);
  const [selectedKiosk, setSelectedKiosk] = useState(null);

  // Dragging State for dialog panel
  const [dialogOffset, setDialogOffset] = useState({ x: 0, y: 0 });
  const isDragging = useRef(false);
  const dragStart = useRef({ x: 0, y: 0 });

  const activeFeaturesRef = useRef([]);
  const currentNode = drillStack[drillStack.length - 1];
  const parentNode = drillStack.length > 1 ? drillStack[drillStack.length - 2] : null;
  const activeParamMeta = PARAMETER_TYPES.find((p) => p.id === activeParam) || PARAMETER_TYPES[0];

  const buildFillExpression = (paramMeta) => {
    const expr = ['match', ['get', 'displayLevel']];
    Object.entries(paramMeta.palette).forEach(([label, hex]) => expr.push(label, hex));
    expr.push('#cbd5e1');
    return expr;
  };

  // Accurate spatial + hierarchy kiosk counter for ADM1 through ADM5
  const getKioskCountForNode = useCallback((node) => {
    if (!node || node.level === 0) return dynamicKiosks.length;
    const cleanNode = cleanAdminName(node.name || '').toLowerCase();
    const geom = node.feature?.geometry;

    const matches = dynamicKiosks.filter((k) => {
      if (geom && isPointInGeometry([k.lng, k.lat], geom)) {
        return true;
      }
      const stateMatch = cleanAdminName(k.state || '').toLowerCase() === cleanNode;
      const districtMatch = cleanAdminName(k.district || '').toLowerCase() === cleanNode;
      const subDivMatch = cleanAdminName(k.subDivision || '').toLowerCase().includes(cleanNode) || cleanNode.includes(cleanAdminName(k.subDivision || '').toLowerCase());
      const adm5Match = cleanAdminName(k.adm5 || '').toLowerCase().includes(cleanNode) || cleanNode.includes(cleanAdminName(k.adm5 || '').toLowerCase());
      const nameMatch = cleanAdminName(k.name || '').toLowerCase().includes(cleanNode);

      return stateMatch || districtMatch || subDivMatch || adm5Match || nameMatch;
    });

    return matches.length;
  }, [dynamicKiosks]);

  const placeAlertBeacon = useCallback((kiosk) => {
    if (!mapRef.current) return;
    if (alertMarkerRef.current) {
      alertMarkerRef.current.remove();
    }

    const el = document.createElement('div');
    el.className = 'alert-vibrating-marker';
    el.innerHTML = `
      <div class="vibrating-ring ring-1"></div>
      <div class="vibrating-ring ring-2"></div>
      <div class="vibrating-ring ring-3"></div>
      <div class="vibrating-beacon"></div>
    `;

    alertMarkerRef.current = new Marker({ element: el, anchor: 'center' })
      .setLngLat([kiosk.lng, kiosk.lat])
      .addTo(mapRef.current);
  }, []);

  // Handler to trigger simulated alert
  const handleSimulateAlert = () => {
    triggerSimulatedAlert();
    setShowKiosks(true);
  };

  const handleDismissAlert = () => {
    dismissAlert();
    if (alertMarkerRef.current) {
      alertMarkerRef.current.remove();
      alertMarkerRef.current = null;
    }
  };

  // Sync alert marker and smooth auto-pan on live alert arrival
  useEffect(() => {
    if (activeAlert && mapRef.current) {
      placeAlertBeacon(activeAlert);
      setShowKiosks(true);
      try {
        mapRef.current.flyTo({
          center: [activeAlert.lng, activeAlert.lat],
          zoom: Math.max(mapRef.current.getZoom(), 9.5),
          speed: 1.4,
          essential: true,
        });
      } catch {}
    } else if (!activeAlert && alertMarkerRef.current) {
      alertMarkerRef.current.remove();
      alertMarkerRef.current = null;
    }
  }, [activeAlert, placeAlertBeacon]);

  // Keep MapLibre source updated when dynamicKiosks registry updates
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !isMapLoadedRef.current) return;
    const src = map.getSource('kiosk-towers-source');
    if (src) {
      src.setData(buildKioskGeoJson(dynamicKiosks));
    }
  }, [dynamicKiosks]);

  // Search auto-complete
  useEffect(() => {
    if (searchQuery.trim().length < 2) {
      setSearchResults([]);
      return;
    }
    let isCancelled = false;
    const performSearch = async () => {
      const q = searchQuery.toLowerCase().trim();
      const qClean = cleanAdminName(q);
      const levels = await Promise.all([
        fetchLevelFeatures('ADM1'), fetchLevelFeatures('ADM2'),
        fetchLevelFeatures('ADM3'), fetchLevelFeatures('ADM4'), fetchLevelFeatures('ADM5')
      ]);

      if (isCancelled) return;
      const results = [];

      levels.reverse().forEach((levelFeatures, idx) => {
        const levelNum = 5 - idx;
        if (!levelFeatures) return;
        for (const f of levelFeatures) {
          if (results.length >= 10) break;
          const name = f.properties?.shapeName || f.properties?.shapeGroup || '';
          if (levelNum === 1 && !NER_STATES.includes(cleanAdminName(name))) continue;
          if (name.toLowerCase().includes(q) || cleanAdminName(name).includes(qClean)) {
            if (!results.some((r) => r.name === name && r.level === levelNum)) {
              results.push({ name, level: levelNum, feature: f });
            }
          }
        }
      });
      if (!isCancelled) setSearchResults(results);
    };
    const timer = setTimeout(performSearch, 300);
    return () => { isCancelled = true; clearTimeout(timer); };
  }, [searchQuery]);

  // Layer-by-layer stack builder
  const buildLayerAncestryStack = useCallback(async (targetFeature, targetLevel, targetName) => {
    const stack = [{ level: 0, id: 'NER', name: 'North East India', feature: null }];

    if (targetLevel === 1) {
      stack.push({ level: 1, id: targetName, name: targetName, feature: targetFeature });
      return stack;
    }

    const [adm1, adm2, adm3, adm4] = await Promise.all([
      fetchLevelFeatures('ADM1'),
      targetLevel >= 2 ? fetchLevelFeatures('ADM2') : Promise.resolve([]),
      targetLevel >= 3 ? fetchLevelFeatures('ADM3') : Promise.resolve([]),
      targetLevel >= 4 ? fetchLevelFeatures('ADM4') : Promise.resolve([]),
    ]);

    const parentAdm1 = adm1?.find((f) =>
      checkChildBelongsToParent(targetFeature, f, f.properties?.shapeName) &&
      NER_STATES.includes(cleanAdminName(f.properties?.shapeName))
    );

    if (parentAdm1) {
      const name = parentAdm1.properties?.shapeName;
      stack.push({ level: 1, id: name, name, feature: parentAdm1 });
    }

    if (targetLevel >= 2 && adm2?.length) {
      const parentAdm2 = adm2.find((f) => checkChildBelongsToParent(targetFeature, f, f.properties?.shapeName));
      if (parentAdm2 && (!parentAdm1 || checkChildBelongsToParent(parentAdm2, parentAdm1, parentAdm1.properties?.shapeName))) {
        const name = parentAdm2.properties?.shapeName;
        stack.push({ level: 2, id: name, name, feature: parentAdm2 });
      }
    }

    if (targetLevel >= 3 && adm3?.length) {
      const parentAdm3 = adm3.find((f) => checkChildBelongsToParent(targetFeature, f, f.properties?.shapeName));
      if (parentAdm3) {
        const name = parentAdm3.properties?.shapeName || parentAdm3.properties?.shapeGroup;
        stack.push({ level: 3, id: name, name, feature: parentAdm3 });
      }
    }

    if (targetLevel >= 4 && adm4?.length) {
      const parentAdm4 = adm4.find((f) => checkChildBelongsToParent(targetFeature, f, f.properties?.shapeName));
      if (parentAdm4) {
        const name = parentAdm4.properties?.shapeName || parentAdm4.properties?.shapeGroup;
        stack.push({ level: 4, id: name, name, feature: parentAdm4 });
      }
    }

    stack.push({ level: targetLevel, id: targetName, name: targetName, feature: targetFeature });
    return stack;
  }, []);

  const handleSearchSelect = async (item) => {
    setSearchQuery('');
    setSearchResults([]);
    const fullAncestry = await buildLayerAncestryStack(item.feature, item.level, item.name);
    setDrillStack(fullAncestry);
    setDialogFeature({ name: item.name, level: item.level, feature: item.feature });
    setDialogOffset({ x: 0, y: 0 });
  };

  const resolveFeatures = useCallback(async (node, paramKey) => {
    if (node.level === 0) {
      const adm1 = await fetchLevelFeatures('ADM1');
      return adm1.filter((f) => NER_STATES.includes(cleanAdminName(f.properties?.shapeName))).map((f) => ({
        type: 'Feature',
        properties: { id: f.properties?.shapeName, name: f.properties?.shapeName, level: 1, displayLevel: getRegionAnalytics(f.properties?.shapeName).scores[paramKey] || 'Low' },
        geometry: f.geometry,
      }));
    }

    for (let nextLvl = node.level + 1; nextLvl <= 5; nextLvl++) {
      const children = await fetchLevelFeatures(`ADM${nextLvl}`);
      if (children?.length) {
        const inside = children.filter((f) => checkChildBelongsToParent(f, node.feature, node.name));
        if (inside.length > 0) {
          return inside.map((f) => {
            const rawName = f.properties?.shapeName || f.properties?.shapeGroup || node.name;
            return {
              type: 'Feature',
              properties: {
                id: rawName,
                name: rawName,
                level: nextLvl,
                displayLevel: getRegionAnalytics(rawName).scores[paramKey] || getRegionAnalytics(node.name).scores[paramKey] || 'Low'
              },
              geometry: f.geometry,
            };
          });
        }
      }
    }

    if (node.feature) {
      return [{
        type: 'Feature',
        properties: { id: node.id, name: node.name, level: node.level, displayLevel: getRegionAnalytics(node.name).scores[paramKey] },
        geometry: node.feature.geometry
      }];
    }
    return [];
  }, []);

  const applyNode = useCallback(async (node, paramKey) => {
    const map = mapRef.current;
    if (!map || !isMapLoadedRef.current) return;
    setStatus('loading');
    try {
      const features = await resolveFeatures(node, paramKey);
      activeFeaturesRef.current = features;
      if (!mapRef.current || map._removed) return;

      map.setPaintProperty('hazard-fills', 'fill-color', buildFillExpression(activeParamMeta));
      map.getSource('active-level-polygons')?.setData({ type: 'FeatureCollection', features });

      if (targetKioskCenterRef.current) {
        map.flyTo({
          center: targetKioskCenterRef.current,
          zoom: 13.5,
          duration: 900
        });
        targetKioskCenterRef.current = null;
      } else {
        const bbox = featuresBbox(features);
        if (bbox) {
          const pad = LEVEL_PADDING[features[0]?.properties?.level || 1] || 15;
          map.fitBounds(bbox, { padding: pad, duration: 600, maxZoom: 18 });
        }
      }
      setStatus('ready');
    } catch {
      setStatus('error');
    }
  }, [resolveFeatures, activeParamMeta]);

  // Creates the Tower Icon Canvas Image dynamically
  const registerTowerIcon = (map) => {
    if (map.hasImage('tower-icon')) return;

    const size = 64;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');

    ctx.beginPath();
    ctx.arc(size / 2, size / 2, 28, 0, Math.PI * 2);
    ctx.fillStyle = '#d93850';
    ctx.fill();
    ctx.lineWidth = 4;
    ctx.strokeStyle = '#ffffff';
    ctx.stroke();

    ctx.strokeStyle = '#ffffff';
    ctx.fillStyle = '#ffffff';
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    ctx.beginPath();
    ctx.moveTo(22, 46);
    ctx.lineTo(32, 22);
    ctx.lineTo(42, 46);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(25, 40);
    ctx.lineTo(39, 40);
    ctx.moveTo(28, 32);
    ctx.lineTo(36, 32);
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(32, 20, 3.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.beginPath();
    ctx.arc(32, 20, 8, -Math.PI * 0.75, -Math.PI * 0.25);
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(32, 20, 13, -Math.PI * 0.75, -Math.PI * 0.25);
    ctx.stroke();

    const imgData = ctx.getImageData(0, 0, size, size);
    map.addImage('tower-icon', imgData);
  };

  // Synchronize kiosk tower layer visibility
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !isMapLoadedRef.current) return;
    if (map.getLayer('kiosk-towers')) {
      map.setLayoutProperty('kiosk-towers', 'visibility', showKiosks ? 'visible' : 'none');
    }
  }, [showKiosks]);

  // Deep link handler
  const handleDeepLinkKiosk = useCallback(async (kioskId, targetLat, targetLng) => {
    const targetKiosk = dynamicKiosks.find(k => k.id === kioskId) || dynamicKiosks.find(k => Math.abs(k.lat - targetLat) < 0.005 && Math.abs(k.lng - targetLng) < 0.005);
    if (!targetKiosk) return;

    setShowKiosks(true);
    setSelectedKiosk(targetKiosk);

    targetKioskCenterRef.current = [targetKiosk.lng, targetKiosk.lat];

    const [adm5Features, adm4Features, adm2Features] = await Promise.all([
      fetchLevelFeatures('ADM5'),
      fetchLevelFeatures('ADM4'),
      fetchLevelFeatures('ADM2')
    ]);

    const targetAdm5Clean = cleanAdminName(targetKiosk.adm5 || targetKiosk.name).toLowerCase();
    const targetDistrictClean = cleanAdminName(targetKiosk.district || '').toLowerCase();

    let targetFeat = null;
    let targetLvl = 5;

    if (adm5Features?.length) {
      targetFeat = adm5Features.find(f => cleanAdminName(f.properties?.shapeName || '').toLowerCase().includes(targetAdm5Clean));
    }
    if (!targetFeat && adm4Features?.length) {
      targetLvl = 4;
      targetFeat = adm4Features.find(f => cleanAdminName(f.properties?.shapeName || '').toLowerCase().includes(targetDistrictClean));
    }
    if (!targetFeat && adm2Features?.length) {
      targetLvl = 2;
      targetFeat = adm2Features.find(f => cleanAdminName(f.properties?.shapeName || '').toLowerCase().includes(targetDistrictClean));
    }

    if (targetFeat) {
      const featureName = targetFeat.properties?.shapeName || targetKiosk.adm5 || targetKiosk.name;
      const fullStack = await buildLayerAncestryStack(targetFeat, targetLvl, featureName);
      setDrillStack(fullStack);
      setDialogFeature({ name: featureName, level: targetLvl, feature: targetFeat });
      setDialogOffset({ x: 0, y: 0 });
    } else {
      if (mapRef.current) {
        mapRef.current.flyTo({
          center: [targetKiosk.lng, targetKiosk.lat],
          zoom: 13.5,
          duration: 900
        });
      }
    }
  }, [buildLayerAncestryStack]);

  useEffect(() => {
    if (!mapContainerRef.current) return;
    const map = new MapLibreMap({
      container: mapContainerRef.current,
      style: 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json',
      bounds: [[88.0, 21.5], [97.5, 29.8]],
      fitBoundsOptions: { padding: 30 },
      attributionControl: false,
      scrollZoom: true,
      boxZoom: true,
      doubleClickZoom: true,
      keyboard: true,
      touchZoomRotate: true,
      dragRotate: false,
    });
    mapRef.current = map;

    map.on('load', () => {
      isMapLoadedRef.current = true;
      registerTowerIcon(map);

      // 1. Polygons
      map.addSource('active-level-polygons', { type: 'geojson', data: { type: 'FeatureCollection', features: [] }, generateId: true });
      map.addLayer({
        id: 'hazard-fills', type: 'fill', source: 'active-level-polygons',
        paint: { 'fill-color': buildFillExpression(activeParamMeta), 'fill-opacity': ['case', ['boolean', ['feature-state', 'hover'], false], 0.95, 0.8] },
      });
      map.addLayer({
        id: 'hazard-borders', type: 'line', source: 'active-level-polygons',
        paint: { 'line-color': '#ffffff', 'line-width': 1.5, 'line-opacity': 0.9 },
      });
      map.addLayer({
        id: 'hazard-labels', type: 'symbol', source: 'active-level-polygons',
        layout: {
          'text-field': ['get', 'name'],
          'text-size': 12,
          'text-overlap': 'never',
        },
        paint: {
          'text-color': '#1a1a1a',
          'text-halo-color': '#ffffff',
          'text-halo-width': 2
        }
      });

      // 2. Kiosks Layer
      map.addSource('kiosk-towers-source', {
        type: 'geojson',
        data: kioskGeoJson
      });

      map.addLayer({
        id: 'kiosk-towers',
        type: 'symbol',
        source: 'kiosk-towers-source',
        layout: {
          'icon-image': 'tower-icon',
          'icon-size': 0.55,
          'icon-allow-overlap': true,
          'text-field': ['get', 'name'],
          'text-font': ['Open Sans Semibold'],
          'text-offset': [0, 1.4],
          'text-anchor': 'top',
          'text-size': 10,
          'text-optional': true,
          'visibility': showKiosks ? 'visible' : 'none'
        },
        paint: {
          'text-color': '#222222',
          'text-halo-color': '#ffffff',
          'text-halo-width': 2
        }
      });

      map.on('mouseenter', 'kiosk-towers', () => {
        map.getCanvas().style.cursor = 'pointer';
      });
      map.on('mouseleave', 'kiosk-towers', () => {
        map.getCanvas().style.cursor = '';
      });

      map.on('click', 'kiosk-towers', (e) => {
        if (!e.features?.length) return;
        const clickedProps = e.features[0].properties;
        setSelectedKiosk(clickedProps);
        map.flyTo({
          center: e.features[0].geometry.coordinates,
          zoom: 13.5,
          duration: 700
        });
      });

      let hoveredId = null;
      map.on('mousemove', 'hazard-fills', (e) => {
        if (hoveredId !== null) map.setFeatureState({ source: 'active-level-polygons', id: hoveredId }, { hover: false });
        if (e.features?.length) {
          hoveredId = e.features[0].id;
          map.setFeatureState({ source: 'active-level-polygons', id: hoveredId }, { hover: true });
          setHoveredFeature({ name: e.features[0].properties.name, level: e.features[0].properties.displayLevel });
        }
      });
      map.on('mouseleave', 'hazard-fills', () => {
        if (hoveredId !== null) map.setFeatureState({ source: 'active-level-polygons', id: hoveredId }, { hover: false });
        hoveredId = null;
        setHoveredFeature(null);
      });

      map.on('click', 'hazard-fills', (e) => {
        if (!e.features?.length) return;
        const targetId = e.features[0].properties.id;
        const fullFeat = activeFeaturesRef.current.find((f) => f.properties.id === targetId);
        if (!fullFeat) return;

        setDrillStack((prev) => {
          if (prev.length > 0 && prev[prev.length - 1].id === targetId) return prev;
          return [...prev, { level: fullFeat.properties.level || prev.length, id: targetId, name: fullFeat.properties.name, feature: fullFeat }];
        });
        setDialogFeature({ name: fullFeat.properties.name, level: fullFeat.properties.level, feature: fullFeat });
        setDialogOffset({ x: 0, y: 0 });
      });

      applyNode(drillStack[0], activeParam);

      // Restore active alert beacon if one exists in memory
      try {
        const storedAlert = localStorage.getItem('active_alert_kiosk');
        if (storedAlert) {
          placeAlertBeacon(JSON.parse(storedAlert));
        }
      } catch {}

      const params = new URLSearchParams(location.search);
      const urlLat = parseFloat(params.get('lat'));
      const urlLng = parseFloat(params.get('lng'));
      const kioskId = params.get('kioskId');

      if (!isNaN(urlLat) && !isNaN(urlLng)) {
        setTimeout(() => {
          handleDeepLinkKiosk(kioskId, urlLat, urlLng);
        }, 500);
      }
    });

    return () => { isMapLoadedRef.current = false; map.remove(); };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (isMapLoadedRef.current) applyNode(currentNode, activeParam);
  }, [drillStack, activeParam, applyNode, currentNode]);

  const handlePointerDown = (e) => {
    isDragging.current = true;
    dragStart.current = { x: e.clientX - dialogOffset.x, y: e.clientY - dialogOffset.y };
    e.target.setPointerCapture(e.pointerId);
  };
  const handlePointerMove = (e) => {
    if (!isDragging.current) return;
    setDialogOffset({
      x: e.clientX - dragStart.current.x,
      y: e.clientY - dragStart.current.y
    });
  };
  const handlePointerUp = (e) => {
    if (isDragging.current) {
      isDragging.current = false;
      e.target.releasePointerCapture(e.pointerId);
    }
  };

  const da = dialogFeature ? getRegionAnalytics(dialogFeature.name) : null;
  const activeKioskCount = getKioskCountForNode(dialogFeature || currentNode);

  return (
    <div className="flex h-full max-h-screen w-full overflow-hidden bg-[#e0e0e0] relative select-none">

      {/* Dynamic Keyframes for the vibrating ring animation used by the
          imperative MapLibre marker element created in placeAlertBeacon() */}
      <style>{`
        @keyframes rippleExpand {
          0% {
            transform: scale(0.35);
            opacity: 1;
          }
          50% {
            transform: scale(2.2);
            opacity: 0.75;
          }
          100% {
            transform: scale(4.5);
            opacity: 0;
          }
        }
        .alert-vibrating-marker {
          position: relative;
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          pointer-events: none;
          z-index: 50;
        }
        .vibrating-beacon {
          width: 14px;
          height: 14px;
          background: #d93850;
          border: 2.5px solid #ffffff;
          border-radius: 50%;
          box-shadow: 0 0 14px #ff0033, 0 0 24px #ff0000;
          z-index: 10;
        }
        .vibrating-ring {
          position: absolute;
          border-radius: 50%;
          border: 3px solid #ff1744;
          box-shadow: 0 0 12px rgba(255, 23, 68, 0.9);
          pointer-events: none;
        }
        .ring-1 {
          width: 28px;
          height: 28px;
          animation: rippleExpand 2s cubic-bezier(0.15, 0.6, 0.35, 1) infinite;
        }
        .ring-2 {
          width: 28px;
          height: 28px;
          animation: rippleExpand 2s cubic-bezier(0.15, 0.6, 0.35, 1) infinite;
          animation-delay: 0.65s;
        }
        .ring-3 {
          width: 28px;
          height: 28px;
          animation: rippleExpand 2s cubic-bezier(0.15, 0.6, 0.35, 1) infinite;
          animation-delay: 1.3s;
        }
      `}</style>

      {/* Flowing Continuous Marquee Alert Box across the top screen */}
      {activeAlert && (
        <AlertMarquee activeAlert={activeAlert} onDismiss={handleDismissAlert} />
      )}

      {/* Side Panel */}
      <HazardSidebar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchResults={searchResults}
        onSearchSelect={handleSearchSelect}
        showKiosks={showKiosks}
        onToggleKiosks={setShowKiosks}
        activeParam={activeParam}
        onSelectParam={setActiveParam}
      />

      {/* Map Canvas Area */}
      <div className="flex-1 relative h-full overflow-hidden">
        <div ref={mapContainerRef} className="h-full w-full" />

        {/* Top Breadcrumb Bar, Simulate Alert Button & hovered-feature pill */}
        <BreadcrumbBar
          activeAlert={activeAlert}
          drillStack={drillStack}
          parentNode={parentNode}
          onGoBack={() => setDrillStack(p => p.slice(0, p.length - 1))}
          onSimulateAlert={handleSimulateAlert}
          hoveredFeature={hoveredFeature}
        />

        {/* Selected Kiosk Flyout Card */}
        {selectedKiosk && (
          <KioskFlyoutCard
            selectedKiosk={selectedKiosk}
            activeAlert={activeAlert}
            timeWindow={timeWindow}
            onTimeWindowChange={setTimeWindow}
            onClose={() => setSelectedKiosk(null)}
          />
        )}

        {/* Legend Box with Accordion Expand/Collapse */}
        <MapLegend
          activeParamMeta={activeParamMeta}
          showKiosks={showKiosks}
          isLegendExpanded={isLegendExpanded}
          onToggleExpand={() => setIsLegendExpanded(prev => !prev)}
        />

        {/* Region Details Dialog Panel */}
        {dialogFeature && da && (
          <RegionDetailsDialog
            dialogFeature={dialogFeature}
            da={da}
            activeKioskCount={activeKioskCount}
            dialogOffset={dialogOffset}
            onClose={() => setDialogFeature(null)}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
          />
        )}
      </div>
    </div>
  );
}
