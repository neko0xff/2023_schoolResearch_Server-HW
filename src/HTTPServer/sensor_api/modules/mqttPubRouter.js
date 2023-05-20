/*相関函式庫*/
var mqttClient=require('./mqttClient.js');
var database=require('./database.js');

/*Pub Client*/
async function pubRouter(Pubtopic,SQL){
    try{
        var cnDB=database.cnDB();
        const connection = await cnDB.getConnection(); // 從連接池中獲取一個連接
        const [results, fields] = await connection.execute(SQL); // 執行 SQL 查詢
        var data=JSON.stringify(results);
        mqttClient.Pub(Pubtopic,data,1000);
        connection.release(); // 釋放連接
    }catch(error){
        console.error('Failed to execute query: ' + error.message);
        mqttClient.Pub(Pubtopic,'Not Connect',1000);
        throw error;
    }
}

async function pubSensor(device_ID,sensor){
    var readSQL = 'SELECT '+sensor+',date,time FROM ' + device_ID + '_Table ORDER BY `date` AND `time` DESC LIMIT 1;';
    var topicPub = "/"+device_ID+"/"+sensor;
    this.pubRouter(topicPub,readSQL);
}


module.exports={
    pubRouter:pubRouter,
    pubSensor:pubSensor,
}

