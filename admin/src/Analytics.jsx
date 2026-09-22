import React, { useState, useEffect, useRef } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';
import ENV from './config/env';
import { useAlert } from './context/AlertContext';
import { useLanguage } from './context/LanguageContext';
import PageHeader from './components/common/PageHeader';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

// Translation dictionary for supported languages
const TRANSLATIONS = {
  EN: {
    title: 'GEOTECHNICAL ANALYTICS & IN-SITU TELEMETRY',
    subtitle: 'Autonomous Geotechnical Mesh, Sensor Telemetry & Evacuation Routing Console',
    statusSynced: 'GEO-MESH: SYNCHRONIZED',
    corridor: 'SELECTED CORRIDOR: UNAKOTI SECTOR (TRIPURA)',
    gisTitle: 'SURFACE GIS MAP & HEATZONE',
    soilMoisture: 'Soil Moisture',
    rainfall: 'Simulated Rainfall',
    vibration: 'Vibration Sensor (0 - 1)',
    riskLevel: 'Landslide Risk Level',
    smsConsoleTitle: 'SMS EARLY WARNING DISPATCH CONSOLE',
    smsDisabledMsg: 'SMS Dispatch Standby (Risk nominal. Activated when Risk ≥ 85% or Moisture < 200 ADC)',
    smsSendingReg: 'Dispatching critical warning to registered users in sector...',
    smsSendingUnreg: 'Dispatching emergency evacuation advisory to district operators...',
    guideTitle: 'SOIL MOISTURE CALIBRATION GUIDE',
    guideWet: '< 200 ADC: Critical Wet Soil Hazard (Evacuation Alert)',
    guideMod: '200 - 250 ADC: Moderate Risk Soil (Watch State)',
    guideNorm: '> 250 ADC: Stable Baseline Soil (Nominal)',
    sendTestSms: 'Manual Broadcast',
    statusNominal: 'Nominal Stability',
    statusModerate: 'Moderate Caution',
    statusCritical: 'Critical Hazard Warning',
  },
  HI: {
    title: 'भू-तकनीकी विश्लेषण एवं इन-सिटू टेलीमेट्री',
    subtitle: 'स्वायत्त भू-तकनीकी मेश, सेंसर टेलीमेट्री एवं आपातकालीन निकासी कंसोल',
    statusSynced: 'जियो-मेश: समन्वयित',
    corridor: 'चयनित गलियारा: उनाकोटी क्षेत्र (त्रिपुरा)',
    gisTitle: 'सतह जीआईएस मानचित्र एवं हीटज़ोन',
    soilMoisture: 'मिट्टी की नमी',
    rainfall: 'सिमुलेटेड वर्षा',
    vibration: 'कंपन सेंसर (0 - 1)',
    riskLevel: 'भूस्खलन जोखिम स्तर',
    smsConsoleTitle: 'एसएमएस पूर्व चेतावनी प्रेषण कंसोल',
    smsDisabledMsg: 'एसएमएस प्रेषण स्टैंडबाय (जोखिम सामान्य। जोखिम ≥ 85% या नमी < 200 होने पर सक्रिय)',
    smsSendingReg: 'पंजीकृत उपयोगकर्ताओं को आपातकालीन चेतावनी भेजी जा रही है...',
    smsSendingUnreg: 'जिला ऑपरेटरों को तत्काल निकासी नोटिस जारी किया जा रहा है...',
    guideTitle: 'मिट्टी की नमी अंशांकन गाइड',
    guideWet: '< 200: अत्यधिक गीली व खतरनाक मिट्टी (गंभीर चेतावनी)',
    guideMod: '200 - 250: मध्यम जोखिम वाली मिट्टी (निगरानी स्थिति)',
    guideNorm: '> 250: सामान्य मिट्टी (स्थिर स्तर)',
    sendTestSms: 'मैनुअल प्रसारण',
    statusNominal: 'सामान्य स्थिरता',
    statusModerate: 'मध्यम सावधानी',
    statusCritical: 'गंभीर खतरा चेतावनी',
  },
  BN: {
    title: 'ভূ-প্রকৌশলগত বিশ্লেষণ ও ইন-সিটু টেলিমেট্রি',
    subtitle: 'স্বয়ংক্রিয় জিও-মেশ, সেন্সর টেলিমেট্রি ও উচ্ছেদ রুট পর্যবেক্ষণ কনসোল',
    statusSynced: 'জিও-মেশ: সিঙ্ক্রোনাইজড',
    corridor: 'নির্বাচিত করিডোর: উনকোটি সেক্টর (ত্রিপুরা)',
    gisTitle: 'সারফেস জিআইএস মানচিত্র এবং হিট জোন',
    soilMoisture: 'মাটির আর্দ্রতা',
    rainfall: 'সিমুলেটেড বৃষ্টিপাত',
    vibration: 'কম্পন সেন্সর (0 - 1)',
    riskLevel: 'ভূমিধসের ঝুঁকির স্তর',
    smsConsoleTitle: 'এসএমএস সতর্কবার্তা প্রেরণ কনসোল',
    smsDisabledMsg: 'এসএমএস প্রেরণ নিষ্ক্রিয় (ঝুঁকি স্বাভাবিক। ঝুঁকি ≥ ৮৫% বা আর্দ্রতা < ২০০ হলে সক্রিয়)',
    smsSendingReg: 'নিবন্ধিত ব্যবহারকারীদের কাছে জরুরি বার্তা পাঠানো হচ্ছে...',
    smsSendingUnreg: 'জেলা অপারেটরদের কাছে উচ্ছেদের নির্দেশ জারি করা হচ্ছে...',
    guideTitle: 'মাটির আর্দ্রতা ক্যালিব্রেশন নির্দেশিকা',
    guideWet: '< ২০০: অত্যন্ত ঝুঁকিপূর্ণ এবং ভেজা মাটি (জরুরি সতর্কতা)',
    guideMod: '২০০ - ২৫০: মাঝারি ঝুঁকিপূর্ণ মাটি (পর্যবেক্ষণ অবস্থা)',
    guideNorm: '> ২৫০: স্বাভাবিক মাটি (স্থিতিশীল)',
    sendTestSms: 'ম্যানুয়াল সম্প্রচার',
    statusNominal: 'স্বাভাবিক স্থিতিশীলতা',
    statusModerate: 'মাঝারি সতর্কতা',
    statusCritical: 'গুরুতর বিপদ সতর্কতা',
  },
  AS: {
    title: 'ভূ-কাৰিকৰী বিশ্লেষণ আৰু ইন-চিটু টেলিমেট্ৰি',
    subtitle: 'স্বয়ংক্রিয় ভূ-মেছ, সংবেদক টেলিমেট্ৰি আৰু উদ্ধাৰ পথ নিৰীক্ষণ কনচোল',
    statusSynced: 'জিঅ’-মেছ: সংমিশ্ৰিত',
    corridor: 'নিৰ্বাচিত কৰিডৰ: উনাকোটি খণ্ড (ত্ৰিপুৰা)',
    gisTitle: 'পৃষ্ঠ জিআইএছ মানচিত্ৰ আৰু হিটজ’ন',
    soilMoisture: 'মাটিৰ আৰ্দ্ৰতা',
    rainfall: 'কৃত্ৰিম বৃষ্টিপাত',
    vibration: 'কম্পন সংবেদক (0 - 1)',
    riskLevel: 'ভূমিস্খলনৰ বিপশংকাসূচক মাত্ৰা',
    smsConsoleTitle: 'এছএমএছ আগতীয়া সকীয়ানী প্ৰেৰণ কনচোল',
    smsDisabledMsg: 'এছএমএছ প্ৰেৰণ নিষ্ক্ৰিয় (বিপদ স্বাভাৱিক। বিপদ ≥ ৮৫% বা আৰ্দ্ৰতা < ২০০ হ’লে সক্ৰিয়)',
    smsSendingReg: 'পঞ্জীয়নভুক্ত ব্যৱহাৰকাৰীসকললৈ জৰুৰী সকীয়ানী প্ৰেৰণ কৰা হৈছে...',
    smsSendingUnreg: 'জিলা কৰ্তৃপক্ষলৈ উদ্ধাৰ বাৰ্তা প্ৰেৰণ কৰা হৈছে...',
    guideTitle: 'মাটিৰ আৰ্দ্ৰতা মাপকাঠী নিৰ্দেশিকা',
    guideWet: '< ২০০: অতি বিপদসংকুল আৰু সেমেকা মাটি (জৰুৰী সকীয়ানী)',
    guideMod: '২০০ - ২৫০: মধ্যম বিপশংকাৰ মাটি (নিৰীক্ষণ অৱস্থা)',
    guideNorm: '> ২৫০: স্বাভাৱিক মাটি (সুৰক্ষিত)',
    sendTestSms: 'মেনুৱেল সম্প্ৰচাৰ',
    statusNominal: 'স্বাভাৱিক স্থিৰতা',
    statusModerate: 'মধ্যম সাৱধানতা',
    statusCritical: 'গুৰুতৰ বিপদৰ সকীয়ানী',
  },
};

