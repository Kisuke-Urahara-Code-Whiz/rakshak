// Pin Definitions
const int SENSOR_POWER_PIN = 7; // Digital pin powering the sensor
const int SENSOR_ANALOG_PIN = A0; // Analog pin reading the signal

// Sampling Settings
const unsigned long SAMPLE_INTERVAL_MS = 330; // Read every 500ms
unsigned long lastSampleTime = 0;

// Multi-Point Calibration Values (Adjust based on your tests)
const int DRY_THRESHOLD = 800; // Raw value when dry in air
const int WET_THRESHOLD = 115; // Raw value in fully saturated target soil

void setup() {
  Serial.begin(9600);
  
  // Configure power pin as output and start disabled
  pinMode(SENSOR_POWER_PIN, OUTPUT);
  digitalWrite(SENSOR_POWER_PIN, LOW);
  
  //Serial.println("Soil Moisture Sensor Initialized with Duty-Cycling.");
}

void loop() {
  unsigned long currentTime = millis();

  // Non-blocking timer for 500ms intervals
  if (currentTime - lastSampleTime >= SAMPLE_INTERVAL_MS) {
    lastSampleTime = currentTime;

    // 1. Take a pulsed reading
    int rawValue = readMoisturePulsed();

    // 2. Map raw ADC value to moisture percentage
    //int moisturePercent = map(rawValue, DRY_THRESHOLD, WET_THRESHOLD, 0, 100);
    //moisturePercent = constrain(moisturePercent, 0, 100);

    // 3. Print results
    //Serial.print("Raw Reading: ");
    Serial.println(rawValue);
    //Serial.print(" | Moisture: ");
    //Serial.print(moisturePercent);
    //Serial.println("%");
  }
}

/**
 * Powers the sensor momentarily, takes an analog reading, 
 * and immediately powers it off to prevent electrolysis.
 */
int readMoisturePulsed() {
  // Step 1: Turn sensor ON
  digitalWrite(SENSOR_POWER_PIN, HIGH);
  
  // Step 2: Brief settling delay for voltage stabilization (10-15ms)
  delay(15);
  
  // Step 3: Take reading (average of 3 rapid samples for stability)
  int sample1 = analogRead(SENSOR_ANALOG_PIN);
  int sample2 = analogRead(SENSOR_ANALOG_PIN);
  int sample3 = analogRead(SENSOR_ANALOG_PIN);
  int rawAnalog = (sample1 + sample2 + sample3) / 3;

  // Step 4: Turn sensor OFF immediately
  digitalWrite(SENSOR_POWER_PIN, LOW);

  return rawAnalog;
}