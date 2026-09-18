class EnglishDictionary {
  code = 'en';
  name = 'English';
  translations: Record<string, string> = {
    // Login & Auth
    alert_invalid_num_title: 'Invalid Number',
    alert_invalid_num_msg: 'Please enter a valid 10-digit mobile number.',
    alert_loc_req_title: 'Location Required',
    alert_loc_req_msg: 'GPS access is mandatory to register spatial telemetry with RAKSHAK.',
    alert_reg_err_title: 'Registration Error',
    alert_reg_err_msg: 'Could not connect to the authentication service.',
    disaster_protocol_footer: 'Protected under Government Disaster Management Protocol',

    // Header
    app_title: 'RAKSHAK',
    app_subtitle: 'Govt. Landslide Alert Portal',
    btn_exit: 'Exit',

    // Spatial Coordinates Card
    coords_card_title: 'Spatial Coordinates',
    btn_refresh_gps: 'Refresh GPS',
    btn_transmitting: 'Transmitting...',
    txt_syncing_coords: 'Syncing latest coordinates to server...',
    label_latitude: 'Latitude',
    label_longitude: 'Longitude',

    // Zone Vulnerability Card
    vulnerability_card_title: 'Zone Vulnerability Assessment',
    risk_critical: 'CRITICAL HAZARD',
    risk_moderate: 'MODERATE RISK',
    risk_stable: 'STABLE / LOW RISK',
    label_probability_index: 'Probability Index',

    // Critical Advisory Card
    advisory_header_alert: 'PUBLIC SAFETY ADVISORY // ALERT',
    advisory_level_badge: 'LEVEL-3 RESTRICTION',
    advisory_blockage_title: 'Sector Blockage & Route Diversion',
    advisory_blockage_p1: 'Primary bridges, culverts, and connecting transit corridors in your immediate sector have been ',
    advisory_blockage_highlight: 'BARRICADED / BLOCKED',
    advisory_blockage_p2: ' due to structural risk and flash debris accumulation. Avoid lower bypass roads and take authorized high-elevation arterial diversions only.',
    directive_title: 'Mandatory Remedial Protocol (Civic Defense Directive):',
    directive_step_1: 'Halt non-essential surface transit across culverts, retaining walls, and low-lying bridges.',
    directive_step_2: 'Relocate immediately to designated higher-ground shelters away from natural drainage basins.',
    directive_step_3: 'Maintain operational standby on official emergency channels and dispatch field incident reports below.',
    advisory_ref_footer: 'Ref: PROTOCOL-SDRF/SEC-9',
    advisory_execute_now: 'Execute Immediately',

    // Visual Evidence Card
    visual_card_title: 'Visual Evidence',
    visual_status_empty: 'No field snapshot captured',
    visual_status_attached: 'Asset attached',
    btn_open_camera: 'Open Camera',
    btn_retake_media: 'Retake Media',
    btn_transmit_visual: 'Transmit Visual Evidence',
    alert_camera_title: 'Access Denied',
    alert_camera_msg: 'Camera permission required for hazard logging.',

    // Voice Briefing Card
    voice_card_title: 'Voice Telemetry Briefing',
    voice_status_recording: 'Recording audio stream...',
    voice_status_ready: 'Audio ready',
    voice_status_empty: 'No voice briefing recorded',
    btn_record: 'Record',
    btn_recording_stop: 'Stop Recording',
    btn_rerecord: 'Re-record',
    btn_play_memo: 'Play Memo',
    btn_pause_memo: 'Pause',
    voice_playing: 'Playing memo...',
    voice_recorded_memo: 'Recorded Memo',
    btn_transmit_voice: 'Transmit Voice Memo',
    alert_audio_perm_title: 'Permission Denied',
    alert_audio_perm_msg: 'Microphone access is required for voice briefings.',
    alert_audio_err_title: 'Audio Error',
    alert_audio_init_fail: 'Could not initialize voice recording.',
    alert_audio_final_fail: 'Failed to finalize audio file.',
    alert_playback_err_title: 'Playback Error',
    alert_playback_err_msg: 'Could not play voice memo.'
  };

  get(key: string): string | null {
    return this.translations[key] || null;
  }
}

// ==========================================
// 2. Regional Language Dictionaries
// ==========================================

