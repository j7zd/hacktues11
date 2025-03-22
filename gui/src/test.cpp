// #include <M5Unified.h>

// bool helpPrompt = false;
// bool helpCalled = false;

// void showHelpPrompt();
// void callForHelp();
// void cancelHelp();

// void setup()
// {
//   M5.begin();
//   M5.Lcd.setTextSize(2);
//   M5.Lcd.setTextColor(BLACK, WHITE);
//   M5.Lcd.fillScreen(WHITE);
//   M5.Lcd.setCursor(50, 100);
//   M5.Lcd.println("Monitoring for falls...");

//   // Simulate fall after 5 seconds for demo
//   delay(5000);
//   showHelpPrompt();
// }

// void loop()
// {
//   M5.update(); // Update touchscreen status

//   if (helpPrompt)
//   {
//     if (M5.Touch.ispressed())
//     {
//       TouchPoint_t pos = M5.Touch.getPressPoint();

//       // YES button area
//       if (pos.x > 40 && pos.x < 120 && pos.y > 180 && pos.y < 240)
//       {
//         callForHelp();
//         helpPrompt = false;
//       }

//       // NO button area
//       if (pos.x > 200 && pos.x < 280 && pos.y > 180 && pos.y < 240)
//       {
//         cancelHelp();
//         helpPrompt = false;
//       }
//     }
//   }

//   delay(100); // Simple debounce
// }

// void showHelpPrompt()
// {
//   M5.Lcd.fillScreen(WHITE);
//   M5.Lcd.setCursor(30, 50);
//   M5.Lcd.setTextColor(RED, WHITE);
//   M5.Lcd.println("Are you okay?");
//   M5.Lcd.setTextColor(BLACK, WHITE);
//   M5.Lcd.setCursor(30, 100);
//   M5.Lcd.println("Do you need help?");

//   // Draw YES (green) button
//   M5.Lcd.fillRoundRect(40, 180, 80, 60, 10, GREEN);
//   M5.Lcd.setCursor(60, 200);
//   M5.Lcd.setTextColor(WHITE, GREEN);
//   M5.Lcd.println("YES");

//   // Draw NO (red) button
//   M5.Lcd.fillRoundRect(200, 180, 80, 60, 10, RED);
//   M5.Lcd.setCursor(220, 200);
//   M5.Lcd.setTextColor(WHITE, RED);
//   M5.Lcd.println("NO");

//   helpPrompt = true;
// }

// void callForHelp()
// {
//   M5.Lcd.fillScreen(WHITE);
//   M5.Lcd.setCursor(50, 100);
//   M5.Lcd.setTextColor(RED, WHITE);
//   M5.Lcd.println("Calling for help...");
//   helpCalled = true;
//   // Here you can add Bluetooth/Wi-Fi/LoRa call logic
// }

// void cancelHelp()
// {
//   M5.Lcd.fillScreen(WHITE);
//   M5.Lcd.setCursor(50, 100);
//   M5.Lcd.setTextColor(GREEN, WHITE);
//   M5.Lcd.println("Help canceled.");
//   helpCalled = false;
// }
