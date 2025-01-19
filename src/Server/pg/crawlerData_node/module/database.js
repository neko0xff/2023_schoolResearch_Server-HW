/*資料庫連線設定*/
var { Pool } = require("pg");
var ConfigParser = require("configparser");
const configDB = new ConfigParser();
configDB.read("./module/config/cnSet.cfg");

var setDB = new Pool({
    host: configDB.get("POSTGRESQL", "DBsource"),
    user: configDB.get("POSTGRESQL", "DBuser"),
    password: configDB.get("POSTGRESQL", "DBpassword"),
    port: configDB.get("POSTGRESQL", "DBport"),
    database: configDB.get("POSTGRESQL", "cnDatabase"),
    max: 200, // 最大連線數
    connectionTimeoutMillis: 20000, // 連接超時時間 = 20sec
    idleTimeoutMillis: 30000,       // 閒置超時時間 = 30sec
});

function escape(VALUES) {
    return VALUES;
}

function cnDB() {
    return setDB;
}

module.exports = {
    cnDB: cnDB,
    escape: escape,
};
