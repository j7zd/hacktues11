#include <M5Core2.h>
#include "ble_manager.h"
#include "ui_manager.h"
#include "send_message.h"
#include "fall_detector.h"

unsigned long startupTime;
bool inStartup = true;

void setup()
{
  M5.begin();         // Start M5 system
  connectToWiFi();    // For help/wegood messaging
  initBLE();          // BLE advertisement
  initGyroAccel();     // Init accelerometer and serial
  drawStartupUI(); // Initial splash screen
  startupTime = millis();
}

void loop()
{
  M5.update();
  TouchPoint_t touch = M5.Touch.point[0];
  bool touched = M5.Touch.changed && M5.Touch.points > 0;

  handleUI();

  unsigned long now = millis();

  // Show main screen 2s after boot
  if (inStartup)
  {
    if (now - startupTime > 2000)
    {
      drawDefaultScreen(); // Show CALL button
      inStartup = false;
      isDefaultScreen = true;
    }
    return;
  }

  // Run accelerometer-based fall detection
  bool a = hasFallen();
  if (a)
  {
    updateFallPrompt(touch, touched);
  }
  // UI state machine
  if ( isFallPromptActive)
  {
    updateFallPrompt(touch, touched);
  }
  else if (isConfirmPanic)
  {
    updateConfirmPanic(touch, touched);
  }
  else if (isDefaultScreen)
  {
    updateDefaultScreen(touch, touched);
  }

  updateBLEStatus(); // BLE ON/OFF indicator
  delay(50);
}
