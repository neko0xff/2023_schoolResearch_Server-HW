/*資料庫連線設定*/
var ConfigParser = require('configparser');
const configDB = new ConfigParser();
var mysql = require('mysql');
configDB.read('./modules/config/cnDB.cfg');
configDB.sections();

function cnDB(){
    var setDB=mysql.createConnection({
        host: configDB.get('cn_DB','DBhost') ,
        user: configDB.get('cn_DB','DBuser'),
        password: configDB.get('cn_DB','DBpassword') ,
        port: '3306',
        database: configDB.get('cn_DB','cnDatabase')
    });
    return setDB;
}


module.exports={
    cnDB:cnDB
};