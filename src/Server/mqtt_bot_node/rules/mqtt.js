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

// 重构：处理命令的函数
function handleSubscriptionCommand(ctx, isSubscribe = true) {
    const chatId = ctx.chat.id;
    const topic = ctx.message.text.split(' ')[1];
    const commandText = isSubscribe ? 'subscribe' : 'unsubscribe';
    console.log(`[${clock.consoleTime()}] command: /${commandText} ${topic}`);
    isSubscribe ? subscribeTopic(chatId, topic) : unsubscribeTopic(chatId, topic);
}

// bot: /subscribe
// test cmd: /subscribe /Users/master/comparison_result
bot.command('subscribe', (ctx) => handleSubscriptionCommand(ctx, true));

// bot: /unsubscribe
bot.command('unsubscribe', (ctx) => handleSubscriptionCommand(ctx, false));

// Message Send
mqttClient.on('message', (topic, message) => {
    try {
        const data = JSON.parse(message.toString());
        if (data.length > 0) {
            const messageText = formatMessageText(topic, data[0]);
            notifySubscribers(topic, messageText);
        }
    } catch (error) {
        console.error(`[${clock.consoleTime()}] Error processing message: `, error);
    }
});

// format String
function formatMessageText(topic, dataItem) {
    //const statusMap = {1: "超標", 0: "未超標"};
    //${Object.keys(dataItem).map(key => `\t${key}: ${statusMap[dataItem[key]] || dataItem[key]}`).join('\n')}
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

// notify Send
function notifySubscribers(topic, messageText) {
    Object.keys(subscribedTopics).forEach(chatId => {
        if (subscribedTopics[chatId] && subscribedTopics[chatId].includes(topic)) {
            bot.telegram.sendMessage(chatId, messageText);
        }
    });
}

// Sub Topic function
function subscribeTopic(chatId, topic) {
    var messageText = `Subscribed to MQTT topic: ${topic}`;
    mqttClient.subscribe(topic, (err) => {
        if (err) {
            console.error(`[${clock.consoleTime()}] Failed to subscribe to MQTT topic: ${topic}`);
        } else {
            subscribedTopics[chatId] = subscribedTopics[chatId] || [];
            subscribedTopics[chatId].push(topic);
            bot.telegram.sendMessage(chatId, messageText);
            console.log(`[${clock.consoleTime()}] Subscribed to MQTT topic: ${topic}`);
        }
    });
}

// unSub Topic function
async function unsubscribeTopic(chatId, topic) {
    var messageText = `Unsubscribed from MQTT topic: ${topic}`;
    mqttClient.unsubscribe(topic, (err) => {
        if (err) {
            console.error(`[${clock.consoleTime()}] Failed to unsubscribe from MQTT topic: ${topic}`);
        } else {
            subscribedTopics[chatId] = subscribedTopics[chatId].filter(subscribedTopic => subscribedTopic !== topic);
            bot.telegram.sendMessage(chatId, messageText);
            console.log(`[${clock.consoleTime()}] Unsubscribed from MQTT topic: ${topic}`);
        }
    });
}
