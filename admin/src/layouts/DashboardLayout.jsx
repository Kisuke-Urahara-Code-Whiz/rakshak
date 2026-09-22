import React, { useState, useEffect, useRef } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAlert } from '../context/AlertContext';
import { useLanguage } from '../context/LanguageContext';

export default function DashboardLayout() {
  const { language, setLanguage, t } = useLanguage();
  const [langOpen, setLangOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  const { activeAlert, isMuted, toggleMute } = useAlert();

  const languageOptions = [
    { code: 'ENG', label: 'English', native: 'ENG' },
    { code: 'HIN', label: 'हिंदी', native: 'HIN' },
    { code: 'ASM', label: 'অসমীয়া', native: 'ASM' },
    { code: 'BEN', label: 'বাংলা', native: 'BEN' },
  ];

  // Current session & role
  const userRole = window.localStorage.getItem('userRole') || 'Citizen';
  const sessionRaw = window.localStorage.getItem('userSession');
  const session = sessionRaw ? JSON.parse(sessionRaw) : null;
  const isCitizen = userRole === 'Citizen';
  const isMdoner = userRole === 'MDoNER Employee';
  const isZonalOrDistrict = userRole === 'Zonal Admin' || userRole === 'District Admin';

  // Role-based route guard enforcement
  useEffect(() => {
    const p = location.pathname;
    if (p.includes('/app/reports')) {
      navigate('/app/risk-map', { replace: true });
      return;
    }
    if (isCitizen) {
      if (p.includes('/app/alerts') || p.includes('/app/stations') || p.includes('/app/simulator')) {
        navigate('/app/risk-map', { replace: true });
      }
    } else if (isZonalOrDistrict) {
      if (p.includes('/app/uploads')) {
        navigate('/app/risk-map', { replace: true });
      }
    }
  }, [location.pathname, isCitizen, isZonalOrDistrict, navigate]);

  // Handle clicking outside to close language dropdown
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setLangOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [dropdownRef]);

  const handleSignOut = () => {
    window.localStorage.removeItem('userRole');
    window.localStorage.removeItem('userSession');
    navigate('/login');
  };

  return (
    <div className="flex h-screen w-screen flex-col overflow-hidden bg-[#f4f6f8] text-[#333333]">
      {/* Top Navigation Bar */}
      <header className="flex h-16 shrink-0 w-full items-center justify-between border-b border-[#e0e0e0] bg-white px-6 shadow-sm z-50">
        <div className="flex items-center gap-4">
          <Link to="/" className="flex items-center gap-2">
            <img src="/logo-nobg.png" alt="Rakshak" className="h-10 w-10 object-contain" />
            <span className="text-xl font-black uppercase tracking-widest text-[#d93850]">RAKSHAK</span>
          </Link>

          {/* Active Role Indicator Badge */}
          <div
            className={`flex items-center gap-1 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider border ${
              isCitizen
                ? 'bg-slate-100 text-slate-700 border-slate-300'
                : isMdoner
                ? 'bg-red-50 text-[#d93850] border-[#d93850]'
                : 'bg-amber-50 text-amber-800 border-amber-300'
            }`}
            title={`Session: ${session?.name || userRole} • ${session?.department || 'NER Node'}`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${isCitizen ? 'bg-slate-500' : 'bg-[#d93850]'}`} />
            <span>{userRole}</span>
          </div>

          <div className="h-6 w-px bg-[#e0e0e0] mx-2"></div>
          <nav className="flex gap-6 items-center">
            {/* Risk Map: visible to all */}
            <Link 
              to="/app/risk-map" 
              className={`text-sm font-bold uppercase tracking-wider ${location.pathname.includes('risk-map') ? 'text-[#d93850] border-b-2 border-[#d93850] pb-1' : 'text-[#666666] hover:text-[#d93850]'}`}
            >
              {t('nav_risk_map')}
            </Link>

            {/* About: visible to all */}
            <Link 
              to="/app/about" 
              className={`text-sm font-bold uppercase tracking-wider ${location.pathname.includes('about') ? 'text-[#d93850] border-b-2 border-[#d93850] pb-1' : 'text-[#666666] hover:text-[#d93850]'}`}
            >
              {t('nav_about_us')}
            </Link>

            {/* Stations: visible to MDoNER, Zonal Admin, District Admin (hidden for Citizen) */}
            {!isCitizen && (
              <Link 
                to="/app/stations" 
                className={`text-sm font-bold uppercase tracking-wider ${location.pathname.includes('stations') ? 'text-[#d93850] border-b-2 border-[#d93850] pb-1' : 'text-[#666666] hover:text-[#d93850]'}`}
              >
                {t('nav_stations')}
              </Link>
            )}

            {/* Alerts: visible to MDoNER, Zonal Admin, District Admin (hidden for Citizen) */}
            {!isCitizen && (
              <Link 
                to="/app/alerts" 
                className={`text-sm font-bold uppercase tracking-wider relative ${location.pathname.includes('alerts') ? 'text-[#d93850] border-b-2 border-[#d93850] pb-1' : 'text-[#666666] hover:text-[#d93850]'}`}
              >
                <span>{t('nav_alerts')}</span>
                {activeAlert && (
                  <span className="ml-1.5 inline-flex items-center px-1.5 py-0.2 text-[9px] font-black bg-[#d93850] text-white rounded-full animate-pulse">
                    1
                  </span>
                )}
              </Link>
            )}

            {/* Uploads: visible to Citizen (only their uploads) and MDoNER Employee (all uploads). Hidden for Zonal & District Admin */}
            {(isCitizen || isMdoner) && (
              <Link 
                to="/app/uploads" 
                className={`text-sm font-bold uppercase tracking-wider flex items-center gap-1.5 ${location.pathname.includes('uploads') ? 'text-[#d93850] border-b-2 border-[#d93850] pb-1' : 'text-[#666666] hover:text-[#d93850]'}`}
              >
                <span>{isCitizen ? 'My Uploads' : t('nav_uploads')}</span>
                <span className="text-[9px] bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded font-black uppercase">
                  {t('nav_media')}
                </span>
              </Link>
            )}

            {/* AI Models / Stats */}
            <Link 
              to="/app/model-comparison" 
              className={`text-sm font-bold uppercase tracking-wider flex items-center gap-1.5 ${location.pathname.includes('model-comparison') ? 'text-[#d93850] border-b-2 border-[#d93850] pb-1' : 'text-[#666666] hover:text-[#d93850]'}`}
            >
              <span>{t('nav_model_comparison') || 'AI Models'}</span>
              <span className="text-[9px] bg-emerald-100 text-emerald-800 border border-emerald-300 px-1.5 py-0.5 rounded font-black uppercase">
                SOTA
              </span>
            </Link>

            {/* IoT Simulator: visible to all roles except Citizen */}
            {!isCitizen && (
              <Link 
                to="/app/simulator" 
                className={`text-sm font-bold uppercase tracking-wider flex items-center gap-1.5 ${location.pathname.includes('simulator') ? 'text-[#d93850] border-b-2 border-[#d93850] pb-1' : 'text-[#666666] hover:text-[#d93850]'}`}
              >
                <span>{t('nav_iot') || 'IoT'}</span>
                <span className="text-[9px] bg-slate-900 text-cyan-400 px-1.5 py-0.5 rounded font-mono font-black uppercase">
                  SIM
                </span>
              </Link>
            )}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          {/* Audio Alert Beep Mute/Unmute Toggle */}
          <button
            onClick={toggleMute}
            className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs font-bold transition-colors ${
              isMuted
                ? 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                : 'bg-red-50 text-[#d93850] border border-red-200 hover:bg-red-100'
            }`}
            title={isMuted ? 'Alarm Beep Muted (Click to Unmute)' : 'Alarm Beep Active (Click to Mute)'}
          >
            <span>{isMuted ? t('alarm_muted') : t('alarm_on')}</span>
          </button>

          {/* Multilingual Switcher Dropdown */}
          <div className="relative group" ref={dropdownRef}>
            <button 
              onClick={() => setLangOpen(!langOpen)}
              className="flex items-center gap-1.5 rounded border border-[#cccccc] bg-[#f4f6f8] px-3 py-1.5 text-xs font-bold text-[#333333] hover:bg-[#e2e8f0]"
            >
              <span className="text-xs">🌐</span>
              <span>{languageOptions.find(o => o.code === language)?.label || language}</span>
              <svg className="w-3 h-3 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
              </svg>
            </button>
            {langOpen && (
              <div className="absolute right-0 top-full mt-1 w-36 rounded border border-[#e0e0e0] bg-white shadow-xl z-50 overflow-hidden divide-y divide-slate-100">
                {languageOptions.map(opt => (
                  <button 
                    key={opt.code} 
                    onClick={() => { setLanguage(opt.code); setLangOpen(false); }}
                    className={`block w-full px-3.5 py-2 text-left text-xs font-bold flex justify-between items-center transition-colors ${
                      language === opt.code ? 'bg-red-50 text-[#d93850]' : 'hover:bg-[#f4f6f8] text-[#333333]'
                    }`}
                  >
                    <span>{opt.label}</span>
                    <span className="text-[10px] font-mono text-slate-400 font-normal">{opt.code}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={handleSignOut}
            className="rounded bg-[#333333] px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-white hover:bg-[#1a1a1a]"
          >
            {t('nav_sign_out')}
          </button>
        </div>
      </header>

      {/* Main Content Viewport */}
      <main className="flex-1 min-h-0 w-full relative overflow-hidden">
        <Outlet />
      </main>
    </div>
  );
}