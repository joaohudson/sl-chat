const express = require('express');
const http = require('http');
const path = require('path');
const acceptLanguageParser = require('accept-language-parser');
const {Server} = require('socket.io');
const {Chat} = require('./chat');
const {Translator} = require('./translator');
const {maxHttpBufferSize, port} = require('./config.json');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {maxHttpBufferSize});

app.use(express.static(path.join(__dirname, 'static')));

const chat = new Chat(io);
const translator = new Translator();

app.get('/api/user/count', (req, res) => {
    res.send({count: chat.getUsersCount()});
});

app.get('/api/room/count', (req, res) => {
    res.send({count: chat.getRoomCount()});
});

app.get('/api/lang', (req, res) => {
    const languages = acceptLanguageParser.parse(req.headers['accept-language']);
    res.send(translator.get(languages));
});

server.listen(port, () => {
    console.log('Server listening on port: ' + port);
});