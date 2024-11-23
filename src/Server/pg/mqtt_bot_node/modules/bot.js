const { Telegraf } = require('telegraf');
var ConfigParser = require("configparser");
const configCN = new ConfigParser();

/*連線設定*/
configCN.read("./modules/config/cnSet.cfg");
configCN.sections();
const API_KEY = configCN.get("Telegram","bot_key");
const bot = new Telegraf(API_KEY);

module.exports={
    bot:bot,
}