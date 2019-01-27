import socketIo from 'socket.io';

const socketCore = (socket) => {
  socket.on('disconnect', () => null);
};

let io;
global.io = io;
const socketjs = (server) => {
  io = socketIo.listen(server);
  io.on('connection', socketCore);
};

module.exports = socketjs;