class HindiDictionary {
  code = 'hi';
  name = 'Hindi';
  translations: Record<string, string> = {
    alert_invalid_num_title: 'अमान्य नंबर',
    alert_invalid_num_msg: 'कृपया 10 अंकों का वैध मोबाइल नंबर दर्ज करें।',
    alert_loc_req_title: 'स्थान आवश्यक है',
    alert_loc_req_msg: 'रक्षक (RAKSHAK) में स्थानिक टेलीमेट्री दर्ज करने हेतु GPS अनिवार्य है।',
    alert_reg_err_title: 'पंजीकरण त्रुटि',
    alert_reg_err_msg: 'प्रमाणीकरण सेवा से कनेक्ट करने में असमर्थ।',
    disaster_protocol_footer: 'सरकारी आपदा प्रबंधन प्रोटोकॉल के अंतर्गत संरक्षित',
    app_title: 'रक्षक',
    app_subtitle: 'सरकारी भूस्खलन चेतावनी पोर्टल',
    btn_exit: 'बाहर निकलें',
    coords_card_title: 'स्थानिक निर्देशांक',
    btn_refresh_gps: 'GPS रीफ्रेश करें',
    btn_transmitting: 'प्रसारित हो रहा है...',
    txt_syncing_coords: 'सर्वर पर नवीनतम निर्देशांक सिंक किए जा रहे हैं...',
    label_latitude: 'अक्षांश (Latitude)',
    label_longitude: 'देशांतर (Longitude)',
    vulnerability_card_title: 'क्षेत्र संवेदनशीलता मूल्यांकन',
    risk_critical: 'अत्यंत गंभीर खतरा',
    risk_moderate: 'मध्यम जोखिम',
    risk_stable: 'स्थिर / कम जोखिम',
    label_probability_index: 'संभाव्यता सूचकांक',
    advisory_header_alert: 'सार्वजनिक सुरक्षा सलाह // चेतावनी',
    advisory_level_badge: 'स्तर-3 प्रतिबंध',
    advisory_blockage_title: 'सेक्टर रुकावट एवं मार्ग डायवर्जन',
    advisory_blockage_p1: 'आपके तात्कालिक क्षेत्र में मुख्य पुलों, पुलियों और संपर्क मार्गों को संरचनात्मक जोखिम और मलबे के संचय के कारण ',
    advisory_blockage_highlight: 'बैरिकेड / अवरुद्ध',
    advisory_blockage_p2: ' कर दिया गया है। निचले बाईपास मार्गों से बचें और केवल अधिकृत ऊंचे मार्गों का उपयोग करें।',
    directive_title: 'अनिवार्य उपचारात्मक प्रोटोकॉल (नागरिक सुरक्षा निर्देश):',
    directive_step_1: 'पुलियों, रिटेनिंग दीवारों और निचले पुलों पर अनावश्यक आवागमन तुरंत रोकें।',
    directive_step_2: 'प्राकृतिक जल निकासी क्षेत्रों से दूर निर्धारित सुरक्षित ऊंचे आश्रयों में तुरंत जाएं।',
    directive_step_3: 'आधिकारिक आपातकालीन चैनलों पर स्टैंडबाय रहें और नीचे घटना रिपोर्ट भेजें।',
    advisory_ref_footer: 'संदर्भ: PROTOCOL-SDRF/SEC-9',
    advisory_execute_now: 'तत्काल निष्पादित करें',
    visual_card_title: 'दृश्य साक्ष्य (Visual Evidence)',
    visual_status_empty: 'कोई फ़ील्ड स्नैपशॉट नहीं लिया गया',
    visual_status_attached: 'फ़ाइल संलग्न है',
    btn_open_camera: 'कैमरा खोलें',
    btn_retake_media: 'पुनः फ़ोटो लें',
    btn_transmit_visual: 'दृश्य साक्ष्य भेजें',
    alert_camera_title: 'अनुमति अस्वीकृत',
    alert_camera_msg: 'खतरे के पंजीकरण हेतु कैमरा अनुमति आवश्यक है।',
    voice_card_title: 'ध्वनि टेलीमेट्री ब्रीफिंग',
    voice_status_recording: 'ऑडियो रिकॉर्ड हो रहा है...',
    voice_status_ready: 'ऑडियो तैयार है',
    voice_status_empty: 'कोई वॉइस ब्रीफिंग रिकॉर्ड नहीं की गई',
    btn_record: 'रिकॉर्ड करें',
    btn_recording_stop: 'रिकॉर्डिंग रोकें',
    btn_rerecord: 'पुनः रिकॉर्ड करें',
    btn_play_memo: 'मेमो सुनें',
    btn_pause_memo: 'रोकें',
    voice_playing: 'मेमो बज रहा है...',
    voice_recorded_memo: 'रिकॉर्ड किया गया मेमो',
    btn_transmit_voice: 'वॉइस मेमो भेजें',
    alert_audio_perm_title: 'अनुमति अस्वीकृत',
    alert_audio_perm_msg: 'वॉइस ब्रीफिंग के लिए माइक्रोफ़ोन की अनुमति आवश्यक है।',
    alert_audio_err_title: 'ऑडियो त्रुटि',
    alert_audio_init_fail: 'वॉइस रिकॉर्डिंग शुरू नहीं की जा सकी।',
    alert_audio_final_fail: 'ऑडियो फ़ाइल पूर्ण करने में विफल।',
    alert_playback_err_title: 'प्लेबैक त्रुटि',
    alert_playback_err_msg: 'वॉइस मेमो चलाने में असमर्थ।'
  };

  get(key: string): string | null {
    return this.translations[key] || null;
  }
}

