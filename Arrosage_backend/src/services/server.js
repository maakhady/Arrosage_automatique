const express = require("express");
const cors = require("cors");
const WebSocket = require("ws");
const { SerialPort } = require("serialport");
const { ReadlineParser } = require("@serialport/parser-readline");

const app = express();
const PORT = 3001;

// Middleware
app.use(express.json());
app.use(cors({ origin: "http://localhost:4200" }));

// Configuration du port série pour Ubuntu
const port = new SerialPort({
  path: "/dev/ttyUSB0", // Modifier si nécessaire
  baudRate: 9600,
});
const parser = port.pipe(new ReadlineParser({ delimiter: "\n" }));

// Serveur WebSocket sur le port 8000
const wss = new WebSocket.Server({ port: 8000 });

wss.on("connection", (ws) => {
  console.log("Client connecté");
  ws.send(JSON.stringify({ message: "Connexion WebSocket établie" }));

  ws.on("close", () => {
    console.log("Client déconnecté");
  });
});

// Écouter les touches envoyées par l'Arduino et les transmettre via WebSocket
parser.on("data", (data) => {
  let key = data.trim();
  console.log("Touche reçue:", key);

  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify({ type: "keypad", value: key }));
    }
  });
});

console.log("WebSocket en écoute sur ws://localhost:8000");

// Démarrer le serveur Express
app.listen(PORT, () => console.log(`Serveur Express sur le port ${PORT}`));
