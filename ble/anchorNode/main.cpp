#include <WiFi.h>
#include <HTTPClient.h>
#include <BLEDevice.h>
#include <BLEScan.h>
#include <vector>

//externaly saved in another file
extern const char* ssid;
extern const char* password;
extern const char* serverUrl; 

BLEScan* pBLEScan;
const int scanTime = 2;

//tracked macs
std::vector<std::string> allowedMacs = {
    "ec:64:c9:9e:e2:3a"
};


struct BLEDeviceInfo {
    std::string address;
    int rssi;
    std::string name;
};

std::vector<BLEDeviceInfo> detectedDevices;

std::string getESP32MAC() {
    return WiFi.macAddress().c_str();
}
//bluetooth handler
void scanBLEDevices() {
    detectedDevices.clear();
    BLEScanResults foundDevices = pBLEScan->start(scanTime, false);
    for (int i = 0; i < foundDevices.getCount(); i++) {
        BLEAdvertisedDevice device = foundDevices.getDevice(i);
        std::string macAddress = device.getAddress().toString();
        if (std::find(allowedMacs.begin(), allowedMacs.end(), macAddress) == allowedMacs.end()) {
            continue;
        }
        
        BLEDeviceInfo info = {
            macAddress,
            device.getRSSI(),
            device.getName() != "" ? device.getName() : "Unknown"
        };
        detectedDevices.push_back(info);
    }
    pBLEScan->clearResults();
}
//wifi handler
void sendToServer() {
    
    if (WiFi.status() != WL_CONNECTED) {
        Serial.println("Wi-Fi not connected");
        return;
    }
    HTTPClient http;
    http.begin(serverUrl);
    http.addHeader("Content-Type", "application/json");
    
    String payload = "{\"node_mac_address\": \"" + String(getESP32MAC().c_str()) + "\", \"signals\": [";
    for (size_t i = 0; i < detectedDevices.size(); i++) {
        payload += "{\"mac\": \"" + String(detectedDevices[i].address.c_str()) + "\", ";
        payload += "\"signal\": " + String(detectedDevices[i].rssi) + "}";
        if (i < detectedDevices.size() - 1) payload += ", ";
    }
    payload += "]}";
    
    int httpResponseCode = http.POST(payload);
    if (httpResponseCode > 0) {
        Serial.println("Data sent successfully");
    } else {
        Serial.println("Error sending data");
    }
    http.end();
}

void setup() {
    Serial.begin(115200);
    WiFi.begin(ssid, password);
    while (WiFi.status() != WL_CONNECTED) {
        delay(1000);
        Serial.println("Connecting to Wi-Fi...");
    }
    Serial.println("Connected to Wi-Fi");
    
    BLEDevice::init("ESP32_BLE_Scanner");
    pBLEScan = BLEDevice::getScan();
    pBLEScan->setActiveScan(true);
}

void loop() {
    scanBLEDevices();
    sendToServer();
    delay(500); 
}
