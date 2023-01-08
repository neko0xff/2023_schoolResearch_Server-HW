const ConfigParser = require('configparser');
const config = new ConfigParser();
config.read('./modules/config/timezone.cfg');
config.sections();

var locaLang=config.get('timezone','locaLang');
var localZone=config.get('timezone','localZone');;

/*outpuut console Time*/
function consoleTime(){
    var clock = new Date();
    var nowTime = clock.toLocaleString(locaLang, {timeZone: localZone}); //時區
    return nowTime;
}

module.exports={
    consoleTime:consoleTime
};