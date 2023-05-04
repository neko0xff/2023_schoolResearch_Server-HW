const moment = require('moment');
var ConfigParser = require('configparser');
const configZone = new ConfigParser();

/*時區設定*/
configZone.read('./modules/config/timezone.cfg');
configZone.sections();
var locaLang=configZone.get('timezone','locaLang');
var localZone=configZone.get('timezone','localZone');;

/*outpuut console Time*/
function consoleTime(){
    var clock = new Date();
    var nowTime = clock.toLocaleString(locaLang, {timeZone: localZone}); //時區
    return nowTime;
}

/*SQL date&time*/
function SQLDate(){
    var clock = new moment();
    var Date=clock.format('YYYY-MM-DD');
    return Date;
};
function SQLTime(){
    var clock = new moment();
    var Time=clock.format('HH:mm:ss');
    return Time;
}

module.exports={
    consoleTime:consoleTime,
    SQLDate:SQLDate,
    SQLTime:SQLTime
};