class AssameseDictionary {
  code = 'as';
  name = 'Assamese';
  translations: Record<string, string> = {
    alert_invalid_num_title: 'অবৈধ নম্বৰ',
    alert_invalid_num_msg: 'অনুগ্ৰহ কৰি এটা বৈধ ১০-সংখ্যাৰ ম’বাইল নম্বৰ দিয়ক।',
    alert_loc_req_title: 'স্থানৰ তথ্য প্ৰয়োজন',
    alert_loc_req_msg: 'ৰক্ষকৰ (RAKSHAK) সৈতে ভৌগোলিক অৱস্থান পঞ্জীয়ন কৰিবলৈ GPS বাধ্যতামূলক।',
    alert_reg_err_title: 'পঞ্জীয়ন ত্ৰুটি',
    alert_reg_err_msg: 'প্ৰমাণীকৰণ সেৱাৰ সৈতে সংযোগ স্থাপন কৰিব পৰা নগ’ল।',
    disaster_protocol_footer: 'চৰকাৰী দুৰ্যোগ ব্যৱস্থাপনা প্ৰট’কলৰ অধীনত সুৰক্ষিত',
    app_title: 'ৰক্ষক',
    app_subtitle: 'চৰকাৰী ভূমিস্খলন সতৰ্কতা পৰ্টেল',
    btn_exit: 'প্ৰস্থান',
    coords_card_title: 'ভৌগোলিক স্থানাংক',
    btn_refresh_gps: 'GPS সতেজ কৰক',
    btn_transmitting: 'প্ৰেৰণ কৰি থকা হৈছে...',
    txt_syncing_coords: 'চাৰ্ভাৰত শেহতীয়া স্থানাংক সংমিশ্ৰণ কৰা হৈছে...',
    label_latitude: 'অক্ষাংশ (Latitude)',
    label_longitude: 'দ্ৰাঘিমাংশ (Longitude)',
    vulnerability_card_title: 'অঞ্চলৰ সংবেদনশীলতা মূল্যায়ন',
    risk_critical: 'চৰম বিপদজনক',
    risk_moderate: 'মধ্যমীয়া বিপদ',
    risk_stable: 'সুৰক্ষিত / নিম্ন বিপদ',
    label_probability_index: 'সম্ভাৱনা সূচক',
    advisory_header_alert: 'জনসাধাৰণৰ সুৰক্ষাৰ সতৰ্কবাৰ্তা // সতৰ্ক',
    advisory_level_badge: 'স্তৰ-৩ নিষেধাজ্ঞা',
    advisory_blockage_title: 'খণ্ড অৱৰোধ আৰু পথ সলনি',
    advisory_blockage_p1: 'গাঁথনিগত বিপদ আৰু ধ্বংসাৱশেষ জমা হোৱাৰ বাবে আপোনাৰ অঞ্চলৰ মূল দলং আৰু যোগাযোগ পথসমূহ ',
    advisory_blockage_highlight: 'বেৰিকেড / বন্ধ কৰা হৈছে',
    advisory_blockage_p2: '। নিম্নভূমিৰ বাইপাছ পথ পৰিহাৰ কৰক আৰু কেৱল অনুমোদিত ওখ পথ ব্যৱহাৰ কৰক।',
    directive_title: 'বাধ্যতামূলক প্ৰতিৰোধমূলক নিৰ্দেশনা (নাগৰিক প্ৰতিৰক্ষা নিৰ্দেশনা):',
    directive_step_1: 'দলং, কালভাৰ্ট আৰু ওলমা দেৱালৰ ওপৰেৰে অপ্ৰয়োজনীয় যাতায়াত বন্ধ কৰক।',
    directive_step_2: 'প্ৰাকৃতিক নলাৰ পৰা আঁতৰি নিৰ্ধাৰিত ওখ আশ্ৰয় শিবিৰলৈ তৎকালীনভাৱে স্থানান্তৰিত হওক।',
    directive_step_3: 'চৰকাৰী জৰুৰীকালীন চেনেলসমূহত সজাগ থাকক আৰু তলত ঘটনাৰ প্ৰতিবেদন প্ৰেৰণ কৰক।',
    advisory_ref_footer: 'প্ৰসংগ: PROTOCOL-SDRF/SEC-9',
    advisory_execute_now: 'তৎক্ষণাত কাৰ্যকৰী কৰক',
    visual_card_title: 'দৃশ্যমান প্ৰমাণ (Visual Evidence)',
    visual_status_empty: 'কোনো ফটো তোলা হোৱা নাই',
    visual_status_attached: 'নথি সংলগ্ন কৰা হৈছে',
    btn_open_camera: 'কেমেৰা খোলক',
    btn_retake_media: 'পুনৰ ফটো তোলক',
    btn_transmit_visual: 'দৃশ্যমান প্ৰমাণ প্ৰেৰণ কৰক',
    alert_camera_title: 'অনুমতি প্ৰত্যাখ্যান',
    alert_camera_msg: 'বিপদ পঞ্জীয়নৰ বাবে কেমেৰাৰ অনুমতি প্ৰয়োজন।',
    voice_card_title: 'কণ্ঠস্বৰ টেলিমেট্ৰি বিৱৰণী',
    voice_status_recording: 'শব্দ ৰেকৰ্ডিং চলি আছে...',
    voice_status_ready: 'শব্দ বাৰ্তা সাজু',
    voice_status_empty: 'কোনো কণ্ঠস্বৰ বাৰ্তা ৰেকৰ্ড কৰা হোৱা নাই',
    btn_record: 'ৰেকৰ্ড কৰক',
    btn_recording_stop: 'ৰেকৰ্ডিং বন্ধ কৰক',
    btn_rerecord: 'পুনৰ ৰেকৰ্ড কৰক',
    btn_play_memo: 'মেম’ শুনাওক',
    btn_pause_memo: 'ৰখাওক',
    voice_playing: 'মেম’ বাজি আছে...',
    voice_recorded_memo: 'ৰেকৰ্ড কৰা মেম’',
    btn_transmit_voice: 'কণ্ঠস্বৰ মেম’ প্ৰেৰণ কৰক',
    alert_audio_perm_title: 'অনুমতি প্ৰত্যাখ্যান',
    alert_audio_perm_msg: 'ভয়েচ বাৰ্তাৰ বাবে মাইক্ৰ’ফ’নৰ অনুমতি প্ৰয়োজন।',
    alert_audio_err_title: 'অডিঅ’ ত্ৰুটি',
    alert_audio_init_fail: 'শব্দ ৰেকৰ্ডিং আৰম্ভ কৰিব পৰা নগ’ল।',
    alert_audio_final_fail: 'অডিঅ’ ফাইল চূড়ান্ত কৰাত ব্যৰ্থ।',
    alert_playback_err_title: 'প্লেবেক ত্ৰুটি',
    alert_playback_err_msg: 'ভয়েচ মেম’ বজাব পৰা নগ’ল।'
  };

  get(key: string): string | null {
    return this.translations[key] || null;
  }
}

