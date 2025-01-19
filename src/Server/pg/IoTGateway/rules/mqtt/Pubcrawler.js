// deno-lint-ignore-file
/*相関函式庫*/
import mqttPub from "../../modules/mqtt/mqttPubSend.js";
import clock from "../../modules/clock.js";

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
        WHERE sitename = $1
        ORDER BY siteid ASC;
    `;
    const topicPub = `/Crawler/AQI/${sitename}`;

    try {
        await mqttPub.pubRouterSwitch(topicPub, readSQL, [sitename]);
    } catch (error) {
        console.error(`[${ clock.consoleTime()}] Failed to publish AQI data for ${sitename}: ${error.message}`);
    }
}

const Pubcrawler = {
    pubCrawlerAQI,
    pubCrawlerAQIALL
};

export default Pubcrawler;
