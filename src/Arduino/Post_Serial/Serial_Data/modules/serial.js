var ConfigParser = require("configparser");
const { SerialPort } = require('serialport');
const { ReadlineParser } = require('@serialport/parser-readline');
const clock = require("./clock.js");
const configdevice = new ConfigParser();
var parser;
const sensorData = {};

/*序列埠通信設定*/
configdevice.read("./modules/config/device.cfg");
configdevice.sections();
var port1=configdevice.get("device_serial01","port"); //開發版1的序列埠位置
var port2=configdevice.get("device_serial02","port"); //開發版2的序列埠位置
const port = new SerialPort(
    {
        path: `${port1}`,
        baudRate: 9600,
        autoOpen: false,
    },
    {
        path: `${port2}`,
        baudRate: 9600,
        autoOpen: false,
    }
);

function getData(){
    /*輸出Arduino回伝的結果*/
    parser.on('data', (data) => {
        const keyValuePairs = data.split(','); 
        keyValuePairs.forEach(pair => {
            const [key, value] = pair.split('='); 
            if(key == 'device'){
                const device=`${sensorData['device']}`;
                console.log(`[${clock.consoleTime()}] device: ${device}`);
            }else if(key && value){
                sensorData[key] = parseFloat(value);
            }
    });

    if (Object.keys(sensorData).length > 0) {
        const data1=`PM2.5: ${sensorData['pm25']},CO: ${sensorData['co']}`;
        console.log(`[${clock.consoleTime()}] Received: ${data1}`);
        //sendDataToHTTP(sensorData);
    } else {
        console.log(`[${clock.consoleTime()}] Invalid data format`);
    }
       
    });
};

/*打開串口*/
port.open((err) => {
    if (err) {
      console.error(`[${clock.consoleTime()}] Error opening port: `, err);
    } else {
      console.log(`[${clock.consoleTime()}] Serial port is open.`);
      setTimeout(function() {getData()}, 3000);
    } 
});
  
parser = port.pipe(new ReadlineParser({ delimiter: '\r\n' }));
