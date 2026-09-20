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
    title: 'RAKSHAK',
    subtitle: 'Landslide Risk & Soil Moisture Monitoring Platform',
    statusSynced: 'GEO-MESH: SYNCHRONIZED',
    corridor: 'SELECTED CORRIDOR: NH-54 (AIZWAL REGION)',
    gisTitle: 'SURFACE GIS MAP & HEATZONE',
    soilMoisture: 'Soil Moisture',
    rainfall: 'Simulated Rainfall',
    vibration: 'Vibration Sensor (0 - 1)',
    riskLevel: 'Landslide Risk Level',
    smsConsoleTitle: 'SMS EARLY WARNING DISPATCH CONSOLE',
    smsDisabledMsg: 'SMS Dispatch Standby (Risk level nominal. Activated when Risk > 50% or Moisture < 200)',
    smsSendingReg: 'Sending SMS to registered user +919830XXXXXX...',
    smsSendingUnreg: 'Sending SMS to unregistered user +919874XXXXXX...',
    guideTitle: 'SOIL MOISTURE CALIBRATION GUIDE',
    guideWet: '< 200: Very Risky & Wet Soil (Critical Alert)',
    guideMod: '200 - 250: Moderate Risk Soil (Watch State)',
    guideNorm: '> 250: Normal Soil (Stable Baseline)',
    fastapiModalTitle: 'FastAPI Backend WebSocket Integration Snippet',
    copySnippet: 'Copy Endpoint Code',
    copied: 'Copied!',
    close: 'Close',
    viewEndpoint: 'View FastAPI Endpoint Code',
    sendTestSms: 'Send Manual SMS Broadcast',
    statusNominal: 'Nominal Stability',
    statusModerate: 'Moderate Caution',
    statusCritical: 'Critical Hazard Warning',
  },
  HI: {
    title: 'रक्षक',
    subtitle: 'भूस्खलन जोखिम और मिट्टी की नमी निगरानी मंच',
    statusSynced: 'जियो-मेष: समन्वयित',
    corridor: 'चयनित गलियारा: एनएच-54 (आइज़ोल क्षेत्र)',
    gisTitle: 'सतह जीआईएस मानचित्र एवं हीटज़ोन',
    soilMoisture: 'मिट्टी की नमी',
    rainfall: 'सिमुलेटेड वर्षा',
    vibration: 'कंपन सेंसर (0 - 1)',
    riskLevel: 'भूस्खलन जोखिम स्तर',
    smsConsoleTitle: 'एसएमएस पूर्व चेतावनी प्रेषण कंसोल',
    smsDisabledMsg: 'एसएमएस प्रेषण स्टैंडबाय (जोखिम सामान्य है। जोखिम > 50% या नमी < 200 होने पर सक्रिय)',
    smsSendingReg: 'पंजीकृत उपयोगकर्ता +919830XXXXXX को एसएमएस भेजा जा रहा है...',
    smsSendingUnreg: 'गैर-पंजीकृत उपयोगकर्ता +919874XXXXXX को एसएमएस भेजा जा रहा है...',
    guideTitle: 'मिट्टी की नमी अंशांकन गाइड',
    guideWet: '< 200: बहुत जोखिम भरी और गीली मिट्टी (गंभीर चेतावनी)',
    guideMod: '200 - 250: मध्यम जोखिम वाली मिट्टी (निगरानी स्थिति)',
    guideNorm: '> 250: सामान्य मिट्टी (स्थिर)',
    fastapiModalTitle: 'फास्टएपीआई बैकएंड वेबसॉकेट कोड',
    copySnippet: 'कोड कॉपी करें',
    copied: 'कॉपी हो गया!',
    close: 'बंद करें',
    viewEndpoint: 'फास्टएपीआई एंडपॉइंट कोड देखें',
    sendTestSms: 'मैनुअल एसएमएस टेस्ट भेजें',
    statusNominal: 'सामान्य स्थिरता',
    statusModerate: 'मध्यम सावधानी',
    statusCritical: 'गंभीर खतरा चेतावनी',
  },
  BN: {
    title: 'রক্ষক',
    subtitle: 'ভূমিধস ঝুঁকি ও মাটির আর্দ্রতা পর্যবেক্ষণ প্ল্যাটফর্ম',
    statusSynced: 'জিও-মেশ: সিঙ্ক্রোনাইজড',
    corridor: 'নির্বাচিত করিডোর: NH-54 (আইজল অঞ্চল)',
    gisTitle: 'সারফেস জিআইএস মানচিত্র এবং হিট জোন',
    soilMoisture: 'মাটির আর্দ্রতা',
    rainfall: 'সিমুলেটেড বৃষ্টিপাত',
    vibration: 'কম্পন সেন্সর (0 - 1)',
    riskLevel: 'ভূমিধসের ঝুঁকির স্তর',
    smsConsoleTitle: 'এসএমএস সতর্কবার্তা প্রেরণ কনসোল',
    smsDisabledMsg: 'এসএমএস প্রেরণ স্ট্যান্ডবাই (ঝুঁকি স্বাভাবিক। ঝুঁকি > ৫০% বা আর্দ্রতা < ২০০ হলে সক্রিয় হয়)',
    smsSendingReg: 'নিবন্ধিত ব্যবহারকারী +919830XXXXXX কে এসএমএস পাঠানো হচ্ছে...',
    smsSendingUnreg: 'অনিবন্ধিত ব্যবহারকারী +919874XXXXXX কে এসএমএস পাঠানো হচ্ছে...',
    guideTitle: 'মাটির আর্দ্রতা ক্যালিব্রেশন গাইড',
    guideWet: '< ২০০: অত্যন্ত ঝুঁকিপূর্ণ এবং ভেজা মাটি (জরুরি সতর্কতা)',
    guideMod: '২০০ - ২৫০: মাঝারি ঝুঁকিপূর্ণ মাটি (পর্যবেক্ষণ অবস্থা)',
    guideNorm: '> ২৫০: স্বাভাবিক মাটি (স্থিতিশীল)',
    fastapiModalTitle: 'ফাস্ট-এপিআই ব্যাকএন্ড ওয়েবসকেট কোড',
    copySnippet: 'কোড কপি করুন',
    copied: 'কপি হয়েছে!',
    close: 'বন্ধ করুন',
    viewEndpoint: 'ফাস্ট-এপিআই এন্ডপয়েন্ট দেখুন',
    sendTestSms: 'ম্যানুয়াল এসএমএস টেস্ট পাঠান',
    statusNominal: 'স্বাভাবিক স্থিতিশীলতা',
    statusModerate: 'মাঝারি সতর্কতা',
    statusCritical: 'গুরুতর বিপদ সতর্কতা',
  },
  AS: {
    title: 'ৰক্ষক',
    subtitle: 'ভূমিস্খলন বিপশংকা আৰু মাটিৰ আৰ্দ্ৰতা নিৰীক্ষণ মঞ্চ',
    statusSynced: 'জিঅ’-মেছ: সংমিশ্ৰিত',
    corridor: 'নিৰ্বাচিত কৰিডৰ: NH-54 (আইজল অঞ্চল)',
    gisTitle: 'পৃষ্ঠ জিআইএছ মানচিত্ৰ আৰু হিট জ’ন',
    soilMoisture: 'মাটিৰ আৰ্দ্ৰতা',
    rainfall: 'কৃত্ৰিম বৃষ্টিপাত',
    vibration: 'কম্পন সংবেদক (0 - 1)',
    riskLevel: 'ভূমিস্খলনৰ বিপশংকাসূচক মাত্ৰা',
    smsConsoleTitle: 'এছএমএছ আগতীয়া সকীয়ানী প্ৰেৰণ কনচোল',
    smsDisabledMsg: 'এছএমএছ প্ৰেৰণ নিষ্ক্ৰিয় (বিপদ স্বাভাৱিক। বিপদ > ৫০% বা আৰ্দ্ৰতা < ২০০ হ’লে সক্ৰিয় হ’ব)',
    smsSendingReg: 'পঞ্জীয়নভুক্ত ব্যৱহাৰকাৰী +919830XXXXXX লৈ এসএমএছ প্ৰেৰণ কৰা হৈছে...',
    smsSendingUnreg: 'অপঞ্জীয়নভুক্ত ব্যৱহাৰকাৰী +919874XXXXXX লৈ এসএমএছ প্ৰেৰণ কৰা হৈছে...',
    guideTitle: 'মাটিৰ আৰ্দ্ৰতা মাপকাঠী নিৰ্দেশিকা',
    guideWet: '< ২০০: অতি বিপদসংকুল আৰু সেমেকা মাটি (জৰুৰী সকীয়ানী)',
    guideMod: '২০০ - ২৫০: মধ্যম বিপশংকাৰ মাটি (নিৰীক্ষণ অৱস্থা)',
    guideNorm: '> ২৫০: স্বাভাৱিক মাটি (সুৰক্ষিত)',
    fastapiModalTitle: 'ফাষ্ট-এপিআই ব্যাকএণ্ড ৱেবছকেট ক’ড',
    copySnippet: 'ক’ড কপি কৰক',
    copied: 'কপি হ’ল!',
    close: 'বন্ধ কৰক',
    viewEndpoint: 'ফাষ্ট-এপিআই এণ্ডপইণ্ট ক’ড চাওক',
    sendTestSms: 'মেনুৱেল এসএমএছ পৰীক্ষা প্ৰেৰণ কৰক',
    statusNominal: 'স্বাভাৱিক স্থিৰতা',
    statusModerate: 'মধ্যম সাৱধানতা',
    statusCritical: 'গুৰুতৰ বিপদৰ সকীয়ানী',
  },
};

