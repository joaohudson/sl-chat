(async function(){

const messageList = document.getElementById('messageList');
const messageDiv = document.getElementById('messageDiv');
const messageInput = document.getElementById('messageInput');
const messageButton = document.getElementById('messageButton');
const nameInput = document.getElementById('nameInput');
const nameButton = document.getElementById('nameButton');
const roomTitleInput = document.getElementById('roomTitleInput');
const setupDiv = document.getElementById('setupDiv');
const chatDiv = document.getElementById('chatDiv');
const [h1] = document.getElementsByTagName('h1');
const roomIdCopyButton = document.getElementById('roomIdCopyButton');
const roomTitleLabel = document.getElementById('roomTitleLabel');
const createRoomDiv = document.getElementById('createRoomDiv');
const userNameLabel = document.getElementById('userNameLabel');
const profileNameLabel = document.getElementById('profileNameLabel');
const roomNameLabel = document.getElementById('roomNameLabel');
const clearChatButton = document.getElementById('clearChatButton');
const mediaInput = document.getElementById('imageInput');
const mediaLabel = document.getElementById('imageLabel');

const dictionaryResponse = await fetch('/api/lang');
if(!dictionaryResponse.ok){
    alert(await dictionaryResponse.text());
    return;
}
const dictionary = await dictionaryResponse.json();

//setup page
h1.innerText = dictionary.Setup;
roomTitleLabel.innerText = dictionary.RoomTitle;
roomIdCopyButton.innerText = dictionary.roomIdCopy;
userNameLabel.innerText = dictionary.UserName;
messageButton.innerText = dictionary.Send;
clearChatButton.innerText = dictionary.clearChat;
mediaLabel.innerText = dictionary.Media;

//utils
function percent(current, max){
    return Math.floor(current * 100 / max) + '%';
}

//state
const mediaElements = new Map();

function sendMessage(socket){
    if(!messageInput.value){
        return;
    }
    socket.emit('message', {content: messageInput.value});
    messageInput.value = '';
}

async function sendMedia(mediaManager){
    if(!mediaInput.files.length){
        return;
    }
    setSending(true);
    const [file] = mediaInput.files;
    mediaManager.send(file);
    mediaInput.value = '';
}

function onMediaReceive(data){
    const {userId, userName, dataIndex, dataLength, type, mySelf} = data;
    const userColor = mySelf ? 'darkturquoise' : 'white';
    if(dataIndex == 0){
        const message = type + '[0%]';
        const li = pushScreenMessage(userName, message, userColor, userColor);
        mediaElements[userId] = li;
    }else{
        if(!mediaElements[userId]){
            return;
        }
        const span = mediaElements[userId].getElementsByTagName('span')[1];
        span.innerText = type + '['+percent(dataIndex, dataLength)+']';
    }
}

function onMediaSend(data){
    const {dataIndex, dataLength} = data;
    mediaLabel.innerText = percent(dataIndex, dataLength);
    if(dataIndex == dataLength){
        setSending(false);
        mediaLabel.innerText = dictionary.Media;
    }
}

async function onMediaComplete(data){
    const {mySelf, userId, userName, url, type} = data;
    const shortType = type.split('/')[0];
    const userColor = mySelf ? 'darkturquoise' : 'white';
    const li = mediaElements[userId];
    li.innerText = '';
    switch(shortType){
        case 'audio':
            pushAudioMessage(li, userName, url, userColor);
            break;

        case 'image':
            pushImageMessage(li, userName, url, userColor);
            break;

        case 'video':
            pushVideoMessage(li, userName, url, userColor);
            break;
    }
}

function getRoomId(){
    return window.location.hash.substr(1);
}

function setRoomId(roomId){
    if(!window.location.href.includes('#')){
        window.location.href += '#' + roomId;
    }
}

function setup(){
    if(!nameInput.value){
        return;
    }
    const roomId = getRoomId();
    const createRoom = !roomId;
    const loginRequest = {userName: nameInput.value};
    if(createRoom){
        if(!roomTitleInput.value){
            return;
        }
        loginRequest.roomTitle = roomTitleInput.value;
    }else{
        loginRequest.roomId = roomId;
    }
    
    const socket = io({auth: loginRequest});
    h1.innerText = 'Node Chat';
    profileNameLabel.innerText = dictionary.Profile + ': ' + nameInput.value;
    nameInput.value = '';
    setupDiv.style.display = 'none';
    chatDiv.style.display = 'block';

    const mediaManager = new MediaManager(socket, onMediaReceive, onMediaSend, onMediaComplete);

    socket.on('room-info', (room) => {
        setRoomId(room.id);
        roomIdCopyButton.disabled = false;
        roomNameLabel.innerText = dictionary.Room + ': ' + room.title;
    });

    socket.on('message', async (msg) => {
        const mySocket = msg.id = socket.id; 
        const userColor =  mySocket ? 'darkturquoise' : 'white';
        pushScreenMessage(msg.name, msg.content, userColor, 'orange');
    });

    socket.on('disconnect', () => {
        setSending(false);
    });
    
    socket.on('enterer', (user) => {
        const name = user.id == socket.id ? dictionary.You : user.name;
        pushScreenMessage(name, ' ' + dictionary.enteredRoom, 'gray', 'gray');
    });

    socket.on('exit', (user) => {
        pushScreenMessage(user.name, ' ' + dictionary.hasLeftRoom, 'gray', 'gray');
    });

    socket.on('connect_error', (error) => {
        alert(error);
        location.replace(location.origin);
    });

    messageInput.onkeydown = (e) => {
        if(e.key == 'Enter'){
            e.preventDefault();
            sendMessage(socket);
        }
    }
    
    messageButton.onclick = () =>{
        sendMessage(socket);
    };

    mediaInput.onchange = async () => {
        await sendMedia(mediaManager);
    }

    clearChatButton.onclick = () => {
        messageList.innerText = '';
        mediaManager.clearUrls();
    }
}

function pushImageMessage(li, name, url, colorName){
    const nameSpan = document.createElement('span');
    nameSpan.className = 'message';
    nameSpan.style.color = colorName;
    nameSpan.innerText = name + ': ';
    li.appendChild(nameSpan);
    const imgDiv = document.createElement('div');
    const img = document.createElement('img');
    img.className = 'imageMessage';
    img.src = url;
    imgDiv.appendChild(img);
    li.appendChild(imgDiv);
    messageDiv.scrollTop = messageDiv.scrollHeight;
}

function pushVideoMessage(li, name, url, colorName){
    const nameSpan = document.createElement('span');
    nameSpan.className = 'message';
    nameSpan.style.color = colorName;
    nameSpan.innerText = name + ': ';
    li.appendChild(nameSpan);
    const videoDiv = document.createElement('div');
    const video = document.createElement('video');
    video.className = 'imageMessage';
    video.controls = true;
    video.src = url;
    videoDiv.appendChild(video);
    li.appendChild(videoDiv);
    messageDiv.scrollTop = messageDiv.scrollHeight;
}

function pushAudioMessage(li, name, url, colorName){
    const nameSpan = document.createElement('span');
    nameSpan.className = 'message';
    nameSpan.style.color = colorName;
    nameSpan.innerText = name + ': ';
    li.appendChild(nameSpan);
    const audioSpan = document.createElement('span');
    const audio = document.createElement('audio');
    audio.className = 'audioMessage';
    audio.controls = true;
    audio.src = url;
    audioSpan.appendChild(audio);
    li.appendChild(audioSpan);
    messageDiv.scrollTop = messageDiv.scrollHeight;
}

function pushScreenMessage(name, message, colorName, colorMessage){
    const li = document.createElement('li');
    const nameSpan = document.createElement('span');
    nameSpan.className = 'message';
    nameSpan.style.color = colorName;
    nameSpan.innerText = name + ': ';
    li.appendChild(nameSpan);
    const messageSpan = document.createElement('span');
    messageSpan.className = 'message';
    messageSpan.style.color = colorMessage;
    messageSpan.innerText = message;
    li.appendChild(messageSpan);
    messageList.appendChild(li);
    messageDiv.scrollTop = messageDiv.scrollHeight;
    return li;
}

function setSending(sending){
    mediaInput.disabled = sending;
    if(sending){
        mediaLabel.innerText = '. . .';
    }else{
        mediaLabel.innerText = dictionary.Media;
    }
}

nameButton.onclick = () => {
    setup();
}

nameInput.onkeydown = (e) => {
    if(e.key == 'Enter'){
        setup();
    }
}

roomIdCopyButton.onclick = () => {
    navigator.clipboard.writeText(window.location.href);
}

//start
if(getRoomId()){
    createRoomDiv.hidden = true;
}

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

}());
