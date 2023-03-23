const express = require('express');
const http = require('http');
const path = require('path');
const {Server} = require('socket.io');
const {Chat} = require('./chat');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const PORT = '8080';

app.use(express.static(path.join(__dirname, 'static')));

const chat = new Chat(io);

server.listen(PORT, () => {
    console.log('Server listening on port: ' + PORT);
});