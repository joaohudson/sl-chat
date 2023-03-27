const uuid = require('uuid').v4;
const { Message } = require('./message');
const { User } = require('./user')

const ERROR_AUTH = 'Authentication error!';

class Chat{
    constructor(io){
        this.io = io;
        this.rooms = {};
        this.users = {};
        this.io.use((socket, next) => {
            try{
                this.#createUser(socket);
                next();
            }catch(e){
                console.log(e);
                next(e);
            }
        });
        this.io.on('connection', (socket) => this.#onConnection(socket));
    }

    getUsersCount(){
        return Object.keys(this.users).length;
    }

    getRoomCount(){
        return Object.keys(this.rooms).length;
    }

    #createUser(socket){
        let {userName, roomId, roomTitle} = socket.handshake.auth;
        if(!userName){
            throw new Error(ERROR_AUTH);
        }
        if(!roomId){
            roomId = uuid();
            this.rooms[roomId] = {users: {}, title: roomTitle};
        }else if(!this.rooms[roomId]){
            throw new Error(ERROR_AUTH);
        }
        const user = new User(socket, userName, roomId);
        this.users[socket.id] = user;
        this.rooms[roomId].users[socket.id] = user;
    }

    #onConnection(socket){
        console.log('User [' + socket.id + '] connected!');
        socket.on('disconnect', () => this.#onDisconnect(socket));
        socket.on('message', (message) => this.#onMenssage(this.users[socket.id], message));
        
        const user = this.users[socket.id];
        const room = this.rooms[user.roomId];
        socket.emit('room-info', {title: room.title, id: user.roomId});
    }

    #onDisconnect(socket){
        console.log('User [' + socket.id + '] disconnected!');
        const user = this.users[socket.id];
        const roomId = user.roomId;
        const room = this.rooms[roomId];
        for(const id of Object.keys(room.users)){
            const other = room.users[id];
            other.socket.emit('exit', user.name);
        }
        delete this.users[socket.id];
        delete room.users[socket.id];
        if(Object.keys(room.users).length == 0){
            delete this.rooms[roomId];
        }
    }

    #onMenssage(from, message){
        const room = this.rooms[from.roomId];
        for(const id of Object.keys(room.users)){
            const user = this.users[id];
            user.socket.emit('message', new Message(from.socket.id, from.name, message));
        }
    }
}

module.exports = {
    Chat
};