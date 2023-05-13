var mqttClient=require('./modules/mqttClient.js');
const strVaule = Math.ceil(Math.random() * 40).toString();

/*訂閱測試*/
mqttClient.Sub("/Sensor01/hum");
mqttClient.Sub("/Sensor01/temp");
mqttClient.Sub("/Sensor01/tvoc");
mqttClient.Sub("/Sensor01/co2");
mqttClient.Sub("/Sensor01/co");