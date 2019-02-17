import express from 'express';
import bodyParser from 'body-parser';
import http from 'http';

import socket from './socket';
import route from './route';

import { tokenSecret } from './config';

const app = express();
const port = process.env.PORT || 3333;

app.set('jwt-secret', tokenSecret);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true,
}));

app.use(route);

const server = http.createServer(app);
socket(server);

server.listen(port, () => {
  console.log(`listen on ${port}`);
});

module.exports = server;
