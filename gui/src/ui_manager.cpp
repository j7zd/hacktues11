#include <M5Core2.h>
#include "ble_manager.h"
#include "send_message.h"

Zone yesButtonZone(40, 140, 100, 60);
Zone noButtonZone(180, 140, 100, 60);
unsigned long fallPromptStart = 0;
bool isFallPromptActive = false;
const int FALL_TIMEOUT = 10000;

Zone panicButtonZone(90, 120, 140, 80); 
Zone confirmYesZone(40, 140, 100, 60);
Zone confirmNoZone(180, 140, 100, 60);

bool isDefaultScreen = true;
bool isConfirmPanic = false;
unsigned long defaultScreenStart = 0;
const int PANIC_TIMEOUT = 5000;

void drawBLEStatus(bool bleOn)
{
    M5.Lcd.setTextSize(1);
    M5.Lcd.setCursor(M5.Lcd.width() - 60, 5);
    M5.Lcd.setTextColor(bleOn ? GREEN : RED, BLACK);
    M5.Lcd.print("BLE: ");
    M5.Lcd.print(bleOn ? "ON " : "OFF");
}

void drawStartupUI()
{
    M5.Lcd.fillScreen(BLACK);
    M5.Lcd.setTextSize(2);
    M5.Lcd.setTextColor(WHITE);
    M5.Lcd.setCursor(10, 10);
    M5.Lcd.println("Fall Detection System");
    M5.Lcd.setCursor(10, 40);
    M5.Lcd.println("Press A: Stop BLE");
    M5.Lcd.setCursor(10, 70);
    M5.Lcd.println("Press B: Start BLE");
    drawBLEStatus(isBLEOn()); 
}

void handleUI()
{
    if (M5.BtnA.wasPressed())
    {
        stopBLE();
        drawBLEStatus(false);
    }

    if (M5.BtnB.wasPressed())
    {
        startBLE();
        drawBLEStatus(true);
    }
}

void drawDefaultScreen()
{
    M5.Lcd.fillScreen(BLACK);
    M5.Lcd.setTextColor(WHITE);
    M5.Lcd.setTextSize(2);
    M5.Lcd.setCursor(10, 10);
    M5.Lcd.println("Monitoring...");

    M5.Lcd.fillRoundRect(panicButtonZone.x, panicButtonZone.y, panicButtonZone.w, panicButtonZone.h, 10, RED);
    M5.Lcd.setCursor(panicButtonZone.x + 20, panicButtonZone.y + 30);
    M5.Lcd.setTextColor(WHITE);
    M5.Lcd.setTextSize(3);
    M5.Lcd.print("PANIC");

    drawBLEStatus(isBLEOn());
    defaultScreenStart = millis();
    isDefaultScreen = true;
}

void showConfirmPanic()
{
    M5.Lcd.fillScreen(BLACK);
    drawBLEStatus(isBLEOn());
    M5.Lcd.setTextColor(ORANGE);
    M5.Lcd.setTextSize(3);
    M5.Lcd.setCursor(30, 40);
    M5.Lcd.println("Are you sure?");

    // YES
    M5.Lcd.fillRoundRect(confirmYesZone.x, confirmYesZone.y, confirmYesZone.w, confirmYesZone.h, 10, GREEN);
    M5.Lcd.setCursor(confirmYesZone.x + 30, confirmYesZone.y + 20);
    M5.Lcd.setTextColor(WHITE);
    M5.Lcd.setTextSize(2);
    M5.Lcd.println("YES");

    // NO
    M5.Lcd.fillRoundRect(confirmNoZone.x, confirmNoZone.y, confirmNoZone.w, confirmNoZone.h, 10, RED);
    M5.Lcd.setCursor(confirmNoZone.x + 30, confirmNoZone.y + 20);
    M5.Lcd.println("NO");

    isConfirmPanic = true;
    isDefaultScreen = false;
}

void drawFallPrompt()
{
    M5.Lcd.fillScreen(BLACK);
    drawBLEStatus(isBLEOn());
    M5.Lcd.setTextSize(3);
    M5.Lcd.setCursor(60, 40);
    M5.Lcd.setTextColor(RED);
    M5.Lcd.println("Are you OK?");

    M5.Lcd.fillRoundRect(yesButtonZone.x, yesButtonZone.y, yesButtonZone.w, yesButtonZone.h, 10, GREEN);
    M5.Lcd.setCursor(yesButtonZone.x + 30, yesButtonZone.y + 20);
    M5.Lcd.setTextColor(WHITE);
    M5.Lcd.println("YES");

    M5.Lcd.fillRoundRect(noButtonZone.x, noButtonZone.y, noButtonZone.w, noButtonZone.h, 10, RED);
    M5.Lcd.setCursor(noButtonZone.x + 30, noButtonZone.y + 20);
    M5.Lcd.println("NO");

    fallPromptStart = millis();
    isFallPromptActive = true;
}

void updateDefaultScreen(TouchPoint_t touch, bool touched)
{
    if (touched && panicButtonZone.contains(touch))
    {
        showConfirmPanic();
    }

    if (millis() - defaultScreenStart >= PANIC_TIMEOUT && !isFallPromptActive)
    {
        drawFallPrompt();
        isDefaultScreen = false;
    }
}

void updateConfirmPanic(TouchPoint_t touch, bool touched)
{
    if (!isConfirmPanic || !touched)
        return;

    if (confirmYesZone.contains(touch))
    {
        isConfirmPanic = true;
        M5.Lcd.fillScreen(BLACK);
        M5.Lcd.setCursor(40, 100);
        M5.Lcd.setTextColor(RED);
        M5.Lcd.println("Help is on the way!");
        sendHelpRequest();
        
    }
    else if (confirmNoZone.contains(touch))
    {
        isConfirmPanic = false;
        drawDefaultScreen();
    }
}

void updateFallPrompt(TouchPoint_t touch, bool touched)
{
    if (!isFallPromptActive)
        return;

    if (touched)
    {
        if (yesButtonZone.contains(touch))
        {
            M5.Lcd.fillScreen(BLACK);
            M5.Lcd.setCursor(60, 100);
            M5.Lcd.setTextColor(GREEN);
            M5.Lcd.println("Glad you're OK!");
            isFallPromptActive = false;
            sendWeGoodRequest();
        }
        else if (noButtonZone.contains(touch))
        {
            M5.Lcd.fillScreen(BLACK);
            M5.Lcd.setCursor(40, 100);
            M5.Lcd.setTextColor(RED);
            M5.Lcd.println("Help is on the way!");
            isFallPromptActive = false;
            sendHelpRequest();
        }
    }

    int secondsLeft = (FALL_TIMEOUT - (millis() - fallPromptStart)) / 1000;
    M5.Lcd.fillRect(100, 220, 120, 20, BLACK);
    M5.Lcd.setCursor(100, 220);
    M5.Lcd.setTextColor(YELLOW);
    M5.Lcd.setTextSize(2);
    M5.Lcd.printf("Auto in %d", secondsLeft);

    if (millis() - fallPromptStart >= FALL_TIMEOUT)
    {
        M5.Lcd.fillScreen(BLACK);
        M5.Lcd.setCursor(40, 100);
        M5.Lcd.setTextColor(ORANGE);
        M5.Lcd.println("No response. Sending help!");
        isFallPromptActive = false;
        sendHelpRequest();
    }
}
