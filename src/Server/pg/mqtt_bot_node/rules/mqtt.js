const telegram_api = require("../modules/bot.js");
const clock = require("../modules/clock.js");
const mqtt = require('mqtt');
const ConfigParser = require("configparser");

// 配置文件
const configSet = new ConfigParser();
configSet.read("./modules/config/cnSet.cfg");
configSet.sections();

const MQTT_SERVER = configSet.get("MQTT", "source");
const MQTT_PORT = configSet.get("MQTT", "port");
const MQTT_BROKER = `mqtt://${MQTT_SERVER}:${MQTT_PORT}`;

const bot = telegram_api.bot;
const mqttClient = mqtt.connect(MQTT_BROKER);

const subscribedTopics = {};

/*事件模組化*/
// 管理訂閱主題
function handleSubscriptionCommand(ctx, isSubscribe = true) {
    const chatId = ctx.chat.id;
    const topic = ctx.message.text.split(' ')[1];
    const commandText = isSubscribe ? 'subscribe' : 'unsubscribe';
    console.log(`[${clock.consoleTime()}] command: /${commandText} ${topic}`);
    isSubscribe ? subscribeTopic(chatId, topic) : unsubscribeTopic(chatId, topic);
}

// 自訂格式化字串
function formatMessageText(topic, dataItem) {
    var hum_status = dataItem.comparison_result_hum === 1 ? "超標" : "未超標";
    var temp_status = dataItem.comparison_result_temp === 1 ? "超標" : "未超標";
    var tvoc_status = dataItem.comparison_result_tvoc === 1 ? "超標" : "未超標";
    var co_status = dataItem.comparison_result_co === 1 ? "超標" : "未超標";
    var co2_status = dataItem.comparison_result_co2 === 1 ? "超標" : "未超標";
    var pm25_status = dataItem.comparison_result_pm25 === 1 ? "超標" : "未超標";
    var o3_status = dataItem.comparison_result_o3 === 1 ? "超標" : "未超標";
    return `
        訂閱主題: ${topic}   
        \t查詢結果如下
        \t溼度: ${hum_status}
        \t溫度: ${temp_status}
        \t工業廢氣: ${tvoc_status}
        \tCo: ${co_status}
        \tCo2: ${co2_status}
        \tPM 2.5: ${pm25_status}
        \t臭氧: ${o3_status}
    `;
}

// 把通過MQTT傳送的訂閱主題的JSON內容轉換成變數值
mqttClient.on('message', (topic, message) => {
    try {
        const data = JSON.parse(message.toString());
        if (data.length > 0) {
            const messageText = formatMessageText(topic, data[0]);
            notifySubscribers(topic, messageText);
        }
    } catch (error) {
        console.error(`[${clock.consoleTime()}] Error processing message: ${error}`);
    }
});

// 寄出通知給使用者
function notifySubscribers(topic, messageText) {
    Object.keys(subscribedTopics).forEach(chatId => {
        if (subscribedTopics[chatId] && subscribedTopics[chatId].includes(topic)) {
            bot.telegram.sendMessage(chatId, messageText);
        }
    });
}

// 訂閱主題是否成功
function subscribeTopic(chatId, topic) {
    var messageText = `Subscribed to MQTT topic: ${topic}`;
    mqttClient.subscribe(topic, (err) => {
        if (err) {
            console.error(`[${clock.consoleTime()}] Failed to subscribe to MQTT topic: ${topic}`);
        } else {
            subscribedTopics[chatId] = subscribedTopics[chatId] || [];
            subscribedTopics[chatId].push(topic);
            bot.telegram.sendMessage(chatId, messageText);
            console.log(`[${clock.consoleTime()}] ${messageText}`);
        }
    });
}

// 不訂閱主題是否成功
async function unsubscribeTopic(chatId, topic) {
    var messageText = `Unsubscribed from MQTT topic: ${topic}`;
    mqttClient.unsubscribe(topic, (err) => {
        if (err) {
            console.error(`[${clock.consoleTime()}] Failed to unsubscribe from MQTT topic: ${topic}`);
        } else {
            subscribedTopics[chatId] = subscribedTopics[chatId].filter(subscribedTopic => subscribedTopic !== topic);
            bot.telegram.sendMessage(chatId, messageText);
            console.log(`[${clock.consoleTime()}] ${messageText}`);
        }
    });
}

/*指令定義*/
// bot: /subscribe
// test cmd: /subscribe /Users/master/comparison_result_hour
bot.command('subscribe', (ctx) => handleSubscriptionCommand(ctx, true));

// bot: /unsubscribe
// test cmd: /unsubscribe /Users/master/comparison_result_hour
bot.command('unsubscribe', (ctx) => handleSubscriptionCommand(ctx, false));