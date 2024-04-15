/*
* board: Arduino Nano(AT Mega 328p)
* 4pin接法: 
* 1. pwm部分: 接風扇的pin4
* 2. 風扇的正極: 請接5V以上的供電源
*/

#include <Arduino.h>
#define deviceName "Switch01" 

/*腳位設置*/
int fan_pin = 9;          // 風扇: D9
int switch_pin = A0;      // 開關: A0

/*計算風扇速度的pwm輸出*/
int fan_speed(int pot){
  int  cal = pot * (255 / 1023.0); // 計算輸出部分: 介於 0-255
  return cal;
}

/*在序列監控視窗中輸出的值*/
void serialOutput_devicename(){
  Serial.print("device=");
  Serial.print(deviceName);
  Serial.print(",");
}
void serialOuput_task01(int num){
  //開關值
  Serial.print("Switch=");
  Serial.print(num);
  Serial.print(",");  
  delay(1000); // delay 1 sec
}
void serialOuput_task02(int num){
  //風扇速度
  Serial.print("Speed=");
  Serial.print(num);
  delay(1000); // delay 1 sec
}

/*主程式*/
void setup() {
 Serial.begin(9600);                   // 初始化傳輸速率: 9600 bps
 pinMode(fan_pin, OUTPUT);             // 指定fan腳位: 輸出
 pinMode(switch_pin,INPUT);            // 指定開關腳位: 輸入
}

void loop() {
 int pot = analogRead(switch_pin);     // 讀取類比訊號
 int speed_cal = fan_speed(pot);
 
 /*輸出*/
 serialOutput_devicename();
 analogWrite(fan_pin,speed_cal);           // pwm訊號
 serialOuput_task01(pot); 
 serialOuput_task02(speed_cal);
 Serial.println("");  
}