// Unakoti Node & Emergency Facilities (Hospitals, Relief Shelters, Rescue Camps)
const UNAKOTI_NODE_COORDS = { lat: 24.3223, lng: 92.0163 };

const UNAKOTI_FACILITIES = [
  {
    id: 'fac-hosp-01',
    name: 'Unakoti District Hospital',
    type: 'hospital',
    typeLabel: 'DISTRICT HOSPITAL',
    color: '#d93850',
    iconEmoji: '🏥',
    coords: [24.3120, 92.0220],
    distance: '1.4 km',
    eta: '4 mins via Sector Arterial Road',
    address: 'Kailashahar Main Road, Unakoti Sector',
    capacity: '120 Beds • ICU Trauma Center • 108 Ambulance Unit',
    contact: '108 / +91 3824 222234',
    status: 'Operational • 24x7 Emergency Care Active',
  },
  {
    id: 'fac-shelter-01',
    name: 'Kailashahar Town Hall Disaster Relief Shelter',
    type: 'shelter',
    typeLabel: 'EVACUATION SHELTER',
    color: '#059669',
    iconEmoji: '🏕️',
    coords: [24.3285, 92.0090],
    distance: '1.1 km',
    eta: '3 mins via High Elevation Ridge',
    address: 'Administrative Complex, Kailashahar, Unakoti',
    capacity: '650 Persons • Clean Drinking Water & Rations Staged',
    contact: '1077 (District Disaster Control)',
    status: 'Intake Active • High Ground Secure',
  },
  {
    id: 'fac-rescue-01',
    name: 'NDRF Sector Tactical Rescue Camp',
    type: 'rescue_camp',
    typeLabel: 'RESCUE BATTALION',
    color: '#d97706',
    iconEmoji: '🛡️',
    coords: [24.3050, 92.0310],
    distance: '2.5 km',
    eta: '7 mins via Bypass Corridor',
    address: 'NH-8 Bypass Junction, Unakoti',
    capacity: '4 Quick Reaction Rescue Teams • Heavy Evacuation Trucks',
    contact: '112 (Disaster Response Escort)',
    status: 'High Readiness • Patrols Deployed',
  },
  {
    id: 'fac-phc-01',
    name: 'PHC Unakoti Heritage Emergency Post',
    type: 'phc',
    typeLabel: 'FIRST AID / PHC',
    color: '#0284c7',
    iconEmoji: '⚕️',
    coords: [24.3260, 92.0250],
    distance: '0.9 km',
    eta: '2 mins via Heritage Access Gate',
    address: 'Archaeological Gate Sector, Unakoti',
    capacity: '30 Beds • Emergency First-Aid & Triage Post',
    contact: '+91 3824 222880',
    status: 'Operational • Emergency Triage Ready',
  },
];

