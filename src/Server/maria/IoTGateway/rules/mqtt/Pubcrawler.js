/* eslint-disable no-unused-vars */
/*相関函式庫*/
var mqttPub=require("../../modules/mqtt/mqttPubSend.js");

async function pubCrawlerAQIALL() {
    const listSQL = "SELECT sitename FROM AQX_P_434";
    await mqttPub.processListFromDatabase(listSQL, async (item) => {
        const sitename = item.sitename;
        await pubCrawlerAQI(sitename);
    });
}

async function pubCrawlerAQI(sitename){
    var readSQL = `SELECT siteid,sitename,aqi,monitordate FROM AQX_P_434 WHERE sitename = "${sitename}" ORDER BY siteid ASC;`;
    var topicPub = `/Crawler/AQI/${sitename}`;
    mqttPub.pubRouterSwitch(topicPub,readSQL);
}

module.exports={
    pubCrawlerAQI:pubCrawlerAQI,
    pubCrawlerAQIALL:pubCrawlerAQIALL
};
