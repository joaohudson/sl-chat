class Room{
    constructor(id, title){
        this.id = id;
        this.title = title;
        this.users = {};
    }

    getUserCount(){
        return Object.keys(this.users).length;
    }

    dto(){
        return {
            id: this.id,
            title: this.title
        }
    }
}

module.exports = {
    Room
}