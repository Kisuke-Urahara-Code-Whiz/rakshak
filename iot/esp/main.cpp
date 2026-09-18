#include <WiFi.h>
#include <HTTPClient.h>
#include <WiFiClientSecure.h>
#include <WebSocketsClient.h>
#include <ArduinoJson.h>

struct WiFiCredential {
    const char* ssid;
    const char* password;
};

WiFiCredential wifiNetworks[] = {
    {"realme P3 Pro 5G 4C90", "RUM221206"},
    {"Infinix NOTE 10", "sushmitadutta"},
    {"STUDENT", "0123456789"},
    {"Redmi Note 8","1223334444"},
    {"M345G", "11223344"},
};
const int NUM_WIFI_NETWORKS = sizeof(wifiNetworks) / sizeof(wifiNetworks[0]);

const char* vercel_api_url = "https://iotserver-mauve.vercel.app/getESPService";
const char* DEVICE_ID = "device_1";

const int BUZZER_PIN = 18;
const int BUZZER_FREQUENCY = 2700;   
const int BEEP_ON_TIME = 250;        
const int BEEP_OFF_TIME = 150;       

String active_ws_host = "";
const int ws_port = 443;
String ws_path = String("/ws/esp/") + DEVICE_ID;

WebSocketsClient webSocket;

bool isConnected = false;
unsigned long disconnectTime = 0;

bool isAlerting = false;
unsigned long alertEndTime = 0;
unsigned long lastBeepToggle = 0;
bool buzzerState = false;

void esp32Tone(int pin, int frequency) {
    tone(pin, frequency);
}

void esp32NoTone(int pin) {
    noTone(pin);
}

bool connectToWiFi() {
    Serial.println("\n================================");
    Serial.println(" Searching for Wi-Fi Networks");
    Serial.println("================================");

    for (int i = 0; i < NUM_WIFI_NETWORKS; i++) {
        if (String(wifiNetworks[i].ssid).startsWith("YOUR_WIFI")) continue;

        Serial.printf("\n[Wi-Fi] Trying network %d/%d: %s\n", i + 1, NUM_WIFI_NETWORKS, wifiNetworks[i].ssid);
        WiFi.disconnect(true);
        delay(300);
        WiFi.begin(wifiNetworks[i].ssid, wifiNetworks[i].password);
        Serial.print("[Wi-Fi] Connecting");

        unsigned long startTime = millis();
        while (WiFi.status() != WL_CONNECTED && millis() - startTime < 10000) {
            delay(500);
            Serial.print(".");
        }
        Serial.println();

        if (WiFi.status() == WL_CONNECTED) {
            Serial.println("[Wi-Fi] Connected successfully!");
            Serial.print("[Wi-Fi] Local IP: ");
            Serial.println(WiFi.localIP());
            return true;
        }

        Serial.println("[Wi-Fi] Connection failed. Trying next network...");
        WiFi.disconnect(true);
        delay(500);
    }
    return false;
}

bool fetchPinggyHostFromVercel() {
    Serial.println("[HTTP] Fetching active Pinggy URL from Vercel...");
    WiFiClientSecure httpSecureClient;
    httpSecureClient.setInsecure(); 
    HTTPClient http;

    if (http.begin(httpSecureClient, vercel_api_url)) {
        int httpCode = http.GET();
        if (httpCode == HTTP_CODE_OK) {
            String payload = http.getString();
            Serial.printf("[HTTP] Vercel Response: %s\n", payload.c_str());

            StaticJsonDocument<256> doc;
            DeserializationError error = deserializeJson(doc, payload);

            if (!error) {
                const char* host = doc["clean_host"] | "";
                if (strlen(host) > 0) {
                    active_ws_host = String(host);
                } else if (doc.containsKey("tunnel_url")) {
                    String url = doc["tunnel_url"].as<String>();
                    url.replace("https://", "");
                    url.replace("http://", "");
                    int slashIdx = url.indexOf('/');
                    if (slashIdx != -1) url = url.substring(0, slashIdx);
                    active_ws_host = url;
                }

                if (active_ws_host.length() > 0) {
                    Serial.printf("[HTTP] Extracted Pinggy Host: %s\n", active_ws_host.c_str());
                    http.end();
                    return true;
                }
            } else {
                Serial.printf("[HTTP] JSON Parse Error: %s\n", error.c_str());
            }
        } else {
            Serial.printf("[HTTP] GET failed, error code: %d\n", httpCode);
        }
        http.end();
    } else {
        Serial.println("[HTTP] Unable to connect to Vercel API");
    }
    return false;
}

