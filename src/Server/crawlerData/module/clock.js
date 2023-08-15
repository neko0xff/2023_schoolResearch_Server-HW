const moment = require("moment");
var ConfigParser = require("configparser");
const configZone = new ConfigParser();

/*時區設定*/
configZone.read("./module/config/clockSet.cfg");
configZone.sections();
var locaLang=configZone.get("timezone","locaLang");
var localZone=configZone.get("timezone","localZone");

/*outpuut console Time*/
function consoleTime(){
    var clock = new Date();
    var nowTime = clock.toLocaleString(locaLang, {timeZone: localZone}); //時區
    return nowTime;
}

/*SQL date&time*/
function SQLDate(){
    var clock = new moment();
    var dateFormat=configZone.get("formatStyle","dateFormat");
    var Date=clock.format(dateFormat);
    return Date;
}
function SQLTime(){
    var clock = new moment();
    var timeFormat=configZone.get("formatStyle","timeFormat");
    var Time=clock.format(timeFormat);
    return Time;
}

function yasterDate(){
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    const formattedYesterday = yesterday.toISOString().slice(0, 10); // 格式為 YYYY-MM-DD
    return formattedYesterday;
}

module.exports={
    yasterDate:yasterDate,
    consoleTime:consoleTime,
    SQLDate:SQLDate,
    SQLTime:SQLTime
};