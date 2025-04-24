// utils/socket.js
let io;

module.exports = {
  init: (socketIO) => {
    io = socketIO;
    return io;
  },
  getIO: () => {
    if (!io) {
      throw new Error("Socket.io not initialized!");
    }
    return io;
  }
}; 