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
    const imageData = await readFile(file);
    const [type] = file.type.split('/');
    mediaManager.send(imageData, type);
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
    const userColor = mySelf ? 'darkturquoise' : 'white';
    const li = mediaElements[userId];
    li.innerText = '';
    switch(type){
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
        location.reload();
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

async function readFile(file){
    const reader = new FileReader();
    const promise = new Promise((res, rej) => {
        reader.onloadend = () => {
            res(reader.result);
        };
        reader.onerror = (error) => {
            rej(error);
        }
    });
    reader.readAsDataURL(file);
    return promise;
}

async function base64ToBlobUrl(base64){
    const blob = await base64ToBlob(base64);
    return URL.createObjectURL(blob);
}

async function base64ToBlob(base64){
    const response = await fetch(base64);
    if(!response.ok){
        throw new Error(await response.text());
    }
    return await response.blob();
}

//start
if(getRoomId()){
    createRoomDiv.hidden = true;
}

const CHUNK_SIZE = 2e5;

class MediaManager{
    constructor(socket, mediaReceiveListener, mediaSendListener, mediaCompleteListener){
        this.medias = new Map();
        this.blobUrls = [];
        this.mediaReceiveListener = mediaReceiveListener;
        this.mediaSendListener = mediaSendListener;
        this.mediaCompleteListener = mediaCompleteListener;
        this.socket = socket;
        this.sendingBase64 = '';
        this.sendingType = ''; 
        this.sendingIndex = 0;

        socket.on('media', (mediaData) => this.#onMedia(mediaData));
        socket.on('chunk-send', (chunkData) => this.#onChunkSend(chunkData));
    }

    send(base64, type){
        if(this.#isSending())
            return;

        this.sendingBase64 = base64;
        this.sendingType = type;
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
        media.data += dataChunk;
        media.index += dataChunk.length;
        this.medias[userId] = media;
        const mySelf = this.socket.id == userId;
        this.mediaReceiveListener({
            userId, userName, dataIndex, dataLength, type, mySelf
        });
        if(dataIndex == dataLength){
            const base64 = this.medias[userId].data;
            const blobUrl = await base64ToBlobUrl(base64);
            this.blobUrls.push(blobUrl);
            delete this.medias[userId];
            this.mediaCompleteListener({
                url: blobUrl,
                type, userId, userName, mySelf
            });
        }
    }

    #onChunkSend(chunkData){
        const {dataIndex, dataLength} = chunkData;
        this.mediaSendListener(chunkData);
        if(dataIndex < dataLength){
            this.#send();
        }else{
            this.sendingBase64 = '';
            this.sendingIndex = 0;
            this.sendingType = '';
        }
    }

    #isSending(){
        return this.sendingBase64 != '';
    }

    #send(){
        const chunk = this.sendingBase64.substr(this.sendingIndex, CHUNK_SIZE);
        this.socket.emit('media', {
            dataChunk: chunk,
            dataIndex: this.sendingIndex,
            dataLength: this.sendingBase64.length,
            type: this.sendingType
        });
        this.sendingIndex += CHUNK_SIZE;
        if(this.sendingIndex > this.sendingBase64.length){
            this.sendingIndex = this.sendingBase64.length;
        }
    }

    #newMedia(){
        return {
            data: '',
            index: 0
        };
    }
}

}());
