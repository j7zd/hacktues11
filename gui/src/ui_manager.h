#pragma once
#include <M5Core2.h>

void drawStartupUI();
void handleUI();
// void updateBLEStatus();

void drawDefaultScreen();
void updateDefaultScreen(TouchPoint_t touch, bool touched);

void showConfirmPanic();
void updateConfirmPanic(TouchPoint_t touch, bool touched);

void drawFallPrompt();
void updateFallPrompt(TouchPoint_t touch, bool touched);
void drawBLEStatus(bool bleOn);

extern bool isFallPromptActive;
extern bool isDefaultScreen;
extern bool isConfirmPanic;