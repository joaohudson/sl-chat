class User{
    constructor(socket, name, roomId){
        this.socket = socket;
        this.name = name;
        this.roomId = roomId
    }

    dto(){
        return {
            id: this.socket.id,
            name: this.name,
            roomId: this.roomId,
        }
    }
}

module.exports = {
    User
}