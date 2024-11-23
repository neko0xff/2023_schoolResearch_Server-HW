/*相關函式庫*/
const mqtt = require("mqtt");
const clock = require("../clock.js");

/*MQTT Client*/
var ConfigParser = require("configparser");
const configSet = new ConfigParser();
configSet.read("./modules/config/cnSet.cfg");
configSet.sections();
var ServerSource = configSet.get("MQTT","source");
var port = configSet.get("MQTT","port");
var client = mqtt.connect(`mqtt://${ServerSource}:${port}`);

/* 訂閱主題 */
function Sub(topic){ 
    client.on("connect", function() {
        console.log(`[${clock.consoleTime()}] Server is Started`);
        client.subscribe(topic, { qos: 1 }); 
    });
    client.on("message", function(top, message) {
        console.log(`[${clock.consoleTime()}] Now topic= ${top}`);
        console.log(`[${clock.consoleTime()}] Now Sub Data= ${message.toString()}`);
    });
}

/* 發佈主題 */
function Pub(topic,value,timer){
    setInterval(function() {    
        client.publish(topic, value, { qos: 0, retain: true });
    }, timer);
}

/* 固定每一個小時發佈主題一回 */
function Pub_hour(topic,value,timer){
    var setHour = timer * (60 * 60 * 1000);
    setInterval(function() {    
        client.publish(topic, value, { qos: 0, retain: true });
    }, setHour);
}

module.exports={
    Pub:Pub,
    Pub_hour:Pub_hour,
    Sub:Sub,
};