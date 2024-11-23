/* eslint-disable no-unused-vars */
/*相関函式庫*/
var mqttPub=require("../../modules/mqtt/mqttPubSend.js");

async function pubUsersComparisonResultALL() {
    const listSQL = "SELECT username FROM Users";
    await mqttPub.processListFromDatabase(listSQL, async (item) => {
        const username = item.username;
        await pubUsersComparisonResult(username);
    });
}

async function pubUsersComparisonResultALL_hour() {
    const listSQL = "SELECT username FROM Users";
    await mqttPub.processListFromDatabase(listSQL, async (item) => {
        const username = item.username;
        await pubUsersComparisonResult_hour(username);
    });
}

async function pubCustomValueALL() {
    const listSQL = "SELECT username FROM Users";
    await mqttPub.processListFromDatabase(listSQL, async (item) => {
        const username = item.username;
        await pubCustomValue(username);
    });
}

async function pubCustomValue(username){
    var readSQL = `SELECT customvar01,customvar02,customvar03,customvar04,customvar05,customvar06,customvar07 FROM Users WHERE username= '${username}'; `;
    var topicPub = `/Users/${username}/CustomValue`;
    mqttPub.pubRouterSwitch(topicPub,readSQL);
}

async function pubUsersComparisonResult_hour(username){
    var readSQL = `
        SELECT
            CASE WHEN Sensor01_Table.hum > Users.customvar01 THEN 1 ELSE 0 END AS comparison_result_hum,
            CASE WHEN Sensor01_Table.temp > Users.customvar02 THEN 1 ELSE 0 END AS comparison_result_temp,
            CASE WHEN Sensor01_Table.tvoc > Users.customvar03 THEN 1 ELSE 0 END AS comparison_result_tvoc,
            CASE WHEN Sensor01_Table.co > Users.customvar04 THEN 1 ELSE 0 END AS comparison_result_co,
            CASE WHEN Sensor01_Table.co2 > Users.customvar05 THEN 1 ELSE 0 END AS comparison_result_co2,
            CASE WHEN Sensor01_Table.pm25 > Users.customvar06 THEN 1 ELSE 0 END AS comparison_result_pm25,
            CASE WHEN Sensor01_Table.o3 > Users.customvar07 THEN 1 ELSE 0 END AS comparison_result_o3
        FROM
            Sensor01_Table
        CROSS JOIN
            Users
        WHERE 
            Users.username = '${username}'
        ORDER BY
            Sensor01_Table.date DESC,
            Sensor01_Table.time DESC
        LIMIT 1;
    `;
    var topicPub = `/Users/${username}/comparison_result_hour`;
    mqttPub.pubRouter_hour(topicPub,readSQL);
}

async function pubUsersComparisonResult(username){
    var readSQL = `
        SELECT
            CASE WHEN Sensor01_Table.hum > Users.customvar01 THEN 1 ELSE 0 END AS comparison_result_hum,
            CASE WHEN Sensor01_Table.temp > Users.customvar02 THEN 1 ELSE 0 END AS comparison_result_temp,
            CASE WHEN Sensor01_Table.tvoc > Users.customvar03 THEN 1 ELSE 0 END AS comparison_result_tvoc,
            CASE WHEN Sensor01_Table.co > Users.customvar04 THEN 1 ELSE 0 END AS comparison_result_co,
            CASE WHEN Sensor01_Table.co2 > Users.customvar05 THEN 1 ELSE 0 END AS comparison_result_co2,
            CASE WHEN Sensor01_Table.pm25 > Users.customvar06 THEN 1 ELSE 0 END AS comparison_result_pm25,
            CASE WHEN Sensor01_Table.o3 > Users.customvar07 THEN 1 ELSE 0 END AS comparison_result_o3
        FROM
            Sensor01_Table
        CROSS JOIN
            Users
        WHERE 
            Users.username = '${username}'
        ORDER BY
            Sensor01_Table.date DESC,
            Sensor01_Table.time DESC
        LIMIT 1;
    `;
    var topicPub = `/Users/${username}/comparison_result`;
    mqttPub.pubRouter(topicPub,readSQL);
}

module.exports={
    pubUsersComparisonResult:pubUsersComparisonResult,
    pubUsersComparisonResult_hour:pubUsersComparisonResult_hour,
    pubCustomValue:pubCustomValue,
    pubUsersComparisonResultALL:pubUsersComparisonResultALL,
    pubUsersComparisonResultALL_hour:pubUsersComparisonResultALL_hour,
    pubCustomValueALL:pubCustomValueALL,
};