export default function Analytics() {
  const [selectedLang, setSelectedLang] = useState('EN');
  const t = TRANSLATIONS[selectedLang] || TRANSLATIONS.EN;

  // Real-Time Telemetry States
  const [soilMoisture, setSoilMoisture] = useState(450);
  const [vibration, setVibration] = useState(0.08);
  const [riskPercentage, setRiskPercentage] = useState(12);
  const [currentTime, setCurrentTime] = useState('');
  const [smsLogs, setSmsLogs] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [blipActive, setBlipActive] = useState(true);

  // Historical Arrays for Real-Time Charts (Fixed buffer length)
  const [historicalMoisture, setHistoricalMoisture] = useState([450]);
  const [historicalRainfall, setHistoricalRainfall] = useState([54.0]);
  const [historicalVibration, setHistoricalVibration] = useState([0.08]);
  const [chartLabels, setChartLabels] = useState([new Date().toLocaleTimeString()]);

  // Map References
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const polygonRef = useRef(null);
  const markerRef = useRef(null);

  // Default to Unakoti ADM5-Node 85 (Tripura) if not set in localStorage
  const [targetCoords, setTargetCoords] = useState({ lat: 23.7548, lng: 92.4273 });

  // 1. Fetch Location Coordinates
  useEffect(() => {
    const storedLat = parseFloat(localStorage.getItem('latitude'));
    const storedLng = parseFloat(localStorage.getItem('longitude'));

    if (!isNaN(storedLat) && !isNaN(storedLng)) {
      setTargetCoords({ lat: storedLat, lng: storedLng });
    } else {
      setTargetCoords({ lat: 23.7548, lng: 92.4273 });
    }
  }, []);

  // 2. Real-Time Clock
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setCurrentTime(now.toUTCString().split(' ')[4] + ' UTC');
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // 3. WebSocket Listener
  useEffect(() => {
    const clientId = 'front_1';
    const pythonWs = (ENV.PYTHON_WS_URL || 'ws://localhost:8000').replace(/\/+$/, '');
    const wsUrl = `${pythonWs}/ws/front/${clientId}`;
    let socket;

    try {
      socket = new WebSocket(wsUrl);

      socket.onopen = () => {
        console.log('[WS] Connected to FastAPI backend');
        const queryPayload = {
          type: 'INIT_QUERY',
          client_id: clientId,
          latitude: targetCoords.lat,
          longitude: targetCoords.lng,
          language: selectedLang,
          device_id: 'RAKSHAK_FRONTEND_01',
          status: 'READY',
        };
        socket.send(JSON.stringify(queryPayload));
      };

      socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);

          if (data.type === 'PING') {
            socket.send(JSON.stringify({ type: 'PONG', status: 'ALIVE' }));
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

            // Append live server data with max 12 sliding data points
            if (rawSoil !== null) {
              const roundedSoil = Math.round(rawSoil);
              const rainfall = data.rainfall_rate || parseFloat((roundedSoil * 0.12).toFixed(1));

              setHistoricalMoisture((prev) => [...prev.slice(-11), roundedSoil]);
              setHistoricalRainfall((prev) => [...prev.slice(-11), rainfall]);
            }
            if (rawVib !== null) {
              setHistoricalVibration((prev) => [...prev.slice(-11), rawVib]);
            }
            setChartLabels((prev) => [...prev.slice(-11), timeStr]);
          }
        } catch (err) {
          console.error('[WS] Error parsing incoming WebSocket packet:', err);
        }
      };

      socket.onerror = (err) => console.warn('[WS] WebSocket Error:', err);
      socket.onclose = () => console.log('[WS] Connection closed');
    } catch (e) {
      console.warn('[WS] Could not initiate WebSocket connection.');
    }

    return () => {
      if (socket && socket.readyState === WebSocket.OPEN) socket.close();
    };
  }, [selectedLang, targetCoords]);

  // 4. Initialize Leaflet Map
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
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 18,
      }).addTo(map);

      const towerName = localStorage.getItem('towerName') || 'Unakoti ADM5-Node 85';

      const customIcon = L.divIcon({
        className: 'custom-tower-blip-icon',
        html: `
          <div style="position:relative; width:48px; height:48px; display:flex; align-items:center; justify-content:center;">
            ${blipActive ? '<div style="position:absolute; width:42px; height:42px; border-radius:50%; border:2.5px solid #EF4444; animation: ping 1.6s cubic-bezier(0, 0, 0.2, 1) infinite; opacity:0.85;"></div>' : ''}
            <div style="position:relative; z-index:10; background:#EF4444; width:26px; height:26px; border-radius:50%; border:2.5px solid white; box-shadow:0 0 10px rgba(239,68,68,0.7); display:flex; align-items:center; justify-content:center; color:white; font-size:12px;">🗼</div>
          </div>
        `,
        iconSize: [48, 48],
        iconAnchor: [24, 24],
      });

      const marker = L.marker([lat, lng], { icon: customIcon }).addTo(map);
      marker.bindPopup(`
        <div style="font-family:sans-serif; padding:2px;">
          <b style="font-size:13px; color:#0f172a;">${towerName}</b><br/>
          <span style="font-size:10px; color:#64748b;">Tripura Sector • KIO-TR-085</span><br/>
          <span style="font-size:10px; font-family:monospace; color:#0284c7;">Lat: ${lat.toFixed(4)}, Lng: ${lng.toFixed(4)}</span><br/>
          <span style="font-size:10px; color:#10B981; font-weight:bold;">● In-Situ Telemetry Station Active</span>
        </div>
      `).openPopup();
      markerRef.current = marker;

      const delta = 0.025;
      const polygonCoords = [
        [lat + delta, lng - delta],
        [lat + delta, lng + delta],
        [lat - delta, lng + delta],
        [lat - delta, lng - delta],
      ];

      const polygon = L.polygon(polygonCoords, {
        color: '#10B981',
        fillColor: '#10B981',
        fillOpacity: 0.35,
        weight: 2,
      }).addTo(map);

      polygonRef.current = polygon;
      mapInstanceRef.current = map;

      setTimeout(() => map.invalidateSize(), 300);
    }
  }, [targetCoords]);

  // Update marker blip on toggle
  useEffect(() => {
    if (markerRef.current && window.L) {
      const isBlipOn = blipActive;
      const newIcon = window.L.divIcon({
        className: 'custom-tower-blip-icon',
        html: `
          <div style="position:relative; width:48px; height:48px; display:flex; align-items:center; justify-content:center;">
            ${isBlipOn ? '<div style="position:absolute; width:42px; height:42px; border-radius:50%; border:2.5px solid #EF4444; animation: ping 1.6s cubic-bezier(0, 0, 0.2, 1) infinite; opacity:0.85;"></div>' : ''}
            <div style="position:relative; z-index:10; background:#EF4444; width:26px; height:26px; border-radius:50%; border:2.5px solid white; box-shadow:0 0 10px rgba(239,68,68,0.7); display:flex; align-items:center; justify-content:center; color:white; font-size:12px;">🗼</div>
          </div>
        `,
        iconSize: [48, 48],
        iconAnchor: [24, 24],
      });
      markerRef.current.setIcon(newIcon);
    }
  }, [blipActive]);

  // 5. Heatmap Polygon Updates
  useEffect(() => {
    if (!polygonRef.current) return;

    let strokeColor = '#10B981';
    let fillColor = '#10B981';

    if (soilMoisture < 200) {
      strokeColor = '#EF4444';
      fillColor = '#EF4444';
    } else if (soilMoisture >= 200 && soilMoisture <= 250) {
      strokeColor = '#F59E0B';
      fillColor = '#F59E0B';
    }

    polygonRef.current.setStyle({
      color: strokeColor,
      fillColor: fillColor,
      fillOpacity: 0.4,
    });
  }, [soilMoisture]);

  // Status Calculations
  const isHighRisk = soilMoisture < 200 || riskPercentage > 85;

  const getStatusText = () => {
    if (soilMoisture < 200 || riskPercentage > 50) return t.statusCritical;
    if (soilMoisture >= 200 && soilMoisture <= 250) return t.statusModerate;
    return t.statusNominal;
  };

  const getStatusColor = () => {
    if (soilMoisture < 200 || riskPercentage > 50) return 'text-red-600 bg-red-100 border-red-300';
    if (soilMoisture >= 200 && soilMoisture <= 250) return 'text-amber-600 bg-amber-100 border-amber-300';
    return 'text-emerald-700 bg-emerald-100 border-emerald-300';
  };

  // Chart Configurations
  const moistureChartData = {
    labels: chartLabels,
    datasets: [
      {
        label: t.soilMoisture,
        data: historicalMoisture,
        borderColor: '#0284C7',
        backgroundColor: 'rgba(2, 132, 199, 0.15)',
        fill: true,
        tension: 0.4, // Smoother line curve
        borderWidth: 2,
        pointRadius: 3,
      },
    ],
  };

  const rainfallChartData = {
    labels: chartLabels,
    datasets: [
      {
        label: t.rainfall + ' (mm)',
        data: historicalRainfall,
        backgroundColor: '#3B82F6',
        borderRadius: 4,
      },
    ],
  };

  const vibrationChartData = {
    labels: chartLabels,
    datasets: [
      {
        label: t.vibration,
        data: historicalVibration,
        borderColor: '#E11D48',
        backgroundColor: 'rgba(225, 29, 72, 0.1)',
        fill: true,
        tension: 0.3,
        borderWidth: 2,
        pointRadius: 2,
      },
    ],
  };

  // FIXED Y-AXIS CHART OPTIONS TO PREVENT GRAPH FLUTTERING/JUMPING
  const moistureChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    animation: { duration: 300 }, // Smooth transition
    plugins: {
      legend: { display: false },
    },
    scales: {
      x: { grid: { color: '#E2E8F0' }, ticks: { color: '#64748B', font: { size: 10 } } },
      y: {
        min: 0,
        max: 600, // FIXED AXIS BOUNDS
        grid: { color: '#E2E8F0' },
        ticks: { stepSize: 100, color: '#64748B', font: { size: 10 } },
      },
    },
  };

  const rainfallChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    animation: { duration: 300 },
    plugins: { legend: { display: false } },
    scales: {
      x: { grid: { color: '#E2E8F0' }, ticks: { color: '#64748B', font: { size: 10 } } },
      y: {
        min: 0,
        max: 80, // FIXED AXIS BOUNDS
        grid: { color: '#E2E8F0' },
        ticks: { color: '#64748B', font: { size: 10 } },
      },
    },
  };

  const vibrationChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    animation: { duration: 300 },
    plugins: { legend: { display: false } },
    scales: {
      x: { grid: { color: '#E2E8F0' }, ticks: { color: '#64748B', font: { size: 10 } } },
      y: {
        min: 0.0,
        max: 1.0, // FIXED AXIS BOUNDS
        grid: { color: '#E2E8F0' },
        ticks: { color: '#64748B', font: { size: 10 } },
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
        message: `TEST ALERT: Manual trigger executed. Landslide Risk Level: ${riskPercentage}%`,
        time: timeStr,
      },
      {
        id: Date.now() + 1,
        recipient: '+919874987654',
        type: 'Unregistered User',
        message: `TEST ALERT: Manual trigger executed. Landslide Risk Level: ${riskPercentage}%`,
        time: timeStr,
      },
    ]);
  };

  const copyCodeToClipboard = () => {
    navigator.clipboard.writeText('// FastAPI backend snippet');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="h-full w-full overflow-y-auto bg-slate-100 text-slate-800 font-sans p-4 md:p-6">
      {/* TOP HEADER */}
      <header className="mb-6 bg-white rounded-xl p-4 shadow-sm border border-slate-200 flex flex-wrap justify-between items-center gap-4">
        <div className="flex items-center gap-3">
          <img
            src="/favicon.ico"
            alt="RAKSHAK Icon"
            className="w-9 h-9 object-contain"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="%230284c7"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3l8 18H4L12 3z"/></svg>';
            }}
          />
          <div>
            <h1 className="text-2xl font-black tracking-wider text-slate-900">{t.title}</h1>
            <p className="text-xs text-slate-500 font-medium">{t.subtitle}</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4 text-xs font-mono">
          <div className="hidden lg:block text-slate-600 bg-slate-100 px-3 py-1.5 rounded-md border border-slate-200">
            {t.corridor}
          </div>
          <div className="flex items-center gap-2 bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-md border border-emerald-200">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            {t.statusSynced}
          </div>
          <div className="text-slate-500 font-semibold">{currentTime}</div>

          <select
            value={selectedLang}
            onChange={(e) => setSelectedLang(e.target.value)}
            className="bg-slate-50 border border-slate-300 text-slate-800 text-xs font-sans rounded-md px-2.5 py-1.5 focus:ring-2 focus:ring-sky-500 outline-none cursor-pointer font-bold"
          >
            <option value="EN">English</option>
            <option value="HI">हिंदी (Hindi)</option>
            <option value="BN">বাংলা (Bengali)</option>
            <option value="AS">অসমীয়া (Assamese)</option>
          </select>

          
        </div>
      </header>

      {/* MAIN CONTENT GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT COLUMN: GIS MAP & HISTORICAL GRAPHS (7 Cols) */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          {/* GIS MAP CARD */}
          <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200">
            <div className="flex flex-wrap justify-between items-center gap-2 mb-3">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-sky-600"></span>
                <h2 className="text-sm font-bold tracking-wide text-slate-800 uppercase">{t.gisTitle}</h2>
                <span className="text-[10px] font-black uppercase px-2 py-0.5 bg-emerald-100 text-emerald-800 border border-emerald-300 rounded flex items-center gap-1">
                  <span>🗼</span>
                  <span>Unakoti Node 85</span>
                </span>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setBlipActive(!blipActive)}
                  className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded border transition-colors cursor-pointer ${
                    blipActive
                      ? 'bg-red-50 text-[#d93850] border-red-300 shadow-2xs'
                      : 'bg-slate-100 text-slate-500 border-slate-300'
                  }`}
                  title="Toggle Tower Radar Pulse Blip"
                >
                  {blipActive ? '📡 Radar Blip: ON' : '📡 Radar Blip: OFF'}
                </button>
                <div className="text-xs text-slate-500 font-mono">
                  Lat: {targetCoords.lat.toFixed(4)} | Lng: {targetCoords.lng.toFixed(4)}
                </div>
              </div>
            </div>

            <div
              ref={mapContainerRef}
              className="w-full h-80 rounded-lg border border-slate-200 z-0 bg-slate-50"
            />
          </div>

          {/* STABILIZED SOIL MOISTURE GRAPH */}
          <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-sm font-bold text-slate-800">{t.soilMoisture} (Stabilized Sensor Values)</h3>
              <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-sky-100 text-sky-800">
                {soilMoisture}
              </span>
            </div>
            <div className="h-44">
              <Line data={moistureChartData} options={moistureChartOptions} />
            </div>
          </div>

          {/* SIMULATED RAINFALL GRAPH */}
          <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-sm font-bold text-slate-800">
                {t.rainfall} 
              </h3>
              <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-blue-100 text-blue-800">
                {((485 - soilMoisture )* 0.056).toFixed(1)} mm/h
              </span>
            </div>
            <div className="h-44">
              <Bar data={rainfallChartData} options={rainfallChartOptions} />
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: METRICS, VIBRATION, CALIBRATION & SMS CONSOLE (5 Cols) */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          {/* STATUS & RISK METRICS PANEL */}
          <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-200">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Overall Assessment</h3>
            <div className="flex items-center justify-between mb-4">
              <div className={`px-3 py-1.5 rounded-lg border text-xs font-bold ${getStatusColor()}`}>
                {getStatusText()}
              </div>
              <div className="text-right">
                <span className="text-3xl font-black text-slate-900">{riskPercentage}%</span>
                <p className="text-[10px] text-slate-500 font-medium">{t.riskLevel}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-100 font-mono text-xs">
              <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                <p className="text-slate-500 text-[10px]">SOIL MOISTURE</p>
                <p className="text-base font-bold text-slate-800">{soilMoisture}</p>
              </div>
              <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                <p className="text-slate-500 text-[10px]">VIBRATION (0-1)</p>
                <p className="text-base font-bold text-slate-800">{vibration}</p>
              </div>
            </div>
          </div>

          {/* LIVE VIBRATION SENSOR GRAPH */}
          <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-sm font-bold text-slate-800">{t.vibration}</h3>
              <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-rose-100 text-rose-800">
                {vibration}
              </span>
            </div>
            <div className="h-40">
              <Line data={vibrationChartData} options={vibrationChartOptions} />
            </div>
          </div>

          {/* SOIL MOISTURE CALIBRATION GUIDE */}
          <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">{t.guideTitle}</h3>
            <ul className="space-y-2 text-xs font-medium">
              <li className="flex items-center gap-2 p-2 rounded bg-red-50 text-red-800 border border-red-100">
                <span className="w-2.5 h-2.5 rounded-full bg-red-600 shrink-0"></span>
                {t.guideWet}
              </li>
              <li className="flex items-center gap-2 p-2 rounded bg-amber-50 text-amber-800 border border-amber-100">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shrink-0"></span>
                {t.guideMod}
              </li>
              <li className="flex items-center gap-2 p-2 rounded bg-emerald-50 text-emerald-800 border border-emerald-100">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 shrink-0"></span>
                {t.guideNorm}
              </li>
            </ul>
          </div>

          {/* SMS EARLY WARNING CONSOLE */}
          <div
            className={`rounded-xl p-4 shadow-sm border transition-all ${
              isHighRisk ? 'bg-white border-red-300 ring-2 ring-red-100' : 'bg-slate-50 border-slate-200 opacity-70'
            }`}
          >
            <div className="flex justify-between items-center mb-3">
              <div className="flex items-center gap-2">
                <span className={`w-2.5 h-2.5 rounded-full ${isHighRisk ? 'bg-red-600 animate-ping' : 'bg-slate-400'}`}></span>
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wide">{t.smsConsoleTitle}</h3>
              </div>
              {isHighRisk && (
                <button
                  onClick={handleManualSmsTest}
                  className="text-[10px] bg-red-600 hover:bg-red-700 text-white font-bold px-2 py-1 rounded transition-colors"
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
                      className="p-2.5 rounded border bg-red-50 border-red-200 text-slate-800 space-y-1"
                    >
                      <div className="flex justify-between font-bold text-[11px]">
                        <span className="text-red-700">{log.type}</span>
                        <span className="text-slate-500">{log.time || log.timestamp}</span>
                      </div>
                      <p className="text-[11px] font-semibold">
                        Recipient: <span className="underline">{log.recipient}</span>
                      </p>
                      <p className="text-[10px] text-slate-600 bg-white p-1.5 rounded border border-red-100">
                        {log.message}
                      </p>
                    </div>
                  ))
                ) : (
                  <div className="space-y-2">
                    <div className="p-2 rounded bg-red-50 border border-red-200 text-red-800">
                      <p className="font-bold">{t.smsSendingReg}</p>
                      <p className="text-[10px] text-red-600">ALERT: High soil moisture risk detected.</p>
                    </div>
                    <div className="p-2 rounded bg-orange-50 border border-orange-200 text-orange-800">
                      <p className="font-bold">{t.smsSendingUnreg}</p>
                      <p className="text-[10px] text-orange-600">WARNING: Mandatory evacuation notice issued.</p>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-4 rounded border border-dashed border-slate-300 text-center text-slate-500 text-xs font-medium">
                {t.smsDisabledMsg}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* FASTAPI MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full border border-slate-200 overflow-hidden">
            <div className="p-4 bg-slate-900 text-white flex justify-between items-center">
              <h3 className="font-bold text-sm font-mono">{t.fastapiModalTitle}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white text-lg font-bold">
                &times;
              </button>
            </div>
            <div className="p-4 bg-slate-950 font-mono text-xs text-emerald-400 overflow-x-auto max-h-96">
              <pre>{"// FastAPI WebSocket code"}</pre>
            </div>
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end gap-3">
              <button
                onClick={copyCodeToClipboard}
                className="bg-sky-600 hover:bg-sky-700 text-white font-bold px-4 py-2 rounded text-xs transition-colors"
              >
                {copied ? t.copied : t.copySnippet}
              </button>
              <button
                onClick={() => setIsModalOpen(false)}
                className="bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold px-4 py-2 rounded text-xs transition-colors"
              >
                {t.close}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}