import React from 'react';

export default function AboutPage() {
  return (
    <div className="flex flex-col h-full w-full bg-[#f4f6f8] overflow-y-auto">
      {/* Official Header Banner */}
      <div className="bg-[#1a202c] text-white px-8 py-6 border-b-4 border-[#d93850]">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest bg-[#d93850] px-2 py-1 text-white">
              Official Portal
            </span>
            <h1 className="text-2xl font-black uppercase tracking-wider mt-2">
              North-Eastern Regional Hazard & Risk Monitoring System
            </h1>
            <p className="text-xs text-[#cbd5e1] font-medium mt-1">
              Ministry of Disaster Management & Regional Infrastructure • Government Initiative
            </p>
          </div>
          <div className="bg-[#2d3748] px-4 py-3 border border-[#4a5568] text-right">
            <div className="text-[10px] uppercase font-bold text-[#a0aec0]">System Version</div>
            <div className="text-xs font-black text-white tracking-widest">v4.2.0-PROD</div>
          </div>
        </div>
      </div>

      {/* Main Content Container */}
      <div className="max-w-5xl mx-auto w-full p-8 space-y-8">
        
        {/* Mission Statement */}
        <div className="bg-white p-6 shadow-sm border-l-4 border-[#d93850]">
          <h2 className="text-sm font-black uppercase tracking-widest text-[#333333] mb-3">
            Mandate & Objective
          </h2>
          <p className="text-xs font-medium text-[#4a5568] leading-relaxed">
            The North-Eastern Regional Hazard & Risk Monitoring System is a centralized GIS-enabled decision support framework designed to provide real-time vulnerability analytics, landslide susceptibility tracking, flood forecasting, and micro-climatic assessments across administrative tiers (ADM1 through ADM5). This portal empowers disaster response authorities, district administrators, and field operators with empirical data to mitigate natural hazards and coordinate rapid emergency response.
          </p>
        </div>

        {/* Core Architecture & Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-5 shadow-sm border border-[#e2e8f0]">
            <div className="text-xs font-black uppercase tracking-wider text-[#d93850] mb-2">
              Multi-Tier Drilldown
            </div>
            <p className="text-[11px] text-[#64748b] leading-normal">
              Granular spatial mapping scaling seamlessly from state-level overviews down to municipal village and ward divisions.
            </p>
          </div>

          <div className="bg-white p-5 shadow-sm border border-[#e2e8f0]">
            <div className="text-xs font-black uppercase tracking-wider text-[#d93850] mb-2">
              Telemetry & Sensors
            </div>
            <p className="text-[11px] text-[#64748b] leading-normal">
              Integration with automated rain gauges, seismic monitors, and active ground kiosks for live parameter feeds.
            </p>
          </div>

          <div className="bg-white p-5 shadow-sm border border-[#e2e8f0]">
            <div className="text-xs font-black uppercase tracking-wider text-[#d93850] mb-2">
              Role-Based Access
            </div>
            <p className="text-[11px] text-[#64748b] leading-normal">
              Secure authentication tiers isolating public analytics from administrative hazard overrides and telemetry configurations.
            </p>
          </div>
        </div>

        {/* Regulatory & Emergency Contacts */}
        <div className="bg-white p-6 shadow-sm border border-[#e2e8f0]">
          <h3 className="text-xs font-black uppercase tracking-widest text-[#333333] mb-4">
            Emergency Control Room & Helplines
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-bold text-[#4a5568]">
            <div className="p-3 bg-[#f8fafc] border border-[#e2e8f0] flex justify-between">
              <span>Central Control Helpline:</span>
              <span className="text-[#d93850]">1077 / 112</span>
            </div>
            <div className="p-3 bg-[#f8fafc] border border-[#e2e8f0] flex justify-between">
              <span>Technical Support Desk:</span>
              <span className="text-[#333333]">support-ner@hazardmgmt.gov.in</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}