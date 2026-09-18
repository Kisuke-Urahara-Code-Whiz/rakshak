import React from 'react';

// Right column of the Alerts page: SMS dispatch log table + footer status bar.
// Markup/behavior copied verbatim from Alerts.jsx.
export default function SmsDispatchLog({ recipients, totalSmsCount }) {
  return (
    <div className="lg:col-span-7 bg-white border border-[#cbd5e1] shadow-md flex flex-col overflow-hidden">
      <div className="p-4 border-b border-[#e2e8f0] bg-[#f8fafc] flex justify-between items-center">
        <div>
          <h2 className="text-xs font-black uppercase tracking-wider text-[#0f172a]">
            Emergency SMS Broadcaster
          </h2>
          <p className="text-[10px] font-bold text-[#64748b] uppercase mt-0.5">
            Targeted Government & Local Early Warning Dispatches
          </p>
        </div>

        {/* Total Dispatched Metric Badge */}
        <div className="bg-[#d93850] text-white px-3 py-1 text-right">
          <div className="text-[9px] font-bold uppercase tracking-wider">Total Dispatched</div>
          <div className="text-sm font-black tracking-wider leading-none mt-0.5">{totalSmsCount.toLocaleString()} SMS</div>
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto">
        <table className="w-full text-left border-collapse">
          <thead className="sticky top-0 bg-[#f8fafc] border-b border-[#cbd5e1] z-10 shadow-sm">
            <tr className="text-[10px] font-black uppercase tracking-widest text-[#475569]">
              <th className="p-3.5">Designated Authority & Role</th>
              <th className="p-3.5">Target Phone Number</th>
              <th className="p-3.5">Delivery Status</th>
              <th className="p-3.5 text-right">Timestamp</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#e2e8f0] text-xs font-bold text-[#333333]">
            {recipients.map((rec, i) => (
              <tr key={i} className="hover:bg-[#f8fafc] transition-colors">
                <td className="p-3.5">
                  <div className="font-black text-[#0f172a]">{rec.authority}</div>
                  <div className="text-[10px] font-bold text-[#64748b] mt-0.5">{rec.role}</div>
                </td>
                <td className="p-3.5 font-mono text-[#0f172a] font-bold">
                  {rec.phone}
                </td>
                <td className="p-3.5">
                  <span className="inline-flex items-center gap-1.5 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                    {rec.status}
                  </span>
                </td>
                <td className="p-3.5 text-right text-[11px] font-medium text-[#64748b]">
                  {rec.time}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="p-4 bg-[#f8fafc] border-t border-[#e2e8f0] text-xs font-bold text-[#64748b] flex justify-between items-center">
        <span>Automated STOMP Gateway Active</span>
        <span className="text-emerald-600 font-black uppercase">SMS Gateway 100% Operational</span>
      </div>
    </div>
  );
}
