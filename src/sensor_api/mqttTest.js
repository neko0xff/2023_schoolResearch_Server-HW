var mqttClient=require('./modules/mqttClient.js');
const strVaule = Math.ceil(Math.random() * 40).toString();

mqttClient.Pub("/Sensor01/temp",strVaule,1000);
mqttClient.Sub("/Sensor01/temp");