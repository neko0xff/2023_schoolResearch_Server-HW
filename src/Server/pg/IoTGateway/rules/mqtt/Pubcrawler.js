/*相関函式庫*/
var mqttPub = require("../../modules/mqtt/mqttPubSend.js");
var clock = require("../../modules/clock.js");

/*主程式*/

// 發布: 全台站點的AQI
async function pubCrawlerAQIALL() {
    const sql = `
        SELECT sitename 
        FROM sensordb.aqx_p_434
    `;

    try {
        await mqttPub.processListFromDatabase(sql, async (item) => {
            const sitename = item.sitename;
            await pubCrawlerAQI(sitename); 
        });
    } catch (error) {
        console.error(`[${ clock.consoleTime()}] Failed to fetch or process sitenames: ${error.message}`);
    }
}

// 發布: 特定站點的AQI
async function pubCrawlerAQI(sitename) {
    const readSQL = `
        SELECT siteid, sitename, aqi, monitordate 
        FROM sensordb.aqx_p_434 
        WHERE sitename = '${sitename}'
        ORDER BY siteid ASC;
    `;
    var topicPub = `/Crawler/AQI/${sitename}`;

    try {
        await mqttPub.pubRouterSwitch(topicPub, readSQL, [sitename]);
    } catch (error) {
        console.error(`[${ clock.consoleTime()}] Failed to publish AQI data for ${sitename}: ${error.message}`);
    }
}

module.exports = {
    pubCrawlerAQI: pubCrawlerAQI,
    pubCrawlerAQIALL: pubCrawlerAQIALL
};
