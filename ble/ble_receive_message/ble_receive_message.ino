#include <Arduino.h>
#include <BLEDevice.h>
#include <BLEScan.h>
#include <BLEAdvertisedDevice.h>

#define SCAN_TIME 5
#define TARGET_DEVICE "M5Core2_Fall_Detect"

BLEScan *pBLEScan;

class MyAdvertisedDeviceCallbacks : public BLEAdvertisedDeviceCallbacks
{
    void onResult(BLEAdvertisedDevice advertisedDevice)
    {
        String deviceName = advertisedDevice.getName().c_str();
        String target_device = TARGET_DEVICE;
        int target_device_length = target_device.length();

        for (int i = 0; i < target_device_length; i++)
        {
            if (deviceName[i] != target_device[i])
            {
                return;
            }
        }

        String id = deviceName.substring(target_device_length);

        Serial.println("M5Core2 Detected!");
        Serial.print("RSSI: ");
        Serial.println(advertisedDevice.getRSSI());
        Serial.print("ID: ");
        Serial.println(id);

        if (advertisedDevice.haveManufacturerData())
        {
            String manufacturerData = advertisedDevice.getManufacturerData();
            Serial.print("Manufacturer Data: ");
            for (char c : manufacturerData)
                Serial.print(c);
            Serial.println();
        }

        Serial.println("-----------------------------");
    }
};

void setup()
{
    Serial.begin(115200);
    Serial.println("\nBLE Scanner Started");

    BLEDevice::init("ESP32S3_Receiver");
    pBLEScan = BLEDevice::getScan();
    pBLEScan->setAdvertisedDeviceCallbacks(new MyAdvertisedDeviceCallbacks());
    pBLEScan->setActiveScan(true);
    pBLEScan->setInterval(100);
    pBLEScan->setWindow(99);
}

void loop()
{
    Serial.println("Scanning...");
    pBLEScan->start(SCAN_TIME, false);
    delay(1000);
}
