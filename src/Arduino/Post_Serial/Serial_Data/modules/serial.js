/*相關函式庫*/
var ConfigParser = require("configparser");
const axios =require("axios");
const querystring = require('querystring');
const { SerialPort } = require('serialport');
const { ReadlineParser } = require('@serialport/parser-readline');
const clock = require("./clock.js");

/*相關函數*/
var parser1,parser2;
var device = "";
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
configdevice.read("./modules/config/device.cfg");
configdevice.sections();
const url=configdevice.get("Server","url");
const serverport=configdevice.get("Server","port");
var sensorname=configdevice.get("Server","sensorname");//伺服器
var port1=configdevice.get("device_serial01","port"); //開發版1的序列埠位置
var port2=configdevice.get("device_serial02","port"); //開發版2的序列埠位置
var baud1=parseInt(configdevice.get("device_serial01","baud"),10); //開發版1的調變速率
var baud2=parseInt(configdevice.get("device_serial02","baud"),10); //開發版2的調變速率

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
function getData1() {
    parser1.on('data', (data) => {
        const keyValuePairs = data.split(',');
        keyValuePairs.forEach(pair => {
            const [key, value] = pair.split('=');
            if (key == 'device') {
                device = `${value}`;
                console.log(`[${clock.consoleTime()}] device: ${device}`);
            } else if (key && value) {
                sensorData[key] = parseFloat(value);
            }
        });

        if (Object.keys(sensorData).length > 0) {
            pm25 = sensorData['pm25'];
            co = sensorData['co'];
            var data1 = `PM2.5: ${pm25},CO: ${co}`;
            console.log(`[${clock.consoleTime()}] Received= ${data1}`);
        } else {
            console.log(`[${clock.consoleTime()}] Invalid data format`);
        }

    });
};

function getData2() {
    parser2.on('data', (data) => {
        const keyValuePairs = data.split(',');
        keyValuePairs.forEach(pair => {
            const [key, value] = pair.split('=');
            if (key == 'device') {
                device = `${value}`;
                console.log(`[${clock.consoleTime()}] device: ${device}`);
            } else if (key && value) {
                sensorData[key] = parseFloat(value);
            }
        });

        if (Object.keys(sensorData).length > 0) {
            temp = sensorData['temp'];
            hum = sensorData['hum'];
            o3 = sensorData['o3'];
            var data1 = `temp: ${temp},hum: ${hum},o3: ${o3}`;
            console.log(`[${clock.consoleTime()}] Received= ${data1}`);
        } else {
            console.log(`[${clock.consoleTime()}] Invalid data format`);
        }

    });
};

/*發送至後端*/
function sendDataToHTTP(sensorData) {
    const additionalData = {
        tvoc: tvoc,
        co2: co2,
    };
    const combinedData = { ...additionalData, ...sensorData };
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
            getData1();
          }, 3000);
        } 
    });
    serial02.open((err) => {
        if (err) {
          console.error(`[${clock.consoleTime()}] Error opening Serial02: `, err);
        } else {
          console.log(`[${clock.consoleTime()}] Serial02 is open.`);
          setTimeout(function() {
            getData2();
          }, 3000);
        } 
    });

    /*換行*/
    parser1 = serial01.pipe(new ReadlineParser({ delimiter: '\r\n' }));
    parser2 = serial02.pipe(new ReadlineParser({ delimiter: '\r\n' }));

}

/*主程式*/
openSerial();
sendDataToHTTP();
