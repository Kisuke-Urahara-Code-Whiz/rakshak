/**
 * Regional Language Dictionaries for Rakshak Web Administration Portal
 * English (ENG), Hindi (HIN), Assamese (ASM), Bengali (BEN)
 */

export const TRANSLATIONS = {
  ENG: {
    // Navigation
    nav_risk_map: 'Risk Map',
    nav_about_us: 'About Us',
    nav_stations: 'Stations',
    nav_alerts: 'Alerts',
    nav_reports: 'Reports',
    nav_uploads: 'Uploads',
    nav_media: 'Media',
    nav_model_comparison: 'AI Models',
    nav_analytics: 'Analytics',
    nav_sign_out: 'Sign Out',
    
    // Status Bar
    ws_live: 'WS LIVE',
    ws_connecting: 'WS CONNECTING',
    ws_standby: 'WS STANDBY',
    alarm_on: '🔊 Alarm On',
    alarm_muted: '🔇 Muted',
    test_ws_alert: 'Test WS Alert',

    // Alerts Page
    alerts_title: 'Active Incident Alerts & Telemetry Broadcaster',
    alerts_subtitle: 'Real-time tower sensor broadcast and automated emergency SMS dispatch log',
    alerts_standby_title: 'NO ACTIVE HAZARD ALERT PAYLOAD',
    alerts_standby_desc: 'All regional geotechnical telemetry channels are normal. The emergency broadcasting siren and dispatch pipeline will activate automatically when a KIOSK_ALERT_EVENT payload is received via WebSocket.',
    alerts_trigger_btn: 'Send WebSocket Alert Payload',
    alerts_dismiss_btn: 'Dismiss Active Alert',
    alerts_listening: 'WebSocket Channel: Listening for real-time sensor events',

    // Reports Page
    reports_title: 'Civilian & Field Incident Dossiers',
    reports_subtitle: 'Field incident reports and ground dossiers submitted by mobile app users',
    reports_empty_title: 'NO USER INCIDENT REPORTS SUBMITTED YET',
    reports_empty_desc: 'Reports submitted by citizens and field officers via the Rakshak mobile app will automatically appear here in real-time.',
    reports_col_ref: 'Report Reference & Reporter',
    reports_col_region: 'Regional Location & GPS',
    reports_col_type: 'Incident Type & Media',
    reports_col_time: 'Submitted Timestamp',
    reports_col_status: 'Triage Status',
    reports_col_action: 'Action',
    reports_export_btn: 'Export Dossier',

    // Uploads Page
    uploads_title: 'Field Incident Media Submissions & Ground Triage',
    uploads_subtitle: 'Civilian & sensor ground uploads • Audio (.m4a) & Photo (.jpeg) telemetry dossier verification',
    uploads_submit_btn: 'Submit Incident Report',
    uploads_total: 'Total Submissions',
    uploads_photos: 'JPEG Photos',
    uploads_audio: 'M4A Audio',
    uploads_high_risk: 'High Risk Triage',
    uploads_search_placeholder: 'SEARCH BY PHONE, DISTRICT OR FILENAME...',
    uploads_live_sync: 'LIVE SYNC ACTIVE',
  },

  HIN: {
    // Navigation
    nav_risk_map: 'जोखिम मानचित्र',
    nav_about_us: 'हमारे बारे में',
    nav_stations: 'निगरानी केंद्र',
    nav_alerts: 'चेतावनी',
    nav_reports: 'प्रतिवेदन',
    nav_uploads: 'अपलोड',
    nav_media: 'मीडिया',
    nav_model_comparison: 'एआई मॉडल',
    nav_analytics: 'एनालिटिक्स',
    nav_sign_out: 'साइन आउट',
    
    // Status Bar
    ws_live: 'डेटा लाइव',
    ws_connecting: 'कनेक्ट हो रहा है',
    ws_standby: 'स्टैंडबाय',
    alarm_on: '🔊 सायरन चालू',
    alarm_muted: '🔇 मूक',
    test_ws_alert: 'परीक्षण अलर्ट',

    // Alerts Page
    alerts_title: 'सक्रिय आपदा चेतावनी एवं प्रसारण केंद्र',
    alerts_subtitle: 'वास्तविक समय टॉवर सेंसर प्रसारण एवं स्वचालित आपातकालीन संदेश प्रेषण लॉग',
    alerts_standby_title: 'वर्तमान में कोई सक्रिय चेतावनी पेलोड नहीं है',
    alerts_standby_desc: 'सभी क्षेत्रीय भू-तकनीकी सेंसर चैनल सामान्य हैं। जब भी वेबसॉकेट के माध्यम से कोई अलर्ट पेलोड प्राप्त होगा, सायरन और आपातकालीन प्रसारण स्वतः सक्रिय हो जाएगा।',
    alerts_trigger_btn: 'वेबसॉकेट अलर्ट भेजें',
    alerts_dismiss_btn: 'अलर्ट निरस्त करें',
    alerts_listening: 'वेबसॉकेट चैनल: वास्तविक समय सेंसर डेटा की निगरानी जारी है',

    // Reports Page
    reports_title: 'नागरिक एवं फील्ड घटना प्रतिवेदन',
    reports_subtitle: 'मोबाइल ऐप उपयोगकर्ताओं द्वारा प्रेषित घटना प्रतिवेदन एवं ग्राउंड दस्तावेज',
    reports_empty_title: 'अभी तक कोई उपयोगकर्ता प्रतिवेदन प्राप्त नहीं हुआ',
    reports_empty_desc: 'रक्षक मोबाइल ऐप से नागरिकों और फील्ड अधिकारियों द्वारा भेजे गए प्रतिवेदन यहां वास्तविक समय में दिखाई देंगे।',
    reports_col_ref: 'प्रतिवेदन संदर्भ एवं प्रेषक',
    reports_col_region: 'स्थान एवं जीपीएस निर्देशांक',
    reports_col_type: 'आपदा प्रकार एवं मीडिया',
    reports_col_time: 'प्रेषित समय',
    reports_col_status: 'सत्यापन स्थिति',
    reports_col_action: 'कार्रवाई',
    reports_export_btn: 'दस्तावेज डाउनलोड करें',

    // Uploads Page
    uploads_title: 'फील्ड घटना मीडिया प्रेषण एवं ग्राउंड सत्यापन',
    uploads_subtitle: 'नागरिक एवं सेंसर अपलोड • ऑडियो (.m4a) एवं फोटो (.jpeg) सत्यापन',
    uploads_submit_btn: 'घटना रिपोर्ट दर्ज करें',
    uploads_total: 'कुल प्रेषण',
    uploads_photos: 'तस्वीरें (JPEG)',
    uploads_audio: 'ऑडियो रिकॉर्डिंग',
    uploads_high_risk: 'उच्च जोखिम स्थिति',
    uploads_search_placeholder: 'फोन नंबर, जिला या फाइल नाम से खोजें...',
    uploads_live_sync: 'लाइव सिंक सक्रिय',
  },

  ASM: {
    // Navigation
    nav_risk_map: 'বিপদাশঙ্কা মানচিত্ৰ',
    nav_about_us: 'আমাৰ বিষয়ে',
    nav_stations: 'ষ্টেচনসমূহ',
    nav_alerts: 'সতৰ্কবাৰ্তা',
    nav_reports: 'প্ৰতিবেদনসমূহ',
    nav_uploads: 'আপলোডসমূহ',
    nav_media: 'মিডিয়া',
    nav_model_comparison: 'এআই মডেল',
    nav_analytics: 'বিশ্লেষণ',
    nav_sign_out: 'প্ৰস্থান',
    
    // Status Bar
    ws_live: 'WS লাইভ',
    ws_connecting: 'সংযোগ হৈ আছে',
    ws_standby: 'ষ্টেণ্ডবাই',
    alarm_on: '🔊 চাইৰেন অন',
    alarm_muted: '🔇 স্তব্ধ',
    test_ws_alert: 'পৰীক্ষামূলক সতৰ্কবাৰ্তা',

    // Alerts Page
    alerts_title: 'সক্ৰিয় দুৰ্যোগ সতৰ্কবাৰ্তা আৰু সম্প্ৰচাৰ কেন্দ্ৰ',
    alerts_subtitle: 'প্ৰকৃত সময়ৰ টাৱাৰ সংবেদক সম্প্ৰচাৰ আৰু জৰুৰীকালীন বাৰ্তা সংৰক্ষণ',
    alerts_standby_title: 'কোনো সক্ৰিয় সতৰ্কবাৰ্তা পেলোড নাই',
    alerts_standby_desc: 'সকলো আঞ্চলিক ভূ-কাৰিকৰী চেনেল স্বাভাৱিক অৱস্থাত আছে। ৱেবছকেটৰ জৰিয়তে কোনো দুৰ্যোগ সংকেত আহিলে চাইৰেন আৰু জৰুৰী সম্প্ৰচাৰ স্বয়ংক্ৰিয়ভাৱে সক্ৰিয় হ’ব।',
    alerts_trigger_btn: 'ৱেবছকেট সতৰ্কবাৰ্তা প্ৰেৰণ কৰক',
    alerts_dismiss_btn: 'সতৰ্কবাৰ্তা বাতিল কৰক',
    alerts_listening: 'ৱেবছকেট চেনেল: সংবেদক তথ্য নিৰীক্ষণ চলি আছে',

    // Reports Page
    reports_title: 'নাগৰিক আৰু ফিল্ড দুৰ্যোগ প্ৰতিবেদনসমূহ',
    reports_subtitle: 'ম’বাইল এপ্প ব্যৱহাৰকাৰীসকলে প্ৰেৰণ কৰা ঘটনা প্ৰতিবেদন আৰু নথি',
    reports_empty_title: 'এতিয়ালৈকে কোনো ঘটনা প্ৰতিবেদন প্ৰাপ্ত হোৱা নাই',
    reports_empty_desc: 'ৰক্ষক ম’বাইল এপ্পৰ জৰিয়তে নাগৰিকে প্ৰেৰণ কৰা প্ৰতিবেদন ইয়াত প্ৰকৃত সময়ত দেখা যাব।',
    reports_col_ref: 'প্ৰতিবেদন সূচক আৰু প্ৰেৰক',
    reports_col_region: 'স্থান আৰু জিপিএছ স্থানাংক',
    reports_col_type: 'দুৰ্যোগৰ প্ৰকাৰ আৰু মিডিয়া',
    reports_col_time: 'প্ৰেৰণ কৰা সময়',
    reports_col_status: 'যাচাই স্থিতি',
    reports_col_action: 'পদক্ষেপ',
    reports_export_btn: 'নথি সংগ্ৰহ কৰক',

    // Uploads Page
    uploads_title: 'ফিল্ড মিডিয়া সংগ্ৰহ আৰু ভূ-পৰ্যবেক্ষণ',
    uploads_subtitle: 'নাগৰিক আৰু সংবেদক আপলোড • অডিঅ’ (.m4a) আৰু আলোকচিত্ৰ (.jpeg) নিৰীক্ষণ',
    uploads_submit_btn: 'দুৰ্যোগ তথ্য জমা দিয়ক',
    uploads_total: 'মুঠ প্ৰেৰণ',
    uploads_photos: 'আলোকচিত্ৰ (JPEG)',
    uploads_audio: 'অডিঅ’ ৰেকৰ্ডিং',
    uploads_high_risk: 'উচ্চ বিপদাশঙ্কা',
    uploads_search_placeholder: 'ফোন নম্বৰ বা জিলাৰ নাম বিচাৰক...',
    uploads_live_sync: 'লাইভ সংমিশ্ৰণ সক্ৰিয়',
  },

  BEN: {
    // Navigation
    nav_risk_map: 'ঝুঁকি মানচিত্র',
    nav_about_us: 'আমাদের সম্পর্কে',
    nav_stations: 'স্টেশনসমূহ',
    nav_alerts: 'সতর্কবার্তা',
    nav_reports: 'প্রতিবেদন',
    nav_uploads: 'আপলোড',
    nav_media: 'মিডিয়া',
    nav_model_comparison: 'এআই মডেল',
    nav_analytics: 'বিশ্লেষণ',
    nav_sign_out: 'সাইন আউট',
    
    // Status Bar
    ws_live: 'WS লাইভ',
    ws_connecting: 'সংযোগ হচ্ছে',
    ws_standby: 'স্ট্যান্ডবাই',
    alarm_on: '🔊 সাইরেন চালু',
    alarm_muted: '🔇 নিঃশব্দ',
    test_ws_alert: 'পরীক্ষামূলক অ্যালার্ট',

    // Alerts Page
    alerts_title: 'সক্রিয় দুর্যোগ সতর্কতা ও সম্প্রচার কেন্দ্র',
    alerts_subtitle: 'রিয়েল-টাইম টাওয়ার সেন্সর সম্প্রচার এবং স্বয়ংক্রিয় জরুরী বার্তা লগ',
    alerts_standby_title: 'বর্তমানে কোন সক্রিয় সতর্কতা পেলোড নেই',
    alerts_standby_desc: 'সমস্ত আঞ্চলিক ভূ-প্রযুক্তিগত চ্যানেল স্বাভাবিক আছে। ওয়েবসকেটের মাধ্যমে সতর্কবার্তা পেলে সম্প্রচার ব্যবস্থা সক্রিয় হবে।',
    alerts_trigger_btn: 'ওয়েবসকেট অ্যালার্ট পাঠান',
    alerts_dismiss_btn: 'অ্যালার্ট বন্ধ করুন',
    alerts_listening: 'ওয়েবসকেট চ্যানেল: রিয়েল-টাইম তথ্য পর্যবেক্ষণ চলছে',

    // Reports Page
    reports_title: 'নাগরিক ও ফিল্ড দুর্ঘটনা প্রতিবেদন',
    reports_subtitle: 'মোবাইল অ্যাপ ব্যবহারকারীদের পাঠানো দুর্ঘটনা প্রতিবেদন ও গ্রাউন্ড ডসিয়ার',
    reports_empty_title: 'এখনও পর্যন্ত কোন ব্যবহারকারীর প্রতিবেদন আসেনি',
    reports_empty_desc: 'রক্ষক মোবাইল অ্যাপের মাধ্যমে পাঠানো প্রতিবেদনসমূহ এখানে রিয়েল-টাইমে প্রদর্শিত হবে।',
    reports_col_ref: 'প্রতিবেদন সূত্র ও প্রেরক',
    reports_col_region: 'অঞ্চল ও জিপিএস স্থানাঙ্ক',
    reports_col_type: 'দুর্ঘটনার ধরন ও মিডিয়া',
    reports_col_time: 'পাঠানোর সময়',
    reports_col_status: 'যাচাই স্থিতি',
    reports_col_action: 'পদক্ষেপ',
    reports_export_btn: 'ডসিয়ার ডাউনলোড',

    // Uploads Page
    uploads_title: 'ফিল্ড মিডিয়া জমাদান ও গ্রাউন্ড পর্যবেক্ষণ',
    uploads_subtitle: 'নাগরিক ও সেন্সর আপলোড • অডিও (.m4a) ও ছবি (.jpeg) যাচাইকরণ',
    uploads_submit_btn: 'ঘটনা রিপোর্ট জমা দিন',
    uploads_total: 'মোট জমাদান',
    uploads_photos: 'ছবি (JPEG)',
    uploads_audio: 'অডিও রেকর্ডিং',
    uploads_high_risk: 'উচ্চ ঝুঁকি ট্রায়াজ',
    uploads_search_placeholder: 'ফোন নম্বর, জেলা বা ফাইলের নাম খুঁজুন...',
    uploads_live_sync: 'লাইভ সিঙ্ক সক্রিয়',
  },
};

export function getTranslation(lang, key) {
  const dictionary = TRANSLATIONS[lang] || TRANSLATIONS.ENG;
  return dictionary[key] || TRANSLATIONS.ENG[key] || key;
}
