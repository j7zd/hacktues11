#include <WiFi.h>
#include <HTTPClient.h>

const char *ssid = "6rek";
const char *password = "6rekislove";

const char *SERVER_URL = "http://192.168.0.150:42069";
const char *MAC_ADDRESS = "EC:64:C9:9E:E2:3A";

void connectToWiFi()
{
    WiFi.begin(ssid, password);
    Serial.print("Connecting to WiFi");
    while (WiFi.status() != WL_CONNECTED)
    {
        delay(500);
        Serial.print(".");
    }
    Serial.println("\nConnected to WiFi!");
}

void sendHelpRequest()
{
    if (WiFi.status() == WL_CONNECTED)
    {
        HTTPClient http;
        http.begin(String(SERVER_URL) + "/api/help");
        http.addHeader("Content-Type", "application/json");
        String payload = String("{\"mac\": \"") + MAC_ADDRESS + "\"}";
        int httpResponseCode = http.POST(payload);

        Serial.printf("Help POST response: %d\n", httpResponseCode);
        http.end();
    }
}

void sendWeGoodRequest()
{
    if (WiFi.status() == WL_CONNECTED)
    {
        HTTPClient http;
        http.begin(String(SERVER_URL) + "/api/wegood");
        http.addHeader("Content-Type", "application/json");
        String payload = String("{\"mac\": \"") + MAC_ADDRESS + "\"}";
        int httpResponseCode = http.POST(payload);

        Serial.printf("WeGood POST response: %d\n", httpResponseCode);
        http.end();
    }
}