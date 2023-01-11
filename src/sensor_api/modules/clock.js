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

module.exports={
    consoleTime:consoleTime
};