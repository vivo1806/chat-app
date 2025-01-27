import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import path from "path";
import { fileURLToPath } from "url";

import { Filter } from "bad-words";
import { addUser, removeUser, getUserInRoom, getUser } from "./utils/users.js";
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
  socket.on("join", (options, callback) => {
    const { error, user } = addUser({ id: socket.id, ...options });

    if (error) {
      return callback(error);
    }
    socket.join(user.room);

    socket.emit("message", generateMessage("Admin", msg));
    socket.broadcast
      .to(user.room)
      .emit(
        "message",
        generateMessage("Admin", `${user.username} has joined!`),
      );
    io.to(user.room).emit("roomData", {
      room: user.room,
      users: getUserInRoom(user.room),
    });

    callback();
  });

  socket.on("sendMessage", (msg, callback) => {
    const user = getUser(socket.id);
    const message = filter.clean(msg);
    io.to(user.room).emit("message", generateMessage(user.username, message));
    callback();
  });

  socket.on("sendLocation", (url, callback) => {
    const user = getUser(socket.id);
    io.to(user.room).emit(
      "locationmessage",
      generateLocationMessage(user.username, url),
    );
    callback();
  });

  //NOTE: user left the chat
  //
  socket.on("disconnect", () => {
    console.log(`Socket disconnected: ${socket.id}`);
    const user = removeUser(socket.id);
    console.log(`Removed user:`, user);

    if (user) {
      console.log(`Broadcasting message to room: ${user.room}`);
      io.to(user.room).emit(
        "message",
        generateMessage("admin", `${user.username} has left the chat!`),
      );

      console.log(`Updating room data for room: ${user.room}`);
      io.to(user.room).emit("roomData", {
        room: user.room,
        users: getUserInRoom(user.room),
      });
    } else {
      console.log("User not found for this socket.");
    }
  });
});

server.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
