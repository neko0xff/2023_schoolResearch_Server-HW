/*相關函式庫*/
const axios = require('axios');
var ConfigParser = require("configparser");
const clock = require("./modules/clock.js");

/*設定來源*/
const configdevice = new ConfigParser();
configdevice.read("./config/device.cfg");
configdevice.sections();
const url=configdevice.get("Server","url");
const port=configdevice.get("Server","port");

/*測試連線*/
console.log(`[${clock.consoleTime()}] Checking Server Service`);
console.log(`[${clock.consoleTime()}] Server URL: ${url}:${port}`);
axios.get(`http://${url}:${port}/`)
     .then(response => console.log(`[${clock.consoleTime()}] HTTP API: It Work`))
     .catch(error => console.error("Error fetching /:", error));

axios.get(`http://${url}:${port}/testDB`)
     .then(response => console.log(`[${clock.consoleTime()}] Data Base: It Work`))
     .catch(error => console.error("Error fetching /testDB:", error));

