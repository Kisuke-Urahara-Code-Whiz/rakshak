import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Activity, Radio, Bell, AlertTriangle, Play, Pause, RefreshCw, 
  Send, ShieldCheck, Zap, Server, Sliders, Sun, Moon, Volume2, VolumeX,
  Plus, Trash2, ShieldAlert
} from 'lucide-react';

export default function App() {
  // Theme State
  const [themeMode, setThemeMode] = useState('dark'); // 'dark' (slate-900) or 'grey' (zinc-800)

  // Audio state
  const [soundEnabled, setSoundEnabled] = useState(true);
  const audioCtxRef = useRef(null);

  // Soil Simulator State
  const [soilDeviceId, setSoilDeviceId] = useState('SOIL_NODE_01');
  const [soilConnected, setSoilConnected] = useState(false);
  const [soilMoisture, setSoilMoisture] = useState(450); // ADC (450 normal -> 150 runoff)
  const [vibration, setVibration] = useState(0.01);     // (0.00 -> 1.00)
  const [isSimulating, setIsSimulating] = useState(false);
  const [autoIntervalMs, setAutoIntervalMs] = useState(1000);
  const [sendFormat, setSendFormat] = useState('json'); // 'json' or 'raw_soil'
  const soilWs = useRef(null);

  // ESP Nodes Visualizer State
  const [espNodes, setEspNodes] = useState([
    { id: 'ESP32_NODE_1', x: 25, y: 35, ringing: false, ringTimeLeft: 0, connected: false },
    { id: 'ESP32_NODE_2', x: 50, y: 65, ringing: false, ringTimeLeft: 0, connected: false },
    { id: 'ESP32_NODE_3', x: 75, y: 30, ringing: false, ringTimeLeft: 0, connected: false },
  ]);
  const [newEspId, setNewEspId] = useState('');
  const espSockets = useRef({});

  // System Logs Terminal
  const [logs, setLogs] = useState([]);
  const canvasRef = useRef(null);

  // Helper to append logs
  const logMessage = useCallback((type, text) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs((prev) => [{ id: Math.random().toString(), timestamp, type, text }, ...prev.slice(0, 49)]);
  }, []);

  // Web Audio Alert Buzzer
  const triggerBuzzer = useCallback((durationMs = 2000) => {
    if (!soundEnabled) return;
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + (durationMs / 1000));
      
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + (durationMs / 1000));

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + (durationMs / 1000));
    } catch (e) {
      console.warn("Audio playback blocked by browser policies", e);
    }
  }, [soundEnabled]);

  // Handle Dynamic Soil Moisture & Risk Calculation
  const calculateRiskPercentage = (adc) => {
    const clamped = Math.min(Math.max(adc, 100), 450);
    const risk = ((450 - clamped) / (450 - 100)) * 100;
    return Math.round(risk);
  };

  const riskPercent = calculateRiskPercentage(soilMoisture);

  // Connect/Disconnect Soil Socket
  const toggleSoilSocket = () => {
    if (soilConnected) {
      if (soilWs.current) soilWs.current.close();
      setSoilConnected(false);
      logMessage('system', `Disconnected Soil Socket (${soilDeviceId})`);
    } else {
      const url = `ws://localhost:8000/ws/soil/${soilDeviceId}`;
      logMessage('system', `Connecting to ${url}...`);
      
      try {
        const ws = new WebSocket(url);
        
        ws.onopen = () => {
          setSoilConnected(true);
          logMessage('success', `Soil Socket Connected: ${soilDeviceId}`);
        };

        ws.onmessage = (event) => {
          logMessage('incoming', `[SOIL RX]: ${event.data}`);
        };

        ws.onerror = (err) => {
          logMessage('error', `Soil Socket Error`);
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

  // Send Soil & Vibration Frame over Socket
  const sendSoilFrame = useCallback(() => {
    if (!soilWs.current || soilWs.current.readyState !== WebSocket.OPEN) return;

    let payloadString = '';
    if (sendFormat === 'json') {
      payloadString = JSON.stringify({
        risk: Number(soilMoisture),
        vib: Number(parseFloat(vibration).toFixed(2))
      });
    } else {
      // Send raw float value if backend expects single float string
      payloadString = String(soilMoisture);
    }

    soilWs.current.send(payloadString);
    logMessage('outgoing', `[SOIL TX]: ${payloadString}`);
  }, [soilMoisture, vibration, sendFormat, logMessage]);

  // Simulation Interval Loop
  useEffect(() => {
    let timer;
    if (isSimulating) {
      timer = setInterval(() => {
        setSoilMoisture((prev) => {
          const drop = Math.floor(Math.random() * 15) + 5;
          const nextVal = prev - drop;
          return nextVal < 120 ? 450 : nextVal;
        });

        setVibration((prev) => {
          const spike = Math.random() > 0.7 ? Math.random() * 0.4 : 0.02;
          return parseFloat(spike.toFixed(2));
        });

        sendSoilFrame();
      }, autoIntervalMs);
    }
    return () => clearInterval(timer);
  }, [isSimulating, autoIntervalMs, sendSoilFrame]);

  // Connect Individual ESP Node to WebSocket
  const connectEspNode = useCallback((nodeId) => {
    const url = `ws://localhost:8000/ws/esp/${nodeId}`;
    
    try {
      const ws = new WebSocket(url);

      ws.onopen = () => {
        setEspNodes((prev) =>
          prev.map((n) => (n.id === nodeId ? { ...n, connected: true } : n))
        );
        logMessage('success', `ESP Node Connected: ${nodeId}`);
      };

      ws.onmessage = (event) => {
        logMessage('incoming', `[ESP RX ${nodeId}]: ${event.data}`);
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'ALERT') {
            const duration = data.duration_ms || 2000;
            triggerEspAlert(nodeId, duration);
          }
        } catch (e) {
          // Non-json alert or text message
        }
      };

      ws.onclose = () => {
        setEspNodes((prev) =>
          prev.map((n) => (n.id === nodeId ? { ...n, connected: false } : n))
        );
        logMessage('warning', `ESP Node Disconnected: ${nodeId}`);
      };

      espSockets.current[nodeId] = ws;
    } catch (e) {
      logMessage('error', `ESP ${nodeId} Connection Error`);
    }
  }, [logMessage]);

  // Trigger Local Ringing UI + Sound
  const triggerEspAlert = useCallback((nodeId, durationMs = 2000) => {
    logMessage('alert', `🚨 RINGING ALERT TRIGGERED ON NODE: ${nodeId} (${durationMs}ms)`);
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

  // Manage Auto Connect for Node List
  useEffect(() => {
    espNodes.forEach((node) => {
      if (!espSockets.current[node.id]) {
        connectEspNode(node.id);
      }
    });
  }, [espNodes, connectEspNode]);

  // Add Dynamic Node
  const handleAddEsp = (e) => {
    e.preventDefault();
    if (!newEspId.trim()) return;
    const formattedId = newEspId.trim().toUpperCase().replace(/\s+/g, '_');
    if (espNodes.some((n) => n.id === formattedId)) return;

    const newNode = {
      id: formattedId,
      x: Math.floor(Math.random() * 70) + 15,
      y: Math.floor(Math.random() * 70) + 15,
      ringing: false,
      ringTimeLeft: 0,
      connected: false
    };

    setEspNodes((prev) => [...prev, newNode]);
    setNewEspId('');
  };

  // Remove Dynamic Node
  const handleRemoveEsp = (id) => {
    if (espSockets.current[id]) {
      espSockets.current[id].close();
      delete espSockets.current[id];
    }
    setEspNodes((prev) => prev.filter((n) => n.id !== id));
    logMessage('system', `Removed ESP Node: ${id}`);
  };

  // Render Topology Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrame;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw Grid Lines
      ctx.strokeStyle = themeMode === 'dark' ? '#334155' : '#475569';
      ctx.lineWidth = 0.5;
      const step = 40;
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

      // Draw Connections between nodes
      ctx.strokeStyle = themeMode === 'dark' ? 'rgba(56, 189, 248, 0.25)' : 'rgba(14, 165, 233, 0.25)';
      ctx.lineWidth = 1.5;
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

      animationFrame = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animationFrame);
  }, [espNodes, themeMode]);

  const bgContainer = themeMode === 'dark' ? 'bg-slate-950 text-slate-100' : 'bg-zinc-800 text-zinc-100';
  const cardBg = themeMode === 'dark' ? 'bg-slate-900/90 border-slate-800' : 'bg-zinc-900/90 border-zinc-700';

  return (
    <div className={`min-h-screen p-4 md:p-8 font-sans ${bgContainer} transition-colors duration-300`}>
      {/* Header Bar */}
      <header className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center mb-8 gap-4 border-b border-slate-700/50 pb-6">
        <div>
          <div className="flex items-center gap-3">
            <Activity className="w-8 h-8 text-cyan-400 animate-pulse" />
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight bg-gradient-to-r from-cyan-400 via-sky-300 to-indigo-400 bg-clip-text text-transparent">
              Landslide Early Warning & ESP Node Simulator
            </h1>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            Real-time Soil Telemetry WebSocket Streamer & Interactive Node Network
          </p>
        </div>

        {/* Global Controls */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`p-2.5 rounded-xl border transition-all flex items-center gap-2 text-xs font-semibold ${
              soundEnabled 
                ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/20' 
                : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700'
            }`}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-cyan-400" /> : <VolumeX className="w-4 h-4" />}
            {soundEnabled ? 'Buzzer On' : 'Muted'}
          </button>

          <button
            onClick={() => setThemeMode(themeMode === 'dark' ? 'grey' : 'dark')}
            className="p-2.5 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-300 transition-all flex items-center gap-2 text-xs font-semibold"
          >
            {themeMode === 'dark' ? <Moon className="w-4 h-4 text-indigo-400" /> : <Sun className="w-4 h-4 text-amber-400" />}
            {themeMode === 'dark' ? 'Dark Theme' : 'Grey Theme'}
          </button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT COLUMN: Soil Simulator Node */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          <div className={`p-6 rounded-2xl border ${cardBg} shadow-xl relative overflow-hidden backdrop-blur-md`}>
            
            {/* Header / Connection Toggle */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-6">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${soilConnected ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>
                  <Radio className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <h2 className="font-bold text-lg">Soil Moisture & Vibration Sensor</h2>
                  <p className="text-xs text-slate-400 font-mono">localhost:8000/ws/soil/</p>
                </div>
              </div>
              <button
                onClick={toggleSoilSocket}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-md ${
                  soilConnected 
                    ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-900/30' 
                    : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-900/30'
                }`}
              >
                {soilConnected ? 'Disconnect' : 'Connect Socket'}
              </button>
            </div>

            {/* Config & Payload Format Settings */}
            <div className="space-y-4 mb-6">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Soil Device ID</label>
                  <input
                    type="text"
                    value={soilDeviceId}
                    onChange={(e) => setSoilDeviceId(e.target.value)}
                    disabled={soilConnected}
                    className="w-full bg-slate-950/70 border border-slate-700/60 rounded-xl px-3 py-2 text-xs font-mono text-cyan-300 focus:outline-none focus:border-cyan-500 disabled:opacity-50"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Payload Format</label>
                  <select
                    value={sendFormat}
                    onChange={(e) => setSendFormat(e.target.value)}
                    className="w-full bg-slate-950/70 border border-slate-700/60 rounded-xl px-3 py-2 text-xs font-mono text-cyan-300 focus:outline-none focus:border-cyan-500"
                  >
                    <option value="json">JSON Object {"{risk, vib}"}</option>
                    <option value="raw_soil">Raw Float Value (adc string)</option>
                  </select>
                </div>
              </div>

              <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3 font-mono text-xs text-slate-300 flex justify-between items-center">
                <span className="text-slate-500">Payload Sample:</span>
                <span className="text-cyan-400">
                  {sendFormat === 'json' 
                    ? `{ "risk": ${soilMoisture}, "vib": ${parseFloat(vibration).toFixed(2)} }`
                    : `${soilMoisture}`
                  }
                </span>
              </div>
            </div>

            {/* Risk Gauge Bar */}
            <div className="mb-6 p-4 rounded-xl bg-slate-950/80 border border-slate-800">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs uppercase font-bold text-slate-400 tracking-wider">Landslide Risk Level</span>
                <span className={`text-xs font-bold px-2 py-0.5 rounded ${riskPercent > 60 ? 'bg-rose-500/20 text-rose-400' : 'bg-cyan-500/20 text-cyan-300'}`}>
                  {riskPercent}% Risk
                </span>
              </div>
              <div className="h-3 w-full bg-slate-800 rounded-full overflow-hidden p-0.5">
                <div 
                  className={`h-full rounded-full transition-all duration-300 ${
                    riskPercent > 70 
                      ? 'bg-gradient-to-r from-amber-500 to-rose-600' 
                      : 'bg-gradient-to-r from-emerald-400 to-cyan-500'
                  }`}
                  style={{ width: `${riskPercent}%` }}
                />
              </div>
              <div className="flex justify-between text-[10px] text-slate-500 mt-2 font-mono">
                <span>NORMAL / SAFE SOIL</span>
                <span>CRITICAL / RUNOFF</span>
              </div>
            </div>

            {/* Soil Controls Sliders */}
            <div className="space-y-6">
              {/* Moisture ADC Slider */}
              <div>
                <div className="flex justify-between text-xs font-medium mb-2">
                  <span className="text-slate-300">Soil Moisture ADC (<code className="text-cyan-400">"risk"</code>)</span>
                  <span className="font-mono text-cyan-400 font-bold">{soilMoisture} ADC</span>
                </div>
                <input
                  type="range"
                  min="100"
                  max="450"
                  step="1"
                  value={soilMoisture}
                  onChange={(e) => setSoilMoisture(Number(e.target.value))}
                  className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                />
                <div className="flex justify-between text-[10px] text-slate-500 mt-1 font-mono">
                  <span>100 (Extreme Risk / Saturated)</span>
                  <span>450 (Normal / ~25% Risk)</span>
                </div>
              </div>

              {/* Vibration Slider */}
              <div>
                <div className="flex justify-between text-xs font-medium mb-2">
                  <span className="text-slate-300">Vibration Sensor (<code className="text-cyan-400">"vib"</code>)</span>
                  <span className="font-mono text-amber-400 font-bold">{parseFloat(vibration).toFixed(2)} g</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={vibration}
                  onChange={(e) => setVibration(Number(e.target.value))}
                  className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
                />
                <div className="flex justify-between text-[10px] text-slate-500 mt-1 font-mono">
                  <span>0.00 (Still)</span>
                  <span>0.50 (Tremor)</span>
                  <span>1.00 (Slide Active)</span>
                </div>
              </div>
            </div>

            {/* Action Trigger Buttons */}
            <div className="mt-8 pt-4 border-t border-slate-800 flex items-center gap-3">
              <button
                onClick={() => setIsSimulating(!isSimulating)}
                className={`flex-1 py-3 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                  isSimulating 
                    ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-lg shadow-amber-500/20' 
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
                }`}
              >
                {isSimulating ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                {isSimulating ? 'Simulating Rainfall...' : 'Auto-Simulate Degradation'}
              </button>

              <button
                onClick={sendSoilFrame}
                disabled={!soilConnected}
                className="py-3 px-5 rounded-xl bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-800 disabled:text-slate-600 text-white text-xs font-bold flex items-center gap-2 transition-all shadow-lg shadow-cyan-950"
              >
                <Send className="w-4 h-4" />
                Send Frame Now
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: ESP Node Topology Visualizer & Trigger Controls */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          <div className={`p-6 rounded-2xl border ${cardBg} shadow-xl flex flex-col justify-between backdrop-blur-md`}>
            
            {/* Visualizer Title & Add Node */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800 mb-6">
              <div>
                <h2 className="font-bold text-lg flex items-center gap-2">
                  <Zap className="w-5 h-5 text-indigo-400" />
                  ESP Node Network Visualizer & Ring Alarm
                </h2>
                <p className="text-xs text-slate-400 font-mono">
                  ws://localhost:8000/ws/esp/&#123;device_id&#125;
                </p>
              </div>

              {/* Add New Node Form */}
              <form onSubmit={handleAddEsp} className="flex gap-2">
                <input
                  type="text"
                  placeholder="ESP Node ID (e.g. NODE_04)"
                  value={newEspId}
                  onChange={(e) => setNewEspId(e.target.value)}
                  className="bg-slate-950 border border-slate-700 text-xs text-slate-200 px-3 py-2 rounded-xl focus:outline-none focus:border-cyan-500"
                />
                <button
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-500 text-white p-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1"
                >
                  <Plus className="w-4 h-4" />
                  Add Node
                </button>
              </form>
            </div>

            {/* Topology Interactive Map Canvas */}
            <div className="relative w-full h-72 bg-slate-950 rounded-xl border border-slate-800 overflow-hidden mb-6">
              <canvas ref={canvasRef} width={650} height={288} className="absolute inset-0 w-full h-full" />
              
              {/* Nodes Overlay */}
              {espNodes.map((node) => (
                <div
                  key={node.id}
                  style={{ left: `${node.x}%`, top: `${node.y}%` }}
                  className="absolute transform -translate-x-1/2 -translate-y-1/2 group cursor-pointer"
                >
                  {/* Pulsing Visual Alarm Wave Animation when node is ringing */}
                  {node.ringing && (
                    <>
                      <div className="absolute inset-0 rounded-full bg-rose-500 opacity-75 animate-ping" />
                      <div className="absolute -inset-4 rounded-full border-2 border-rose-500 animate-pulse" />
                    </>
                  )}

                  {/* Node Body */}
                  <div className={`relative p-3 rounded-full border flex items-center justify-center transition-all ${
                    node.ringing 
                      ? 'bg-rose-600 border-rose-300 text-white shadow-lg shadow-rose-500/50 scale-125' 
                      : node.connected 
                        ? 'bg-slate-900 border-indigo-500 text-indigo-400 hover:border-cyan-400' 
                        : 'bg-slate-900/80 border-slate-700 text-slate-600'
                  }`}>
                    <Bell className={`w-5 h-5 ${node.ringing ? 'animate-bounce' : ''}`} />
                  </div>

                  {/* Node ID Label Tag */}
                  <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-2 py-0.5 rounded bg-slate-900/90 border border-slate-700 text-[10px] font-mono whitespace-nowrap text-slate-300 flex items-center gap-1">
                    <span className={`w-1.5 h-1.5 rounded-full ${node.connected ? 'bg-emerald-400' : 'bg-slate-600'}`} />
                    {node.id}
                  </div>
                </div>
              ))}
            </div>

            {/* Dynamic Node Manager List */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Connected ESP Clients & Test Triggers</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-48 overflow-y-auto pr-1">
                {espNodes.map((node) => (
                  <div key={node.id} className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${node.connected ? 'bg-emerald-400' : 'bg-slate-600'}`} />
                        <span className="font-mono text-xs font-bold text-slate-200">{node.id}</span>
                      </div>
                      <span className="text-[10px] text-slate-500">
                        {node.connected ? 'WebSocket Connected' : 'Disconnected'}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => triggerEspAlert(node.id, 2000)}
                        className="px-2.5 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-[11px] font-semibold flex items-center gap-1 transition-all"
                      >
                        <AlertTriangle className="w-3 h-3" />
                        Sim Ring
                      </button>
                      <button
                        onClick={() => handleRemoveEsp(node.id)}
                        className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-500 hover:text-rose-400 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>

      </div>

      {/* BOTTOM SECTION: Live WebSocket Log Inspector Terminal */}
      <div className="max-w-7xl mx-auto mt-8">
        <div className={`p-6 rounded-2xl border ${cardBg} shadow-xl backdrop-blur-md`}>
          <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
            <div className="flex items-center gap-2">
              <Server className="w-5 h-5 text-cyan-400" />
              <h2 className="font-bold text-base">WebSocket System Telemetry Log Inspector</h2>
            </div>
            <button
              onClick={() => setLogs([])}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 text-xs font-semibold transition-all"
            >
              Clear Terminal
            </button>
          </div>

          <div className="h-44 bg-slate-950/90 rounded-xl p-4 font-mono text-xs overflow-y-auto space-y-2 border border-slate-800">
            {logs.length === 0 ? (
              <p className="text-slate-600 italic">No telemetry events logged yet...</p>
            ) : (
              logs.map((log) => (
                <div key={log.id} className="flex items-start gap-3">
                  <span className="text-slate-600 text-[11px] whitespace-nowrap">{log.timestamp}</span>
                  <span
                    className={`font-semibold ${
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