class BengaliDictionary {
  code = 'bn';
  name = 'Bengali';
  translations: Record<string, string> = {
    alert_invalid_num_title: 'ভুল নম্বর',
    alert_invalid_num_msg: 'দয়া করে একটি সঠিক ১০-সংখ্যার মোবাইল নম্বর দিন।',
    alert_loc_req_title: 'অবস্থান প্রয়োজন',
    alert_loc_req_msg: 'রক্ষক (RAKSHAK)-এর সাথে ভৌগোলিক তথ্য যোগ করতে GPS অনুমতি বাধ্যতামূলক।',
    alert_reg_err_title: 'নিবন্ধকরণ ত্রুটি',
    alert_reg_err_msg: 'সার্ভারের সাথে সংযোগ স্থাপন করা যায়নি।',
    disaster_protocol_footer: 'সরকারি দুর্যোগ ব্যবস্থাপনা বিধিমালার অধীনে সুরক্ষিত',
    app_title: 'রক্ষক',
    app_subtitle: 'সরকারি ভূমিধস সতর্কীকরণ পোর্টাল',
    btn_exit: 'প্রস্থান',
    coords_card_title: 'ভৌগোলিক স্থানাঙ্ক',
    btn_refresh_gps: 'GPS রিফ্রেশ করুন',
    btn_transmitting: 'প্রেরণ করা হচ্ছে...',
    txt_syncing_coords: 'সার্ভারে সাম্প্রতিক স্থানাঙ্ক সিঙ্ক করা হচ্ছে...',
    label_latitude: 'অক্ষাংশ (Latitude)',
    label_longitude: 'দ্রাঘিমাংশ (Longitude)',
    vulnerability_card_title: 'অঞ্চলভিত্তিক ঝুঁকি মূল্যায়ন',
    risk_critical: 'চরম বিপজ্জনক',
    risk_moderate: 'মাঝারি ঝুঁকি',
    risk_stable: 'স্থিতিশীল / কম ঝুঁকি',
    label_probability_index: 'সম্ভাব্যতা সূচক',
    advisory_header_alert: 'জননিরাপত্তা নির্দেশিকা // সতর্কতা',
    advisory_level_badge: 'স্তর-৩ নিষেধাজ্ঞা',
    advisory_blockage_title: 'সেক্টর অবরোধ ও পথ পরিবর্তন',
    advisory_blockage_p1: 'কাঠামোগত ঝুঁকি এবং ধসের কারণে আপনার এলাকার প্রধান সেতু ও সংযোগ সড়কসমূহ ',
    advisory_blockage_highlight: 'ব্যারিকেড / অবরুদ্ধ',
    advisory_blockage_p2: ' করা হয়েছে। নিচু এলাকার বাইপাস সড়ক এড়িয়ে চলুন এবং শুধুমাত্র অনুমোদিত পাহাড়ি বিকল্প পথ ব্যবহার করুন।',
    directive_title: 'বাধ্যতামূলক সুরক্ষাবিধি (নাগরিক প্রতিরক্ষা নির্দেশিকা):',
    directive_step_1: 'কালভার্ট ও নিচু সেতুর ওপর দিয়ে সমস্ত অপ্রয়োজনীয় যাতায়াত বন্ধ রাখুন।',
    directive_step_2: 'প্রাকৃতিক জলনিকাশী খাদ থেকে দূরে নির্ধারিত উঁচু আশ্রয়কেন্দ্রে অবিলম্বে চলে যান।',
    directive_step_3: 'সরকারি জরুরি বার্তা চ্যানেলে নজর রাখুন এবং নিচে ক্ষয়ক্ষতির রিপোর্ট পাঠান।',
    advisory_ref_footer: 'রেফারেন্স: PROTOCOL-SDRF/SEC-9',
    advisory_execute_now: 'অবিলম্বে কার্যকর করুন',
    visual_card_title: 'দৃশ্যমান প্রমাণ (Visual Evidence)',
    visual_status_empty: 'কোনো ছবি তোলা হয়নি',
    visual_status_attached: 'ফাইল সংযুক্ত হয়েছে',
    btn_open_camera: 'ক্যামেরা খুলুন',
    btn_retake_media: 'পুনরায় ছবি তুলুন',
    btn_transmit_visual: 'দৃশ্যমান প্রমাণ পাঠান',
    alert_camera_title: 'অনুমতি প্রত্যাখ্যাত',
    alert_camera_msg: 'ঝুঁকি নথিবদ্ধ করতে ক্যামেরার অনুমতি আবশ্যক।',
    voice_card_title: 'ভয়েস টেলিমেট্রি ব্রিফিং',
    voice_status_recording: 'অডিও রেকর্ড হচ্ছে...',
    voice_status_ready: 'অডিও প্রস্তুত',
    voice_status_empty: 'কোনো ভয়েস ব্রিফিং রেকর্ড করা হয়নি',
    btn_record: 'রেকর্ড করুন',
    btn_recording_stop: 'রেকর্ডিং থামান',
    btn_rerecord: 'পুনরায় রেকর্ড করুন',
    btn_play_memo: 'মেমো শুনুন',
    btn_pause_memo: 'থামান',
    voice_playing: 'মেমো চলছে...',
    voice_recorded_memo: 'রেকর্ডকৃত মেমো',
    btn_transmit_voice: 'ভয়েস মেমো পাঠান',
    alert_audio_perm_title: 'অনুমতি প্রত্যাখ্যাত',
    alert_audio_perm_msg: 'ভয়েস বার্তার জন্য মাইক্রোফোনের অনুমতি প্রয়োজন।',
    alert_audio_err_title: 'অডিও ত্রুটি',
    alert_audio_init_fail: 'ভয়েস রেকর্ডিং শুরু করা যায়নি।',
    alert_audio_final_fail: 'অডিও ফাইল চূড়ান্ত করা যায়নি।',
    alert_playback_err_title: 'প্লেব্যাক ত্রুটি',
    alert_playback_err_msg: 'ভয়েস মেমো বাজানো যায়নি।'
  };

  get(key: string): string | null {
    return this.translations[key] || null;
  }
}

