/*相關函式庫&定義*/
#include <GP2Y1010AU0F.h>
#include <MQUnifiedsensor.h>

#define Board "Arduino UNO"
#define deviceName "Serial01"
#define PIN_LED 5       //GP2Y1010AU0F
#define PIN_OUTPUT A0   //GP2Y1010AU0F Pin: A0       
#define MQtype "MQ-7"
#define Pin_MQ7 7       //MQ7 Pin: D7
#define Voltage_Resolution   5   // MQ7 Voltage=5V
#define ADC_Bit_Resolution   10  // MQ7 For arduino UNO/MEGA/NANO
#define tx  1           //Pin: D1
#define rx  0           //Pin: D0

/*相關變數*/
MQUnifiedsensor MQ7(Board, Voltage_Resolution, ADC_Bit_Resolution, Pin_MQ7, MQtype);
GP2Y1010AU0F GP2Y1010AU0F(PIN_LED, PIN_OUTPUT);
float calcR0 = 0;

/*程式初始化部分*/
void setup(){
  Serial.begin(9600); //baud: 9600bps
  //pinMode(rx,INPUT_PULLUP);
  //pinMode(tx,INPUT_PULLUP);
  
  /*啟動MQ7*/ 
  MQ7.setRegressionMethod(1); //_PPM =  a*ratio^b
  MQ7.setA(99.042); 
  MQ7.setB(-1.518); // Configurate the ecuation values to get CO concentration
  MQ7.init(); 

  for(int i = 1; i<=10; i ++){
    MQ7.update(); 
    calcR0 += MQ7.calibrate(27.5);
  }

  MQ7.setR0(calcR0/10);
  if(isinf(calcR0)) {
    Serial.println("Warning: Conection issue founded, R0 is infite (Open circuit detected) please check your wiring and supply"); 
    while(1);
  }
  if(calcR0 == 0){
    Serial.println("Warning: Conection issue founded, R0 is zero (Analog pin with short circuit to ground) please check your wiring and supply"); 
    while(1);
  }
  
}

/*主程式*/
void loop() {
  // GP2Y1010AU0F
  double outputV = GP2Y1010AU0F.getOutputV(); //採樣獲取輸出電壓
  double ugm3 = GP2Y1010AU0F.getDustDensity(outputV); //計算灰塵濃度
  double aqi = GP2Y1010AU0F.getAQI(ugm3); //計算aqi
  // MQ7
  float COppm =MQ7.readSensor(); 
  MQ7.update();

  /*輸出至序列埠*/
  Serial.print("device=");
  Serial.print(deviceName);
  Serial.print(",pm25=");
  Serial.print(ugm3);
  Serial.print(",co=");
  Serial.print(COppm);
  Serial.print(",AQI=");
  Serial.print(aqi);
  Serial.print(",voltage=");
  Serial.print(outputV);   
  Serial.println();
  delay(3000); 
}
