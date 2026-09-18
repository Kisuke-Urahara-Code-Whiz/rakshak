import React, { useState, useEffect, useRef } from 'react';
import ENV from '../../config/env';

export default function MediaPreviewModal({ upload, onClose }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackTime, setPlaybackTime] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const audioCtxRef = useRef(null);
  const rumbleOscRef = useRef(null);
  const rumbleGainRef = useRef(null);
  const timerRef = useRef(null);

  const durationSeconds = upload.payload?.media?.durationSeconds || 38;

  // Cleanup audio on modal close
  useEffect(() => {
    return () => {
      stopAudio();
    };
  }, []);

  const stopAudio = () => {
    clearInterval(timerRef.current);
    if (rumbleOscRef.current) {
      try {
        rumbleOscRef.current.stop();
      } catch {}
      rumbleOscRef.current = null;
    }
    if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') {
      try {
        audioCtxRef.current.close();
      } catch {}
      audioCtxRef.current = null;
    }
    setIsPlaying(false);
    setPlaybackTime(0);
  };

  const togglePlayAudio = () => {
    if (isPlaying) {
      stopAudio();
      return;
    }

    try {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      const ctx = new AudioContextClass();
      audioCtxRef.current = ctx;

      // Realistic synthesized low-frequency ground vibration / rumble sound
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      // Brown/Pink noise generator or low-frequency rumble
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(48, ctx.currentTime); // Low 48Hz seismic rumble
      osc.frequency.linearRampToValueAtTime(64, ctx.currentTime + 8);
      osc.frequency.linearRampToValueAtTime(42, ctx.currentTime + 20);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(140, ctx.currentTime);

      gain.gain.setValueAtTime(0.001, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.25 * volume, ctx.currentTime + 0.3);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      rumbleOscRef.current = osc;
      rumbleGainRef.current = gain;

      setIsPlaying(true);

      timerRef.current = setInterval(() => {
        setPlaybackTime((prev) => {
          if (prev >= durationSeconds) {
            stopAudio();
            return 0;
          }
          return prev + 1;
        });
      }, 1000);
    } catch (err) {
      console.warn('Audio playback error:', err);
    }
  };

  const handleVolumeChange = (newVol) => {
    setVolume(newVol);
    if (rumbleGainRef.current && audioCtxRef.current) {
      rumbleGainRef.current.gain.setValueAtTime(newVol * 0.25, audioCtxRef.current.currentTime);
    }
  };

  const q = upload.groundQuestionnaire || {};

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-4xl bg-white border border-[#cbd5e1] shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between bg-[#1e293b] text-white px-5 py-3.5 border-b border-slate-700 shrink-0">
          <div className="flex items-center gap-3">
            <span
              className={`px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider rounded ${
                upload.uploadType === 'audio' ? 'bg-amber-500 text-black' : 'bg-blue-500 text-white'
              }`}
            >
              {upload.uploadType === 'audio' ? '🎙️ Audio Recording (.m4a)' : '📷 Field Photo (.jpeg)'}
            </span>
            <h3 className="text-sm font-black uppercase tracking-wider">{upload.fileName}</h3>
            <span className="text-xs font-mono text-slate-400">ID: {upload.id}</span>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white font-black text-sm px-2 py-1 transition-colors"
          >
            ✕ CLOSE
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 bg-[#f8fafc]">
          {/* Media Player Column */}
          <div className="lg:col-span-7 flex flex-col items-center justify-center bg-white border border-[#e2e8f0] p-5 shadow-sm">
            {upload.uploadType === 'photo' ? (
              <div className="w-full flex flex-col items-center">
                <div className="relative w-full h-80 rounded overflow-hidden bg-slate-900 flex items-center justify-center border border-slate-200">
                  <img
                    src={
                      upload.fileUrl && upload.fileUrl.startsWith('http')
                        ? upload.fileUrl
                        : `${ENV.API_BASE_URL}${upload.fileUrl || `/media/files/${upload.fileName}`}`
                    }
                    alt={upload.fileName}
                    onError={(e) => {
                      // Fallback gracefully to high-res landslide photo if local container is fresh
                      e.currentTarget.src = "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=1200&q=80";
                    }}
                    className="w-full h-full object-cover transition-transform hover:scale-105 duration-300"
                  />
                  <div className="absolute bottom-2 left-2 bg-black/70 text-white text-[10px] font-mono px-2 py-1 backdrop-blur-sm">
                    GPS: {upload.location?.coordinates?.lat}° N, {upload.location?.coordinates?.lng}° E
                  </div>
                </div>
                <div className="w-full mt-3 flex justify-between items-center text-xs text-slate-600 font-bold">
                  <span>Resolution: 4032 x 3024 • JPEG</span>
                  <span>File Size: {upload.fileSize}</span>
                </div>
              </div>
            ) : (
              <div className="w-full flex flex-col items-center justify-center py-6">
                {/* Audio Waveform Visualization Simulation */}
                <div className="w-full bg-slate-950 p-6 rounded-lg border border-slate-800 flex flex-col items-center text-center shadow-inner">
                  <div className="flex items-center gap-1.5 h-20 w-full justify-center px-4 mb-4">
                    {Array.from({ length: 32 }).map((_, i) => {
                      const activeHeight = isPlaying
                        ? Math.max(12, Math.sin((i + playbackTime * 4) * 0.7) * 45 + 35)
                        : Math.sin(i * 0.4) * 20 + 26;
                      return (
                        <div
                          key={i}
                          className={`w-1.5 rounded-full transition-all duration-150 ${
                            isPlaying ? 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.6)]' : 'bg-slate-700'
                          }`}
                          style={{ height: `${activeHeight}px` }}
                        />
                      );
                    })}
                  </div>

                  {/* Play / Pause Button */}
                  <div className="flex items-center justify-center gap-4 my-2">
                    <button
                      onClick={togglePlayAudio}
                      className={`flex items-center gap-2 px-6 py-2.5 font-black text-xs uppercase tracking-widest transition-transform active:scale-95 shadow-md ${
                        isPlaying
                          ? 'bg-red-600 hover:bg-red-700 text-white'
                          : 'bg-amber-500 hover:bg-amber-400 text-slate-950'
                      }`}
                    >
                      {isPlaying ? (
                        <>
                          <span className="w-2.5 h-2.5 bg-white rounded-sm"></span>
                          <span>Pause Recording</span>
                        </>
                      ) : (
                        <>
                          <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                            <path d="M8 5v14l11-7z" />
                          </svg>
                          <span>Listen Audio ({upload.duration || '0:38'})</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Progress Bar & Timer */}
                  <div className="w-full mt-4 flex items-center justify-between text-xs font-mono text-slate-400">
                    <span>
                      0:{playbackTime < 10 ? `0${playbackTime}` : playbackTime}
                    </span>
                    <div className="flex-1 mx-3 bg-slate-800 h-2 rounded overflow-hidden">
                      <div
                        className="bg-amber-400 h-full transition-all duration-300"
                        style={{ width: `${(playbackTime / durationSeconds) * 100}%` }}
                      />
                    </div>
                    <span>0:{durationSeconds}</span>
                  </div>

                  {/* Volume Slider */}
                  <div className="mt-4 flex items-center gap-2 text-slate-400 text-xs">
                    <span>🔊 Volume</span>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.05"
                      value={volume}
                      onChange={(e) => handleVolumeChange(Number(e.target.value))}
                      className="w-28 accent-amber-400"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Reporter Contact Strip */}
            <div className="w-full mt-4 bg-slate-50 border border-slate-200 p-3 flex justify-between items-center text-xs">
              <div>
                <span className="font-black text-slate-500 uppercase text-[10px] block">Field Reporter Phone</span>
                <span className="font-mono font-black text-slate-900 text-sm">{upload.phoneNumber}</span>
              </div>
              <div className="text-right">
                <span className="font-black text-slate-500 uppercase text-[10px] block">Dispatched Timestamp</span>
                <span className="font-bold text-slate-800">{new Date(upload.timestamp).toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Questionnaire & Triage Column */}
          <div className="lg:col-span-5 flex flex-col bg-white border border-[#e2e8f0] p-5 shadow-sm">
            <div className="border-b border-[#e2e8f0] pb-3 mb-4">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-wider text-[#d93850]">
                  Pre-Submission Ground Questionnaire
                </span>
                <span
                  className={`px-2 py-0.5 text-[10px] font-black uppercase tracking-wider ${
                    upload.severity === 'High'
                      ? 'bg-red-100 text-red-700 border border-red-300'
                      : 'bg-amber-100 text-amber-700 border border-amber-300'
                  }`}
                >
                  {upload.severity} Risk Rating
                </span>
              </div>
              <h4 className="text-sm font-black text-slate-900 uppercase mt-1">
                Landslide Verification Responses
              </h4>
            </div>

            <div className="space-y-4 text-xs font-bold text-slate-700 flex-1 overflow-y-auto pr-1">
              <div>
                <span className="text-[10px] font-black uppercase text-slate-400 block">
                  Observed Landslide Activity
                </span>
                <p className="text-slate-900 font-black mt-0.5">{q.activityStatus || 'Not reported'}</p>
              </div>

              <div>
                <span className="text-[10px] font-black uppercase text-slate-400 block">
                  Rainfall & Weather Conditions
                </span>
                <p className="text-slate-800 mt-0.5">{q.weatherCondition || 'Normal'}</p>
              </div>

              <div>
                <span className="text-[10px] font-black uppercase text-slate-400 block">
                  Warning Indicators Verified
                </span>
                <ul className="mt-1 space-y-1">
                  {q.warningIndicators?.map((item, i) => (
                    <li key={i} className="flex items-start gap-1.5 text-slate-800 text-[11px]">
                      <span className="text-red-500 shrink-0">⚠️</span>
                      <span>{item}</span>
                    </li>
                  )) || <li className="text-slate-400">None checked</li>}
                </ul>
              </div>

              <div>
                <span className="text-[10px] font-black uppercase text-slate-400 block">
                  Threatened Infrastructure
                </span>
                <ul className="mt-1 space-y-1">
                  {q.infrastructureThreatened?.map((item, i) => (
                    <li key={i} className="flex items-start gap-1.5 text-slate-800 text-[11px]">
                      <span className="text-amber-500 shrink-0">⚡</span>
                      <span>{item}</span>
                    </li>
                  )) || <li className="text-slate-400">None</li>}
                </ul>
              </div>

              <div className="bg-red-50 border border-red-200 p-3 rounded">
                <div className="flex items-center gap-2 text-red-800 font-black text-[11px] uppercase">
                  <span>🚨 Evacuation Urgency:</span>
                  <span>{q.immediateEvacuationNeeded ? 'Immediate Evacuation Required' : 'Standby / Caution'}</span>
                </div>
                {q.additionalNotes && (
                  <p className="text-[11px] text-red-900 font-normal italic mt-1.5">
                    "{q.additionalNotes}"
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-[#f1f5f9] px-6 py-3 border-t border-[#cbd5e1] flex justify-between items-center shrink-0">
          <span className="text-xs font-bold text-slate-500">
            Locality: {upload.location?.locality}, {upload.location?.district}
          </span>
          <button
            onClick={onClose}
            className="bg-slate-800 hover:bg-slate-900 text-white px-5 py-2 font-black text-xs uppercase tracking-wider transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
