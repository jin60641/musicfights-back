import socketIo from 'socket.io';

import { authMws } from './middlewares';
import { tokenSecret } from '../config';

const socketCore = (socket) => {
  socket.on('disconnect', () => null);
};

let io;
global.io = io;

const connectSocket = (server) => {
  io = socketIo.listen(server);
  io.use(async (socket, next) => {
    const { token = '' } = socket.handshake.query;
    const user = await authMws.checkToken(token, tokenSecret);
    if (!user) {
      next(new Error('invalid token'));
    }
    socket.user = user;
    next();
  });
  io.on('connection', socketCore);
};

export default connectSocket;