void webSocketEvent(WStype_t type, uint8_t* payload, size_t length) {
    switch (type) {
        case WStype_DISCONNECTED:
            isConnected = false;
            disconnectTime = millis();
            Serial.println("[WS] Disconnected!");
            break;

        case WStype_CONNECTED:
            isConnected = true;
            disconnectTime = 0;
            Serial.printf("[WS] Connected to %s as %s!\n", active_ws_host.c_str(), DEVICE_ID);
            break;

        case WStype_TEXT:
        {
            Serial.printf("[WS] Received: %.*s\n", length, payload);

            DynamicJsonDocument doc(1024);
            DeserializationError err = deserializeJson(doc, payload);

            if (!err) {
                const char* msgType = doc["type"] | "";

                if (strcmp(msgType, "ALERT") == 0) {
                    int duration = doc["duration_ms"] | 2000;
                    Serial.printf("[WS] ALERT received. Duration: %d ms\n", duration);

                    isAlerting = true;
                    alertEndTime = millis() + duration;

                    String ack = "{\"status\":\"DONE\",\"device_id\":\"" + String(DEVICE_ID) + "\"}";
                    Serial.printf("[WS] Sending ACK: %s\n", ack.c_str());
                    webSocket.sendTXT(ack);
                }
            } else {
                Serial.printf("[WS] JSON Error: %s\n", err.c_str());
            }
            break;
        }
        case WStype_PING:
            Serial.println("[WS] PING");
            break;
        case WStype_PONG:
            Serial.println("[WS] PONG");
            break;
        default:
            break;
    }
}

void disconnectWebSocket() {
    if (isConnected) {
        Serial.println("[WS] Initiating graceful disconnect...");
        isAlerting = false;
        esp32NoTone(BUZZER_PIN);

        String disconnectMessage = "{\"status\":\"DISCONNECTING\",\"device_id\":\"" + String(DEVICE_ID) + "\"}";
        webSocket.sendTXT(disconnectMessage);
        delay(100);
        webSocket.disconnect();
        isConnected = false;
        Serial.println("[WS] Disconnected cleanly.");
    }
}

void setup() {
    Serial.begin(115200);
    delay(1000);

    Serial.println("\n==============================");
    Serial.println(" ESP32-S3 IoT Alert Device");
    Serial.println("==============================");

    pinMode(BUZZER_PIN, OUTPUT);
    esp32NoTone(BUZZER_PIN);

    WiFi.mode(WIFI_STA);
    if (!connectToWiFi()) {
        Serial.println("\n[Wi-Fi] No configured network available. Restarting in 5s...");
        delay(5000);
        ESP.restart();
    }

    while (!fetchPinggyHostFromVercel()) {
        Serial.println("[HTTP] Retrying Vercel lookup in 5 seconds...");
        delay(5000);
    }

    Serial.printf("[WS] Connecting to wss://%s:%d%s\n", active_ws_host.c_str(), ws_port, ws_path.c_str());

    //webSocket.setExtraHeaders(("Host: " + active_ws_host + "\r\n").c_str());
    webSocket.beginSSL(active_ws_host.c_str(), ws_port, ws_path.c_str(), "", "arduino");

    webSocket.onEvent(webSocketEvent);
    webSocket.setReconnectInterval(5000);
    webSocket.enableHeartbeat(15000, 3000, 2);

    Serial.println("[SYSTEM] Setup complete.");
}

void loop() {
    webSocket.loop();

    if (isAlerting) {
        if (millis() < alertEndTime) {
            unsigned long currentInterval = buzzerState ? BEEP_ON_TIME : BEEP_OFF_TIME;
            if (millis() - lastBeepToggle > currentInterval) {
                buzzerState = !buzzerState;
                lastBeepToggle = millis();
                
                if (buzzerState) {
                    esp32Tone(BUZZER_PIN, BUZZER_FREQUENCY);
                } else {
                    esp32NoTone(BUZZER_PIN);
                }
            }
        } else {
            isAlerting = false;
            buzzerState = false;
            esp32NoTone(BUZZER_PIN);
            Serial.println("[SYSTEM] Alert finished.");
        }
    }

    if (!isConnected && disconnectTime > 0 && (millis() - disconnectTime > 15000)) {
        Serial.println("[WS] Pinggy tunnel lost. Restarting to fetch new URL...");
        delay(1000);
        ESP.restart();
    }

    delay(1);
}
