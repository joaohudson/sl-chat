const {User} = require('./user')

class Chat{
    constructor(io){
        this.io = io;
        this.users = {};
        this.io.on('connection', (socket) => this.#onConnection(socket));
    }

    #onConnection(socket){
        console.log('User [' + socket.id + '] connected!');
        this.users[socket.id] = new User(socket, socket.id);
        socket.on('setup', (message) => this.#onSetup(socket.id, message));
        socket.on('disconnect', () => this.#onDisconnect(socket));
        socket.on('message', (message) => this.#onMenssage(this.users[socket.id], message));
    }

    #onDisconnect(socket){
        console.log('User [' + socket.id + '] disconnected!');
        delete this.users[socket.id];
    }

    #onSetup(id, message){
        this.users[id].name = message.name;
    }

    #onMenssage(from, message){
        for(const id of Object.keys(this.users)){
            const user = this.users[id];
            user.socket.emit('message', '[' + from.name + ']: ' + message);
        }
    }
}

module.exports = {
    Chat
};