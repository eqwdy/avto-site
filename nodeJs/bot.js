import TelegramBot from "node-telegram-bot-api";
import dotenv from "dotenv";
dotenv.config();

const token = process.env.BOT_TOKEN;
let bot;
if (!bot) {
  bot = new TelegramBot(token, { polling: true });
}

bot.setMyCommands([
  { command: "getchatid", description: "Получить ID текущего чата" },
]);

bot.on("message", (msg) => {
  if (msg.text === "/getchatid") {
    bot.sendMessage(msg.chat.id, `Chat_ID: ${msg.chat.id}`);
  }
});

export default bot;
