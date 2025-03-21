#include "painlessMesh.h"

#include <BLEDevice.h>
#include <BLEUtils.h>
#include <BLEScan.h>
#include <BLEAdvertisedDevice.h>
#include <string>

#define MESH_PREFIX "MyMeshNetwork"
#define MESH_PASSWORD "password123"
#define MESH_PORT 5555

int scanTime = 2; // BLE Scan duration (seconds). Must not exceed the first parameter of Task bleScan, or it will cause conflict.
String jsonString;
Scheduler userScheduler;
painlessMesh mesh;                            // mesh network object
String BOARD_NAME = String(mesh.getNodeId()); // name/number of the board
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
  pBLEScan->setInterval(200); // time between two scans, in ms
  pBLEScan->setWindow(199);   // scanning window, must be <= interval

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

// Callbacks necessary to keep the mesh network up to date
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

// This function is called whenever a new node joins the network
void newConnectionCallback(uint32_t nodeId)
{
  Serial.printf("New node connected, nodeId = %u\n", nodeId);
}

// This function is called when a node connects or disconnects
void changedConnectionCallback()
{
  Serial.printf("Network connection changed\n");
}

// This function is called when the mesh adjusts timing to keep all nodes in sync
void nodeTimeAdjustedCallback(int32_t offset)
{
  Serial.printf("Adjusted time %u. Offset = %d\n", mesh.getNodeTime(), offset);
}

void setup()
{
  Serial.begin(115200);

  // Choose the Debug message type that suits you
  // mesh.setDebugMsgTypes(ERROR | MESH_STATUS | CONNECTION | SYNC | COMMUNICATION | GENERAL | MSG_TYPES | REMOTE); // all types on
  mesh.setDebugMsgTypes(ERROR | STARTUP | CONNECTION | GENERAL);    // set before init() to see mesh startup messages
  mesh.init(MESH_PREFIX, MESH_PASSWORD, &userScheduler, MESH_PORT); // initialize the mesh with defined parameters

  // Assign the corresponding function to each event
  mesh.onReceive(&receivedCallback);
  mesh.onNewConnection(&newConnectionCallback);
  mesh.onChangedConnections(&changedConnectionCallback);
  mesh.onNodeTimeAdjusted(&nodeTimeAdjustedCallback);

  // Add tasks to scheduler
  userScheduler.addTask(transmit);
  userScheduler.addTask(bleScan);
  bleScan.enable();
  transmit.enable();
}

void loop()
{
  mesh.update(); // keeps the mesh and scheduler running
}