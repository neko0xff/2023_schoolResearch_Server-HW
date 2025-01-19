/* 相関函式庫 */
import mqttPub from "../../modules/mqtt/mqttPubSend.js";
import clock from "../../modules/clock.js";
import strcvlib from "../../modules/str.js";

/*主程式*/

// 發布: 特定感測器偵測數值
async function pubSensor(device_ID, sensor) {
    const deviceNamecv = strcvlib.firstLetterToLower(device_ID);
    const topicPub = `/Device/${device_ID}/${sensor}`;
    const readSQL = `
            SELECT ${sensor}, date, time 
            FROM sensordb.${deviceNamecv}_table 
            ORDER BY date DESC, time 
            DESC LIMIT 1;
    `;

    try {
        await mqttPub.pubRouter(topicPub, readSQL);
    } catch (error) {
        console.error(`[${ clock.consoleTime()}] Failed to publish sensor data for ${topicPub}: ${error.message}`);
        throw error; 
    }
}

// 發布: 特定開關狀態
async function pubSwitch(device_ID, switchname) {
    const deviceNamecv = strcvlib.firstLetterToLower(device_ID); 
    const topicPub = `/Device/${device_ID}/${switchname}`;
    const readSQL = `
            SELECT name, status 
            FROM sensordb.${deviceNamecv}_status 
            WHERE name = $1
    `;  

    try {
        await mqttPub.pubRouterSwitch(topicPub, readSQL, [switchname]);  
    } catch (error) {
        console.error(`[${ clock.consoleTime()}] Failed to publish switch data for ${topicPub}: ${error.message}`);
    }
}

// 發布: 全部開關狀態
async function pubSwitchALL(device_ID) {
    try {
        await Promise.all([
            pubSwitch(device_ID, "fan1"),
            pubSwitch(device_ID, "fan2")
        ]);
    } catch (error) {
        console.error(`[${ clock.consoleTime()}] Failed to publish all switches for ${device_ID}: ${error.message}`);
    }
}

// 發布: 全部感測器偵測數值
async function pubSensorALL(device_ID) {
    try {
        await Promise.all([
            pubSensor(device_ID, "hum"),
            pubSensor(device_ID, "temp"),
            pubSensor(device_ID, "tvoc"),
            pubSensor(device_ID, "pm25"),
            pubSensor(device_ID, "co"),
            pubSensor(device_ID, "co2"),
            pubSensor(device_ID, "o3")
        ]);
    } catch (error) {
        console.error(`[${ clock.consoleTime()}] Failed to publish all sensors for ${device_ID}: ${error.message}`);
    }
}

const Pubsensor = {
    pubSensor,
    pubSwitch,
    pubSensorALL,
    pubSwitchALL,
}

export default Pubsensor;
