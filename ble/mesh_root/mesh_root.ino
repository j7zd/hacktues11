  #include "painlessMesh.h"
  #include <WiFi.h>
  #include <HTTPClient.h>

  #define MESH_PREFIX "MyMeshNetwork"
  #define MESH_PASSWORD "password123"
  #define MESH_PORT 5555

  #define ROUTER_SSID "6rek"
  #define ROUTER_PASSWORD "6rekislove"
  #define SERVER_URL "http://192.168.0.150:42069/"

  painlessMesh mesh;


  unsigned long previousMillis = 0;
  const long blinkInterval = 1000;
  bool ledState = LOW;

  void blink() {
    unsigned long currentMillis = millis();
    if (currentMillis - previousMillis >= blinkInterval) {
      previousMillis = currentMillis;
      ledState = !ledState;
      digitalWrite(LED_BUILTIN, ledState);
    }
  }

  void sendHttpRequest(String message) {
    if (WiFi.status() == WL_CONNECTED) {
      HTTPClient http;
      http.begin(SERVER_URL);

      http.addHeader("Content-Type", "application/json");

      int httpResponseCode = http.POST(message);

      if (httpResponseCode > 0) {
          Serial.println("HTTP Request Sent: " + message);
      } else {
          Serial.println("HTTP Request Failed");
      }

      http.end();
    } else {
      Serial.println("Not connected to WiFi");
    }
  }


  void connectToRouter() {
    WiFi.begin(ROUTER_SSID, ROUTER_PASSWORD);
    
    Serial.println("Connecting to WiFi...");
    unsigned long startAttemptTime = millis();
    
    while (WiFi.status() != WL_CONNECTED) {
      if (millis() - startAttemptTime > 15000) { 
        Serial.println("\nWiFi Connection Timed Out!");
        return;
      }
        
    }

    Serial.println("\nConnected to WiFi!");
    Serial.print("IP Address: ");
    Serial.println(WiFi.localIP());
  }

  void sendBroadcastMACS(char* macs) {
    String message = "allowed_macs:" + String(macs);
    Serial.println("Sending broadcast: " + message);
    mesh.sendBroadcast(message);
  }
  void sendBroadcastMessageGetBLE() {
    String message = "command_get_ble";
    Serial.println("Sending broadcast: " + message);
    mesh.sendBroadcast(message);
  }

  void receivedCallback(uint32_t from, String &msg) {
    Serial.printf("Received from %u: %s\n", from, msg.c_str());
    
    String prefix_command_response = "found_ble:";
    if (msg.startsWith(prefix_command_response)) {

        String extractedData = msg.substring(prefix_command_response.length());
        sendHttpRequest(extractedData);
        return;
    }
      
  }
  void newConnectionCallback(uint32_t nodeId) {
    Serial.printf("New Connection: %u\n", nodeId);
      
  }

  void checkSerialCommand() {
    if (Serial.available()) {
        char command = Serial.read();
        if (command == '1') {
            Serial.println("Sending HTTP request...");
            sendHttpRequest("Direct request from Root");
        }
        if (command == '2') {
            sendBroadcastMACS("ec:64:c9:9e:e2:3a;");
      }
      if (command == '3') {
        sendBroadcastMessageGetBLE();
    }
        if (command == '9') {
            Serial.println("I am Root Node");
        }
    }
  }

  void setup() {
    Serial.begin(115200);
    pinMode(LED_BUILTIN, OUTPUT);

    mesh.init(MESH_PREFIX, MESH_PASSWORD, MESH_PORT);
    mesh.onReceive(&receivedCallback);
    mesh.onNewConnection(&newConnectionCallback);
    connectToRouter();
  }

  void loop() {
    mesh.update();
    blink();
    checkSerialCommand();
    if(WiFi.status() != WL_CONNECTED){

      connectToRouter();
    }
  }