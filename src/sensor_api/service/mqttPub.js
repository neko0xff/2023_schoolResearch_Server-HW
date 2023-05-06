/*相関函式庫*/
var mqttClient=require('./modules/mqttClient.js');
var database=require('./modules/database.js');

/*Pub Client*/
async function pubSend(Pubtopic,SQL){
    try{
        var cnDB=database.cnDB();
        const connection = await cnDB.getConnection(); // 從連接池中獲取一個連接
        const [results, fields] = await connection.execute(SQL); // 執行 SQL 查詢
        mqttClient.Pub(Pubtopic,connection,1000);
        connection.release(); // 釋放連接
    }catch{
        console.error('Failed to execute query: ' + error.message);
        res.end('無法連線');
        throw error;
    }
}

var device_ID = "Sensor01";
var readSQL = 'SELECT '+sensor+',date,time FROM ' + device_ID + '_Table ORDER BY `date` AND `time` DESC LIMIT 1;';
var sensor = "hum";
var topicPub = "/"+device_ID+"/"+sensor;
pubSend(topicPub,readSQL);
mqttClient.Sub(topicPub);