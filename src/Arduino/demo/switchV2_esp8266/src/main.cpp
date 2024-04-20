/*
*   File: main.cpp
*   Date: 20240417
*   Author: neko0xff
*/

#include <Arduino.h>
#include <ArduinoJson.h>
#include <ESP8266WiFi.h>
#include <ESP8266HTTPClient.h>
#include <ESP8266WebServer.h>
#include <WiFiClient.h>
#include <WiFiManager.h>         // https://github.com/tzapu/WiFiManager

/*連線部分*/
#include "espCN.h"
espCN espcn;
const char* deviceName_char = espcn.deviceName.c_str();
WiFiServer server(80); // AP URL: http://192.168.4.1:80
WiFiManager wifiManager;

/*timer*/
unsigned long lastTime = 0;
unsigned long timerDelay = 10000;

/*Fan Speed*/
int fan_on = 255;
int fan_off = 0;

/*腳位設置*/
int fan1_pin = D4;   // 風扇1: D4
int fan2_pin = D5;   // 風扇2: D5

/* WIFI AP 設定頁面 */
void WebProtalSetup(){
  // Uncomment and run it once, if you want to erase all the stored information
  //wifiManager.resetSettings();
  
  // set custom ip for portal
  //wifiManager.setAPConfig(IPAddress(10,0,1,1), IPAddress(10,0,1,1), IPAddress(255,255,255,0));

  // fetches ssid and pass from eeprom and tries to connect
  // if it does not connect it starts an access point with the specified name
  // here  "AutoConnectAP"
  // and goes into a blocking loop awaiting configuration
  wifiManager.autoConnect(deviceName_char);
  // or use this for auto generated name ESP + ChipID
  //wifiManager.autoConnect();
  // if you get here you have connected to the WiFi
  Serial.println("Connected.");
}


/*使板戴LED反覆亮*/
void cnOnBoardLED(){
  digitalWrite(LED_BUILTIN,LOW); //亮
  delay(500);
  digitalWrite(LED_BUILTIN,HIGH); //暗
  delay(500);
}

/*使板戴LED持續亮*/
void cnOffBoardLED(){
  digitalWrite(LED_BUILTIN,LOW); //亮
}

/*WiFi連結過程檢視*/
void cnWiFi(){
   //WiFi.begin(espcn.ssid, espcn.password);
   Serial.println("Connecting");
   while(WiFi.status() != WL_CONNECTED) {
     delay(500);
     Serial.print(".");
   }
   Serial.println("");
   Serial.print("Connected to WiFi network with IP Address: ");
   Serial.println(WiFi.localIP());
}

/*在序列監控視窗中輸出的值*/
void serialOutput_devicename(){
  Serial.print("device=");
  Serial.print(espcn.deviceName);
  Serial.print(",");
}

/*HTTP Get update*/
void httpGet(){
   //Check WiFi connection status
   if(WiFi.status() == WL_CONNECTED){
      WiFiClient client;
      HTTPClient http;
      
      // Data to send with HTTP POST
      String cnServer = espcn.serverName;         
      Serial.println("Server=" + cnServer);
      // Your Domain name with URL path or IP address with path
      http.begin(client, cnServer);
  
      // Specify content-type header
      http.addHeader("Content-Type", "application/x-www-form-urlencoded");
       
      int httpResponseCode = http.GET();
      if (httpResponseCode > 0) {
        cnOnBoardLED();
        Serial.print("HTTPResponsecode=");
        Serial.println(httpResponseCode);
        String payload = http.getString();
        Serial.print("Data=");
        Serial.println(payload);

        // Parse JSON
        StaticJsonDocument<1024> doc;
        deserializeJson(doc, payload);
        
        // Extract fan status
        JsonArray fans = doc.as<JsonArray>();
        for(JsonObject fan : fans) {
          String name = fan["name"];
          int status = fan["status"];
          String outmsg = "device=" + espcn.deviceName + ",name=" + name + ",status=" + status ;
          Serial.println(outmsg);

          // Adjust fan speed based on status
          if (name == "fan1") {
            analogWrite(fan1_pin, status ? fan_on : fan_off);
          } else if (name == "fan2") {
            analogWrite(fan2_pin, status ? fan_on : fan_off);
          }
          
        }
      } else {
        cnOffBoardLED();
        Serial.print("Errorcode=");
        Serial.println(httpResponseCode);
      }

      http.end();
  }
}

/* Function to handle timer and send HTTP request periodically */
void timer_update() {
  if (millis() - lastTime >= timerDelay) {
    httpGet();
    lastTime = millis();
  }
}

/*主程式*/
void setup() {
  Serial.begin(9600);            // 初始化傳輸速率: 9600 bps
  server.begin();                // 啟用Web Server
  pinMode(fan1_pin, OUTPUT);     // 指定風扇1腳位: 輸出
  pinMode(fan2_pin, OUTPUT);     // 指定風扇2腳位: 輸出
  WebProtalSetup();
}

void loop() {
  timer_update();
}
