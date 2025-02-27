/*相關函式庫*/
import clock from "../clock.js";
import mqtt from "mqtt";
import ConfigParser from "configparser";

/*MQTT Client*/
const configSet = new ConfigParser();
configSet.read("./module/config/cnSet.cfg");
configSet.sections();
var ServerSource = configSet.get("MQTT","source");
var port = configSet.get("MQTT","port");
var client = mqtt.connect(`mqtt://${ServerSource}:${port}`);

/*主程式*/
function Sub(topic){
    //訂閱
    client.on("connect", function() {
        console.log(`[${clock.consoleTime()}] Server is Started`);
        client.subscribe(topic, { qos: 1 }); 
    });
    client.on("message", function(top, message) {
        console.log(`[${clock.consoleTime()}] Now topic= `, top);
        console.log(`[${clock.consoleTime()}] Now Sub Data= `, message.toString());
    });
}

function Pub(topic,value,timer){
    //發布
    setInterval(function() {    
        client.publish(topic, value, { qos: 0, retain: true });
    }, timer);
}

const mqttClient = {
    Pub,
    Sub
};

export default mqttClient;