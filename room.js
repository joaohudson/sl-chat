class Room{
    constructor(id, title){
        this.id = id;
        this.title = title;
        this.users = {};
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