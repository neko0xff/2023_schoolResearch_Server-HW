/*相關函式庫*/
import aedes from 'aedes';
import { createServer } from 'node:net';
import ConfigParser from "configparser";
import clock from "../clock.js";

/*讀取配置*/
const configSet = new ConfigParser();
configSet.read("./modules/config/serviceSet.cfg");
configSet.sections();
const port = configSet.get("Service","MQTT");

/*主程式*/
const broker = createServer(aedes().handle);

// 錯誤處理
broker.on('error', (err) => {
    console.error(`[${clock.consoleTime()}] Server Error:`, err);
});

// 監聽通訊埠
broker.listen(port, function () {
    console.log(`[${clock.consoleTime()}] MQTT Server Started!`);
    console.log(`[${clock.consoleTime()}] MQTT Server URL: mqtt://[Server_IP]:${port}`);
});

const mqttBroker = {
    broker
};

export default mqttBroker;