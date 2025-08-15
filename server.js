const express = require("express");
const app = express();

// Ruta principal (por si quieres dejarla como estaba)
app.get("/", (req, res) => {
  res.send("Bot activo");
});

// Ruta para pings desde Render
app.get("/renderping", (req, res) => {
  console.log(`[${new Date().toISOString()}] Ping recibido desde Render`);
  res.status(200).send("Ping OK desde Render");
});

// Ruta para pings desde UptimeRobot
app.get("/uptimeping", (req, res) => {
  console.log(`[${new Date().toISOString()}] Ping recibido desde UptimeRobot`);
  res.status(200).send("Ping OK desde UptimeRobot");
});

// Escuchar en el puerto asignado por Replit
app.listen(process.env.PORT || 3000, () => {
  console.log("Servidor web encendido");
});