export default function Analytics() {
  const { language } = useLanguage();
  const langKey = language === 'HIN' ? 'HI' : language === 'BEN' ? 'BN' : language === 'ASM' ? 'AS' : 'EN';
  const t = TRANSLATIONS[langKey] || TRANSLATIONS.EN;

  // AlertContext synchronization
  const alertCtx = useAlert();
  const activeAlert = alertCtx?.activeAlert || null;
  const liveRiskPercentage = alertCtx?.liveRiskPercentage !== undefined ? alertCtx.liveRiskPercentage : null;

  // Real-Time Telemetry States
  const [soilMoisture, setSoilMoisture] = useState(419);
  const [vibration, setVibration] = useState(0.02);
  const [riskPercentage, setRiskPercentage] = useState(31);
  const [currentTime, setCurrentTime] = useState('');
  const [smsLogs, setSmsLogs] = useState([]);

  // Selected Emergency Facility State for Active Route Display
  const [selectedFacilityId, setSelectedFacilityId] = useState('fac-hosp-01');
  const selectedFacility = UNAKOTI_FACILITIES.find((f) => f.id === selectedFacilityId) || UNAKOTI_FACILITIES[0];

  // Historical Arrays for Real-Time Charts
  const [historicalMoisture, setHistoricalMoisture] = useState([419, 410, 400, 390, 380, 370, 360, 350, 410, 400, 409]);
  const [historicalRainfall, setHistoricalRainfall] = useState([31.2, 32.1, 33.0, 34.5, 35.0, 36.2, 38.0, 40.1, 5.2, 5.5, 4.3]);
  const [historicalVibration, setHistoricalVibration] = useState([0.02, 0.02, 0.01, 0.02, 0.03, 0.08, 0.02, 0.02, 0.03, 0.02, 0.02]);
  const [chartLabels, setChartLabels] = useState([
    '11:59:16', '11:59:17', '11:59:18', '11:59:19', '11:59:20', '11:59:21', '11:59:22', '11:59:23', '11:59:24', '11:59:25', '11:59:27'
  ]);

  // Map References
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const heatzoneRectRef = useRef(null);
  const routeLayerRef = useRef(null);
  const facilityMarkersRef = useRef([]);

  const [targetCoords] = useState(UNAKOTI_NODE_COORDS);

  // Real-Time Clock
  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setCurrentTime(now.toUTCString().split(' ')[4] + ' UTC');
    };
    updateClock();
    const timer = setInterval(updateClock, 1000);
    return () => clearInterval(timer);
  }, []);

  // WebSocket Listener connected directly to FastAPI telemetry bus
  useEffect(() => {
    const clientId = 'front_analytics';
    const pythonWs = (ENV.PYTHON_WS_URL || 'ws://localhost:8000').replace(/\/+$/, '');
    const wsUrl = `${pythonWs}/ws/front/${clientId}`;
    let socket;

    try {
      socket = new WebSocket(wsUrl);

      socket.onopen = () => {
        const queryPayload = {
          type: 'INIT_QUERY',
          client_id: clientId,
          latitude: targetCoords.lat,
          longitude: targetCoords.lng,
          language: langKey,
          device_id: 'RAKSHAK_FRONTEND_01',
          status: 'READY',
        };
        try {
          socket.send(JSON.stringify(queryPayload));
        } catch {}
      };

      socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);

          if (data.type === 'PING') {
            try {
              socket.send(JSON.stringify({ type: 'PONG', status: 'ALIVE' }));
            } catch {}
            return;
          }

          if (data.type === 'TELEMETRY_UPDATE' || data.type === 'INIT_DATA') {
            const rawSoil = data.soil_moisture !== undefined ? parseFloat(data.soil_moisture) : null;
            const rawVib = data.vibration !== undefined ? parseFloat(data.vibration) : null;
            const rawRisk = data.risk_percentage !== undefined ? data.risk_percentage : null;

            if (rawSoil !== null) setSoilMoisture(Math.round(rawSoil));
            if (rawVib !== null) setVibration(rawVib);
            if (rawRisk !== null) setRiskPercentage(rawRisk);
            if (data.sms_logs) setSmsLogs(data.sms_logs);

            const timeStr = data.timestamp || new Date().toLocaleTimeString();

            if (rawSoil !== null) {
              const roundedSoil = Math.round(rawSoil);
              const rainfall = data.rainfall_rate || parseFloat(((485 - roundedSoil) * 0.056).toFixed(1));

              setHistoricalMoisture((prev) => [...prev.slice(-11), roundedSoil]);
              setHistoricalRainfall((prev) => [...prev.slice(-11), rainfall]);
            }
            if (rawVib !== null) {
              setHistoricalVibration((prev) => [...prev.slice(-11), rawVib]);
            }
            setChartLabels((prev) => [...prev.slice(-11), timeStr]);
          }
        } catch (err) {
          console.warn('[WS] Error parsing incoming WebSocket packet:', err);
        }
      };

      socket.onerror = () => {};
      socket.onclose = () => {};
    } catch (e) {
      console.warn('[WS] Could not initiate WebSocket connection.');
    }

    return () => {
      if (socket && socket.readyState === WebSocket.OPEN) socket.close();
    };
  }, [langKey, targetCoords]);

  // Fetch Street Geometry from OSRM with smooth offline fallback
  const fetchStreetRoute = async (start, end) => {
    try {
      const response = await fetch(
        `https://router.project-osrm.org/route/v1/driving/${start.lng},${start.lat};${end[1]},${end[0]}?overview=full&geometries=geojson`
      );
      const data = await response.json();
      if (data.routes && data.routes.length > 0) {
        return data.routes[0].geometry.coordinates.map((coord) => [coord[1], coord[0]]);
      }
    } catch (err) {
      console.warn('[OSRM] Error fetching street route:', err);
    }
    // High-fidelity road-like path fallback
    const midLat = (start.lat + end[0]) / 2;
    const midLng = (start.lng + end[1]) / 2;
    const offset = 0.0025;
    return [
      [start.lat, start.lng],
      [start.lat + (end[0] - start.lat) * 0.3, start.lng + (end[1] - start.lng) * 0.3 + offset],
      [midLat, midLng + offset * 0.7],
      [start.lat + (end[0] - start.lat) * 0.75, start.lng + (end[1] - start.lng) * 0.75 + offset * 0.3],
      [end[0], end[1]],
    ];
  };

  // Initialize Leaflet Map centered on Unakoti, Tripura (Clean styling, no external links or attribution)
  useEffect(() => {
    if (!document.getElementById('leaflet-css')) {
      const link = document.createElement('link');
      link.id = 'leaflet-css';
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);
    }

    if (!window.L) {
      const script = document.createElement('script');
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      script.async = true;
      script.onload = () => initMap();
      document.head.appendChild(script);
    } else {
      initMap();
    }

    function initMap() {
      if (!mapContainerRef.current || mapInstanceRef.current) return;

      const L = window.L;
      const { lat, lng } = targetCoords;

      const map = L.map(mapContainerRef.current, {
        center: [lat, lng],
        zoom: 13,
        zoomControl: true,
        attributionControl: false, // Disables all external attribution links on the map
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '',
        maxZoom: 18,
      }).addTo(map);

      // Render GIS Landslide Heatzone Mesh Box
      const bounds = [
        [lat - 0.012, lng - 0.015],
        [lat + 0.012, lng + 0.015],
      ];
      const heatzoneRect = L.rectangle(bounds, {
        color: '#10B981',
        weight: 1.5,
        fillColor: '#10B981',
        fillOpacity: 0.35,
      }).addTo(map);
      heatzoneRectRef.current = heatzoneRect;

      // Node Location Marker
      const customIcon = L.divIcon({
        className: 'custom-div-icon',
        html: `<div style="background-color:#EF4444; width:16px; height:16px; border-radius:50%; border:3px solid white; box-shadow:0 0 10px rgba(239,68,68,0.8);"></div>`,
        iconSize: [16, 16],
        iconAnchor: [8, 8],
      });

      const marker = L.marker([lat, lng], { icon: customIcon }).addTo(map);
      marker
        .bindPopup(
          `<div style="font-family:sans-serif; font-size:12px;">
            <b>Unakoti (Tripura) - Node 85</b><br/>
            Tripura Sector - KIO-TR-085<br/>
            Lat: ${lat} | Lng: ${lng}<br/>
            <span style="color:#10B981; font-weight:bold;">In-Situ Telemetry Station Active</span>
          </div>`
        )
        .openPopup();

      mapInstanceRef.current = map;
      setTimeout(() => map.invalidateSize(), 300);
    }
  }, [targetCoords]);

  // Unified Effective Risk calculation (synchronizes socket telemetry & AlertContext)
  const effectiveRisk = liveRiskPercentage !== null && liveRiskPercentage !== undefined
    ? Math.max(riskPercentage, liveRiskPercentage)
    : riskPercentage;

  // Critical threshold is set to 85 for all types of critical alerts and messages
  const isHighRisk = Boolean(activeAlert) || (soilMoisture !== null && soilMoisture < 200) || effectiveRisk >= 85;

  // Map Update Effect: When risk drops, completely purge all shelter markers and routes from map
  useEffect(() => {
    if (!mapInstanceRef.current || !window.L) return;
    const L = window.L;

    // 1. Update Heatzone Color
    if (heatzoneRectRef.current) {
      if (isHighRisk) {
        heatzoneRectRef.current.setStyle({
          color: '#d93850',
          fillColor: '#d93850',
          fillOpacity: 0.45,
        });
      } else {
        heatzoneRectRef.current.setStyle({
          color: '#10B981',
          fillColor: '#10B981',
          fillOpacity: 0.35,
        });
      }
    }

    // 2. Clean up existing facility markers
    facilityMarkersRef.current.forEach((marker) => {
      try {
        mapInstanceRef.current.removeLayer(marker);
      } catch {}
    });
    facilityMarkersRef.current = [];

    // 3. Clean up existing route layer
    if (routeLayerRef.current) {
      try {
        mapInstanceRef.current.removeLayer(routeLayerRef.current);
      } catch {}
      routeLayerRef.current = null;
    }

    // STRICT REQUIREMENT: When risk drops, remove all shelter info, markers, and routes
    if (!isHighRisk) {
      // Re-center on Unakoti node smoothly when hazard cleared
      try {
        mapInstanceRef.current.setView([targetCoords.lat, targetCoords.lng], 13);
      } catch {}
      return;
    }

    // 4. Render Facility Markers on Map during Active Alert
    const markers = [];
    UNAKOTI_FACILITIES.forEach((fac) => {
      const isSelected = fac.id === selectedFacilityId;
      const markerHtml = `
        <div style="
          background-color:${fac.color};
          width:${isSelected ? '30px' : '24px'};
          height:${isSelected ? '30px' : '24px'};
          border-radius:50%;
          border:3px solid white;
          box-shadow:0 0 ${isSelected ? '14px' : '8px'} ${fac.color};
          display:flex;
          align-items:center;
          justify-content:center;
          font-size:${isSelected ? '14px' : '12px'};
          cursor:pointer;
        ">
          ${fac.iconEmoji}
        </div>
      `;

      const icon = L.divIcon({
        className: 'emergency-facility-icon',
        html: markerHtml,
        iconSize: isSelected ? [30, 30] : [24, 24],
        iconAnchor: isSelected ? [15, 15] : [12, 12],
      });

      const m = L.marker(fac.coords, { icon }).addTo(mapInstanceRef.current);
      m.bindPopup(`
        <div style="font-family:sans-serif; font-size:12px; min-width:200px; padding:2px;">
          <div style="display:inline-block; font-size:9px; font-weight:900; text-transform:uppercase; color:white; background:${fac.color}; padding:1px 5px; border-radius:3px; margin-bottom:3px;">
            ${fac.typeLabel}
          </div>
          <div style="font-weight:900; font-size:13px; color:#0f172a; margin-bottom:2px;">
            ${fac.name}
          </div>
          <div style="color:#64748b; font-size:11px; margin-bottom:4px;">
            📍 ${fac.address}
          </div>
          <div style="font-weight:bold; font-size:11px; color:#0f172a; margin-bottom:2px;">
            Distance: <span style="color:${fac.color}; font-weight:900;">${fac.distance}</span> • ETA: ${fac.eta}
          </div>
          <div style="font-size:10px; color:#475569; margin-bottom:4px;">
            ⚡ ${fac.capacity}
          </div>
          <div style="padding-top:4px; border-top:1px solid #e2e8f0; font-size:10px; font-weight:bold; color:#15803d;">
            ● ${fac.status}
          </div>
        </div>
      `);

      m.on('click', () => {
        setSelectedFacilityId(fac.id);
      });

      markers.push(m);
    });
    facilityMarkersRef.current = markers;

    // 5. Draw Emergency Route to Selected Facility
    let isCancelled = false;
    async function updateEmergencyRoute() {
      const routeCoords = await fetchStreetRoute(targetCoords, selectedFacility.coords);
      if (isCancelled || !mapInstanceRef.current || !L) return;

      if (routeCoords && routeCoords.length > 0) {
        const routePolyline = L.polyline(routeCoords, {
          color: selectedFacility.color,
          weight: 4,
          opacity: 0.9,
          dashArray: '6, 6',
        }).addTo(mapInstanceRef.current);

        routePolyline.bindPopup(`
          <div style="font-family:sans-serif; font-size:11px;">
            <b>EMERGENCY EVACUATION CORRIDOR</b><br/>
            Destination: <b>${selectedFacility.name}</b> (${selectedFacility.distance})<br/>
            Status: Active Clear Route
          </div>
        `);
        routeLayerRef.current = routePolyline;

        try {
          const bounds = L.latLngBounds([
            [targetCoords.lat, targetCoords.lng],
            selectedFacility.coords,
          ]);
          mapInstanceRef.current.fitBounds(bounds, {
            padding: [35, 35],
            maxZoom: 14,
          });
        } catch {}
      }
    }

    updateEmergencyRoute();

    return () => {
      isCancelled = true;
    };
  }, [isHighRisk, selectedFacilityId, targetCoords]);

  // Facility Switcher Handler
  const handleSelectFacility = (facId) => {
    setSelectedFacilityId(facId);
    if (mapInstanceRef.current) {
      setTimeout(() => {
        mapInstanceRef.current.invalidateSize();
      }, 100);
    }
  };

  // Status Calculations
  const getStatusText = () => {
    if (isHighRisk) return t.statusCritical;
    if ((soilMoisture >= 200 && soilMoisture <= 250) || effectiveRisk >= 50) return t.statusModerate;
    return t.statusNominal;
  };

  const getStatusColor = () => {
    if (isHighRisk) return 'text-[#d93850] bg-rose-50 border-rose-300';
    if ((soilMoisture >= 200 && soilMoisture <= 250) || effectiveRisk >= 50) return 'text-amber-700 bg-amber-50 border-amber-300';
    return 'text-emerald-700 bg-emerald-50 border-emerald-300';
  };

  // Chart Configurations
  const moistureChartData = {
    labels: chartLabels,
    datasets: [
      {
        label: t.soilMoisture,
        data: historicalMoisture,
        borderColor: '#0284c7',
        backgroundColor: 'rgba(2, 132, 199, 0.12)',
        fill: true,
        tension: 0.35,
        borderWidth: 2,
        pointRadius: 2.5,
      },
    ],
  };

  const rainfallChartData = {
    labels: chartLabels,
    datasets: [
      {
        label: t.rainfall + ' (mm)',
        data: historicalRainfall,
        backgroundColor: '#2563eb',
        borderRadius: 2,
      },
    ],
  };

  const vibrationChartData = {
    labels: chartLabels,
    datasets: [
      {
        label: t.vibration,
        data: historicalVibration,
        borderColor: '#d93850',
        backgroundColor: 'rgba(217, 56, 80, 0.1)',
        fill: true,
        tension: 0.3,
        borderWidth: 2,
        pointRadius: 2,
      },
    ],
  };

  const moistureChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    animation: { duration: 300 },
    plugins: { legend: { display: false } },
    scales: {
      x: { grid: { color: '#f1f5f9' }, ticks: { color: '#64748b', font: { size: 10 } } },
      y: {
        min: 0,
        max: 600,
        grid: { color: '#f1f5f9' },
        ticks: { stepSize: 100, color: '#64748b', font: { size: 10 } },
      },
    },
  };

  const rainfallChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    animation: { duration: 300 },
    plugins: { legend: { display: false } },
    scales: {
      x: { grid: { color: '#f1f5f9' }, ticks: { color: '#64748b', font: { size: 10 } } },
      y: {
        min: 0,
        max: 80,
        grid: { color: '#f1f5f9' },
        ticks: { color: '#64748b', font: { size: 10 } },
      },
    },
  };

  const vibrationChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    animation: { duration: 300 },
    plugins: { legend: { display: false } },
    scales: {
      x: { grid: { color: '#f1f5f9' }, ticks: { color: '#64748b', font: { size: 10 } } },
      y: {
        min: 0.0,
        max: 1.0,
        grid: { color: '#f1f5f9' },
        ticks: { color: '#64748b', font: { size: 10 } },
      },
    },
  };

  const handleManualSmsTest = () => {
    const timeStr = new Date().toLocaleTimeString();
    setSmsLogs([
      {
        id: Date.now(),
        recipient: '+919830123456',
        type: 'Registered User',
        message: `CRITICAL ALERT: Geotechnical threshold breached! Landslide Risk: ${effectiveRisk}%`,
        time: timeStr,
      },
      {
        id: Date.now() + 1,
        recipient: '+919874987654',
        type: 'Sector Operator',
        message: `CRITICAL ALERT: Geotechnical threshold breached! Landslide Risk: ${effectiveRisk}%`,
        time: timeStr,
      },
    ]);
  };

  return (
    <div className="flex-1 flex flex-col h-full min-h-0 w-full bg-[#f4f6f8] overflow-y-auto p-4 sm:p-6 select-none font-sans">
      {/* PAGE HEADER MATCHING WEBSITE DESIGN SYSTEM */}
      <PageHeader
        title={t.title}
        subtitle={t.subtitle}
      >
        <div className="flex flex-wrap items-center gap-2">
          {/* Corridor Badge */}
          <div className="hidden lg:flex items-center gap-1.5 bg-white border border-[#cbd5e1] px-3 py-1.5 shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-cyan-600"></span>
            <span className="text-[11px] font-black uppercase tracking-wider text-slate-700">
              {t.corridor}
            </span>
          </div>

          {/* Sync Status Badge */}
          <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-300 text-emerald-800 px-3 py-1.5 shadow-2xs font-mono font-bold text-[11px]">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>{t.statusSynced}</span>
          </div>

          {/* Clock */}
          <div className="bg-white border border-[#cbd5e1] text-slate-700 font-mono font-bold px-3 py-1.5 text-[11px] shadow-2xs">
            {currentTime}
          </div>
        </div>
      </PageHeader>

      {/* MAIN CONTENT GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 pb-8">
        {/* LEFT COLUMN: GIS MAP & HISTORICAL GRAPHS (7 Cols) */}
        <div className="lg:col-span-7 flex flex-col gap-5">
          {/* GIS MAP CARD */}
          <div className="bg-white border border-[#cbd5e1] p-4 sm:p-5 shadow-xs">
            <div className="flex flex-wrap justify-between items-center gap-2 mb-3">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#0284c7]"></span>
                <h2 className="text-xs font-black tracking-wider text-[#1a1a1a] uppercase">{t.gisTitle}</h2>
                <span className="bg-emerald-50 text-emerald-800 text-[10px] font-black uppercase px-2 py-0.5 border border-emerald-300">
                  UNAKOTI NODE 85
                </span>
              </div>
              <div className="text-[11px] font-mono font-bold text-slate-500">
                Lat: {targetCoords.lat} | Lng: {targetCoords.lng}
              </div>
            </div>

            <div ref={mapContainerRef} className="w-full h-72 border border-[#cbd5e1] bg-slate-50 relative z-0" />

            {/* STRICT REQUIREMENT: Emergency Shelters, Hospitals & Routes ONLY visible when Alert is High Risk */}
            {isHighRisk && (
              <div className="mt-4 pt-3 border-t border-[#cbd5e1]">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-3 bg-rose-50 border border-rose-300 p-2.5">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#d93850] animate-ping"></span>
                    <div>
                      <h4 className="text-xs font-black uppercase tracking-wider text-[#d93850]">
                        EMERGENCY EVACUATION & RESCUE CORRIDORS (UNAKOTI SECTOR)
                      </h4>
                      <p className="text-[10px] text-rose-700 font-mono mt-0.5 font-bold">
                        Active Route: <span className="underline">{selectedFacility.name}</span> ({selectedFacility.distance} • {selectedFacility.eta})
                      </p>
                    </div>
                  </div>
                  <span className="text-[9px] font-black uppercase px-2 py-0.5 bg-[#d93850] text-white font-mono shadow-2xs">
                    CRITICAL ALERT PROTOCOL
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {UNAKOTI_FACILITIES.map((fac) => {
                    const isSelected = selectedFacilityId === fac.id;
                    return (
                      <div
                        key={fac.id}
                        className={`p-3 border transition-all ${
                          isSelected
                            ? 'bg-rose-50/60 border-rose-400 shadow-xs'
                            : 'bg-[#f8fafc] border-[#e2e8f0] hover:border-slate-400'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2 mb-1.5">
                          <div className="flex items-center gap-1.5 flex-1 min-w-0">
                            <span className="text-base shrink-0">{fac.iconEmoji}</span>
                            <div className="min-w-0">
                              <span
                                className="text-[9px] font-black uppercase px-1.5 py-0.2 font-mono text-white inline-block"
                                style={{ backgroundColor: fac.color }}
                              >
                                {fac.typeLabel}
                              </span>
                              <h5 className="text-xs font-black text-[#1a1a1a] uppercase mt-0.5 leading-snug truncate">
                                {fac.name}
                              </h5>
                            </div>
                          </div>
                          <span className="text-xs font-black font-mono px-2 py-0.5 bg-[#1a1a1a] text-[#f6d274] shrink-0">
                            {fac.distance}
                          </span>
                        </div>

                        <p className="text-[10px] text-slate-600 font-medium truncate">📍 {fac.address}</p>
                        <p className="text-[10px] text-slate-500 font-mono mt-0.5 truncate">⚡ {fac.capacity}</p>

                        <div className="mt-2 pt-2 border-t border-slate-200 flex items-center justify-between gap-2">
                          <div className="text-[9px] font-mono font-bold text-slate-600">
                            ETA: <span className="text-slate-900 font-black">{fac.eta}</span>
                          </div>
                          <button
                            onClick={() => handleSelectFacility(fac.id)}
                            className={`text-[10px] font-black uppercase px-2.5 py-1 transition-colors flex items-center gap-1 shrink-0 ${
                              isSelected
                                ? 'bg-[#d93850] text-white shadow-xs'
                                : 'bg-white hover:bg-slate-200 text-slate-700 border border-slate-300'
                            }`}
                          >
                            <span>{isSelected ? '✓ Route Active' : '🗺️ View Route'}</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* STABILIZED SOIL MOISTURE GRAPH */}
          <div className="bg-white border border-[#cbd5e1] p-4 sm:p-5 shadow-xs">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-xs font-black uppercase tracking-wider text-[#1a1a1a]">{t.soilMoisture} (ADC In-Situ Sensor)</h3>
              <span className="text-xs font-mono font-bold px-2 py-0.5 bg-sky-50 text-sky-800 border border-sky-200">
                {soilMoisture} ADC
              </span>
            </div>
            <div className="h-36 w-full">
              <Line data={moistureChartData} options={moistureChartOptions} />
            </div>
          </div>

          {/* SIMULATED RAINFALL GRAPH */}
          <div className="bg-white border border-[#cbd5e1] p-4 sm:p-5 shadow-xs">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-xs font-black uppercase tracking-wider text-[#1a1a1a]">{t.rainfall} (Micro-Precipitation)</h3>
              <span className="text-xs font-mono font-bold px-2 py-0.5 bg-blue-50 text-blue-800 border border-blue-200">
                {((485 - soilMoisture) * 0.056).toFixed(1)} mm/h
              </span>
            </div>
            <div className="h-36 w-full">
              <Bar data={rainfallChartData} options={rainfallChartOptions} />
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: METRICS, VIBRATION, CALIBRATION & SMS CONSOLE (5 Cols) */}
        <div className="lg:col-span-5 flex flex-col gap-5">
          {/* STATUS & RISK METRICS PANEL */}
          <div className="bg-white border border-[#cbd5e1] p-4 sm:p-5 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Overall Assessment</h3>
              <div className={`px-2.5 py-1 border text-[10px] font-black uppercase tracking-wider ${getStatusColor()}`}>
                {getStatusText()}
              </div>
            </div>

            <div className="flex items-baseline justify-between mb-4 bg-[#f8fafc] border border-slate-200 p-3 sm:p-4">
              <div>
                <span className="text-[10px] font-black uppercase text-slate-500 block mb-1">PROBABILITY LEVEL</span>
                <p className="text-xs text-slate-600 font-bold uppercase">{t.riskLevel}</p>
              </div>
              <div className="text-right">
                <span className={`text-4xl font-black font-mono tracking-tight ${
                  effectiveRisk >= 85 ? 'text-[#d93850]' : effectiveRisk >= 50 ? 'text-amber-600' : 'text-emerald-700'
                }`}>
                  {effectiveRisk}%
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-200 font-mono text-xs">
              <div className="bg-[#f8fafc] p-2.5 border border-slate-200">
                <p className="text-slate-500 text-[9px] font-black uppercase">SOIL MOISTURE</p>
                <p className="text-sm font-black text-slate-800 mt-0.5">{soilMoisture} ADC</p>
              </div>
              <div className="bg-[#f8fafc] p-2.5 border border-slate-200">
                <p className="text-slate-500 text-[9px] font-black uppercase">VIBRATION (0 - 1)</p>
                <p className="text-sm font-black text-slate-800 mt-0.5">{vibration}</p>
              </div>
            </div>
          </div>

          {/* LIVE VIBRATION SENSOR GRAPH */}
          <div className="bg-white border border-[#cbd5e1] p-4 sm:p-5 shadow-xs">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-xs font-black uppercase tracking-wider text-[#1a1a1a]">{t.vibration}</h3>
              <span className="text-xs font-mono font-bold px-2 py-0.5 bg-rose-50 text-rose-800 border border-rose-200">
                {vibration}
              </span>
            </div>
            <div className="h-36 w-full">
              <Line data={vibrationChartData} options={vibrationChartOptions} />
            </div>
          </div>

          {/* SOIL MOISTURE CALIBRATION GUIDE */}
          <div className="bg-white border border-[#cbd5e1] p-4 sm:p-5 shadow-xs">
            <h3 className="text-xs font-black uppercase tracking-wider text-[#1a1a1a] mb-3">{t.guideTitle}</h3>
            <ul className="space-y-2 text-xs font-medium">
              <li className="flex items-center gap-2 p-2 bg-rose-50 text-rose-900 border border-rose-200">
                <span className="w-2.5 h-2.5 rounded-full bg-[#d93850] shrink-0"></span>
                <span className="text-[11px] font-bold">{t.guideWet}</span>
              </li>
              <li className="flex items-center gap-2 p-2 bg-amber-50 text-amber-900 border border-amber-200">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shrink-0"></span>
                <span className="text-[11px] font-bold">{t.guideMod}</span>
              </li>
              <li className="flex items-center gap-2 p-2 bg-emerald-50 text-emerald-900 border border-emerald-200">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 shrink-0"></span>
                <span className="text-[11px] font-bold">{t.guideNorm}</span>
              </li>
            </ul>
          </div>

          {/* SMS EARLY WARNING CONSOLE */}
          <div
            className={`border p-4 sm:p-5 shadow-xs transition-all ${
              isHighRisk ? 'bg-white border-rose-300 ring-1 ring-rose-200' : 'bg-white border-[#cbd5e1]'
            }`}
          >
            <div className="flex justify-between items-center mb-3">
              <div className="flex items-center gap-2">
                <span className={`w-2.5 h-2.5 rounded-full ${isHighRisk ? 'bg-[#d93850] animate-ping' : 'bg-slate-400'}`}></span>
                <h3 className="text-xs font-black uppercase tracking-wider text-[#1a1a1a]">{t.smsConsoleTitle}</h3>
              </div>
              {isHighRisk && (
                <button
                  onClick={handleManualSmsTest}
                  className="text-[10px] bg-[#d93850] hover:bg-[#b8273d] text-white font-black uppercase px-2.5 py-1 tracking-wider transition-colors shadow-2xs"
                >
                  {t.sendTestSms}
                </button>
              )}
            </div>

            {isHighRisk ? (
              <div className="space-y-2 font-mono text-xs">
                {smsLogs.length > 0 ? (
                  smsLogs.map((log) => (
                    <div
                      key={log.id || Math.random()}
                      className="p-2.5 border bg-rose-50/70 border-rose-200 text-slate-800 space-y-1"
                    >
                      <div className="flex justify-between font-bold text-[11px]">
                        <span className="text-rose-700 uppercase font-black">{log.type}</span>
                        <span className="text-slate-500">{log.time || log.timestamp}</span>
                      </div>
                      <p className="text-[11px] font-bold text-slate-700">
                        Recipient: <span className="font-mono text-slate-900">{log.recipient}</span>
                      </p>
                      <p className="text-[10px] text-slate-600 bg-white p-1.5 border border-rose-100 font-mono">
                        {log.message}
                      </p>
                    </div>
                  ))
                ) : (
                  <div className="space-y-2">
                    <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-800">
                      <p className="font-bold text-[11px] uppercase">{t.smsSendingReg}</p>
                      <p className="text-[10px] text-rose-700 font-mono mt-0.5">CRITICAL: Landslide hazard threshold exceeded (≥ 85%).</p>
                    </div>
                    <div className="p-2.5 bg-amber-50 border border-amber-200 text-amber-800">
                      <p className="font-bold text-[11px] uppercase">{t.smsSendingUnreg}</p>
                      <p className="text-[10px] text-amber-700 font-mono mt-0.5">ADVISORY: Evacuation routes mapped and broadcasted.</p>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-4 border border-dashed border-slate-300 text-center text-slate-500 text-xs font-bold uppercase tracking-wide">
                {t.smsDisabledMsg}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}