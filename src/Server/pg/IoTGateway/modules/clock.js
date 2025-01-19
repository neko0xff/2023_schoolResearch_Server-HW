/*相関函式庫*/
import moment from "moment";
import ConfigParser from "configparser";

/*戴入設定檔*/
const configZone = new ConfigParser();

/*時區設定*/
configZone.read("./modules/config/clockSet.cfg");
configZone.sections();
const locaLang=configZone.get("timezone","locaLang");
const localZone=configZone.get("timezone","localZone");

/*主程式 */

// outpuut console Time
function consoleTime(){
    const clock = new Date();
    const nowTime = clock.toLocaleString(locaLang, {timeZone: localZone});

    return nowTime;
}

// SQL: date
function SQLDate(){
    const clock = new moment();
    const dateFormat=configZone.get("formatStyle","dateFormat");
    const Date=clock.format(dateFormat);

    return Date;
}

// SQL: time
function SQLTime(){
    const clock = new moment();
    const timeFormat=configZone.get("formatStyle","timeFormat");
    const Time=clock.format(timeFormat);

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

const clock ={
    yasterDate,
    formatDateToYYYYMMDD,
    consoleTime,
    SQLDate,
    SQLTime
};

export default clock;
