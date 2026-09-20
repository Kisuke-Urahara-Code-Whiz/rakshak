import React, { useState, useEffect, useRef, useCallback } from 'react';
import ENV from '../config/env';

/**
 * Harmonized geotechnical risk score calculation
 * Maps Soil Moisture ADC (100–450) and Vibration (0.00–1.00g)
 * Exactly mirrors backend socketManager.py
 */
export function calculateRiskScore(adc, vib = 0.0) {
  const clamped = Math.min(Math.max(Number(adc), 100), 450);
  // Soil component: 100 ADC (saturated) -> 90%, 450 ADC (dry) -> 15%
  const base = ((450 - clamped) / 350) * 75 + 15;
  // Vibration adds dynamic shear slip / tremor risk (up to +20%)
  const vibBoost = Number(vib) * 20;
  return Math.min(100, Math.max(5, Math.round(base + vibBoost)));
}

export default function IoTSimulator() {
  // Audio buzzer state
  const [soundEnabled, setSoundEnabled] = useState(true);
  const audioCtxRef = useRef(null);

  // Soil Simulator State
  const [soilDeviceId, setSoilDeviceId] = useState('SOIL_NODE_01');
  const [soilConnected, setSoilConnected] = useState(false);
  const [soilMoisture, setSoilMoisture] = useState(420); // ADC (450 normal -> 100 severe saturation)
  const [vibration, setVibration] = useState(0.02);     // (0.00 -> 1.00 g)
  const [isSimulating, setIsSimulating] = useState(false);
  const [autoIntervalMs, setAutoIntervalMs] = useState(1000);
  const [sendFormat, setSendFormat] = useState('json'); // 'json' or 'raw_soil'
  const soilWs = useRef(null);

  // Backend Front Socket Sync Listener (confirms exact live value broadcasted to App & Web)
  const [networkSyncedRisk, setNetworkSyncedRisk] = useState(null);
  const frontWs = useRef(null);

  // ESP Mesh Network Topology State
  const [espNodes, setEspNodes] = useState([
    { id: 'ESP32_NODE_1', x: 22, y: 38, ringing: false, ringTimeLeft: 0, connected: false },
    { id: 'ESP32_NODE_2', x: 50, y: 62, ringing: false, ringTimeLeft: 0, connected: false },
    { id: 'ESP32_NODE_3', x: 78, y: 32, ringing: false, ringTimeLeft: 0, connected: false },
  ]);
  const [newEspId, setNewEspId] = useState('');
  const espSockets = useRef({});

  // System Logs Terminal
  const [logs, setLogs] = useState([]);
  const canvasRef = useRef(null);
  const logsContainerRef = useRef(null);

  // Helper to append timestamped logs
  const logMessage = useCallback((type, text) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs((prev) => [
      { id: Math.random().toString(), timestamp, type, text },
      ...prev.slice(0, 99),
    ]);
  }, []);

  // Web Audio Synthesized Buzzer
  const triggerBuzzer = useCallback((durationMs = 2000) => {
    if (!soundEnabled) return;
    try {
      if (!audioCtxRef.current) {
        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        audioCtxRef.current = new AudioContextClass();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + durationMs / 1000);

      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + durationMs / 1000);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + durationMs / 1000);
    } catch (e) {
      console.warn('Audio buzzer playback blocked or unavailable:', e);
    }
  }, [soundEnabled]);

  // Synchronized calculated risk percentage
  const riskPercent = calculateRiskScore(soilMoisture, vibration);

  // 1. Connect to /ws/front listener to confirm 100% telemetry sync with App and Analytics
  useEffect(() => {
    const targetBase = ENV.IOT_WS_URL.replace(/\/$/, '');
    const frontUrl = `${targetBase}/ws/front/iot_simulator_sync_monitor`;

    let active = true;
    let ws = null;

    try {
      ws = new WebSocket(frontUrl);
      frontWs.current = ws;

      ws.onopen = () => {
        if (!active) return;
        try {
          ws.send(JSON.stringify({ type: 'INIT_QUERY', status: 'READY' }));
        } catch {}
      };

      ws.onmessage = (event) => {
        if (!active) return;
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'PING') {
            try { ws.send(JSON.stringify({ type: 'PONG', status: 'ALIVE' })); } catch {}
            return;
          }
          if (data.risk_percentage !== undefined) {
            setNetworkSyncedRisk(Math.round(Number(data.risk_percentage)));
          }
        } catch {}
      };
    } catch {}

    return () => {
      active = false;
      if (ws) {
        try { ws.close(); } catch {}
      }
    };
  }, []);

  // Toggle Soil Sensor WebSocket Connection
  const toggleSoilSocket = () => {
    if (soilConnected) {
      if (soilWs.current) {
        soilWs.current.close();
      }
      setSoilConnected(false);
      logMessage('system', `Disconnected Soil Socket (${soilDeviceId})`);
    } else {
      const targetBase = ENV.IOT_WS_URL.replace(/\/$/, '');
      const url = `${targetBase}/ws/soil/${soilDeviceId}`;
      logMessage('system', `Connecting to ${url}...`);

      try {
        const ws = new WebSocket(url);

        ws.onopen = () => {
          setSoilConnected(true);
          logMessage('success', `Soil Socket Connected: ${soilDeviceId} (${url})`);
        };

        ws.onmessage = (event) => {
          logMessage('incoming', `[SOIL RX]: ${event.data}`);
        };

        ws.onerror = () => {
          logMessage('error', `Soil Socket Error connecting to ${url}`);
        };

        ws.onclose = () => {
          setSoilConnected(false);
          logMessage('warning', `Soil Socket Closed: ${soilDeviceId}`);
        };

        soilWs.current = ws;
      } catch (e) {
        logMessage('error', `Failed to open Soil Socket: ${e.message}`);
      }
    }
  };

  // Cleanup Soil socket on unmount
  useEffect(() => {
    return () => {
      if (soilWs.current) {
        soilWs.current.close();
      }
    };
  }, []);

  // Send Frame to Soil WebSocket (Sends explicit riskPercentage so App & Web match 1:1)
  const sendSoilFrame = useCallback(() => {
    if (!soilWs.current || soilWs.current.readyState !== WebSocket.OPEN) {
      logMessage('warning', 'Cannot send: Soil socket is disconnected.');
      return;
    }

    const currentRisk = calculateRiskScore(soilMoisture, vibration);

    let payloadString = '';
    if (sendFormat === 'json') {
      payloadString = JSON.stringify({
        risk: Number(soilMoisture),
        vib: Number(parseFloat(vibration).toFixed(2)),
        riskPercentage: currentRisk,
        risk_percentage: currentRisk,
      });
    } else {
      payloadString = String(soilMoisture);
    }

    soilWs.current.send(payloadString);
    logMessage('outgoing', `[SOIL TX]: ${payloadString}`);
  }, [soilMoisture, vibration, sendFormat, logMessage]);

  // Automated Simulation Degradation Loop
  useEffect(() => {
    let timer;
    if (isSimulating) {
      timer = setInterval(() => {
        setSoilMoisture((prev) => {
          const drop = Math.floor(Math.random() * 15) + 5;
          const nextVal = prev - drop;
          return nextVal < 110 ? 430 : nextVal;
        });

        setVibration(() => {
          const spike = Math.random() > 0.65 ? Math.random() * 0.45 : 0.02;
          return parseFloat(spike.toFixed(2));
        });

        sendSoilFrame();
      }, autoIntervalMs);
    }
    return () => clearInterval(timer);
  }, [isSimulating, autoIntervalMs, sendSoilFrame]);

  // Trigger Local ESP Siren + Buzzer
  const triggerEspAlert = useCallback((nodeId, durationMs = 2000) => {
    logMessage('alert', `🚨 RINGING ALARM BROADCAST ON NODE: ${nodeId} (${durationMs}ms)`);
    triggerBuzzer(durationMs);

    setEspNodes((prev) =>
      prev.map((node) =>
        node.id === nodeId ? { ...node, ringing: true, ringTimeLeft: durationMs } : node
      )
    );

    setTimeout(() => {
      setEspNodes((prev) =>
        prev.map((node) =>
          node.id === nodeId ? { ...node, ringing: false, ringTimeLeft: 0 } : node
        )
      );
    }, durationMs);
  }, [logMessage, triggerBuzzer]);

  // Connect Individual ESP Node to WebSocket
  const connectEspNode = useCallback((nodeId) => {
    const targetBase = ENV.IOT_WS_URL.replace(/\/$/, '');
    const url = `${targetBase}/ws/esp/${nodeId}`;

    try {
      const ws = new WebSocket(url);

      ws.onopen = () => {
        setEspNodes((prev) =>
          prev.map((n) => (n.id === nodeId ? { ...n, connected: true } : n))
        );
        logMessage('success', `ESP Mesh Client Connected: ${nodeId}`);
      };

      ws.onmessage = (event) => {
        logMessage('incoming', `[ESP RX ${nodeId}]: ${event.data}`);
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'ALERT') {
            const duration = data.duration_ms || 2000;
            triggerEspAlert(nodeId, duration);
          }
        } catch {
          if (typeof event.data === 'string' && event.data.toUpperCase().includes('ALERT')) {
            triggerEspAlert(nodeId, 2500);
          }
        }
      };

      ws.onclose = () => {
        setEspNodes((prev) =>
          prev.map((n) => (n.id === nodeId ? { ...n, connected: false } : n))
        );
        logMessage('warning', `ESP Mesh Node Disconnected: ${nodeId}`);
      };

      ws.onerror = () => {
        logMessage('error', `ESP ${nodeId} Connection Fault`);
      };

      espSockets.current[nodeId] = ws;
    } catch (e) {
      logMessage('error', `Failed connecting ESP ${nodeId}: ${e.message}`);
    }
  }, [logMessage, triggerEspAlert]);

  // Manage Auto-Connect for All ESP Nodes
  useEffect(() => {
    espNodes.forEach((node) => {
      if (!espSockets.current[node.id]) {
        connectEspNode(node.id);
      }
    });

    const currentSockets = espSockets.current;
    return () => {
      Object.values(currentSockets).forEach((sock) => {
        try {
          sock.close();
        } catch {}
      });
    };
  }, [espNodes, connectEspNode]);

  // Add Dynamic Node
  const handleAddEsp = (e) => {
    e.preventDefault();
    if (!newEspId.trim()) return;
    const formattedId = newEspId.trim().toUpperCase().replace(/\s+/g, '_');
    if (espNodes.some((n) => n.id === formattedId)) return;

    const newNode = {
      id: formattedId,
      x: Math.floor(Math.random() * 65) + 18,
      y: Math.floor(Math.random() * 65) + 18,
      ringing: false,
      ringTimeLeft: 0,
      connected: false,
    };

    setEspNodes((prev) => [...prev, newNode]);
    setNewEspId('');
    logMessage('system', `Registered New ESP Field Node: ${formattedId}`);
  };

  // Remove Dynamic Node
  const handleRemoveEsp = (id) => {
    if (espSockets.current[id]) {
      try {
        espSockets.current[id].close();
      } catch {}
      delete espSockets.current[id];
    }
    setEspNodes((prev) => prev.filter((n) => n.id !== id));
    logMessage('system', `Decommissioned ESP Node: ${id}`);
  };

  // Render 2D Tactical Topology Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrame;
    let tick = 0;

    const render = () => {
      tick += 1;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw Tactical Radar Grid
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 0.8;
      const step = 32;
      for (let x = 0; x < canvas.width; x += step) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }
      for (let y = 0; y < canvas.height; y += step) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }

      // Draw Mesh Link Vectors
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.25)';
      ctx.lineWidth = 1.2;
      ctx.setLineDash([4, 4]);
      for (let i = 0; i < espNodes.length; i++) {
        for (let j = i + 1; j < espNodes.length; j++) {
          const n1 = espNodes[i];
          const n2 = espNodes[j];
          ctx.beginPath();
          ctx.moveTo((n1.x / 100) * canvas.width, (n1.y / 100) * canvas.height);
          ctx.lineTo((n2.x / 100) * canvas.width, (n2.y / 100) * canvas.height);
          ctx.stroke();
        }
      }
      ctx.setLineDash([]);

      // Draw Animated Pulse Rings for Ringing Nodes
      espNodes.forEach((node) => {
        if (node.ringing) {
          const nx = (node.x / 100) * canvas.width;
          const ny = (node.y / 100) * canvas.height;
          const radius = (tick * 2) % 48;
          ctx.beginPath();
          ctx.arc(nx, ny, radius, 0, 2 * Math.PI);
          ctx.strokeStyle = `rgba(217, 56, 80, ${1 - radius / 48})`;
          ctx.lineWidth = 2.5;
          ctx.stroke();
        }
      });

      animationFrame = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animationFrame);
  }, [espNodes]);

  // Quick Preset Handlers
  const applyPreset = (moisture, vib) => {
    setSoilMoisture(moisture);
    setVibration(vib);
    logMessage('system', `Applied Scenario: Moisture=${moisture} ADC, Vib=${vib}g`);
  };

  const connectedCount = espNodes.filter((n) => n.connected).length;

  return (
    <div
      style={{ fontFamily: '"Dosis", sans-serif' }}
      className="flex-1 flex flex-col h-full min-h-0 w-full bg-[#090e18] text-slate-100 overflow-y-auto p-6 select-none"
    >
      {/* Page Header (Matches Website PageHeader pattern) */}
      <div className="w-full mb-4 shrink-0 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-[#1e293b] pb-4">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 bg-[#d93850] rounded-full animate-pulse" />
            <h1 className="text-lg font-black uppercase tracking-wider text-slate-100">
              IoT Sensor & ESP Node Network Simulator
            </h1>
            <span className="px-2 py-0.5 bg-[#1e293b] border border-[#334155] text-cyan-400 text-[10px] font-mono font-black uppercase rounded">
              DARK COMMAND
            </span>
          </div>
          <p className="text-[11px] font-bold text-slate-400 uppercase mt-0.5">
            Real-Time Geotechnical Telemetry Streamer & Synchronized ESP Siren Transceiver
          </p>
        </div>

        {/* Global Controls & Status Badges */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Target Host Badge */}
          <div className="bg-[#111827] border border-[#1e293b] px-3 py-1 text-xs font-mono font-bold text-slate-300 flex items-center gap-1.5 shadow-sm">
            <span className="text-slate-500 uppercase text-[10px] font-black">TARGET WS:</span>
            <span className="text-cyan-400">{ENV.IOT_WS_URL}</span>
          </div>

          {/* Buzzer Sound Toggle */}
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`px-3 py-1 border text-xs font-black uppercase tracking-wider flex items-center gap-1.5 shadow-sm transition-all ${
              soundEnabled
                ? 'bg-cyan-950/40 border-cyan-500/40 text-cyan-300 hover:bg-cyan-900/40'
                : 'bg-[#111827] border-[#334155] text-slate-400 hover:bg-slate-800'
            }`}
          >
            <span>{soundEnabled ? '🔊 BUZZER ON' : '🔇 MUTED'}</span>
          </button>
        </div>
      </div>

      {/* Metric Quick Strip (Matches Website Uploads & Alerts Strip) */}
      <div className="flex flex-wrap items-center gap-3 mb-4 shrink-0">
        <div className="bg-[#111827] border border-[#1e293b] px-3.5 py-1.5 shadow-sm text-xs font-bold">
          <span className="text-slate-400 uppercase text-[10px] block font-black">SIMULATED RISK</span>
          <span className="text-[#d93850] font-mono font-black text-sm">{riskPercent}% PROBABILITY</span>
        </div>

        <div className="bg-[#111827] border border-[#1e293b] px-3.5 py-1.5 shadow-sm text-xs font-bold">
          <span className="text-cyan-400 uppercase text-[10px] block font-black">APP & WEB SYNC ECHO</span>
          <span className="text-cyan-300 font-mono font-black text-sm">
            {networkSyncedRisk !== null ? `${networkSyncedRisk}% SYNCHRONIZED` : 'LISTENING...'}
          </span>
        </div>

        <div className="bg-[#111827] border border-[#1e293b] px-3.5 py-1.5 shadow-sm text-xs font-bold">
          <span className="text-slate-400 uppercase text-[10px] block font-black">SOIL MOISTURE ADC</span>
          <span className="text-slate-100 font-mono font-black text-sm">{soilMoisture} ADC</span>
        </div>

        <div className="bg-[#111827] border border-[#1e293b] px-3.5 py-1.5 shadow-sm text-xs font-bold">
          <span className="text-amber-400 uppercase text-[10px] block font-black">GROUND VIBRATION</span>
          <span className="text-amber-300 font-mono font-black text-sm">{parseFloat(vibration).toFixed(2)} g</span>
        </div>

        <div className="bg-[#111827] border border-[#1e293b] px-3.5 py-1.5 shadow-sm text-xs font-bold">
          <span className="text-emerald-400 uppercase text-[10px] block font-black">ESP MESH NODES</span>
          <span className="text-emerald-300 font-mono font-black text-sm">{connectedCount} / {espNodes.length} ONLINE</span>
        </div>
      </div>

      {/* Main Grid: Soil Simulator (Left) + ESP Node Visualizer (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 mb-5">
        {/* LEFT COLUMN: Geotechnical Soil Telemetry Node */}
        <div className="lg:col-span-5 flex flex-col gap-5">
          <div className="p-5 border border-[#1e293b] bg-[#111827] shadow-sm flex flex-col justify-between">
            {/* Panel Header */}
            <div className="flex items-center justify-between pb-3 border-b border-[#1e293b] mb-4">
              <div>
                <h2 className="font-black text-xs uppercase tracking-wider text-slate-100 flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${soilConnected ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
                  <span>Soil Moisture & Vibration Sensor Node</span>
                </h2>
                <p className="text-[10px] text-slate-400 font-mono uppercase mt-0.5">
                  Stream Endpoint: /ws/soil/{soilDeviceId}
                </p>
              </div>

              <button
                onClick={toggleSoilSocket}
                className={`px-3 py-1.5 text-xs font-black uppercase tracking-wider shadow-sm transition-transform active:scale-95 border ${
                  soilConnected
                    ? 'bg-rose-600 hover:bg-rose-700 text-white border-rose-500'
                    : 'bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-500'
                }`}
              >
                {soilConnected ? 'Disconnect' : 'Connect Socket'}
              </button>
            </div>

            {/* Config Inputs */}
            <div className="space-y-3.5 mb-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1">
                    Sensor Device ID
                  </label>
                  <input
                    type="text"
                    value={soilDeviceId}
                    onChange={(e) => setSoilDeviceId(e.target.value)}
                    disabled={soilConnected}
                    className="w-full bg-[#090e1a] border border-[#334155] px-3 py-1.5 text-xs font-mono font-bold text-cyan-300 focus:border-[#d93850] focus:outline-none disabled:opacity-50"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1">
                    Payload Format
                  </label>
                  <select
                    value={sendFormat}
                    onChange={(e) => setSendFormat(e.target.value)}
                    className="w-full bg-[#090e1a] border border-[#334155] px-3 py-1.5 text-xs font-mono font-bold text-cyan-300 focus:border-[#d93850] focus:outline-none"
                  >
                    <option value="json">JSON Object {"{risk, vib, riskPercentage}"}</option>
                    <option value="raw_soil">Raw Float ADC String</option>
                  </select>
                </div>
              </div>

              {/* Real-time Payload Inspection */}
              <div className="bg-[#090e1a] border border-[#1e293b] p-2.5 font-mono text-xs text-slate-300 flex justify-between items-center">
                <span className="text-slate-500 uppercase text-[10px] font-black">Outbound Payload:</span>
                <span className="text-cyan-400 font-bold truncate max-w-[280px]">
                  {sendFormat === 'json'
                    ? `{ "risk": ${soilMoisture}, "vib": ${parseFloat(vibration).toFixed(2)}, "riskPercentage": ${riskPercent} }`
                    : `${soilMoisture}`}
                </span>
              </div>
            </div>

            {/* Harmonized Risk Probability Gauge */}
            <div className="mb-4 p-3.5 bg-[#090e1a] border border-[#1e293b]">
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-[10px] uppercase font-black text-slate-400 tracking-wider">
                  Harmonized Geotechnical Landslide Risk
                </span>
                <span
                  className={`text-xs font-black uppercase px-2 py-0.5 rounded font-mono ${
                    riskPercent >= 75
                      ? 'bg-rose-500/20 text-rose-400 border border-rose-500/50 animate-pulse'
                      : riskPercent >= 50
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50'
                      : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/50'
                  }`}
                >
                  {riskPercent}% Probability {riskPercent >= 75 ? '• CRITICAL' : riskPercent >= 50 ? '• WARNING' : '• NORMAL'}
                </span>
              </div>
              <div className="h-2.5 w-full bg-slate-900 overflow-hidden border border-[#1e293b]">
                <div
                  className={`h-full transition-all duration-300 ${
                    riskPercent >= 75
                      ? 'bg-rose-600 shadow-[0_0_10px_rgba(225,29,72,0.8)]'
                      : riskPercent >= 50
                      ? 'bg-amber-500'
                      : 'bg-emerald-500'
                  }`}
                  style={{ width: `${riskPercent}%` }}
                />
              </div>
              <div className="flex justify-between text-[10px] text-slate-500 mt-1.5 font-mono font-bold uppercase">
                <span>100 ADC (Saturated / Slide)</span>
                <span>450 ADC (Normal Ground)</span>
              </div>
            </div>

            {/* Interactive Sliders */}
            <div className="space-y-4 mb-4">
              {/* Soil Moisture Slider */}
              <div>
                <div className="flex justify-between text-xs font-bold mb-1">
                  <span className="text-slate-300 uppercase tracking-wide">
                    Soil Moisture ADC (<code className="text-cyan-400">"risk"</code>)
                  </span>
                  <span className="font-mono text-cyan-400 font-black">{soilMoisture} ADC</span>
                </div>
                <input
                  type="range"
                  min="100"
                  max="450"
                  step="1"
                  value={soilMoisture}
                  onChange={(e) => setSoilMoisture(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-800 rounded appearance-none cursor-pointer accent-[#d93850]"
                />
              </div>

              {/* Vibration Slider */}
              <div>
                <div className="flex justify-between text-xs font-bold mb-1">
                  <span className="text-slate-300 uppercase tracking-wide">
                    Ground Vibration (<code className="text-amber-400">"vib"</code>)
                  </span>
                  <span className="font-mono text-amber-400 font-black">
                    {parseFloat(vibration).toFixed(2)} g
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={vibration}
                  onChange={(e) => setVibration(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-800 rounded appearance-none cursor-pointer accent-amber-400"
                />
              </div>
            </div>

            {/* Presets Strip */}
            <div className="border-t border-[#1e293b] pt-3 mb-4">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1.5">
                Quick Telemetry Presets
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => applyPreset(420, 0.02)}
                  className="flex-1 py-1 px-2 bg-[#090e1a] hover:bg-slate-800 border border-[#334155] text-[10px] font-black uppercase tracking-wider text-slate-300 transition-colors"
                >
                  Baseline (15%)
                </button>
                <button
                  onClick={() => applyPreset(230, 0.15)}
                  className="flex-1 py-1 px-2 bg-amber-950/30 hover:bg-amber-900/40 border border-amber-700/60 text-[10px] font-black uppercase tracking-wider text-amber-300 transition-colors"
                >
                  Heavy Rain (65%)
                </button>
                <button
                  onClick={() => applyPreset(120, 0.75)}
                  className="flex-1 py-1 px-2 bg-rose-950/40 hover:bg-rose-900/50 border border-rose-600/70 text-[10px] font-black uppercase tracking-wider text-rose-300 transition-colors"
                >
                  Critical (99%)
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2.5">
              <button
                onClick={() => setIsSimulating(!isSimulating)}
                className={`flex-1 py-2 px-3 text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-transform active:scale-95 shadow-sm border ${
                  isSimulating
                    ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 border-amber-400'
                    : 'bg-[#1e293b] hover:bg-[#334155] text-slate-200 border-[#334155]'
                }`}
              >
                <span>{isSimulating ? '⏸ Pause Stream' : '▶ Auto-Degrade Stream'}</span>
              </button>

              <button
                onClick={sendSoilFrame}
                disabled={!soilConnected}
                className="py-2 px-4 bg-[#d93850] hover:bg-[#b8273d] disabled:bg-slate-800 disabled:text-slate-600 text-white text-xs font-black uppercase tracking-wider flex items-center gap-1.5 transition-transform active:scale-95 shadow-md border border-white/10"
              >
                <span>Send Frame</span>
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: ESP Mesh Network Visualizer & Siren Array */}
        <div className="lg:col-span-7 flex flex-col gap-5">
          <div className="p-5 border border-[#1e293b] bg-[#111827] shadow-sm flex flex-col justify-between">
            {/* Header & Add Node Form */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#1e293b] mb-4">
              <div>
                <h2 className="font-black text-xs uppercase tracking-wider text-slate-100 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                  <span>ESP Mesh Network Topology & Siren Transceiver</span>
                </h2>
                <p className="text-[10px] text-slate-400 font-mono uppercase mt-0.5">
                  Listening on /ws/esp/&#123;device_id&#125; • {connectedCount} / {espNodes.length} Online
                </p>
              </div>

              {/* Add New Node Form */}
              <form onSubmit={handleAddEsp} className="flex gap-1.5">
                <input
                  type="text"
                  placeholder="ESP NODE ID"
                  value={newEspId}
                  onChange={(e) => setNewEspId(e.target.value)}
                  className="bg-[#090e1a] border border-[#334155] text-xs font-mono font-bold text-slate-200 px-2.5 py-1 uppercase focus:border-[#d93850] focus:outline-none"
                />
                <button
                  type="submit"
                  className="bg-[#d93850] hover:bg-[#b8273d] text-white px-3 py-1 text-xs font-black uppercase tracking-wider shadow-sm transition-transform active:scale-95 border border-white/10"
                >
                  + Add Node
                </button>
              </form>
            </div>

            {/* Tactical Radar 2D Canvas */}
            <div className="relative w-full h-64 bg-[#090e1a] border border-[#1e293b] overflow-hidden mb-4">
              <canvas ref={canvasRef} width={680} height={256} className="absolute inset-0 w-full h-full" />

              {/* Nodes Overlay */}
              {espNodes.map((node) => (
                <div
                  key={node.id}
                  style={{ left: `${node.x}%`, top: `${node.y}%` }}
                  onClick={() => triggerEspAlert(node.id, 2500)}
                  className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer group"
                  title={`Click to test siren on ${node.id}`}
                >
                  {/* Visual Alarm Wave Animation */}
                  {node.ringing && (
                    <>
                      <div className="absolute inset-0 rounded-full bg-rose-500 opacity-75 animate-ping" />
                      <div className="absolute -inset-3 rounded-full border-2 border-[#d93850] animate-pulse" />
                    </>
                  )}

                  {/* Node Icon Circle */}
                  <div
                    className={`relative w-9 h-9 rounded-full border flex items-center justify-center transition-all ${
                      node.ringing
                        ? 'bg-[#d93850] border-rose-300 text-white shadow-lg shadow-red-500/60 scale-125'
                        : node.connected
                        ? 'bg-[#111827] border-cyan-400 text-cyan-300 hover:border-white shadow-md'
                        : 'bg-[#090e1a] border-slate-700 text-slate-600'
                    }`}
                  >
                    <span className="text-xs">
                      {node.ringing ? '🚨' : node.connected ? '📡' : '⚪'}
                    </span>
                  </div>

                  {/* Node Label Tag */}
                  <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1 px-1.5 py-0.5 bg-[#090e1a] border border-[#334155] text-[9px] font-mono whitespace-nowrap text-slate-300 flex items-center gap-1 shadow-sm">
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        node.connected ? 'bg-emerald-400' : 'bg-slate-600'
                      }`}
                    />
                    <span>{node.id}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Dynamic Node Manager Array */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-300">
                  ESP Clients & Siren Trigger Array
                </h3>
                <span className="text-[10px] font-mono text-slate-500 uppercase">
                  Click 'Simulate Siren' for sound + visual broadcast
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-44 overflow-y-auto pr-1">
                {espNodes.map((node) => (
                  <div
                    key={node.id}
                    className="p-2.5 bg-[#090e1a] border border-[#1e293b] flex items-center justify-between"
                  >
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`w-2 h-2 rounded-full ${
                            node.connected ? 'bg-emerald-400 animate-pulse' : 'bg-slate-600'
                          }`}
                        />
                        <span className="font-mono text-xs font-bold text-slate-200">{node.id}</span>
                      </div>
                      <span className="text-[9px] font-mono text-slate-500 mt-0.5 block uppercase">
                        {node.connected ? 'Socket Connected' : 'Disconnected'}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => triggerEspAlert(node.id, 2500)}
                        className="px-2.5 py-1 bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border border-rose-600/60 text-[10px] font-black uppercase tracking-wider flex items-center gap-1 transition-transform active:scale-95"
                      >
                        <span>🚨 Simulate Siren</span>
                      </button>
                      <button
                        onClick={() => handleRemoveEsp(node.id)}
                        className="p-1 text-slate-500 hover:text-rose-400 transition-colors text-xs font-bold"
                        title="Decommission node"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* BOTTOM PANEL: Live WebSocket Telemetry Terminal */}
      <div className="w-full shrink-0">
        <div className="p-4 border border-[#1e293b] bg-[#111827] shadow-sm">
          <div className="flex items-center justify-between pb-2.5 border-b border-[#1e293b] mb-2.5">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
              <h2 className="font-black text-xs uppercase tracking-wider text-slate-200">
                WebSocket System Telemetry Log Inspector
              </h2>
              <span className="text-[10px] font-mono text-slate-500">
                ({logs.length} events captured)
              </span>
            </div>
            <button
              onClick={() => setLogs([])}
              className="px-2.5 py-1 bg-[#1e293b] hover:bg-[#334155] text-slate-300 border border-[#334155] text-[10px] font-black uppercase tracking-wider transition-colors"
            >
              Clear Terminal
            </button>
          </div>

          <div
            ref={logsContainerRef}
            className="h-36 bg-[#080d19] border border-[#1e293b] p-3 font-mono text-xs overflow-y-auto space-y-1.5 text-slate-300"
          >
            {logs.length === 0 ? (
              <p className="text-slate-600 italic">No telemetry packet stream logged yet. Connect a socket to begin streaming.</p>
            ) : (
              logs.map((log) => (
                <div key={log.id} className="flex items-start gap-2.5">
                  <span className="text-slate-500 text-[10px] whitespace-nowrap">{log.timestamp}</span>
                  <span
                    className={`font-semibold text-[11px] ${
                      log.type === 'outgoing'
                        ? 'text-cyan-400'
                        : log.type === 'incoming'
                        ? 'text-emerald-400'
                        : log.type === 'alert'
                        ? 'text-rose-400 font-bold animate-pulse'
                        : log.type === 'error'
                        ? 'text-rose-500'
                        : log.type === 'warning'
                        ? 'text-amber-400'
                        : 'text-indigo-400'
                    }`}
                  >
                    {log.text}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
