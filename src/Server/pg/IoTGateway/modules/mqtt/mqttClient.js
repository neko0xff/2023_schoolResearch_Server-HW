/*相關函式庫*/
import mqtt from "mqtt";
import clock from "../clock.js";
import ConfigParser from "configparser";

/*MQTT Client*/
const configSet = new ConfigParser();
configSet.read("./modules/config/cnSet.cfg");
configSet.sections();
const ServerSource = configSet.get("MQTT","source");
const port = configSet.get("MQTT","port");
const client = mqtt.connect(`mqtt://${ServerSource}:${port}`);

/* 主程式 */

// 訂閱主題
function Sub(topic){ 
    client.on("connect", function() {
        console.log(`[${clock.consoleTime()}] Server is Started`);
        client.subscribe(topic, { qos: 1 }); 
    });
    client.on("message", function(top, message) {
        console.log(`[${clock.consoleTime()}] Now topic => ${top}`);
        console.log(`[${clock.consoleTime()}] Now Sub Data => ${message.toString()}`);
    });
}

// 發佈主題
function Pub(topic,value,timer){
    setInterval(function() {    
        client.publish(topic, value, { qos: 0, retain: true });
    }, timer);
}

// 發佈主題(固定每一個小時一回) 
function Pub_hour(topic,value,timer){
    const setHour = timer * (60 * 60 * 1000);
    setInterval(function() {    
        client.publish(topic, value, { qos: 0, retain: true });
    }, setHour);
}

const mqttClient ={
    Pub,
    Pub_hour,
    Sub,
};

export default mqttClient;