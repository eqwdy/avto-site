import app from "./app.js";

const PORT = process.env.BOT_PORT || 3000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});
