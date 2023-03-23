class Chat{
    constructor(io){
        this.io = io;
        this.users = {};
        this.io.on('connection', (socket) => this.#onConnection(socket));
    }

    #onConnection(socket){
        console.log('User [' + socket.id + '] connected!');
        this.users[socket.id] = socket;
        socket.on('disconnect', () => this.#onDisconnect(socket));
        socket.on('message', (message) => this.#onMenssage(message));
    }

    #onDisconnect(socket){
        console.log('User [' + socket.id + '] disconnected!');
        delete this.users[socket.id];
    }

    #onMenssage(message){
        for(const id of Object.keys(this.users)){
            const user = this.users[id];
            user.emit('message', message);
        }
    }
}

module.exports = {
    Chat
};