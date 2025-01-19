/*相関函式庫*/
import { Telegraf } from "telegraf";
import ConfigParser from "configparser";

/*戴入設定檔*/
const configCN = new ConfigParser();

/*連線設定*/
configCN.read("./modules/config/cnSet.cfg");
configCN.sections();
const API_KEY = configCN.get("Telegram","bot_key");
const bot_serve = new Telegraf(API_KEY);

const bot_api = {
    bot_serve
};

export default bot_api;