/*相關函式庫*/
const aedes = require("aedes")();
const broker = require("net").createServer(aedes.handle);
var ConfigParser = require("configparser");
var clock=require("../clock.js");

/*讀取配置*/
const configSet = new ConfigParser();
configSet.read("./modules/config/serviceSet.cfg");
configSet.sections();
var port = configSet.get("Service","MQTT");

/*主程式*/

// 監聽通訊埠
broker.listen(port, function () {
    console.log(`[${clock.consoleTime()}] MQTT Server Started!`);
    console.log(`[${clock.consoleTime()}] MQTT Server URL: http://[Server_IP]:${port}`);
});

