#include <M5Core2.h>
#include <BLEDevice.h>
#include <BLEUtils.h>
#include <BLEServer.h>

#define DEVICE_NAME "M5Core2_Fall_Detect1"

BLEAdvertising* pAdvertising;

void setup() {
    M5.begin();
    M5.Lcd.setTextSize(2);
    M5.Lcd.setCursor(10, 50);
    M5.Lcd.print("Initializing BLE...");

    BLEDevice::init(DEVICE_NAME);
    BLEServer* pServer = BLEDevice::createServer();

    pAdvertising = BLEDevice::getAdvertising();
    
    BLEAdvertisementData advData;
    advData.setName(DEVICE_NAME);

    pAdvertising->setAdvertisementData(advData);
    pAdvertising->start();

    M5.Lcd.fillScreen(TFT_BLACK);
    M5.Lcd.setCursor(10, 50);
    M5.Lcd.print("BLE Advertising!");
    M5.Lcd.setCursor(10, 80);
    M5.Lcd.print("Device: " DEVICE_NAME);
    M5.Lcd.setCursor(10, 110);
}

void loop() {
    M5.update();

    if (M5.BtnA.wasPressed()) {
        pAdvertising->stop();
        M5.Lcd.fillScreen(TFT_BLACK);
        M5.Lcd.setCursor(10, 50);
        M5.Lcd.print("BLE Stopped!");
    }

    if (M5.BtnB.wasPressed()) {
        pAdvertising->start();
        M5.Lcd.fillScreen(TFT_BLACK);
        M5.Lcd.setCursor(10, 50);
        M5.Lcd.println("BLE Advertising!");
        M5.Lcd.print("Device: " DEVICE_NAME);
        M5.Lcd.setCursor(10, 110);
    }

    delay(500);
}
