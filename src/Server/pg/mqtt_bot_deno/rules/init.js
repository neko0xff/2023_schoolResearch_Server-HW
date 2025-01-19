/*相関函式庫*/
import bot_api from"../modules/bot_api.js";

const bot = bot_api.bot_serve;

/*指令定義*/
bot.start((ctx) => ctx.reply('Welcome use this Service'));
bot.help((ctx) => ctx.reply('Send me a sticker'));
bot.on('sticker', (ctx) => ctx.reply('😒🧐'));
bot.hears('hi', (ctx) => ctx.reply('Hey there'));
bot.command('oldschool', (ctx) => ctx.reply('Hello oldman'));
bot.on('callback_query', async (ctx) => {
    // Explicit usage
    await ctx.telegram.answerCbQuery(ctx.callbackQuery.id);
  
    // Using context shortcut
    await ctx.answerCbQuery();
});
bot.on('inline_query', async (ctx) => {
    const result = [];
    // Explicit usage
    await ctx.telegram.answerInlineQuery(ctx.inlineQuery.id, result);
  
    // Using context shortcut
    await ctx.answerInlineQuery(result);
});

/*
bot.on('text', async (ctx) => {
    var sendText = `Hello ${ctx.state.role}`;
    // Explicit usage
    // await ctx.telegram.sendMessage(ctx.message.chat.id, sendText);
  
    // Using context shortcut
    await ctx.reply(sendText);
    console.log(`[${clock.consoleTime()}] ${sendText}`);
});
*/

bot.launch();