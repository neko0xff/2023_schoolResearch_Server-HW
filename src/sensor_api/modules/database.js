/*資料庫連線設定*/
var ConfigParser = require('configparser');
const configDB = new ConfigParser();
var mysql = require('mysql2/promise');
configDB.read('./modules/config/cnDB.cfg');
configDB.sections();

var setDB=mysql.createPool({
    connectionLimit: 1000, // 設置最大連接數量
    host: configDB.get('cn_DB','DBhost') ,
    user: configDB.get('cn_DB','DBuser'),
    password: configDB.get('cn_DB','DBpassword') ,
    port: '3306',
    database: configDB.get('cn_DB','cnDatabase')
});

function cnDB(){
    return setDB;
}

module.exports={
    cnDB:cnDB,
};