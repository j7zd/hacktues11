#include <M5Core2.h>

// Thresholds
const float FALL_THRESHOLD_LOW = 0.4;      // Lower threshold for free fall (0.4g)
const float FALL_THRESHOLD_HIGH = 3.0;     // Upper threshold for impact (3.0g)
const float ANGLE_CHANGE_THRESHOLD = 30.0; // Significant orientation change (degrees)

// Global variables for fall detection
boolean trigger1 = false; // First trigger (lower threshold)
boolean trigger2 = false; // Second trigger (upper threshold)
boolean trigger3 = false; // Third trigger (orientation change)
byte trigger1count = 0;   // Counts since trigger 1 was set true
byte trigger2count = 0;   // Counts since trigger 2 was set true
byte trigger3count = 0;   // Counts since trigger 3 was set true
float angleChange = 0;    // Stores the magnitude of orientation change

void initGyroAccel(){
    M5.begin();           // Initialize M5Core2
    M5.IMU.Init();        // Initialize MPU6886
    
}


bool hasFallen()
{
    float ax, ay, az, gx, gy, gz;
    M5.IMU.getAccelData(&ax, &ay, &az); // Read accelerometer data
    M5.IMU.getGyroData(&gx, &gy, &gz);  // Read gyroscope data

    // Calculate acceleration magnitude (AM)
    float AM = sqrt(ax * ax + ay * ay + az * az);

    // Debugging: Print acceleration magnitude
    Serial.println(AM);

    // Trigger 1: Detect free fall (AM < lower threshold)
    if (AM <= FALL_THRESHOLD_LOW && !trigger2)
    {
        trigger1 = true;
        trigger1count++;
        Serial.println("TRIGGER 1 ACTIVATED");
    }

    // Trigger 2: Detect impact (AM > upper threshold)
    if (trigger1 && AM >= FALL_THRESHOLD_HIGH)
    {
        trigger2 = true;
        trigger1 = false;
        trigger1count = 0;
        Serial.println("TRIGGER 2 ACTIVATED");
    }

    // Trigger 3: Detect orientation change
    if (trigger2)
    {
        trigger2count++;
        angleChange = sqrt(gx * gx + gy * gy + gz * gz); // Calculate orientation change
        Serial.println(angleChange);

        if (angleChange >= ANGLE_CHANGE_THRESHOLD && angleChange <= 400)
        {
            trigger3 = true;
            trigger2 = false;
            trigger2count = 0;
            Serial.println("TRIGGER 3 ACTIVATED");
        }
    }

    // Confirm fall if orientation remains stable after change
    if (trigger3)
    {
        trigger3count++;
        if (trigger3count >= 10)
        { // Wait for 10 iterations to confirm
            if (angleChange >= 0 && angleChange <= 10)
            { // Small orientation change
                trigger3 = false;
                trigger3count = 0;
                Serial.println("FALL DETECTED");
                return true; // Fall detected
            }
            else
            {
                trigger3 = false;
                trigger3count = 0;
                Serial.println("TRIGGER 3 DEACTIVATED");
            }
        }
    }

    // Reset triggers if conditions are not met
    if (trigger1count >= 6)
    { // Reset trigger 1 after 6 iterations
        trigger1 = false;
        trigger1count = 0;
        Serial.println("TRIGGER 1 DEACTIVATED");
    }
    if (trigger2count >= 6)
    { // Reset trigger 2 after 6 iterations
        trigger2 = false;
        trigger2count = 0;
        Serial.println("TRIGGER 2 DEACTIVATED");
    }

    return false; // No fall detected
}