#include <M5Core2.h>
#include "ble_manager.h"
#include "ui_manager.h"
#include "send_message.h"

unsigned long startupTime;
bool inStartup = true;

void setup()
{
  M5.begin();
  connectToWiFi();
  initBLE();
  drawStartupUI();
  startupTime = millis();
}

void loop()
{
  M5.update();
  TouchPoint_t touch = M5.Touch.point[0];
  bool touched = M5.Touch.changed && M5.Touch.points > 0;

  handleUI();

  unsigned long now = millis();

  if (inStartup)
  {
    if (now - startupTime > 1000)
    {
      drawDefaultScreen();
      inStartup = false;
      isDefaultScreen = true;
    }
    return;
  }

  if (isFallPromptActive)
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

  updateBLEStatus();
  delay(50);
}
