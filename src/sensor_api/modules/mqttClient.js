/*相關函式庫*/
const clock = require('./clock.js');
const mqtt = require("mqtt");

/*MQTT Client*/
var ConfigParser = require('configparser');
const configSet = new ConfigParser();
configSet.read('./modules/config/mqttServer.cfg');
configSet.sections();
var ServerSource = configSet.get('server','source');
var port = configSet.get('server','port');
var client = mqtt.connect(`mqtt://${ServerSource}:${port}`);

/*時間*/
var date= clock.SQLDate();
var time= clock.SQLTime();

/*主程式*/
function Sub(topic){
    client.on("connect", function() {
        console.log(clock.consoleTime()+" : Server is Started");
        client.subscribe(topic, { qos: 1 }); //订阅主题为test的消息
    });
    client.on("message", function(top, message) {
        console.log(clock.consoleTime()+" : 当前topic:", top);
        console.log(clock.consoleTime()+" : 当前温度：", message.toString());
    });
}

function Pub(topic,value){
    setInterval(function() {    
        client.publish(topic, value, { qos: 0, retain: true });
    }, 1000);
}

module.exports={
    Pub:Pub,
    Sub:Sub,
}