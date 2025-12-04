import express from "express";
import multer from "multer";
import fs from "fs";
import path from "path";
import bot from "../bot.js";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config();

const router = express.Router();

if (!fs.existsSync(path.join(__dirname, "uploads"))) {
  fs.mkdirSync(path.join(__dirname, "uploads"));
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, "uploads")),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + "-" + file.originalname);
  },
});
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) cb(null, true);
    else cb(new Error("Incorrect MIME-type!"));
  },
});

router.post("/", upload.array("file[]", 6), async (req, res) => {
  const { name, tel, addres, mark, year, miles, transmission, engine, carId } =
    req.body;
  if (!name || name.trim().length < 1) {
    return res
      .status(400)
      .json({ status: "error", errorType: "Missing or empty name" });
  }
  if (!tel || tel.trim().length < 6) {
    return res
      .status(400)
      .json({ status: "error", errorType: "Missing or empty tel" });
  }

  let msgBody = `📩  Новая заявка:\n Имя: ${name}\n Телефон: ${tel}`;
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

  const chatId = process.env.BOT_CHATID;
  if (!chatId) {
    console.error("BOT_CHATID не задан!");
    return res
      .status(500)
      .json({ status: "error", errorType: "ChatId missing" });
  }
  try {
    await bot.sendMessage(chatId, msgBody);
  } catch (err) {
    console.error("Ошибка отправки в Telegram:", err);
    return res.json({
      status: "error",
      errorType: `Telegram API error: ${err}`,
    });
  }

  if (req.files && req.files.length > 0) {
    for (const file of req.files) {
      try {
        await bot.sendPhoto(chatId, fs.createReadStream(file.path));
      } catch (err) {
        console.error("Ошибка при отправке файла:", err);
      } finally {
        if (fs.existsSync(file.path)) {
          try {
            await fs.promises.unlink(file.path);
          } catch (err) {
            console.error("Ошибка удаления файла:", err);
          }
        }
      }
    }
  }

  return res.json({ status: "success" });
});

export default router;
