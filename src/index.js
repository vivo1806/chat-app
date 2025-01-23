import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import path from "path";
import { fileURLToPath } from "url";
import { Filter } from "bad-words";
const app = express();
const port = process.env.PORT || 3000;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
import { generateMessage, generateLocationMessage } from "./utils/messages.js";
const localdirec = path.join(__dirname, "../public");
app.use(express.static(localdirec));

const server = createServer(app);
const io = new Server(server);
const filter = new Filter();
const msg = "Welcome!";
io.on("connection", (socket) => {
  console.log("User connected!");
  socket.emit("message", generateMessage(msg));
  socket.broadcast.emit("message", generateMessage("A new user has joined"));

  socket.on("sendMessage", (msg, callback) => {
    const message = filter.clean(msg);
    io.emit("message", generateMessage(message));
    callback();
  });

  socket.on("disconnect", () => {
    io.emit("message", "A user has left the chat");
  });

  socket.on("sendLocation", (url, callback) => {
    console.log("check3");
    io.emit("locationmessage", generateLocationMessage(url));
    console.log("check1");
    callback();
  });
});

server.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
