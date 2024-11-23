/* eslint-disable linebreak-style */
/*MQTT Lib*/
var sensor=require("./Pubsensor.js");
var user=require("./Pubuser.js");
var crawler=require("./Pubcrawler.js");

/*定義的MQTT 路由*/
sensor.pubSensorALL("Sensor01");
sensor.pubSwitchALL("Switch01");
user.pubUsersComparisonResultALL();
user.pubUsersComparisonResultALL_hour();
user.pubCustomValueALL();
crawler.pubCrawlerAQIALL();


