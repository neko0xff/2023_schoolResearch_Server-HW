#include <SimpleDHT.h> 
#define MQ2pin 0  
#define deviceName Serial02

float sensorValue;
byte temperature = 0;
byte humidity = 0;
int pinDHT11 = 13;
SimpleDHT11 dht11;
 
void setup(){
  Serial.begin(9600); // sets the serial port to 9600
  //Serial.println("MQ2 warming up!");
  delay(20000); // allow the MQ2 to warm up
}

void loop() {{
  sensorValue = analogRead(MQ2pin); // read analog input pin 0
  int err = SimpleDHTErrSuccess;
  
  if ((err = dht11.read(pinDHT11, &temperature, &humidity, NULL)) != SimpleDHTErrSuccess) {
    Serial.print("hum=0,temp=0,");
    Serial.print("o3=");
    Serial.print(sensorValue);
  }else{
    Serial.print("hum= ");   
    Serial.print((int)humidity);   
    Serial.print(",");   
    Serial.print("temp=");   
    Serial.print((int)temperature);
    Serial.print("03=");
    Serial.print(sensorValue);
  } 
  Serial.println("");   
  delay(3000);  
}
