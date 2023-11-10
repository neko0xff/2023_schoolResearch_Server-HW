/*相關函式庫&定義*/
#include <GP2Y1010AU0F.h>
#include <MQUnifiedsensor.h>
#define deviceName "Serial01"
#define PIN_LED 5
#define PIN_OUTPUT A0
#define tx  1
#define rx  0

MQUnifiedsensor MQ7("Arduino UNO", 5, 10, 7, "MQ-7");
GP2Y1010AU0F GP2Y1010AU0F(PIN_LED, PIN_OUTPUT);

/*主程式*/
void setup(){
  Serial.begin(9600);
  pinMode(rx,INPUT_PULLUP);
  pinMode(tx,INPUT_PULLUP);
  MQ7.setRegressionMethod(1); //_PPM =  a*ratio^b
  MQ7.setA(99.042); 
  MQ7.setB(-1.518); // Configurate the ecuation values to get CO concentration
  MQ7.init(); 

  //Serial.print("Calibrating please wait.");
  float calcR0 = 0;
  for(int i = 1; i<=10; i ++){
    MQ7.update(); // Update data, the arduino will be read the voltage on the analog pin
    calcR0 += MQ7.calibrate(27.5);
    //Serial.print(".");
  }

  MQ7.setR0(calcR0/10);
  //Serial.println("  done!.");
  if(isinf(calcR0)) {
    Serial.println("Warning: Conection issue founded, R0 is infite (Open circuit detected) please check your wiring and supply"); 
    while(1);
  }
  if(calcR0 == 0){
    Serial.println("Warning: Conection issue founded, R0 is zero (Analog pin with short circuit to ground) please check your wiring and supply"); 
    while(1);
  }
  //MQ7.serialDebug(false);
  
}

void loop() {
  double outputV = GP2Y1010AU0F.getOutputV(); //採樣獲取輸出電壓
  double ugm3 = GP2Y1010AU0F.getDustDensity(outputV); //計算灰塵濃度
  double aqi = GP2Y1010AU0F.getAQI(ugm3); //計算aqi
  float COppm =MQ7.readSensor(); 
  int gradeInfo = GP2Y1010AU0F.getGradeInfo(aqi); //計算級別
  
  /*輸出至序列埠*/
  //Serial.println(String("outputV=") + outputV + "\tug/m3=" + ugm3 + "\tAQI=" + aqi );
  delay(1000);
  MQ7.update();   
  Serial.println(String("device=")+deviceName+String(",pm25=")+ugm3+String(",co=")+COppm);
  delay(500); //Sampling frequency
}
