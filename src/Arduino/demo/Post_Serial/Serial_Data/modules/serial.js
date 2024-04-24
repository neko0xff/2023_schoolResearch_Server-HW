/*相關函式庫*/
var ConfigParser = require("configparser");
const axios =require("axios");
const { SerialPort } = require('serialport');
const { ReadlineParser } = require('@serialport/parser-readline');
const clock = require("./clock.js");

/*相關函數*/
var parser1,parser2;
const sensorData = {};
let temp = 0;
let hum = 0;
let co = 0;
let co2 = 0;
let o3 = 0;
let tvoc = 0;
let pm25 = 0;

/*讀取設置檔*/
const configdevice = new ConfigParser();
configdevice.read("./config/device.cfg");
configdevice.sections();
const url=configdevice.get("Server","url"); //伺服器: 位置
const serverport=configdevice.get("Server","port"); //伺服器: 連結埠
var sensorname=configdevice.get("Server","sensorname");//伺服器: 開發版名稱
var port1=configdevice.get("device_serial01","port"); //開發版1: 序列埠位置
var port2=configdevice.get("device_serial02","port"); //開發版2: 序列埠位置
var baud1=parseInt(configdevice.get("device_serial01","baud"),10); //開發版1: 調變速率
var baud2=parseInt(configdevice.get("device_serial02","baud"),10); //開發版2: 調變速率

/*序列埠通信設定*/
const serial01 = new SerialPort(
    {
        path: `${port1}`,
        baudRate: baud1,
        autoOpen: false,
    }
);
const serial02 = new SerialPort(
    {
        path: `${port2}`,
        baudRate: baud2,
        autoOpen: false,
    }
);

/*輸出Arduino回伝的結果*/
function getData() {
    parser1.on('data', (data) => {
        readstr(data);
    });
    parser2.on('data', (data) => {
       readstr(data);
    });
}

/*把字串解析成所需的數值*/
function readstr(data) {
    const keyValuePairs = data.split(',');
    keyValuePairs.forEach(pair => {
        const [key, value] = pair.split('=');
        if (key && value) {
            sensorData[key] = parseFloat(value);
        }
    });

    // 检查且把未偵測到的值为0
    const keys = ['temp', 'hum', 'o3', 'tvoc', 'co2', 'pm25', 'co'];
    keys.forEach(key => {
        if (!(key in sensorData)) {
            sensorData[key] = 0;
        }
    });

    temp = sensorData['temp'];
    hum = sensorData['hum'];
    o3 = sensorData['o3'];
    tvoc = sensorData['tvoc'];
    co2 = sensorData['co2'];
    pm25 = sensorData['pm25'];
    co = sensorData['co'];

    console.log(`[${clock.consoleTime()}] Received Value: ${JSON.stringify({temp, hum, o3, tvoc, co2, pm25, co})}`);
}


/*發送至後端*/
function sendDataToHTTP(sensorData) {
    const combinedData = {  ...sensorData };
    const options = {
      method: 'post',
      url: `http://${url}:${serverport}/upload/${sensorname}/data`,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      data: combinedData,
    };
  
    axios(options).then(response => {
        console.log(`[${clock.consoleTime()}] Response from server: ${JSON.stringify(response.data)}`);
    })
    .catch(error => {
      console.error(`[${clock.consoleTime()}] Error sending data to server: ${error.message}`);
    });
  }
  

/*打開串口*/
function openSerial(){
    serial01.open((err) => {
        if (err) {
          console.error(`[${clock.consoleTime()}] Error opening Serial01: `, err);
        } else {
          console.log(`[${clock.consoleTime()}] Serial01 is open.`);
          setTimeout(function() {
            getData();
          }, 3000);
        } 
    });
    serial02.open((err) => {
        if (err) {
          console.error(`[${clock.consoleTime()}] Error opening Serial02: `, err);
        } else {
          console.log(`[${clock.consoleTime()}] Serial02 is open.`);
          setTimeout(function() {
            getData();
          }, 3000);
        } 
    });

    //換行
    parser1 = serial01.pipe(new ReadlineParser({ delimiter: '\r\n' }));
    parser2 = serial02.pipe(new ReadlineParser({ delimiter: '\r\n' }));

}

/*主程式*/
openSerial(); 
setInterval(function () {
    sendDataToHTTP(sensorData);
}, 6000); //設置每6秒傳送一回至後端
