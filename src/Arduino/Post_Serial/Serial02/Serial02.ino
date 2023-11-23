#include <SimpleDHT.h> 
#include <Wire.h>
#include "Adafruit_SGP30.h"
#define MQ2pin 0  
#define deviceName "Serial02"
#define tx  1
#define rx  0

float sensorValue;
byte temperature = 0;
byte humidity = 0;
int pinDHT11 = 13;
int counter = 0;
SimpleDHT11 dht11;
Adafruit_SGP30 sgp;

uint32_t getAbsoluteHumidity(float temperature, float humidity) {
    // approximation formula from Sensirion SGP30 Driver Integration chapter 3.15
    const float absoluteHumidity = 216.7f * ((humidity / 100.0f) * 6.112f * exp((17.62f * temperature) / (243.12f + temperature)) / (273.15f + temperature)); // [g/m^3]
    const uint32_t absoluteHumidityScaled = static_cast<uint32_t>(1000.0f * absoluteHumidity); // [mg/m^3]
    return absoluteHumidityScaled;
}
 
void setup(){
  Serial.begin(9600); // sets the serial port to 9600
  if (! sgp.begin()){
    Serial.println("Sensor not found :(");
    while (1);
  }
  pinMode(rx,INPUT_PULLUP);
  pinMode(tx,INPUT_PULLUP);
  //Serial.println("MQ2 warming up!");
  //delay(20000); // allow the MQ2 to warm up
}

void loop() {
  sensorValue = analogRead(MQ2pin); // read analog input pin 0
  byte temperature = 0;
  byte humidity = 0;
  int err = SimpleDHTErrSuccess;
  
  if ((err = dht11.read(pinDHT11, &temperature, &humidity, NULL)) != SimpleDHTErrSuccess) {
       Serial.print("Read DHT11 failed, err="); Serial.println(err);delay(1000);
       return;
  }

  /*輸出至序列埠*/
  Serial.print("device=");
  Serial.print(deviceName);
  Serial.print(",hum=");   
  Serial.print((int)humidity);     
  Serial.print(",temp=");   
  Serial.print((int)temperature);
  Serial.print(",o3=");
  Serial.print(sensorValue);
  if (! sgp.IAQmeasure()) {
    Serial.println("Measurement failed");
    return;
  }
  Serial.print(",tvoc=");
  Serial.print(sgp.TVOC);
  Serial.print(",co2=");
  Serial.print(sgp.eCO2);
  if (! sgp.IAQmeasureRaw()) {
    Serial.println("Raw Measurement failed");
    return;
  }
  Serial.println("");   
  delay(3000);  
}