class NepaliDictionary {
  code = 'ne';
  name = 'Nepali';
  translations: Record<string, string> = {
    alert_invalid_num_title: 'अमान्य नम्बर',
    alert_invalid_num_msg: 'कृपया १० अंकको मान्य मोबाइल नम्बर प्रविष्ट गर्नुहोस्।',
    alert_loc_req_title: 'स्थान आवश्यक छ',
    alert_loc_req_msg: 'रक्षक (RAKSHAK) मा स्थान दर्ता गर्न GPS पहुँच अनिवार्य छ।',
    alert_reg_err_title: 'दर्ता त्रुटि',
    alert_reg_err_msg: 'प्रमाणीकरण सेवासँग सम्पर्क हुन सकेन।',
    disaster_protocol_footer: 'सरकारी विपद् व्यवस्थापन नियम अन्तर्गत सुरक्षित',
    app_title: 'रक्षक',
    app_subtitle: 'सरकारी पहिरो चेतावनी पोर्टल',
    btn_exit: 'बाहिरिनुहोस्',
    coords_card_title: 'भौगोलिक निर्देशाङ्कहरू',
    btn_refresh_gps: 'GPS रिफ्रेस गर्नुहोस्',
    btn_transmitting: 'पठाउँदै...',
    txt_syncing_coords: 'सर्भरमा नयाँ निर्देशाङ्क सिङ्क गरिँदैछ...',
    label_latitude: 'अक्षांश (Latitude)',
    label_longitude: 'देशान्तर (Longitude)',
    vulnerability_card_title: 'क्षेत्र जोखिम मूल्याङ्कन',
    risk_critical: 'गम्भीर खतरा',
    risk_moderate: 'मध्यम जोखिम',
    risk_stable: 'स्थिर / न्यून जोखिम',
    label_probability_index: 'सम्भाव्यता सूचकाङ्क',
    advisory_header_alert: 'सार्वजनिक सुरक्षा सल्लाह // चेतावनी',
    advisory_level_badge: 'स्तर-३ प्रतिबन्ध',
    advisory_blockage_title: 'सडक अवरोध र वैकल्पिक मार्ग',
    advisory_blockage_p1: 'तपाईंको क्षेत्रका मुख्य पुलहरू र सहायक मार्गहरू पहिरो र संरचनात्मक जोखिमका कारण ',
    advisory_blockage_highlight: 'बन्द / अवरुद्ध',
    advisory_blockage_p2: ' गरिएका छन्। तल्लो बाइपास सडकहरू प्रयोग नगर्नुहोस् र केवल माथिल्लो वैकल्पिक मार्ग लिनुहोस्।',
    directive_title: 'अनिवार्य सुरक्षा निर्देशनहरू (नागरिक रक्षा निर्देशिका):',
    directive_step_1: 'पुल, पर्खाल र खोला किनारका सडकहरूमा अनावश्यक आवतजावत बन्द गर्नुहोस्।',
    directive_step_2: 'पहिरोको जोखिम भएका ठाउँहरू छोडेर सुरक्षित अग्लो आश्रयस्थलमा जानुहोस्।',
    directive_step_3: 'सरकारी आपतकालीन च्यानलहरू सुन्नुहोस् र तल घटनाको जानकारी पठाउनुहोस्।',
    advisory_ref_footer: 'सन्दर्भ: PROTOCOL-SDRF/SEC-9',
    advisory_execute_now: 'तुरुन्त पालना गर्नुहोस्',
    visual_card_title: 'प्रत्यक्ष प्रमाण (तस्बिर)',
    visual_status_empty: 'कुनै तस्बिर लिइएको छैन',
    visual_status_attached: 'फाइल संलग्न गरियो',
    btn_open_camera: 'क्यामेरा खोल्नुहोस्',
    btn_retake_media: 'फेरि खिच्नुहोस्',
    btn_transmit_visual: 'तस्बिर प्रमाण पठाउनुहोस्',
    alert_camera_title: 'अनुमति अस्वीकृत',
    alert_camera_msg: 'जोखिम दर्ता गर्न क्यामेरा अनुमति आवश्यक पर्छ।',
    voice_card_title: 'भ्वाइस टेलिमेट्री जानकारी',
    voice_status_recording: 'अडियो रेकर्ड हुँदैछ...',
    voice_status_ready: 'अडियो तयार छ',
    voice_status_empty: 'कुनै अडियो रेकर्ड गरिएको छैन',
    btn_record: 'रेकर्ड गर्नुहोस्',
    btn_recording_stop: 'रेकर्डिङ रोक्नुहोस्',
    btn_rerecord: 'पुनः रेकर्ड गर्नुहोस्',
    btn_play_memo: 'मेमो सुन्नुहोस्',
    btn_pause_memo: 'रोक्नुहोस्',
    voice_playing: 'अडियो बज्दैछ...',
    voice_recorded_memo: 'रेकर्ड गरिएको मेमो',
    btn_transmit_voice: 'भ्वाइस मेमो पठाउनुहोस्',
    alert_audio_perm_title: 'अनुमति अस्वीकृत',
    alert_audio_perm_msg: 'भ्वाइस रेकर्डिङको लागि माइकको अनुमति आवश्यक छ।',
    alert_audio_err_title: 'अडियो त्रुटि',
    alert_audio_init_fail: 'रेकर्डिङ सुरु गर्न सकिएन।',
    alert_audio_final_fail: 'अडियो फाइल सुरक्षित गर्न असफल।',
    alert_playback_err_title: 'प्लेब्याक त्रुटि',
    alert_playback_err_msg: 'अडियो बजाउन सकिएन।'
  };

  get(key: string): string | null {
    return this.translations[key] || null;
  }
}

class ManipuriDictionary {
  code = 'mni';
  name = 'Manipuri (Meiteilon)';
  translations: Record<string, string> = {
    alert_invalid_num_title: 'চুমদবা নম্বর',
    alert_invalid_num_msg: 'চানবীদুনা ডিজিট ১০ গী অচুম্বা মোবাইল নম্বর অমা ইবীয়ু।',
    alert_loc_req_title: 'লৈফম মথৌ তারি',
    alert_loc_req_msg: 'রাক্ষক (RAKSHAK) দা লৈফমগী অকুপ্পা মরোল পীনবা GPS য়াওদবা য়ারোই।',
    alert_reg_err_title: 'রেজিস্ত্রেসন অশোয়বা',
    alert_reg_err_msg: 'সার্ভিসকা শম্নবা ঙমদে।',
    disaster_protocol_footer: 'লৈঙাক্কী খুদোংথীবা ঙাকথোকপগী কাংলোন মখাদা ঙাকথোক্লবা',
    app_title: 'রাক্ষক',
    app_subtitle: 'লৈঙাক্কী চিং তূখায়বগী চেক্সিন ৱারোল পোর্তেল',
    btn_exit: 'থোক্লসি',
    coords_card_title: 'মফমগী কোওর্দিনেতশিং',
    btn_refresh_gps: 'GPS নৌনবা তৌবা',
    btn_transmitting: 'থাজিল্লি...',
    txt_syncing_coords: 'সার্ভারদা নৌবা কোওর্দিনেতশিং শম্নহন্দুনা লৈরে...',
    label_latitude: 'লেতিত্যুদ (Latitude)',
    label_longitude: 'লোঙ্গিত্যুদ (Longitude)',
    vulnerability_card_title: 'লমদমগী অকি-তুজুংবা য়েংশিনবা',
    risk_critical: 'য়াম্না খুদোংথীবা',
    risk_moderate: 'ময়ায় ওইবা অকিবা',
    risk_stable: 'তেন্তাকপা লৈতবা / নেম্বা',
    label_probability_index: 'থোক্লকপগী চাং (Probability Index)',
    advisory_header_alert: 'মীয়ামগী সেফতি ৱারোল // চেক্সিনবা',
    advisory_level_badge: 'থাক-৩ গী অপনবা',
    advisory_blockage_title: 'লম্বী থিংজিনবা অমসুং অতোপ্পা লম্বী',
    advisory_blockage_p1: 'নহাক্কী নাকলগী থোং অমসুং মরুওইবা লম্বীশিং অসি তূখায়বগী অকিবা লৈবনা ',
    advisory_blockage_highlight: 'বেরিকেদ তৌরে / থিংজিল্লে',
    advisory_blockage_p2: '। মখা থংবা লম্বীশিং চৎকনু অমসুং অৱাংবা মফমগী লম্বী খক্তা শীজিন্নবীয়ু।',
    directive_title: 'তৌদবা য়াদবা ঙাকথোক্নবা কাংলোন:',
    directive_step_1: 'থোং অমসুং মফম নেম্বা লম্বীশিংদা কান্নদবা খোঙচৎ চৎপীয়িগনু।',
    directive_step_2: 'ঈশিং চেল্লকপা মফমশিং থাদোক্তুনা ৱাংবা শাফবা মফমদা চৎলু।',
    directive_step_3: 'লৈঙাক্কী ইমার্জেন্সি চেনেলশিং তাবীয়ু অমসুং মখাদা পাও থাবীয়ু।',
    advisory_ref_footer: 'রেফরেন্স: PROTOCOL-SDRF/SEC-9',
    advisory_execute_now: 'হৌজিকমক চৎনহন্নু',
    visual_card_title: 'উবা ফংবা প্রমান (Visual Evidence)',
    visual_status_empty: 'ফোতো অমত্তা লোক্লিদে',
    visual_status_attached: 'ফাইল য়াওরে',
    btn_open_camera: 'কেমেরা হাংদোকউ',
    btn_retake_media: 'অমুক লোকউ',
    btn_transmit_visual: 'ফোতো থাজিল্লু',
    alert_camera_title: 'অয়াবা ফংদে',
    alert_camera_msg: 'খুদোংথীবা পাও পীনবা কেমেরা অয়াবা মথৌ তারি।',
    voice_card_title: 'খোনজেলগী পাও পীনবা',
    voice_status_recording: 'খোনজেল রেকর্ড তৌরি...',
    voice_status_ready: 'খোনজেল শেম-শারে',
    voice_status_empty: 'খোনজেলগী পাও অমত্তা রেকর্ড তৌদে',
    btn_record: 'রেকর্ড তৌবা',
    btn_recording_stop: 'রেকর্ডিং লেপপা',
    btn_rerecord: 'অমুক রেকর্ড তৌবা',
    btn_play_memo: 'মেমো তাবীয়ু',
    btn_pause_memo: 'লেপহন্নু',
    voice_playing: 'মেমো তারি...',
    voice_recorded_memo: 'রেকর্ড তৌরবা মেমো',
    btn_transmit_voice: 'ভয়েস মেমো থাজিল্লু',
    alert_audio_perm_title: 'অয়াবা ফংদে',
    alert_audio_perm_msg: 'খোনজেলগী পাও পীনবা মাইক মথৌ তারি।',
    alert_audio_err_title: 'অডিওগী অশোয়বা',
    alert_audio_init_fail: 'রেকর্ডিং হৌবা ঙমদে।',
    alert_audio_final_fail: 'অডিও ফাইল শেমবা লোইশিনবা ঙমদে।',
    alert_playback_err_title: 'প্লেবেক অশোয়বা',
    alert_playback_err_msg: 'ভয়েস মেমো য়াহনবা ঙমদে।'
  };

