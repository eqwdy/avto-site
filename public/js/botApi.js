import express from "express";
import cors from "cors";
import multer from "multer";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import TelegramBot from "node-telegram-bot-api";
import helmet from "helmet";
import dotenv from "dotenv";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config();

const app = express();
app.use(helmet());
app.use(cors());

if (!fs.existsSync(path.join(__dirname, "uploads"))) {
  fs.mkdirSync(path.join(__dirname, "uploads"));
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, "uploads/")),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + "-" + file.originalname);
  },
});
const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) cb(null, true);
    else cb(new Error("Incorrect MIME-type!"));
  },
});

app.use((err, req, res, next) => {
  return res.status(400).json({ status: "error", errorType: err.message });
});

const token = process.env.BOT_TOKEN;
const chatId = process.env.BOT_CHATID;
const bot = new TelegramBot(token, { polling: true });
bot.setMyCommands([
  { command: "getchatid", description: "Получить ID текущего чата" },
]);
bot.on("message", (msg) => {
  if (msg.text === "/getchatid") {
    bot.sendMessage(msg.chat.id, `Chat_ID: ${msg.chat.id}`);
  }
});
// const bot = new TelegramBot(token);

app.post("/botApi", upload.array("file[]", 6), async (req, res) => {
  const { name, tel, addres, mark, year, miles, transmission, engine, carId } =
    req.body;
  if (!name) {
    return res
      .status(400)
      .json({ status: "error", errorType: `Missing field: name` });
  }
  if (!tel) {
    return res
      .status(400)
      .json({ status: "error", errorType: `Missing field: tel` });
  }

  let msgBody = `📩 Новая заявка:\n Имя: ${name}\n Телефон: ${tel}`;
  if (addres) msgBody += `\n Адрес: ${addres}`;
  if (mark) msgBody += `\n Марка и модель автомобиля: ${mark}`;
  if (year) msgBody += `\n Год выпуска: ${year}`;
  if (miles) msgBody += `\n Пробег: ${miles}`;
  const transmissions = {
    auto: "Автоматическая",
    mechanical: "Механическая",
    gibrid: "Гибридная",
  };
  if (transmission) {
    const transmissionType = transmissions[transmission] || "Что-то не так";
    msgBody += `\n Коробка передач: ${transmissionType}`;
  }
  const engineTypes = {
    benzin: "Бензиновый",
    diesel: "Дизельный",
    gaz: "Газовый",
    gibrid: "Гибридный",
    electro: "Электро",
  };
  if (engine) {
    const engineType = engineTypes[engine] || engine;
    msgBody += `\n Тип двигателя: ${engineType}`;
  }
  if (carId) msgBody += `\n Государственный номер: ${carId}`;
  const nowDate = new Date();
  const formattedTime = nowDate.toLocaleString("ru-RU", {
    timeZone: "Europe/Moscow",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
  msgBody += `\n Время отправки: ${formattedTime}`;

  try {
    await bot.sendMessage(chatId, msgBody);

    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const maxFileSize = 5 * 1024 * 1024;
        if (file.size > maxFileSize) {
          return res.status(400).json({
            status: "error",
            errorType: "File size is too large",
          });
        }
        await bot.sendPhoto(chatId, fs.createReadStream(file.path));

        try {
          await fs.promises.unlink(file.path);
        } catch (err) {
          console.error("Ошибка удаления файла:", err);
          return res.json({
            status: "error",
            errorType: "Error in deleting file",
          });
        }
      }
    }
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
