var mqttClient= require('./modules/mqttClient.js');
const value_x = Math.ceil(Math.random() * 40);

mqttClient.Pub("/Sensor01/temp",value_x.toString());
mqttClient.Sub("/Sensor01/temp");