  get(key: string): string | null {
    return this.translations[key] || null;
  }
}

class MizoDictionary {
  code = 'lus';
  name = 'Mizo';
  translations: Record<string, string> = {
    alert_invalid_num_title: 'Number Dik Lo',
    alert_invalid_num_msg: 'Khawngaihin mobile number digit 10 dik tak chhu lut rawh.',
    alert_loc_req_title: 'Awmna Hmun Hriat A Ngai',
    alert_loc_req_msg: 'RAKSHAK-a awmna hmun chhinchhiah turin GPS phalna pek a tul.',
    alert_reg_err_title: 'Inziahluh Fuh Lo',
    alert_reg_err_msg: 'Server biak pawh theih a ni lo.',
    disaster_protocol_footer: 'Sorkar Chhiatrupna Enkawl Dan Dan hnuaia venhim',
    app_title: 'RAKSHAK',
    app_subtitle: 'Sorkar Leimin Hriattirna Portal',
    btn_exit: 'Chhuak',
    coords_card_title: 'Awmna Hmun Coordinates',
    btn_refresh_gps: 'GPS Tharthawh',
    btn_transmitting: 'Thawn mek a ni...',
    txt_syncing_coords: 'Coordinates server-ah thawn luh mek a ni...',
    label_latitude: 'Latitude',
    label_longitude: 'Longitude',
    vulnerability_card_title: 'Hmun Hlauhawm Tehna',
    risk_critical: 'HLAUHAWM ZUAL',
    risk_moderate: 'HLAUHAWM VE THAWKHAWK',
    risk_stable: 'HILHIAU / HLAUHAWM LO',
    label_probability_index: 'Hlauhawm Theihna San Lam',
    advisory_header_alert: 'MIPUI VENHIMNA HRIATTIRNA // DANGCHAT',
    advisory_level_badge: 'LEVEL-3 KHAPNA',
    advisory_blockage_title: 'Kawng Ping Leh Kawng Dang Zawh Tur',
    advisory_blockage_p1: 'I awmna bul lawka leihlawn leh kawngpuite chu leimin leh chhiatna vanga hlauhawm a nih avangin ',
    advisory_blockage_highlight: 'DANGH CHAT / PING',
    advisory_blockage_p2: ' vek a ni. Hnuai lam kawng zawh lovin tlang sang lam kawng chauh zawh rawh.',
    directive_title: 'Hman Hmawh Thil Tih Tur (Civic Defense Directive):',
    directive_step_1: 'Leihlawn, lungrem leh hmun hniam lamah kalchhuah loh tur.',
    directive_step_2: 'Tuihawk luan kawr kalsanin hmun sang leh himah inbualhim nghal rawh.',
    directive_step_3: 'Sorkar emergency channel ngaithla reng la, chhiatna thleng hnuai lamah hian thawn rawh.',
    advisory_ref_footer: 'Ref: PROTOCOL-SDRF/SEC-9',
    advisory_execute_now: 'Zawm Nghal Tur',
    visual_card_title: 'Thlalak / Hmuh Theih Finfiahna',
    visual_status_empty: 'Thlalak engmah lak a la ni lo',
    visual_status_attached: 'Thlalak dah a ni tawh',
    btn_open_camera: 'Camera Hawng Rawh',
    btn_retake_media: 'La Nawn Rawh',
    btn_transmit_visual: 'Thlalak Finfiahna Thawn Rawh',
    alert_camera_title: 'Phalna Pek A Ni Lo',
    alert_camera_msg: 'Chhiatna chhinchhiah nan camera hman phal a ngai.',
    voice_card_title: 'Aw Kaia Hriattirna',
    voice_status_recording: 'Aw thun mek a ni...',
    voice_status_ready: 'Aw thun peih a ni tawh',
    voice_status_empty: 'Aw thun a la awm lo',
    btn_record: 'Aw Thun Rawh',
    btn_recording_stop: 'Tawp Rawh',
    btn_rerecord: 'Thun Nawn Rawh',
    btn_play_memo: 'Ngaithla Rawh',
    btn_pause_memo: 'Chawlhtir Rawh',
    voice_playing: 'Ngeithlak mek a ni...',
    voice_recorded_memo: 'Aw Thun Tawh',
    btn_transmit_voice: 'Aw Thun Thawn Rawh',
    alert_audio_perm_title: 'Phalna Pek A Ni Lo',
    alert_audio_perm_msg: 'Aw thun turin microphone hman phal a ngai.',
    alert_audio_err_title: 'Aw Thun Rilruah Buaina',
    alert_audio_init_fail: 'Aw thun theih a ni lo.',
    alert_audio_final_fail: 'Aw thun dah fel theih a ni lo.',
    alert_playback_err_title: 'Ngaihthlak Buaina',
    alert_playback_err_msg: 'Aw thun hi ngaihthlak theih a ni lo.'
  };

