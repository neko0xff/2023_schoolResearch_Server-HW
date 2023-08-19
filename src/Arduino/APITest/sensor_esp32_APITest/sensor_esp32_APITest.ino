#include <WiFi.h>
#include <HTTPClient.h>

/*計時部分*/
unsigned long lastTime=0;
unsigned long timeDelay=5000; //5sec=5000ms

/*伺服器路徑*/
String serverSource = "http://[Server_IP]:3095";
String serverName = serverSource + "/upload/Sensor01/data";

/*WiFi 連網部分*/
const char* ssid="";
const char* password="";

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

/*連結WiFi*/
void cnWiFi(){
    WiFi.begin(ssid,password);
    Serial.println("Now Connecting");
    while(WiFi.status() != WL_CONNECTED){
        delay(500);
        Serial.print(".");
    }
    Serial.println("");
    Serial.print("IP Address: ");
    Serial.println(WiFi.localIP());
}

/*http code*/
void DataSend(){
  WiFiClient client;
  HTTPClient http;

  /*數值上傳*/
  String humUD = "hum="+String(30);
  String tempUD = "temp="+String(44.5);
  String coUD = "co="+String(77.2);
  String co2UD = "co2="+String(55);
  String tvocUD = "tvoc="+String(40.11);
  String pm25UD = "pm25="+String(10);
  String o3UD = "o3="+String(50);
  String query = humUD+"&"+tempUD+"&"+coUD+"&"+co2UD+"&"+tvocUD+"&"+pm25UD+"&"+o3UD;  
  String cnServer = serverName;
  
  http.begin(client, cnServer);
  http.addHeader("Content-Type", "application/x-www-form-urlencoded");
  Serial.print("Server= ");
  Serial.println(cnServer);
  
  /*HTTP Status*/   
  int httpResponseCode = http.POST(query);
  if (httpResponseCode>0) {
    cnOnBoardLED();
    Serial.print("HTTP Response code: ");
    Serial.println(httpResponseCode);
    String payload = http.getString();
    Serial.println(payload);
  }else {
    cnOffBoardLED();
    Serial.print("Error code: ");
    Serial.println(httpResponseCode);
  }
   
  http.end();
}

/*主程式*/
void setup() {
  // put your setup code here, to run once:
  Serial.begin(9600);
  cnWiFi();
}

void loop() {
  // put your main code here, to run repeatedly:
  if((millis()-lastTime)>timeDelay){
       if(WiFi.status() == WL_CONNECTED){
          DataSend();  
       }else{
          Serial.println("WiFi Disconnected");
       }
       lastTime=millis();
  }
}
