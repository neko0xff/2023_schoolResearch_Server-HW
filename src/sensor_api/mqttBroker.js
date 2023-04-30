/*MQTT Broker lib*/
const aedes = require('aedes');
const server = require('net').createServer(aedes.handle);
const port=3094;

/*時間*/
var clock=require('./modules/clock.js');
var date= clock.SQLDate();
var time= clock.SQLTime();

/*主程式*/
server.listen(port, function () {
    console.log(clock.consoleTime()+' : MQTT Server Started!');
    console.log(clock.consoleTime()+' : MQTT Server URL: http://[Server_IP]:'+port);
});