  get(key: string): string | null {
    return this.translations[key] || null;
  }
}

class KhasiDictionary {
  code = 'kha';
  name = 'Khasi';
  translations: Record<string, string> = {
    alert_invalid_num_title: 'U Number Um Long',
    alert_invalid_num_msg: 'Sngewbha thep 10-digit mobile number ba beit.',
    alert_loc_req_title: 'Donkam Jingtip Shaphang Ka Hmun',
    alert_loc_req_msg: 'Donkam ban ai bor ia ka GPS ban rejistar ha RAKSHAK.',
    alert_reg_err_title: 'Jingbakla ha ka Rejistar',
    alert_reg_err_msg: 'Ym lah ban pyrsngat sha ka server.',
    disaster_protocol_footer: 'La kynshew hapoh ka Ain Disaster Management jong ka Sorkar',
    app_title: 'RAKSHAK',
    app_subtitle: 'Portal Ai Maham Khyllem Khyndew jong ka Sorkar',
    btn_exit: 'Mih Noh',
    coords_card_title: 'Ki Coordinates jong ka Hmun',
    btn_refresh_gps: 'Pynthymmai GPS',
    btn_transmitting: 'Mynsiem phah...',
    txt_syncing_coords: 'Phah ki coordinates sha ka server...',
    label_latitude: 'Latitude',
    label_longitude: 'Longitude',
    vulnerability_card_title: 'Jingthew jingma ha katei ka jaka',
    risk_critical: 'JINGMA BA KHRAW',
    risk_moderate: 'JINGMA BA PDENG',
    risk_stable: 'KA JAKA BA SHNGIAIN',
    label_probability_index: 'Ka Jingkhein Jingma (Index)',
    advisory_header_alert: 'JINGMAHAM IA KA SHONGSUK // ALERT',
    advisory_level_badge: 'LEVEL-3 JINGKHANG',
    advisory_blockage_title: 'Ka Jingkhang Ia Ki Surok & Ki Lad Bha',
    advisory_blockage_p1: 'Ki jingkieng ba kongsan bad ki surok hajan jong phi la ',
    advisory_blockage_highlight: 'KHANG LYNTI / SET',
    advisory_blockage_p2: ' namar ka jingma ba khyllem ka khyndew. Kiap na ki surok kiba madan bad shim tang ia ki surok neng ba la shah.',
    directive_title: 'Ki Ain ban leh kyrkieh (Civic Defense Directive):',
    directive_step_1: 'Sangeh shisyndon ban iaid lyngba ki jingkieng bad ki madan ba khim.',
    directive_step_2: 'Kynriah noh mar-mar sha ki jaka kiba neng bad ba shngiain kiba jngai na ki nur.',
    directive_step_3: 'Sngap ia ki khubor sorkar bad phah report halor ki jingjia harum.',
    advisory_ref_footer: 'Ref: PROTOCOL-SDRF/SEC-9',
    advisory_execute_now: 'Leh Mar-mar',
    visual_card_title: 'Ki Sakhi da ka Dur (Visual Evidence)',
    visual_status_empty: 'Ym pat shon dur e-e',
    visual_status_attached: 'Dur la thep',
    btn_open_camera: 'Plie Camera',
    btn_retake_media: 'Shon biang',
    btn_transmit_visual: 'Phah Dur Sakhi',
    alert_camera_title: 'Ym Shah',
    alert_camera_msg: 'Donkam ban ai bor ia ka camera ban shim dur jingma.',
    voice_card_title: 'Ka Khubor da ka Ktien (Voice Memo)',
    voice_status_recording: 'Dang rikod ia ka ktien...',
    voice_status_ready: 'La dep rikod',
    voice_status_empty: 'Ym pat don jingrikod',
    btn_record: 'Rikod',
    btn_recording_stop: 'Sangeh',
    btn_rerecord: 'Rikod biang',
    btn_play_memo: 'Sngap biang',
    btn_pause_memo: 'Sangeh shiphang',
    voice_playing: 'Dang pynsngap...',
    voice_recorded_memo: 'Jingrikod ba la dep',
    btn_transmit_voice: 'Phah ia ka Voice Memo',
    alert_audio_perm_title: 'Ym Shah',
    alert_audio_perm_msg: 'Donkam bor microphone ban rikod ktien.',
    alert_audio_err_title: 'Jingbakla ka Sur',
    alert_audio_init_fail: 'Ym lah ban sdang rikod.',
    alert_audio_final_fail: 'Ym lah ban pynkynmaw ia ka audio.',
    alert_playback_err_title: 'Jingbakla ban pynsngap',
    alert_playback_err_msg: 'Ym lah ban pynsngap ia ka sur.'
  };

  get(key: string): string | null {
    return this.translations[key] || null;
  }
}

