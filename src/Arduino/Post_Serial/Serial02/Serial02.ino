#include <SimpleDHT.h> 
#define MQ2pin 0  
#define deviceName "Serial02"
#define tx  1
#define rx  0

float sensorValue;
byte temperature = 0;
byte humidity = 0;
int pinDHT11 = 13;
SimpleDHT11 dht11;
 
void setup(){
  Serial.begin(9600); // sets the serial port to 9600
  pinMode(rx,INPUT_PULLUP);
  pinMode(tx,INPUT_PULLUP);
  //Serial.println("MQ2 warming up!");
  delay(20000); // allow the MQ2 to warm up
}

void loop() {
  sensorValue = analogRead(MQ2pin); // read analog input pin 0
  int err = SimpleDHTErrSuccess;

  /*輸出至序列埠*/
  Serial.print("device=");
  Serial.print(deviceName);
  Serial.print(",hum=");   
  Serial.print((int)humidity);     
  Serial.print(",temp=");   
  Serial.print((int)temperature);
  Serial.print(",o3=");
  Serial.print(sensorValue);
  Serial.print(",tvoc=");
  Serial.print("0");
  Serial.print(",co2=");
  Serial.print("0");
  Serial.println("");   
  delay(3000);  
}
