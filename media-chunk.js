class MediaChunk{
    constructor(userId, userName, dataChunk, dataIndex, dataLength, type){
        this.userId = userId;
        this.userName = userName;
        this.dataChunk = dataChunk;
        this.dataIndex = dataIndex;
        this.dataLength = dataLength;
        this.type = type;
    }
}

module.exports = {
    MediaChunk
}