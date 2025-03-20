#include <M5Core2.h>
#include "BluetoothSerial.h"

BluetoothSerial SerialBT;

bool isConnected = false;

void setup() {
    M5.begin(); 
    M5.Lcd.setTextSize(2);
    M5.Lcd.setCursor(10, 50);
    M5.Lcd.print("Starting Bluetooth...");
    
    Serial.begin(115200);
    SerialBT.begin("M5Core2_BT");  
    
    M5.Lcd.fillScreen(TFT_BLACK);
    M5.Lcd.setCursor(10, 50);
    M5.Lcd.print("Bluetooth Started!");
    delay(1000);
}

void loop() {
    M5.update();

    if (SerialBT.available()) {
        String received = SerialBT.readString();
        Serial.print("Received: ");
        Serial.println(received);

        M5.Lcd.fillRect(10, 80, 300, 30, TFT_BLACK); // clear previous text
        M5.Lcd.setCursor(10, 80);
        M5.Lcd.setTextColor(TFT_GREEN);
        M5.Lcd.print("Received: " + received);
    }

    if (M5.BtnA.wasPressed()) {  // send message when button A is pressed
        SerialBT.println("Hello from M5Core2!");
        M5.Lcd.fillRect(10, 120, 300, 30, TFT_BLACK);
        M5.Lcd.setCursor(10, 120);
        M5.Lcd.setTextColor(TFT_CYAN);
        M5.Lcd.print("Sent: Hello from M5Core2!");
    }

    delay(100);
}
