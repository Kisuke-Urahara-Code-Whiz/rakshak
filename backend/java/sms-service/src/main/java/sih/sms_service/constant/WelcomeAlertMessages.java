package sih.sms_service.constant;

import java.util.HashMap;
import java.util.Map;

public class WelcomeAlertMessages {

    private static final Map<String, String> welcomeMessages = new HashMap<>();

    static {

        welcomeMessages.put("en", "Welcome to Rakshak App, an initiative by the Ministry of Development of North Eastern Region (MDoNER), Govt. of India. You will receive real-time automated landslide alerts and emergency safety updates for your area.");

        welcomeMessages.put("hi", "रक्षक (Rakshak) ऐप में आपका स्वागत है, यह पूर्वोत्तर क्षेत्र विकास मंत्रालय (MDoNER), भारत सरकार की एक पहल है। आपको अपने क्षेत्र के लिए भूस्खलन की वास्तविक समय पर चेतावनी और आपातकालीन सुरक्षा अपडेट प्राप्त होंगे।");

        welcomeMessages.put("as", "ৰক্ষক (Rakshak) এপলৈ স্বাগতম, এইটো উত্তৰ-পূব অঞ্চল উন্নয়ন মন্ত্ৰালয় (MDoNER), ভাৰত চৰকাৰৰ এক পদক্ষেপ। আপুনি আপোনাৰ অঞ্চলৰ ভূমিস্খলনৰ সতৰ্কবাণী আৰু জৰুৰীকালীন সুৰক্ষা বাৰ্তা নিয়মীয়াকৈ লাভ কৰিব।");

        welcomeMessages.put("bn", "রক্ষক (Rakshak) অ্যাপে আপনাকে স্বাগতম, এটি উত্তর-পূর্বাঞ্চল উন্নয়ন মন্ত্রক (MDoNER), ভারত সরকারের একটি উদ্যোগ। আপনি আপনার এলাকার ভূমিধসের রিয়েল-টাইম সতর্কতা এবং জরুরি নিরাপত্তা বার্তা পাবেন।");

        welcomeMessages.put("ne", "रक्षक (Rakshak) एपमा यहाँलाई स्वागत छ, यो उत्तर पूर्वी क्षेत्र विकास मन्त्रालय (MDoNER), भारत सरकारको एक पहल हो। तपाईंले आफ्नो क्षेत्रको लागि प्रत्यक्ष पहिरो चेतावनी र आपतकालीन सुरक्षा जानकारी प्राप्त गर्नुहुनेछ।");

        welcomeMessages.put("mni", "রক্ষক (Rakshak) এপ অসিদা তরাম্না ওকচরি, মসিসু নোংপোক-চিংশাং লমদম চাউখৎ-থৌরাং মন্ত্রালয় (MDoNER), ভারত সরকারগী থবক অমনি। নহাক্কী মফমগী লৈবাক থুনবগী অথুবা চেকশিন ৱাফম অমসুং ইমার্জেন্সী সেফটি অপদেতশিং ফংবীগনি।");

        welcomeMessages.put("lus", "Rakshak App-ah kan lo lawm a che. Hei hi Ministry of Development of North Eastern Region (MDoNER), Govt. of India hmalakna a ni. I awmna hmun atana lei min venchhuahna leh emergency thuthar rang takin i dawng zel ang.");

        welcomeMessages.put("kha", "Khublei bad pdiang sngewbha sha ka Rakshak App, ka jingpyntreikam da ka Ministry of Development of North Eastern Region (MDoNER), Sorkar India. Phin ioh ki khubor pyni-maham halor ka jingtwad khyndew bad ki jingiada emergency mar ya jia.");

        welcomeMessages.put("gar", "Rakshak App-ona rimchaksoa. Iade Ministry of Development of North Eastern Region (MDoNER), Govt. of India-ni kam ong·a. Na·ani donggipa biapni a·a khreani mikrakatani aro emergency jokatani kattarangko rang·san man·gen.");
    }

    public static String getMessage(String langCode) {
        if (langCode == null) {
            return welcomeMessages.get("en");
        }
        return welcomeMessages.getOrDefault(langCode.trim().toLowerCase(), welcomeMessages.get("en"));
    }
}