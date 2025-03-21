#include "painlessMesh.h"

#include <BLEDevice.h>
#include <BLEUtils.h>
#include <BLEScan.h>
#include <BLEAdvertisedDevice.h>
#include <string>
#include <WiFi.h>

#define MESH_PREFIX "MyMeshNetwork"
#define MESH_PASSWORD "password123"
#define MESH_PORT 5555

int scanTime = 2; 
String jsonString;
Scheduler userScheduler;
painlessMesh mesh;                           
String BOARD_NAME = String(mesh.getNodeId()); 
String UID = "";
String allowedMAC = "ec:64:c9:9e:e2:3a";

String macs[32]{};

class MyAdvertisedDeviceCallbacks : public BLEAdvertisedDeviceCallbacks
{

  void onResult(BLEAdvertisedDevice advertisedDevice)
  {
    // Serial.printf("Advertised Device: %s \n", advertisedDevice.toString().c_str());
    return;
  }
};

void transmitData();
void scan();

Task transmit(TASK_SECOND * 3, TASK_FOREVER, &transmitData);
Task bleScan(TASK_SECOND * 3, TASK_FOREVER, &scan);

static void scanCompleteCB(BLEScanResults foundDevices)
{
  printf("Scan complete!\n We found %d devices\n", foundDevices.getCount());

  StaticJsonDocument<1024> scanResultsJson;
  JsonArray devicesArray = scanResultsJson.to<JsonArray>();

  for (int i = 0; i < foundDevices.getCount(); i++)
  {
    BLEAdvertisedDevice device = foundDevices.getDevice(i);

    if (device.getAddress().toString() == allowedMAC)
    {
      JsonObject deviceJson = devicesArray.createNestedObject();
      deviceJson["mac_address"] = device.getAddress().toString();
      deviceJson["rssi"] = device.getRSSI();
      deviceJson["boardName"] = mesh.getNodeId();
      deviceJson["anchorID"] = UID;

      Serial.printf("Device %d: MAC Address: %s, RSSI: %d\n", i + 1, device.getAddress().toString().c_str(), device.getRSSI());
    }
  }

  serializeJson(scanResultsJson, jsonString);
  devicesArray.clear();

  Serial.print("JsonString: ");
  Serial.println(jsonString);

  foundDevices.dump();
}

static void run()
{
  Serial.print(F("Board "));
  Serial.print(BOARD_NAME);
  Serial.print(F(" is scanning...\n"));

  printf("Async scanning sample starting\n");

  BLEDevice::init("");
  BLEScan *pBLEScan = BLEDevice::getScan();
  pBLEScan->setAdvertisedDeviceCallbacks(new MyAdvertisedDeviceCallbacks(), false);
  pBLEScan->setActiveScan(true);
  pBLEScan->setInterval(200); 
  pBLEScan->setWindow(199);   

  Serial.println("Starting scan for " + String(scanTime) + " seconds");

  pBLEScan->start(scanTime, scanCompleteCB);
  printf("Now scanning in the background ... scanCompleteCB() will be called when done.\n");
}

void scan()
{
  Serial.println("Entered scan Task");
  run();
}

void transmitData()
{
  Serial.println(BOARD_NAME + " is trying to broadcast...");
  String command = "found_ble:";
  mesh.sendBroadcast(command + jsonString);
}

void receivedCallback(uint32_t from, String &msg)
{
  Serial.println("New message received: " + msg);

  char lastChar = msg.charAt(msg.length() - 1);
  String BOARD_ARRIVED_ID = String(lastChar);
  int i = BOARD_ARRIVED_ID.toInt();

  Serial.print("BOARD_ARRIVED_ID int = ");
  Serial.println(i);
  Serial.print("BOARD_ARRIVED_ID string = ");
  Serial.println(BOARD_ARRIVED_ID);

  Serial.println("New message received from BOARD " + BOARD_ARRIVED_ID + " ");
}

// called whenever a new node joins the network
void newConnectionCallback(uint32_t nodeId)
{
  Serial.printf("New node connected, nodeId = %u\n", nodeId);
}

// called when a node connects or disconnects
void changedConnectionCallback()
{
  Serial.printf("Network connection changed\n");
}

// called when the mesh adjusts timing to keep all nodes in sync
void nodeTimeAdjustedCallback(int32_t offset)
{
  Serial.printf("Adjusted time %u. Offset = %d\n", mesh.getNodeTime(), offset);
}

void setup()
{
  Serial.begin(115200);
  
  WiFi.mode(WIFI_STA);
  UID = WiFi.macAddress();

  // choose debug message
  // mesh.setDebugMsgTypes(ERROR | MESH_STATUS | CONNECTION | SYNC | COMMUNICATION | GENERAL | MSG_TYPES | REMOTE); // all types on
  mesh.setDebugMsgTypes(ERROR | STARTUP | CONNECTION | GENERAL);    // set before init() to see mesh startup messages
  mesh.init(MESH_PREFIX, MESH_PASSWORD, &userScheduler, MESH_PORT); // initialize the mesh with defined parameters

  mesh.onReceive(&receivedCallback);
  mesh.onNewConnection(&newConnectionCallback);
  mesh.onChangedConnections(&changedConnectionCallback);
  mesh.onNodeTimeAdjusted(&nodeTimeAdjustedCallback);

  userScheduler.addTask(transmit);
  userScheduler.addTask(bleScan);
  bleScan.enable();
  transmit.enable();
}

void loop()
{
  mesh.update(); 
}