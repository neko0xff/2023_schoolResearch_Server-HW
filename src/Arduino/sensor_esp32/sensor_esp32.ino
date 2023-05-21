#include <WiFi.h>
#include <HTTPClient.h>

/*計時部分*/
unsigned long lastTime=0;
unsigned long timeDelay=5000; //5sec=5000ms

/*伺服器連線部分*/
String ServerSource="http://[server_ip]:3000/upload";
String deviceID="/device01";
String URLPath="/data";
String cnServer= ServerSource + deviceID + URLPath;

/*WiFi 連網部分*/
const char* ssid="";
const char* password="";
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
void DataSend(String req,String upload){
   HTTPClient http;
   int Code;
   if(req="post"){
       Code=http.POST("Post form ESP32");
   }else if(req="get"){
       Code=http.GET();
   }
   
   http.begin(upload.c_str());
   String payload;

   if(Code>0){
       Serial.print("HTTP Code: ");
       Serial.print(Code);
       payload=http.getString();
       Serial.println(payload);
   }else{
       Serial.print("Http Code: ");
       Serial.println(Code);
   }
   http.end();
}
/*主程式*/
void setup() {
  // put your setup code here, to run once:
  Serial.begin(115200);
  cnWiFi();
}

void loop() {
  // put your main code here, to run repeatedly:
  if((millis()-lastTime)>timeDelay){
       if(WiFi.status() == WL_CONNECTED){
          String humUD = "?hum="+String("0");
          String tempUD = "&temp="+String("0");
          String tvocUD = "&tvoc="+String("0");
          String co2UD = "&co2="+String("0");
          String uploadData = cnServer+humUD+tempUD+tvocUD+co2UD;
          String Mode="post";
          DataSend(Mode,uploadData);    
       }else{
          Serial.println("WiFi Disconnected");
       }
       lastTime=millis();
  }
}
