/*相關函式庫和定義*/
#include <SimpleDHT.h> 
#include <Wire.h>
#include "Adafruit_SGP30.h"
#define deviceName "Serial02"
#define tx  1         // Pin: D1
#define rx  0         // Pin: D0
#define MQ2pin 0      // MQ2   Pin: A0
#define pinDHT11 13   // DHT11 Pin: D13

/*相關變數*/
SimpleDHT11 dht11;
Adafruit_SGP30 sgp;
float o3 = analogRead(MQ2pin);
byte temperature = 0;
byte humidity = 0;

/*程式初始化部分*/
void setup(){
  Serial.begin(9600); // baud: 9600bps
  /*啟用SGP30*/
  if (! sgp.begin()){
    Serial.println("Sensor not found :(");
    while (1);
  }
  pinMode(rx,INPUT_PULLUP);
  pinMode(tx,INPUT_PULLUP);
}

void loop() {
  int err = SimpleDHTErrSuccess;
  
  /*偵測DHT11*/
  if ((err = dht11.read(pinDHT11, &temperature, &humidity, NULL)) != SimpleDHTErrSuccess) {
       Serial.print("Read DHT11 failed, err="); Serial.println(err);delay(1000);
       return;
  }

  /*輸出相關數值至序列埠*/
  Serial.print("device=");
  Serial.print(deviceName);
  Serial.print(",hum=");   
  Serial.print(float(humidity));     
  Serial.print(",temp=");   
  Serial.print(float(temperature));
  Serial.print(",o3=");
  Serial.print(o3);
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
