#include <Arduino.h>
#include <BLEDevice.h>
#include <BLEScan.h>
#include <BLEAdvertisedDevice.h>

#define SCAN_TIME 5
#define TARGET_DEVICE "M5Core2_Fall_Detect"

BLEScan* pBLEScan;

class MyAdvertisedDeviceCallbacks: public BLEAdvertisedDeviceCallbacks {
    void onResult(BLEAdvertisedDevice advertisedDevice) {
        String deviceName = advertisedDevice.getName().c_str();
        
        if (deviceName == TARGET_DEVICE) {
            Serial.println("🔵 M5Core2 Detected!");
            Serial.print("📡 RSSI: "); Serial.println(advertisedDevice.getRSSI());
            
            if (advertisedDevice.haveManufacturerData()) {
                String manufacturerData = advertisedDevice.getManufacturerData();
                Serial.print("🏭 Manufacturer Data: ");
                for (char c : manufacturerData) Serial.print(c);
                Serial.println();
            }

            Serial.println("-----------------------------");
        }
    }
};

void setup() {
    Serial.begin(115200);
    Serial.println("\n🔍 BLE Scanner Started");

    BLEDevice::init("ESP32S3_Receiver");
    pBLEScan = BLEDevice::getScan();
    pBLEScan->setAdvertisedDeviceCallbacks(new MyAdvertisedDeviceCallbacks());
    pBLEScan->setActiveScan(true); 
    pBLEScan->setInterval(100);
    pBLEScan->setWindow(99);
}

void loop() {
    Serial.println("🔄 Scanning...");
    pBLEScan->start(SCAN_TIME, false);
    delay(1000); 
}
