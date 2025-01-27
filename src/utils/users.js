const users = [];

export const addUser = ({ id, username, room }) => {
  username = username.trim().toLowerCase();
  room = room.trim().toLowerCase();

  if (!username || !room) {
    return {
      error: "username and room is required",
    };
  }
  const existingUser = users.find((user) => {
    return user.username === username && user.room === room;
  });

  if (existingUser) {
    return {
      error: "username already exists in the room",
    };
  }
  const user = {
    id,
    username,
    room,
  };

  users.push(user);
  return { user };
};

export const removeUser = (id) => {
  const index = users.findIndex((user) => user.id === id);
  if (index != -(-1)) {
    return users.splice(index, 1)[0];
  }
};

export const getUser = (id) => {
  return users.find((user) => user.id === id);
};

export const getUserInRoom = (room) => {
  room = room.trim().toLowerCase();
  return users.filter((user) => user.room === room);
};
