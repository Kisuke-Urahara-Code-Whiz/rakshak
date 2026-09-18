import React from 'react';
import PageHeader from '../components/common/PageHeader';
import TowerBroadcastCard from '../components/alerts/TowerBroadcastCard';
import SmsDispatchLog from '../components/alerts/SmsDispatchLog';
import { EMERGENCY_RECIPIENTS } from '../data/emergencyRecipients';
import { useAlert } from '../context/AlertContext';
import { useLanguage } from '../context/LanguageContext';

export default function Alerts() {
  const { activeAlert, dismissAlert, wsUrl, wsStatus, isWsConnected } = useAlert();
  const { t } = useLanguage();

  const totalSmsCount = 1420;

  return (
    <div className="flex-1 flex flex-col h-full min-h-0 w-full bg-[#f4f6f8] overflow-hidden p-6 select-none">
      <PageHeader
        title={t('alerts_title')}
        subtitle={t('alerts_subtitle')}
      >
        <div className="flex items-center gap-2">
          {activeAlert && (
            <button
              onClick={dismissAlert}
              className="bg-[#333333] hover:bg-[#1a1a1a] text-white px-3.5 py-2 font-black text-xs uppercase tracking-wider transition-colors"
            >
              {t('alerts_dismiss_btn')}
            </button>
          )}
        </div>
      </PageHeader>

      {/* Display alert ONLY when an active WebSocket payload is received */}
      {activeAlert ? (
        <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-12 gap-5 overflow-hidden">
          <TowerBroadcastCard activeAlert={activeAlert} />
          <SmsDispatchLog recipients={EMERGENCY_RECIPIENTS} totalSmsCount={totalSmsCount} />
        </div>
      ) : (
        <div className="flex-1 min-h-0 bg-white border border-[#cbd5e1] shadow-sm flex flex-col items-center justify-center p-8 text-center">
          <div className="max-w-xl flex flex-col items-center">
            {/* Status Radar / Standby Icon */}
            <div className="relative w-24 h-24 mb-6 flex items-center justify-center">
              <div className="absolute inset-0 rounded-full border-2 border-slate-200 animate-ping opacity-30"></div>
              <div className="w-16 h-16 rounded-full bg-[#f4f6f8] border-2 border-slate-300 flex items-center justify-center">
                <span className="text-2xl">📡</span>
              </div>
            </div>

            <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-100 border border-slate-300 text-slate-700 text-xs font-mono font-bold uppercase mb-3">
              <span className={`w-2 h-2 rounded-full ${isWsConnected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`}></span>
              <span>{isWsConnected ? 'WEBSOCKET ACTIVE • CHANNEL STANDBY' : 'WEBSOCKET CONNECTING...'}</span>
            </div>

            <h3 className="text-lg font-black uppercase tracking-wider text-[#1a1a1a] mb-2">
              {t('alerts_standby_title')}
            </h3>

            <p className="text-xs text-[#666666] leading-relaxed max-w-md mb-6">
              {t('alerts_standby_desc')}
            </p>

            <div className="p-3 bg-[#f8fafc] border border-[#e2e8f0] w-full max-w-md text-left font-mono text-[11px] text-slate-600">
              <div className="flex justify-between pb-1 border-b border-slate-200">
                <span className="font-bold text-slate-400">ENDPOINT:</span>
                <span className="text-slate-800 font-bold">{wsUrl}</span>
              </div>
              <div className="flex justify-between pt-1">
                <span className="font-bold text-slate-400">SUBSCRIBED EVENT:</span>
                <span className="text-[#d93850] font-bold">KIOSK_ALERT_EVENT</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
