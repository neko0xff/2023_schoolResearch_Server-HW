/* eslint-disable linebreak-style */
/*MQTT Lib*/
import sensor from"./Pubsensor.js";
import user from "./Pubuser.js";
import crawler from "./Pubcrawler.js";

/*定義的MQTT 路由*/
sensor.pubSensorALL("Sensor01");
sensor.pubSwitchALL("Switch01");
user.pubUsersComparisonResultALL();
user.pubUsersComparisonResultALL_hour();
user.pubCustomValueALL();
crawler.pubCrawlerAQIALL();




