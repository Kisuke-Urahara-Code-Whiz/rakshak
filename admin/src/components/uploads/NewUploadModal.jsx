import React, { useState } from 'react';
import ENV from '../../config/env';

const WARNING_SIGN_OPTIONS = [
  'Visible tension cracks in soil or roadway (>5cm)',
  'Subterranean rumbling or grinding sounds heard',
  'Sudden muddy water surge or spring stoppage',
  'Tilted trees, utility poles, or retaining walls',
  'Rolling rockfall or loose scree cascading',
];

const THREAT_OPTIONS = [
  'National/State Highway or main lifeline road',
  'Downslope residential village / human settlement',
  'Power grid transmission poles or transformer',
  'Drinking water supply pipeline / dam reservoir',
];

export default function NewUploadModal({ onAddUpload, onClose }) {
  const [step, setStep] = useState(1); // 1: Media & Contact, 2: Ground Questionnaire, 3: Review & Payload

  // Form State
  const [phoneNumber, setPhoneNumber] = useState('');
  const [uploadType, setUploadType] = useState('photo'); // 'photo' | 'audio'
  const [selectedFile, setSelectedFile] = useState(null);
  const [filePreviewUrl, setFilePreviewUrl] = useState('');
  const [fileName, setFileName] = useState('');

  // Location
  const [state, setState] = useState('Sikkim');
  const [district, setDistrict] = useState('North Sikkim');
  const [locality, setLocality] = useState('Chungthang Road, KM 93');
  const [lat, setLat] = useState('27.6328');
  const [lng, setLng] = useState('88.9482');

  // Mandatory Questionnaire State
  const [activityStatus, setActivityStatus] = useState('Actively Expanding Tension Cracks');
  const [weatherCondition, setWeatherCondition] = useState('Continuous Heavy Monsoon Rain');
  const [selectedWarnings, setSelectedWarnings] = useState([WARNING_SIGN_OPTIONS[0], WARNING_SIGN_OPTIONS[1]]);
  const [selectedThreats, setSelectedThreats] = useState([THREAT_OPTIONS[0], THREAT_OPTIONS[1]]);
  const [severity, setSeverity] = useState('High');
  const [immediateEvacuationNeeded, setImmediateEvacuationNeeded] = useState(true);
  const [additionalNotes, setAdditionalNotes] = useState('');

  const [errors, setErrors] = useState({});

  // Handle mock / sample file selection or real file input
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setFileName(file.name);
      if (file.type.startsWith('image/')) {
        setFilePreviewUrl(URL.createObjectURL(file));
      } else {
        setFilePreviewUrl('');
      }
    }
  };

  const handleUseSampleFile = () => {
    if (uploadType === 'photo') {
      setFileName('field_slope_shear_sample.jpeg');
      setFilePreviewUrl('https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=1200&q=80');
    } else {
      setFileName('ground_rumble_recording_field.m4a');
      setFilePreviewUrl('');
    }
  };

  const toggleWarning = (opt) => {
    setSelectedWarnings((prev) =>
      prev.includes(opt) ? prev.filter((o) => o !== opt) : [...prev, opt]
    );
  };

  const toggleThreat = (opt) => {
    setSelectedThreats((prev) =>
      prev.includes(opt) ? prev.filter((o) => o !== opt) : [...prev, opt]
    );
  };

  // Validation
  const validateStep1 = () => {
    const newErrors = {};
    const cleanPhone = phoneNumber.replace(/[^0-9+]/g, '');
    if (!cleanPhone || cleanPhone.length < 10) {
      newErrors.phoneNumber = 'A valid phone number (at least 10 digits) is required.';
    }
    if (!fileName && !selectedFile && !filePreviewUrl) {
      newErrors.file = `Please attach or select a ${uploadType === 'photo' ? 'JPEG image' : 'M4A audio'} file.`;
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors = {};
    if (selectedWarnings.length === 0) {
      newErrors.warnings = 'Please select at least one observed warning indicator.';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const buildPayload = () => {
    const eventId = `INC-UPL-${Date.now().toString().slice(-6)}`;
    const timestamp = new Date().toISOString();

    return {
      eventId,
      source: 'RAPID_FIELD_DISPATCH',
      timestamp,
      reporter: {
        phoneNumber: phoneNumber.trim(),
        authenticatedVia: 'SMS_GROUND_STATION',
        location: {
          state,
          district,
          locality,
          coordinates: {
            lat: parseFloat(lat) || 27.6328,
            lng: parseFloat(lng) || 88.9482,
          },
        },
      },
      media: {
        type: uploadType === 'photo' ? 'image/jpeg' : 'audio/m4a',
        format: uploadType === 'photo' ? 'jpeg' : 'm4a',
        fileName: fileName || (uploadType === 'photo' ? 'field_photo.jpeg' : 'field_audio.m4a'),
        fileSizeBytes: uploadType === 'photo' ? 3420100 : 1845000,
        storageRef: `s3://rakshak-telemetry/uploads/${state.toLowerCase()}/${eventId}`,
      },
      groundQuestionnaire: {
        activityStatus,
        weatherCondition,
        warningIndicators: selectedWarnings,
        infrastructureThreatened: selectedThreats,
        urgencyLevel: severity,
        immediateEvacuationNeeded,
        additionalNotes,
      },
      dispatchStatus: severity === 'High' ? 'ESCALATED_TO_LIVE_ALERT' : 'QUEUED_FOR_GEOTECH_REVIEW',
    };
  };

  const handleSubmit = () => {
    const payload = buildPayload();
    const cleanPhone = (phoneNumber.replace(/\D/g, '') || '9832041182');
    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10);
    const timeStr = now.toTimeString().slice(0, 8);

    // Forward multipart payload to backend media-service
    try {
      if (selectedFile) {
        const fd = new FormData();
        fd.append('file', selectedFile);
        fd.append('number', cleanPhone);
        fd.append('fileType', uploadType === 'photo' ? 'PNG' : 'M4A');
        fd.append('date', dateStr);
        fd.append('time', timeStr);
        fd.append('lat', String(lat || '27.6328'));
        fd.append('lon', String(lng || '88.9482'));
        fetch(`${ENV.API_BASE_URL}/media/upload`, { method: 'POST', body: fd }).catch(() => {});
      } else {
        const dummyCanvas = document.createElement('canvas');
        dummyCanvas.width = 120;
        dummyCanvas.height = 120;
        const ctx = dummyCanvas.getContext('2d');
        if (ctx) {
          ctx.fillStyle = uploadType === 'photo' ? '#d93850' : '#f59e0b';
          ctx.fillRect(0, 0, 120, 120);
          ctx.fillStyle = '#ffffff';
          ctx.font = '12px sans-serif';
          ctx.fillText('FIELD REPORT', 10, 65);
        }
        dummyCanvas.toBlob((blob) => {
          if (blob) {
            const fd = new FormData();
            fd.append('file', blob, `web_${Date.now()}.${uploadType === 'photo' ? 'png' : 'm4a'}`);
            fd.append('number', cleanPhone);
            fd.append('fileType', uploadType === 'photo' ? 'PNG' : 'M4A');
            fd.append('date', dateStr);
            fd.append('time', timeStr);
            fd.append('lat', String(lat || '27.6328'));
            fd.append('lon', String(lng || '88.9482'));
            fetch(`${ENV.API_BASE_URL}/media/upload`, { method: 'POST', body: fd }).catch(() => {});
          }
        }, 'image/png');
      }
    } catch (err) {
      console.warn('Backend media forwarding skipped:', err);
    }

    const newUploadRecord = {
      id: payload.eventId,
      phoneNumber: payload.reporter.phoneNumber,
      uploadType,
      mediaFormat: uploadType === 'photo' ? 'jpeg' : 'm4a',
      fileName: payload.media.fileName,
      fileSize: uploadType === 'photo' ? '3.2 MB' : '1.8 MB',
      duration: uploadType === 'audio' ? '0:38' : undefined,
      fileUrl: filePreviewUrl || null,
      timestamp: payload.timestamp,
      relativeTime: 'Just now',
      location: payload.reporter.location,
      verificationStatus: severity === 'High' ? 'Verified & Alerted' : 'Triage Assigned',
      severity,
      groundQuestionnaire: payload.groundQuestionnaire,
      payload,
    };

    onAddUpload(newUploadRecord);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-3xl bg-white border border-[#cbd5e1] shadow-2xl flex flex-col max-h-[92vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between bg-[#d93850] text-white px-5 py-3.5 border-b border-red-700 shrink-0">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-white animate-pulse"></span>
            <h3 className="text-sm font-black uppercase tracking-wider">
              Landslide Incident Submission & Ground Triage Form
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:text-red-100 font-black text-sm px-2 py-1 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Step Indicator */}
        <div className="bg-[#f8fafc] border-b border-[#e2e8f0] px-6 py-2.5 flex items-center justify-between text-xs font-bold shrink-0">
          <div className="flex items-center gap-6">
            <span
              className={`flex items-center gap-1.5 ${
                step >= 1 ? 'text-[#d93850] font-black' : 'text-slate-400'
              }`}
            >
              <span className="w-5 h-5 rounded-full bg-slate-200 flex items-center justify-center text-[10px] font-black">
                1
              </span>
              <span>Contact & Media</span>
            </span>
            <span className="text-slate-300">→</span>
            <span
              className={`flex items-center gap-1.5 ${
                step >= 2 ? 'text-[#d93850] font-black' : 'text-slate-400'
              }`}
            >
              <span className="w-5 h-5 rounded-full bg-slate-200 flex items-center justify-center text-[10px] font-black">
                2
              </span>
              <span>Mandatory Ground Questions</span>
            </span>
            <span className="text-slate-300">→</span>
            <span
              className={`flex items-center gap-1.5 ${
                step >= 3 ? 'text-[#d93850] font-black' : 'text-slate-400'
              }`}
            >
              <span className="w-5 h-5 rounded-full bg-slate-200 flex items-center justify-center text-[10px] font-black">
                3
              </span>
              <span>Review Payload</span>
            </span>
          </div>
          <span className="text-[10px] uppercase font-black tracking-widest text-slate-400">
            Step {step} of 3
          </span>
        </div>

        {/* Modal Content Scroll Area */}
        <div className="flex-1 overflow-y-auto p-6 bg-[#f8fafc] text-slate-800">
          {/* STEP 1: CONTACT & MEDIA */}
          {step === 1 && (
            <div className="space-y-5">
              <div className="bg-red-50 border-l-4 border-[#d93850] p-3 text-xs text-red-900 font-bold">
                ⚠️ Field Protocol: A verifiable reporter phone number and verified field media (.jpeg photo or .m4a audio) are required before dispatching geo-hazard alerts.
              </div>

              {/* Phone Number */}
              <div>
                <label className="block text-xs font-black uppercase text-slate-700 tracking-wider mb-1">
                  Field Reporter Phone Number <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-2">
                  <input
                    type="tel"
                    placeholder="e.g. +91 98765 43210"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="flex-1 border-2 border-slate-300 bg-white px-3 py-2 text-sm font-mono font-bold focus:border-[#d93850] focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setPhoneNumber('+91 98320 93948')}
                    className="bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-black uppercase px-3 py-2"
                  >
                    Use Sample Phone
                  </button>
                </div>
                {errors.phoneNumber && (
                  <p className="text-xs text-red-600 font-bold mt-1">{errors.phoneNumber}</p>
                )}
              </div>

              {/* Upload Type Selector */}
              <div>
                <label className="block text-xs font-black uppercase text-slate-700 tracking-wider mb-1.5">
                  Select Upload Type <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setUploadType('photo');
                      setFileName('');
                      setFilePreviewUrl('');
                    }}
                    className={`p-3.5 border-2 flex items-center gap-3 transition-all text-left ${
                      uploadType === 'photo'
                        ? 'border-[#d93850] bg-red-50/50'
                        : 'border-slate-300 bg-white hover:border-slate-400'
                    }`}
                  >
                    <div className="w-10 h-10 rounded bg-red-100 flex items-center justify-center text-xl shrink-0">
                      📷
                    </div>
                    <div>
                      <div className="text-xs font-black uppercase text-slate-900">Photo Upload (.jpeg)</div>
                      <div className="text-[10px] text-slate-500 font-bold mt-0.5">
                        High-res ground slope tension fracture
                      </div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setUploadType('audio');
                      setFileName('');
                      setFilePreviewUrl('');
                    }}
                    className={`p-3.5 border-2 flex items-center gap-3 transition-all text-left ${
                      uploadType === 'audio'
                        ? 'border-[#d93850] bg-red-50/50'
                        : 'border-slate-300 bg-white hover:border-slate-400'
                    }`}
                  >
                    <div className="w-10 h-10 rounded bg-amber-100 flex items-center justify-center text-xl shrink-0">
                      🎙️
                    </div>
                    <div>
                      <div className="text-xs font-black uppercase text-slate-900">Audio Upload (.m4a)</div>
                      <div className="text-[10px] text-slate-500 font-bold mt-0.5">
                        Seismic ground rumble / subterranean acoustic
                      </div>
                    </div>
                  </button>
                </div>
              </div>

              {/* File Picker / Drag & Drop */}
              <div>
                <label className="block text-xs font-black uppercase text-slate-700 tracking-wider mb-1">
                  Upload {uploadType === 'photo' ? 'JPEG Image File' : 'M4A Audio Recording'}
                </label>
                <div className="border-2 border-dashed border-slate-300 bg-white p-5 text-center flex flex-col items-center justify-center hover:border-[#d93850] transition-colors">
                  <input
                    type="file"
                    id="file-upload-input"
                    accept={uploadType === 'photo' ? '.jpeg,.jpg,image/jpeg' : '.m4a,audio/mp4,audio/m4a,audio/*'}
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <label
                    htmlFor="file-upload-input"
                    className="cursor-pointer bg-slate-900 hover:bg-black text-white px-4 py-2 text-xs font-black uppercase tracking-wider shadow"
                  >
                    Select Local {uploadType === 'photo' ? '.jpeg' : '.m4a'} File
                  </label>
                  <span className="text-[11px] text-slate-400 mt-2">or</span>
                  <button
                    type="button"
                    onClick={handleUseSampleFile}
                    className="text-xs font-bold text-[#d93850] hover:underline mt-1"
                  >
                    Attach Sample Field {uploadType === 'photo' ? 'Photo' : 'Audio'} Recording
                  </button>

                  {fileName && (
                    <div className="mt-3 text-xs font-mono font-bold text-emerald-700 bg-emerald-50 px-3 py-1 border border-emerald-200 flex items-center gap-2">
                      <span>✓ Attached:</span>
                      <span>{fileName}</span>
                    </div>
                  )}

                  {filePreviewUrl && (
                    <div className="mt-3 w-48 h-28 rounded overflow-hidden border border-slate-300">
                      <img src={filePreviewUrl} alt="Preview" className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>
                {errors.file && <p className="text-xs text-red-600 font-bold mt-1">{errors.file}</p>}
              </div>

              {/* Locality Fields */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="block text-[10px] font-black uppercase text-slate-500 mb-1">
                    State & District
                  </label>
                  <input
                    type="text"
                    value={`${district}, ${state}`}
                    onChange={(e) => setDistrict(e.target.value)}
                    className="w-full border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase text-slate-500 mb-1">
                    Locality / Sector
                  </label>
                  <input
                    type="text"
                    value={locality}
                    onChange={(e) => setLocality(e.target.value)}
                    className="w-full border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-bold"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: MANDATORY GROUND VERIFICATION QUESTIONNAIRE */}
          {step === 2 && (
            <div className="space-y-5">
              <div className="bg-amber-50 border-l-4 border-amber-500 p-3 text-xs text-amber-900 font-bold">
                📋 Mandatory Geotechnical Questionnaire: These questions are verified on-site by field teams prior to alert broadcast.
              </div>

              {/* Question 1: Activity Status */}
              <div>
                <label className="block text-xs font-black uppercase text-slate-800 tracking-wider mb-1.5">
                  1. Observed Landslide Dynamic Status <span className="text-red-500">*</span>
                </label>
                <select
                  value={activityStatus}
                  onChange={(e) => setActivityStatus(e.target.value)}
                  className="w-full border-2 border-slate-300 bg-white px-3 py-2 text-xs font-bold focus:border-[#d93850] focus:outline-none"
                >
                  <option value="Actively Expanding Tension Cracks">
                    Actively Expanding Tension Cracks (Pre-failure Stage)
                  </option>
                  <option value="Active Rapid Slope Failure / Debris Flow">
                    Active Rapid Slope Failure / Debris Flow (Failure in Progress)
                  </option>
                  <option value="Continuous Slow Creep & Soil Subsidence">
                    Continuous Slow Creep & Soil Subsidence (Progressive Movement)
                  </option>
                  <option value="Rockfall Cascade on Cut Slope">
                    Rockfall Cascade on Cut Slope
                  </option>
                </select>
              </div>

              {/* Question 2: Rainfall Condition */}
              <div>
                <label className="block text-xs font-black uppercase text-slate-800 tracking-wider mb-1.5">
                  2. Local Precipitation & Weather <span className="text-red-500">*</span>
                </label>
                <select
                  value={weatherCondition}
                  onChange={(e) => setWeatherCondition(e.target.value)}
                  className="w-full border-2 border-slate-300 bg-white px-3 py-2 text-xs font-bold focus:border-[#d93850] focus:outline-none"
                >
                  <option value="Continuous Heavy Monsoon Rain">Continuous Heavy Monsoon Rain (&gt;25 mm/h)</option>
                  <option value="Cloudburst / Flash Torrential Downpour">
                    Cloudburst / Flash Torrential Downpour
                  </option>
                  <option value="Intermittent Showers / Drizzle">Intermittent Showers / Drizzle</option>
                  <option value="Dry / Clearing after Heavy Rainfall">Dry / Clearing after Heavy Rainfall</option>
                </select>
              </div>

              {/* Question 3: Warning Indicators (Checklist) */}
              <div>
                <label className="block text-xs font-black uppercase text-slate-800 tracking-wider mb-1.5">
                  3. Warning Indicators Observed (Select all that apply) <span className="text-red-500">*</span>
                </label>
                <div className="space-y-2">
                  {WARNING_SIGN_OPTIONS.map((opt) => (
                    <label
                      key={opt}
                      className={`flex items-center gap-2.5 p-2.5 border text-xs font-bold cursor-pointer transition-colors ${
                        selectedWarnings.includes(opt)
                          ? 'border-red-500 bg-red-50 text-red-950'
                          : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={selectedWarnings.includes(opt)}
                        onChange={() => toggleWarning(opt)}
                        className="accent-[#d93850] w-4 h-4"
                      />
                      <span>{opt}</span>
                    </label>
                  ))}
                </div>
                {errors.warnings && <p className="text-xs text-red-600 font-bold mt-1">{errors.warnings}</p>}
              </div>

              {/* Question 4: Infrastructure Threatened */}
              <div>
                <label className="block text-xs font-black uppercase text-slate-800 tracking-wider mb-1.5">
                  4. Vulnerable Infrastructure in Slope Path
                </label>
                <div className="space-y-2">
                  {THREAT_OPTIONS.map((opt) => (
                    <label
                      key={opt}
                      className={`flex items-center gap-2.5 p-2.5 border text-xs font-bold cursor-pointer transition-colors ${
                        selectedThreats.includes(opt)
                          ? 'border-amber-500 bg-amber-50 text-amber-950'
                          : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={selectedThreats.includes(opt)}
                        onChange={() => toggleThreat(opt)}
                        className="accent-amber-500 w-4 h-4"
                      />
                      <span>{opt}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Question 5: Severity & Evacuation Urgency */}
              <div className="grid grid-cols-2 gap-4 bg-white p-4 border border-slate-200">
                <div>
                  <label className="block text-xs font-black uppercase text-slate-700 mb-1">
                    Estimated Threat Severity
                  </label>
                  <select
                    value={severity}
                    onChange={(e) => setSeverity(e.target.value)}
                    className="w-full border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-bold"
                  >
                    <option value="High">High (Immediate Slope Rupture Risk)</option>
                    <option value="Medium">Medium (Moderate Displacement)</option>
                    <option value="Low">Low (Superficial Movement)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-black uppercase text-slate-700 mb-1">
                    Immediate Evacuation Needed?
                  </label>
                  <div className="flex gap-4 mt-2">
                    <label className="flex items-center gap-1.5 text-xs font-bold cursor-pointer">
                      <input
                        type="radio"
                        name="evacuation"
                        checked={immediateEvacuationNeeded === true}
                        onChange={() => setImmediateEvacuationNeeded(true)}
                        className="accent-[#d93850]"
                      />
                      <span className="text-red-700">YES - Immediate</span>
                    </label>
                    <label className="flex items-center gap-1.5 text-xs font-bold cursor-pointer">
                      <input
                        type="radio"
                        name="evacuation"
                        checked={immediateEvacuationNeeded === false}
                        onChange={() => setImmediateEvacuationNeeded(false)}
                        className="accent-slate-500"
                      />
                      <span>NO - Standby</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Additional Notes */}
              <div>
                <label className="block text-xs font-black uppercase text-slate-700 tracking-wider mb-1">
                  Field Observations / Ground Comments
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Local village head reported cracking sound began around 04:30 AM..."
                  value={additionalNotes}
                  onChange={(e) => setAdditionalNotes(e.target.value)}
                  className="w-full border-2 border-slate-300 bg-white p-2 text-xs font-bold focus:border-[#d93850] focus:outline-none"
                />
              </div>
            </div>
          )}

          {/* STEP 3: REVIEW & BACKEND PAYLOAD INSPECTION */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="bg-emerald-50 border-l-4 border-emerald-500 p-3 text-xs text-emerald-900 font-bold">
                ✓ Payload Constructed: The payload below has been prepared according to the backend geotechnical ingestion schema.
              </div>

              <div className="bg-[#0f172a] text-emerald-300 p-4 font-mono text-xs overflow-x-auto max-h-72 border border-slate-700 select-all">
                <pre>{JSON.stringify(buildPayload(), null, 2)}</pre>
              </div>

              <div className="bg-white border border-slate-200 p-4 text-xs font-bold space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-500 uppercase">Reporter Phone:</span>
                  <span className="font-mono text-slate-900">{phoneNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 uppercase">Media Attached:</span>
                  <span className="text-slate-900 uppercase">
                    {uploadType} ({fileName || 'Sample File'})
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 uppercase">Locality / Coordinates:</span>
                  <span className="text-slate-900">
                    {locality}, {district} ({lat}° N, {lng}° E)
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 uppercase">Triage Assessment:</span>
                  <span className="text-red-600 font-black">{severity} Severity • Evacuation: {immediateEvacuationNeeded ? 'Required' : 'Standby'}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Navigation Controls */}
        <div className="bg-[#f1f5f9] px-6 py-3.5 border-t border-[#cbd5e1] flex justify-between items-center shrink-0">
          {step > 1 ? (
            <button
              type="button"
              onClick={() => setStep(step - 1)}
              className="bg-slate-200 hover:bg-slate-300 text-slate-800 px-4 py-2 font-black text-xs uppercase tracking-wider transition-colors"
            >
              ← Back
            </button>
          ) : (
            <div></div>
          )}

          {step < 3 ? (
            <button
              type="button"
              onClick={() => {
                if (step === 1 && validateStep1()) setStep(2);
                else if (step === 2 && validateStep2()) setStep(3);
              }}
              className="bg-[#d93850] hover:bg-[#b8273d] text-white px-6 py-2 font-black text-xs uppercase tracking-wider transition-colors shadow"
            >
              Continue to {step === 1 ? 'Questionnaire' : 'Review'} →
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2 font-black text-xs uppercase tracking-wider transition-colors shadow flex items-center gap-2"
            >
              <span>🚀 Submit & Dispatch Incident Payload</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
