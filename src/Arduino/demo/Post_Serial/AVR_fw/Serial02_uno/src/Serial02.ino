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
Adafruit_SGP30 sgp; //UNO I2C: SDA=A4, SCL=A5
int o3 = 0;
byte temperature = 0;
byte humidity = 0;

/*程式初始化部分*/
void setup(){
  Serial.begin(9600); // baud: 9600bps
  /*啟用SGP30*/
  sgp.begin();
  
  if (!sgp.begin()){
    Serial.println("SGP30 initialization failed");
    while (1);
  }

  //pinMode(rx,INPUT_PULLUP);
  //pinMode(tx,INPUT_PULLUP);
}

void loop() {
  o3=analogRead(MQ2pin);
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
  Serial.print(int(humidity));     
  Serial.print(",temp=");   
  Serial.print(int(temperature));
  Serial.print(",o3=");
  Serial.print(o3);
  sgp.IAQmeasure();
  Serial.print(",tvoc=");
  Serial.print(sgp.TVOC);
  Serial.print(",co2=");
  Serial.print(sgp.eCO2);
  sgp.IAQmeasureRaw();
  Serial.println("");   
  delay(3000);  

}
