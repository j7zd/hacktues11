#include <BLEDevice.h>
#include <BLEUtils.h>
#include <BLEServer.h>

BLEAdvertising *pAdvertising;
bool bleIsActive = false; 

void initBLE()
{
    BLEDevice::init("M5Core2_Fall_Detect1");
    pAdvertising = BLEDevice::getAdvertising();
    pAdvertising->start();
    bleIsActive = true;
}

void stopBLE()
{
    pAdvertising->stop();
    bleIsActive = false;
}

void startBLE()
{
    pAdvertising->start();
    bleIsActive = true;
}

bool isBLEOn()
{
    return bleIsActive;
}

void updateBLEStatus()
{
    // Optional: send periodic status
}