class GaroDictionary {
  code = 'gar';
  name = 'Garo';
  translations: Record<string, string> = {
    alert_invalid_num_title: 'Ong·gijagipa Number',
    alert_invalid_num_msg: 'Kakketgipa 10-digit mobile number-ko sedabo.',
    alert_loc_req_title: 'A·song Biapko Nangchongmota',
    alert_loc_req_msg: 'RAKSHAK-o telemetry segatna GPS-ko nanga.',
    alert_reg_err_title: 'Registration Gualani',
    alert_reg_err_msg: 'Authentication service baksa nangrimna amja.',
    disaster_protocol_footer: 'Sorkarini A·sel Nangani Niam (Disaster Protocol) ning·o rakkigimin',
    app_title: 'RAKSHAK',
    app_subtitle: 'Sorkarini A·a Rugani Mikrakatani Portal',
    btn_exit: 'Ong·katbo',
    coords_card_title: 'Biapni Coordinates',
    btn_refresh_gps: 'GPS Gitalattibo',
    btn_transmitting: 'Watatmitingo...',
    txt_syncing_coords: 'Gital coordinates-ko server-ona watatenga...',
    label_latitude: 'Latitude',
    label_longitude: 'Longitude',
    vulnerability_card_title: 'Kenani Obostako Nirikani',
    risk_critical: 'KENBEGNIGIPA BIAP',
    risk_moderate: 'MAJAMPILGIPA KENANI',
    risk_stable: 'TOM·TOMGIPA / KENANI GRIGIPA',
    label_probability_index: 'Ong·na Amangani Index',
    advisory_header_alert: 'JOLNI JOLTOKKO MIKRAKATANI // ALERT',
    advisory_level_badge: 'LEVEL-3 CHAMPENGANI',
    advisory_blockage_title: 'Rama Champengani & Gipin Rama',
    advisory_blockage_p1: 'Na·simangni biapjolni dal·dalgipa jal·lang aro ramarangko a·a rubani a·sel ',
    advisory_blockage_highlight: 'CHAMPENGMANAHA / KADONGMINAHA',
    advisory_blockage_p2: '. Ka·marangni ramako re·nabe aro ge·tanggimin chukgipa ramarangko jakkalbo.',
    directive_title: 'Joltokko Jokatna Niamrang (Civic Defense Directive):',
    directive_step_1: 'Jal·lang aro ka·magipa biapjolrango nangani gri re·rurako champengbo.',
    directive_step_2: 'Chiramchi a·a rugani chel·ao chukgipa gipin biaprangona ta·raken re·angbo.',
    directive_step_3: 'Sorkarini emergency channel-ko knatimbo aro biapni obostako watatbo.',
    advisory_ref_footer: 'Ref: PROTOCOL-SDRF/SEC-9',
    advisory_execute_now: 'Da·on Dakbo',
    visual_card_title: 'Photo Sakki (Visual Evidence)',
    visual_status_empty: 'Photo darangko ra·kuja',
    visual_status_attached: 'Photo kodapmanaha',
    btn_open_camera: 'Camera O·bo',
    btn_retake_media: 'Photo Ra·taibo',
    btn_transmit_visual: 'Photo Sakkiko Watatbo',
    alert_camera_title: 'On·gija Ge·etan',
    alert_camera_msg: 'A·selko segatna camera-ko jakkalna bil nanga.',
    voice_card_title: 'Ku·rangchi Parakatani (Voice Briefing)',
    voice_status_recording: 'Ku·rangko ra·enga...',
    voice_status_ready: 'Ku·rang tarianio donga',
    voice_status_empty: 'Ku·rang darangko ra·kuja',
    btn_record: 'Ku·rang Ra·bo',
    btn_recording_stop: 'Dingtangatbo',
    btn_rerecord: 'Ra·taibo',
    btn_play_memo: 'Knataibo',
    btn_pause_memo: 'Dingtangchibo',
    voice_playing: 'Knatingenga...',
    voice_recorded_memo: 'Ra·gimin Ku·rang',
    btn_transmit_voice: 'Ku·rangko Watatbo',
    alert_audio_perm_title: 'On·gija Ge·etan',
    alert_audio_perm_msg: 'Ku·rang ra·na microphone-ko on·na nanga.',
    alert_audio_err_title: 'Audio Gualani',
    alert_audio_init_fail: 'Ku·rangko ra·na amjaha.',
    alert_audio_final_fail: 'Audio file-ko matchotna amjaha.',
    alert_playback_err_title: 'Play Gualani',
    alert_playback_err_msg: 'Ku·rangko knatna amja.'
  };

  get(key: string): string | null {
    return this.translations[key] || null;
  }
}

// ==========================================
// 3. Central Localization Manager
// ==========================================

interface LanguageDictionary {
  code: string;
  name: string;
  get: (key: string) => string | null;
}

export class LocalizationManager {
  private dictionaries: Map<string, LanguageDictionary> = new Map();
  private currentCode: string;

  constructor(defaultCode = 'en') {
    this.currentCode = defaultCode;

    // Register English + all 8 specified Indian regional languages
    this.registerLanguage(new EnglishDictionary());
    this.registerLanguage(new HindiDictionary());
    this.registerLanguage(new AssameseDictionary());
    this.registerLanguage(new BengaliDictionary());
    this.registerLanguage(new NepaliDictionary());
    this.registerLanguage(new ManipuriDictionary());
    this.registerLanguage(new MizoDictionary());
    this.registerLanguage(new KhasiDictionary());
    this.registerLanguage(new GaroDictionary());
  }

  registerLanguage(dictInstance: LanguageDictionary): void {
    if (!dictInstance.code) {
      throw new Error("Dictionary must contain a 'code' property.");
    }
    this.dictionaries.set(dictInstance.code.toLowerCase(), dictInstance);
  }

  setLanguage(code: string): void {
    const lowerCode = code.toLowerCase();
    if (!this.dictionaries.has(lowerCode)) {
      return;
    }
    this.currentCode = lowerCode;
  }

  getLanguage(): string {
    return this.currentCode;
  }

  t(key: string): string {
    const activeDict = this.dictionaries.get(this.currentCode);
    if (!activeDict) return key;

    const val = activeDict.get(key);
    if (val) return val;

    // Fallback to English if translation is missing
    const fallback = this.dictionaries.get('en');
    return (fallback && fallback.get(key)) || key;
  }

  getAvailableLanguages(): { code: string; name: string; nativeName: string }[] {
    const nativeLabels: Record<string, string> = {
      en: 'English',
      hi: 'हिंदी (Hindi)',
      as: 'অসমীয়া (Assamese)',
      bn: 'বাংলা (Bengali)',
      ne: 'नेपाली (Nepali)',
      mni: 'মৈতৈলোন্ (Manipuri)',
      lus: 'Mizo ṭawng (Mizo)',
      kha: 'Ka Ktien (Khasi)',
      gar: 'A·chik (Garo)',
    };
    const list: { code: string; name: string; nativeName: string }[] = [];
    this.dictionaries.forEach((dict) => {
      list.push({
        code: dict.code,
        name: dict.name,
        nativeName: nativeLabels[dict.code] || dict.name,
      });
    });
    return list;
  }
}

export const i18n = new LocalizationManager('en');