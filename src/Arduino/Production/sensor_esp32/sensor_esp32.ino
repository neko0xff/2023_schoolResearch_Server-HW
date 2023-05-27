#include <WiFi.h>
#include <HTTPClient.h>
#include <SimpleDHT.h> 
#include <SparkFun_SGP30_Arduino_Library.h>
#include <MQUnifiedsensor.h>

/*Sensor腳位定義*/
#define pinDHT11 2  //連結腳位: D4

/*MQ7函式定義*/
#define board "ESP32"
#define Voltage_Resolution 5
#define pinMQ7 A0 //Analog input 0 of your arduino
#define ADC_Bit_Resolution 10 
#define type "MQ-7" //MQ7
MQUnifiedsensor MQ7(board,Voltage_Resolution, ADC_Bit_Resolution, pinMQ7,type);
float calcR0 = 0;

/*SGP30函式定義*/
SGP30 SenSGP30; //連結腳位: SDA&SCL
//SDA=A4
//SCL=A5

/*DHT函式定義*/
SimpleDHT11 dht11;
byte tempVar = 0;
byte humVar = 0;

/*計時部分*/
unsigned long lastTime=0;
unsigned long timeDelay=5000; //5sec=5000ms

/*伺服器路徑*/
String serverIP = "http://[server_ip]:3095";
String serverName = serverIP+"/upload/Sensor01";

/*SGP30連結*/
void cnSGP30(){
  if (SenSGP30.begin() == false) {
    Serial.println("No SGP30 Detected. Check connections.");
    while (1);
  }
  SenSGP30.initAirQuality();
}

/*MQ-7連結*/
void MQ7err(){
  if(isinf(calcR0)){
    Serial.println("Warning: Conection issue founded, R0 is infite (Open circuit detected) please check your wiring and supply"); 
    while(1);
  }
  if(calcR0 == 0){
    Serial.println("Warning: Conection issue founded, R0 is zero (Analog pin with short circuit to ground) please check your wiring and supply"); 
    while(1);
  }
}

void cnMQ7(){
  MQ7.setRegressionMethod(1); //_PPM =  a*ratio^b
  // Configurate the ecuation values to get CO concentration
  MQ7.setA(99.042); 
  MQ7.setB(-1.518); 
  MQ7.init(); 
  Serial.print("Calibrating please wait.");
  
  for(int i = 1; i<=10; i ++){
    MQ7.update(); // Update data, the arduino will be read the voltage on the analog pin
    calcR0 += MQ7.calibrate(27.5);
    Serial.print(".");
  }

  MQ7.setR0(calcR0/10);
  Serial.println("  done!.");
  MQ7err();
  MQ7.serialDebug(true);
}

float MQ7Var(){
  MQ7.update();
  float COppm =MQ7.readSensor(); 
  return COppm;
}

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
void DataSend(){
  WiFiClient client;
  HTTPClient http;

  String humUD = "hum="+String(humVar);
  String tempUD = "temp="+String(tempVar);
  String coUD = "co="+String(MQ7Var());
  String co2UD = "co2="+String(SenSGP30.CO2);
  String tvocUD = "tvoc="+String(SenSGP30.TVOC);
  String pm25UD = "pm25="+String("10");      
  String updateData = "?"+humUD+"&"+tempUD+"&"+coUD+"&"+co2UD+"&"+tvocUD+"&"+pm25UD;  
  String cnServer = serverName+updateData;
  
  http.begin(client, cnServer);
  http.addHeader("Content-Type", "application/x-www-form-urlencoded");
  Serial.print("Server= ");
  Serial.println(cnServer);
  
  /*HTTP Status*/   
  int httpResponseCode = http.POST("");
  if (httpResponseCode>0) {
    Serial.print("HTTP Response code: ");
    Serial.println(httpResponseCode);
    String payload = http.getString();
    Serial.println(payload);
  }else {
    Serial.print("Error code: ");
    Serial.println(httpResponseCode);
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
         DataSend();  
       }else{
          Serial.println("WiFi Disconnected");
       }
       lastTime=millis();
  }
}
