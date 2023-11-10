/*相關函式庫*/
#define LED_BUILTIN 2
#include <ESP8266WiFi.h>
#include <PubSubClient.h>

/*WiFi連網部分*/
const char *ssid = ""; // Enter your Wi-Fi name
const char *password = "";  // Enter Wi-Fi password

/*MQTT Server 連線*/
const char *mqtt_broker = "";
const int mqtt_port = 3094;
const char *topic = "/Sensor01/test";
const char *mqtt_username = "master";
const char *mqtt_password = "oitmis";

WiFiClient wifiClient;
PubSubClient mqttClient(wifiClient);

/*輸出訂閱內容*/
void callback(char *topic, byte *payload, unsigned int length) {
    Serial.print("Message arrived in topic: ");
    Serial.println(topic);
    Serial.print("Message:");
    for (int i = 0; i < length; i++) {
        Serial.print((char) payload[i]);
    }
    Serial.println();
    Serial.println("-----------------------");
}

/*連結部分*/
/*WiFi*/
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
/*MQTT*/
void cnMQTT(){
  mqttClient.setServer(mqtt_broker, mqtt_port);
  mqttClient.setCallback(callback);
  while (!mqttClient.connected()) {
    String client_id = "esp8266-client-";
    client_id += String(WiFi.macAddress());
    Serial.printf("The client %s connects to the local MQTT broker\n", client_id.c_str());
    if (mqttClient.connect(client_id.c_str(), mqtt_username, mqtt_password)) {
      Serial.println("local broker connected");
    } else {
      Serial.print("failed with state ");
      Serial.print(mqttClient.state());
      delay(2000);
    }
  }
}
 
/*MQTT傳送測試*/
void MQTT_test(){
  const char *str_topic = "Hi, I'm ESP8266 ^^";
  mqttClient.publish(topic,str_topic); // 推送
  mqttClient.subscribe(topic); //訂閱
}

/*主程式*/
void setup() {
  // put your setup code here, to run once:
  Serial.begin(115200);
  pinMode(LED_BUILTIN,OUTPUT);
  digitalWrite(LED_BUILTIN,HIGH);
  cnWiFi();
  cnMQTT();
  MQTT_test();
}

void loop() {
  // put your main code here, to run repeatedly:
  mqttClient.loop(); 
}
