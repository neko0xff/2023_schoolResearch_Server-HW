/* 相関函式庫 */
import mqttPub from "../../modules/mqtt/mqttPubSend.js";
import clock from "../../modules/clock.js";

/*主程式*/

// 發布: 全部使用者比對值
async function pubUsersComparisonResultALL() {
    const listSQL = `
        SELECT username 
        FROM sensordb.users
    `;

    try {
        await mqttPub.processListFromDatabase(listSQL, async (item) => {
            const username = item.username;
            await pubUsersComparisonResult(username);
        });
    } catch (error) {
        console.error(`[${clock.consoleTime()}] Failed to fetch or publish users comparison results: ${error.message}`);
    }
}

// 發布: 全部使用者比對值(固定每一小時)
async function pubUsersComparisonResultALL_hour() {
    const listSQL = `
        SELECT username 
        FROM sensordb.users
    `;

    try {
        await mqttPub.processListFromDatabase(listSQL, async (item) => {
            const username = item.username;
            await pubUsersComparisonResult_hour(username);
        });
    } catch (error) {
        console.error(`[${clock.consoleTime()}] Failed to fetch or publish hourly users comparison results: ${error.message}`);
    }
}

// 發布: 全部使用者自訂值
async function pubCustomValueALL() {
    const listSQL = `
        SELECT username 
        FROM sensordb.users
    `;

    try {
        await mqttPub.processListFromDatabase(listSQL, async (item) => {
            const username = item.username;
            await pubCustomValue(username);
        });
    } catch (error) {
        console.error(`[${ clock.consoleTime()}] Failed to fetch or publish custom values: ${error.message}`);
    }
}

// 發布: 特定使用者比對值
async function pubCustomValue(username) {
    const readSQL = `
        SELECT customvar01, customvar02, customvar03, customvar04, customvar05, customvar06, customvar07 
        FROM sensordb.users WHERE username = $1
    `;
    const topicPub = `/Users/${username}/CustomValue`;

    try {
        await mqttPub.pubRouterSwitch(topicPub, readSQL,[username]);
    } catch (error) {
        console.error(`[${clock.consoleTime()}] Failed to publish custom values for ${topicPub}: ${error.message}`);
    }
}

// 發布: 全部使用者全部比對值(固定每一小時)
async function pubUsersComparisonResult_hour(username) {
    const readSQL = `
        SELECT
            CASE WHEN sensordb.sensor01_table.hum > sensordb.users.customvar01 THEN 1 ELSE 0 END AS comparison_result_hum,
            CASE WHEN sensordb.sensor01_table.temp > sensordb.users.customvar02 THEN 1 ELSE 0 END AS comparison_result_temp,
            CASE WHEN sensordb.sensor01_table.tvoc > sensordb.users.customvar03 THEN 1 ELSE 0 END AS comparison_result_tvoc,
            CASE WHEN sensordb.sensor01_table.co > sensordb.users.customvar04 THEN 1 ELSE 0 END AS comparison_result_co,
            CASE WHEN sensordb.sensor01_table.co2 > sensordb.users.customvar05 THEN 1 ELSE 0 END AS comparison_result_co2,
            CASE WHEN sensordb.sensor01_table.pm25 > sensordb.users.customvar06 THEN 1 ELSE 0 END AS comparison_result_pm25,
            CASE WHEN sensordb.sensor01_table.o3 > sensordb.users.customvar07 THEN 1 ELSE 0 END AS comparison_result_o3
        FROM
            sensordb.sensor01_table
        CROSS JOIN
            sensordb.users
        WHERE 
            sensordb.users.username = $1
        ORDER BY
            sensordb.sensor01_table.date DESC,
            sensordb.sensor01_table.time DESC
        LIMIT 1
    `;
    const topicPub = `/Users/${username}/comparison_result_hour`;

    try {
        await mqttPub.pubRouter_hour(topicPub, readSQL,[username]);
    } catch (error) {
        console.error(`[${ clock.consoleTime()}] Failed to publish hourly comparison results for ${topicPub}: ${error.message}`);
    }
}

// 發布: 全部使用者全部比對值
async function pubUsersComparisonResult(username) {
    const readSQL = `
        SELECT
            CASE WHEN sensordb.sensor01_table.hum > sensordb.users.customvar01 THEN 1 ELSE 0 END AS comparison_result_hum,
            CASE WHEN sensordb.sensor01_table.temp > sensordb.users.customvar02 THEN 1 ELSE 0 END AS comparison_result_temp,
            CASE WHEN sensordb.sensor01_table.tvoc > sensordb.users.customvar03 THEN 1 ELSE 0 END AS comparison_result_tvoc,
            CASE WHEN sensordb.sensor01_table.co > sensordb.users.customvar04 THEN 1 ELSE 0 END AS comparison_result_co,
            CASE WHEN sensordb.sensor01_table.co2 > sensordb.users.customvar05 THEN 1 ELSE 0 END AS comparison_result_co2,
            CASE WHEN sensordb.sensor01_table.pm25 > sensordb.users.customvar06 THEN 1 ELSE 0 END AS comparison_result_pm25,
            CASE WHEN sensordb.sensor01_table.o3 > sensordb.users.customvar07 THEN 1 ELSE 0 END AS comparison_result_o3
        FROM
            sensordb.sensor01_table
        CROSS JOIN
            sensordb.users
        WHERE 
            sensordb.users.username = $1
        ORDER BY
            sensordb.sensor01_table.date DESC,
            sensordb.sensor01_table.time DESC
        LIMIT 1
    `;
    const topicPub = `/Users/${username}/comparison_result`;

    try {
        await mqttPub.pubRouter(topicPub, readSQL,[username]);
    } catch (error) {
        console.error(`[${ clock.consoleTime()}] Failed to publish comparison results for ${topicPub}: ${error.message}`);
    }
}

const Pubuser = {
    pubUsersComparisonResult,
    pubUsersComparisonResult_hour,
    pubCustomValue,
    pubUsersComparisonResultALL,
    pubUsersComparisonResultALL_hour,
    pubCustomValueALL,
};

export default Pubuser;
