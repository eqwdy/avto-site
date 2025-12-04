import TelegramBot from "node-telegram-bot-api";
import dotenv from "dotenv";
dotenv.config();

const token = process.env.BOT_TOKEN;
let bot;
if (!bot) {
  bot = new TelegramBot(token, { polling: true });
}
// const bot = new TelegramBot(token);
// bot.setWebHook("https://xn----82-53dkc5deutityk0kl.xn--p1ai/botApi");

bot.setMyCommands([
  { command: "getchatid", description: "Получить ID текущего чата" },
]);

bot.on("message", (msg) => {
  if (msg.text === "/getchatid") {
    bot.sendMessage(msg.chat.id, `Chat_ID: ${msg.chat.id}`);
  }
});

export default bot;
