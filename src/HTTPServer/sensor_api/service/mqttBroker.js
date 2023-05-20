/*MQTT Broker lib*/
const aedes = require('aedes')();
const server = require('net').createServer(aedes.handle);
var ConfigParser = require('configparser');
const configSet = new ConfigParser();
configSet.read('./modules/config/serviceSet.cfg');
configSet.sections();
var mqttClient = require('../modules/mqttClient.js');
var port = configSet.get('MQTT','port');

/*時間*/
var clock=require('../modules/clock.js');

/*主程式*/
server.listen(port, function () {
    console.log(clock.consoleTime()+' : MQTT Server Started!');
    console.log(clock.consoleTime()+' : MQTT Server URL: http://[Server_IP]:'+port);
});

