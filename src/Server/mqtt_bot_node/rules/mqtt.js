const telegram_api = require("../modules/bot.js");
const clock = require("../modules/clock.js");
const mqtt = require('mqtt');
const ConfigParser = require("configparser");

// 读取配置文件
const configSet = new ConfigParser();
configSet.read("./modules/config/cnSet.cfg");
configSet.sections();

const MQTT_SERVER = configSet.get("MQTT", "source");
const MQTT_PORT = configSet.get("MQTT", "port");
const MQTT_BROKER = `mqtt://${MQTT_SERVER}:${MQTT_PORT}`;

const bot = telegram_api.bot;
const mqttClient = mqtt.connect(MQTT_BROKER);

const subscribedTopics = {};

// 处理 /subscribe 命令
bot.command('subscribe', (ctx) => {
    const chatId = ctx.chat.id;
    const topic = ctx.message.text.split(' ')[1];
    console.log(`[${clock.consoleTime()}] command: /subscribe ${topic}`);
    subscribeTopic(chatId, topic);
});

// 处理 /unsubscribe 命令
bot.command('unsubscribe', (ctx) => {
    const chatId = ctx.chat.id;
    const topic = ctx.message.text.split(' ')[1];
    console.log(`[${clock.consoleTime()}] command: /unsubscribe ${topic}`);
    unsubscribeTopic(chatId, topic);
});

// 处理 MQTT 消息
mqttClient.on('message', (topic, message) => {
    var messageText = `Received MQTT message on topic ${topic}: ${message}`;
    Object.keys(subscribedTopics).forEach(chatId => {
        if (subscribedTopics[chatId] && subscribedTopics[chatId].includes(topic)) {
            bot.telegram.sendMessage(chatId, messageText);
            console.log(`[${clock.consoleTime()}] ${messageText}`);
        }
    });
});

// 订阅主题函数
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
            console.log(`[${clock.consoleTime()}] Subscribed to MQTT topic: ${topic}`);
        }
    });
}

// 取消订阅主题函数
async function unsubscribeTopic(chatId, topic) {
    var messageText = `Unsubscribed from MQTT topic: ${topic}`;
    mqttClient.unsubscribe(topic, (err) => {
        if (err) {
            console.error(`[${clock.consoleTime()}] Failed to unsubscribe from MQTT topic: ${topic}`);
        } else {
            subscribedTopics[chatId] = subscribedTopics[chatId].filter(subscribedTopic => subscribedTopic !== topic);
            bot.telegram.sendMessage(chatId, messageText);
            console.log(`[${clock.consoleTime()}] ${messageText}`);
            console.log(`[${clock.consoleTime()}] Unsubscribed from MQTT topic: ${topic}`);
        }
    });
}
