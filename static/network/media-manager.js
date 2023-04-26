//utils
function stringToBinary(string){
    return new Uint8Array(string.split(','));
}

function binaryToString(binary){
    return binary.toString();
}

async function blobToArray(blob){
    return new Uint8Array(await blob.arrayBuffer());
}

const CHUNK_SIZE = 18e5; //1.8MB

class MediaManager{
    constructor(socket, mediaReceiveListener, mediaSendListener, mediaCompleteListener){
        this.medias = new Map();
        this.blobUrls = [];
        this.mediaReceiveListener = mediaReceiveListener;
        this.mediaSendListener = mediaSendListener;
        this.mediaCompleteListener = mediaCompleteListener;
        this.socket = socket;
        this.sendingFile = null;
        this.sendingType = ''; 
        this.sendingIndex = 0;

        socket.on('media', (mediaData) => this.#onMedia(mediaData));
        socket.on('chunk-send', (chunkData) => this.#onChunkSend(chunkData));
        socket.on('disconnect', (message) => this.#onDisconnect(message));
    }

    send(file){
        if(this.#isSending())
            return;

        this.sendingFile = file;
        this.sendingType = file.type;
        this.#send();
    }

    clearUrls(){
        for(const blobUrl of this.blobUrls){
            URL.revokeObjectURL(blobUrl);
        }
        this.blobUrls = [];
    }

    async #onMedia(mediaData){
        const {userId, userName, dataChunk, dataIndex, dataLength, type} = mediaData;
        const media = this.medias[userId] ? this.medias[userId] : this.#newMedia();
        const binaryChunk = stringToBinary(dataChunk);
        media.chunks.push(binaryChunk);
        media.index += binaryChunk.length;
        this.medias[userId] = media;
        const mySelf = this.socket.id == userId;
        this.mediaReceiveListener({
            userId, userName, dataIndex, dataLength, type, mySelf
        });
        if(dataIndex == dataLength){
            const chunks = this.medias[userId].chunks;
            const blob = new Blob(chunks, {type});
            const blobUrl = URL.createObjectURL(blob);
            this.blobUrls.push(blobUrl);
            delete this.medias[userId];
            this.mediaCompleteListener({
                url: blobUrl,
                type, userId, userName, mySelf
            });
        }
    }

    async #onChunkSend(chunkData){
        const {dataIndex, dataLength} = chunkData;
        this.mediaSendListener(chunkData);
        if(dataIndex < dataLength){
            await this.#send();
        }else{
            this.#resetSend();
        }
    }

    #onDisconnect(msg){
        console.log('Disconnect: ', msg);
        this.medias = new Map();
        this.#resetSend();
    }

    #resetSend(){
        this.sendingFile = null;
        this.sendingType = ''; 
        this.sendingIndex = 0;
    }

    #isSending(){
        return this.sendingFile != null;
    }

    async #send(){
        const blob = this.sendingFile.slice(this.sendingIndex, this.sendingIndex + CHUNK_SIZE);
        const chunk = await blobToArray(blob);
        const request = {
            dataChunk: binaryToString(chunk),
            dataIndex: this.sendingIndex,
            dataLength: this.sendingFile.size,
            type: this.sendingType
        };
        this.socket.emit('media', request);
        this.sendingIndex += CHUNK_SIZE;
        if(this.sendingIndex > this.sendingFile.size){
            this.sendingIndex = this.sendingFile.size;
        }
    }

    #newMedia(){
        return {
            index: 0,
            chunks: []
        };
    }
}

export {MediaManager}