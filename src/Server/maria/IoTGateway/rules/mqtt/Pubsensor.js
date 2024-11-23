/* eslint-disable no-unused-vars */
/*相関函式庫*/
var mqttPub=require("../../modules/mqtt/mqttPubSend.js");

async function pubSensor(device_ID,sensor){
    var readSQL = `SELECT ${sensor},date,time FROM ${device_ID}_Table ORDER BY date DESC, time DESC LIMIT 1;`;
    var topicPub = `/Device/${device_ID}/${sensor}`;
    mqttPub.pubRouter(topicPub,readSQL);
}

async function pubSwitch(device_ID,switchname){
    var readSQL = `SELECT name,status FROM ${device_ID}_Status WHERE name= '${switchname}';`;
    var topicPub = `/Device/${device_ID}/${switchname}`;
    mqttPub.pubRouterSwitch(topicPub,readSQL);
}

function pubSwitchALL(device_ID){
    pubSwitch(device_ID,"fan1");
    pubSwitch(device_ID,"fan2"); 
}

function pubSensorALL(device_ID){
    pubSensor(device_ID,"hum");
    pubSensor(device_ID,"temp");
    pubSensor(device_ID,"tvoc");
    pubSensor(device_ID,"pm25");
    pubSensor(device_ID,"co");
    pubSensor(device_ID,"co2");
    pubSensor(device_ID,"o3");
}

module.exports={
    pubSensor:pubSensor,
    pubSwitch:pubSwitch,
    pubSensorALL:pubSensorALL,
    pubSwitchALL:pubSwitchALL,
};
