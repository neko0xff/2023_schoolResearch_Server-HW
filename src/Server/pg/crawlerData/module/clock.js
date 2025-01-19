import moment from "moment";
import ConfigParser from "configparser";

const configZone = new ConfigParser();

/*時區設定*/
configZone.read("./module/config/clockSet.cfg");
configZone.sections();
var locaLang=configZone.get("timezone","locaLang");
var localZone=configZone.get("timezone","localZone");

/*主程式 */

// outpuut console Time
function consoleTime(){
    var clock = new Date();
    var nowTime = clock.toLocaleString(locaLang, {timeZone: localZone}); 

    return nowTime;
}

// SQL: date 
function SQLDate(){
    var clock = new moment();
    var dateFormat=configZone.get("formatStyle","dateFormat");
    var Date=clock.format(dateFormat);

    return Date;
}

// SQL: time
function SQLTime(){
    var clock = new moment();
    var timeFormat=configZone.get("formatStyle","timeFormat");
    var Time=clock.format(timeFormat);

    return Time;
}

/* 時間: ISO 8601 => "yyyy-mm-dd" */
function formatDateToYYYYMMDD(isoDateString) {
    const date = new Date(isoDateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Month is 0-based
    const day = String(date.getDate()).padStart(2, '0');
    const formatted = `${year}-${month}-${day}`;

    return formatted;
}

/*Yasterday a Date: 格式= 'YYYY-MM-DD'*/
function yasterDate(){
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1); 
    const formattedYesterday = yesterday.toISOString().slice(0, 10);

    return formattedYesterday;
}

const clock = {
    consoleTime,
    SQLDate,
    SQLTime,
    formatDateToYYYYMMDD,
    yasterDate
};

export default clock;
