const express = require('express');
const http = require('http');
const path = require('path');
const acceptLanguageParser = require('accept-language-parser');
const {Server} = require('socket.io');
const {Chat} = require('./chat');
const {Dictionary} = require('./dictionary');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {maxHttpBufferSize: 30e6}); //30MB for messages

const PORT = '8080';

app.use(express.static(path.join(__dirname, 'static')));

const chat = new Chat(io);
const dictionary = new Dictionary();

app.get('/api/user/count', (req, res) => {
    res.send({count: chat.getUsersCount()});
});

app.get('/api/room/count', (req, res) => {
    res.send({count: chat.getRoomCount()});
});

app.get('/api/lang', (req, res) => {
    const languages = acceptLanguageParser.parse(req.headers['accept-language']);
    res.send(dictionary.get(languages));
});

server.listen(PORT, () => {
    console.log('Server listening on port: ' + PORT);
});