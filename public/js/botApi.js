import express from "express";
import cors from "cors";
import multer from "multer";
import TelegramBot from "node-telegram-bot-api";
import helmet from "helmet";
import dotenv from "dotenv";
dotenv.config();

const app = express();
const upload = multer(); // для обработки FormData без файлов

app.use(helmet());
app.use(cors());

const token = process.env.BOT_TOKEN;
const chatId = process.env.BOT_CHATID;
const bot = new TelegramBot(token, { polling: true });
// const bot = new TelegramBot(token);

// принимаем FormData (текстовые поля)
app.post("/botApi", upload.none(), async (req, res) => {
  const { name, tel, addres, mark, year, miles, transmission, engine, carId } =
    req.body;
  if (!name) {
    return res.json({ status: "error", errorType: `Missing field: name` });
  }
  if (!tel) {
    return res.json({ status: "error", errorType: `Missing field: tel` });
  }

  let msgBody = `📩 Новая заявка:\n Имя: ${name}\n Телефон: ${tel}`;
  if (addres) msgBody += `\n Адрес: ${addres}`;
  if (mark) msgBody += `\n Марка и модель автомобиля: ${mark}`;
  if (year) msgBody += `\n Год выпуска: ${year}`;
  if (miles) msgBody += `\n Пробег: ${miles}`;
  if (transmission) msgBody += `\n Коробка передач: ${transmission}`;
  if (engine) msgBody += `\n Тип двигателя: ${engine}`;
  if (carId) msgBody += `\n Государственный номер: ${carId}`;
  const nowDate = new Date();
  const formattedTime = nowDate.toLocaleDateString("ru-RU", {
    timeZone: "Europe/Moscow",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
  msgBody += `\n Время отправки: ${formattedTime}`;

  try {
    await bot.sendMessage(chatId, msgBody);
  } catch (err) {
    console.error("Ошибка отправки в Telegram:", err);
    return res.json({
      status: "error",
      errorType: `Telegram API error: ${err}`,
    });
  }

  return res.json({ status: "success" });
});

const PORT = process.env.BOT_PORT || 3000;
app.listen(PORT, () =>
  console.log(`Server running on http://localhost:${PORT}`)
);
