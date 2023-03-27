class User{
    constructor(socket, name, roomId){
        this.socket = socket;
        this.name = name;
        this.roomId = roomId
    }
}

module.exports = {
    User
}