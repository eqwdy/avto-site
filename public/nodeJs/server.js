import app from "./app.js";

const PORT = process.env.BOT_PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
