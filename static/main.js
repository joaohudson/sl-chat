(async function(){

const messageList = document.getElementById('messageList');
const messageDiv = document.getElementById('messageDiv');
const messageInput = document.getElementById('messageInput');
const messageButton = document.getElementById('messageButton');
const nameInput = document.getElementById('nameInput');
const nameButton = document.getElementById('nameButton');
const roomIdInput = document.getElementById('roomIdInput');
const roomTitleInput = document.getElementById('roomTitleInput');
const setupDiv = document.getElementById('setupDiv');
const chatDiv = document.getElementById('chatDiv');
const [h1] = document.getElementsByTagName('h1');
const roomIdCopyButton = document.getElementById('roomIdCopyButton');
const createRoomCheckbox = document.getElementById('createRoomCheckbox');
const createRoomDiv = document.getElementById('createRoomDiv');
const loginRoomDiv = document.getElementById('loginRoomDiv');
const createRoomLabel = document.getElementById('createRoomLabel');
const roomTitleLabel = document.getElementById('roomTitleLabel');
const userNameLabel = document.getElementById('userNameLabel');
const roomIdInputLabel = document.getElementById('roomIdInputLabel');
const profileNameLabel = document.getElementById('profileNameLabel');
const roomNameLabel = document.getElementById('roomNameLabel');
const clearChatButton = document.getElementById('clearChatButton');
const mediaInput = document.getElementById('imageInput');
const imageLabel = document.getElementById('imageLabel');

const dictionaryResponse = await fetch('/api/lang');
if(!dictionaryResponse.ok){
    alert(await dictionaryResponse.text());
    return;
}
const dictionary = await dictionaryResponse.json();

//setup page
h1.innerText = dictionary.Setup;
createRoomLabel.innerText = dictionary.CreateRoom;
roomTitleLabel.innerText = dictionary.RoomTitle;
roomIdCopyButton.innerText = dictionary.roomIdCopy;
userNameLabel.innerText = dictionary.UserName;
roomIdInputLabel.innerText = dictionary.RoomId;
messageButton.innerText = dictionary.Send;
clearChatButton.innerText = dictionary.clearChat;
imageLabel.innerText = dictionary.Media;

//state
let roomId;

function sendMessage(socket){
    if(!messageInput.value){
        return;
    }
    setSending(true);
    socket.emit('message', {content: messageInput.value, type: 'text'});
    messageInput.value = '';
}

async function sendMedia(socket){
    if(!mediaInput.files.length){
        return;
    }
    setSending(true);
    const [file] = mediaInput.files;
    const imageData = await readFile(file);
    const [type] = file.type.split('/');
    socket.emit('message', {content: imageData, type});
    mediaInput.value = '';
}

function setup(){
    if(!nameInput.value){
        return;
    }
    const createRoom = createRoomCheckbox.checked;
    const loginRequest = {userName: nameInput.value};
    if(createRoom){
        if(!roomTitleInput.value){
            return;
        }
        loginRequest.roomTitle = roomTitleInput.value;
    }else{
        if(!roomIdInput.value){
            return;
        }
        loginRequest.roomId = roomIdInput.value;
    }
    
    const socket = io({auth: loginRequest});
    h1.innerText = 'Node Chat';
    profileNameLabel.innerText = dictionary.Profile + ': ' + nameInput.value;
    nameInput.value = '';
    setupDiv.style.display = 'none';
    chatDiv.style.display = 'block';

    socket.on('room-info', (room) => {
        roomId = room.id;
        roomIdCopyButton.disabled = false;
        roomNameLabel.innerText = dictionary.Room + ': ' + room.title;
    });

    socket.on('message', async (msg) => {
        const mySocket = msg.id = socket.id; 
        if(mySocket){
            setSending(false);
        }
        const userColor =  mySocket ? 'darkturquoise' : 'white';
        switch(msg.type){
            case 'image':
                await pushImageMessage(msg.name, msg.content, userColor);
                break;

            case 'video':
                await pushVideoMessage(msg.name, msg.content, userColor);
                break;

            case 'audio':
                await pushAudioMessage(msg.name, msg.content, userColor);
                break;

            case 'text':
                pushScreenMessage(msg.name, msg.content, userColor, 'orange');
                break;
        }
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
        if(!isSending() && e.key == 'Enter'){
            e.preventDefault();
            sendMessage(socket);
        }
    }
    
    messageButton.onclick = () =>{
        sendMessage(socket);
    };

    mediaInput.onchange = async () => {
        await sendMedia(socket);
    }
}

async function pushImageMessage(name, base64, colorName){
    const li = document.createElement('li');
    const nameSpan = document.createElement('span');
    nameSpan.className = 'message';
    nameSpan.style.color = colorName;
    nameSpan.innerText = name + ': ';
    li.appendChild(nameSpan);
    const imgDiv = document.createElement('div');
    const img = document.createElement('img');
    img.className = 'imageMessage';
    img.src = await base64ToBlobUrl(base64);
    imgDiv.appendChild(img);
    li.appendChild(imgDiv);
    messageList.appendChild(li);
    messageDiv.scrollTop = messageDiv.scrollHeight;
}

async function pushVideoMessage(name, base64, colorName){
    const li = document.createElement('li');
    const nameSpan = document.createElement('span');
    nameSpan.className = 'message';
    nameSpan.style.color = colorName;
    nameSpan.innerText = name + ': ';
    li.appendChild(nameSpan);
    const videoDiv = document.createElement('div');
    const video = document.createElement('video');
    video.className = 'imageMessage';
    video.controls = true;
    video.src = await base64ToBlobUrl(base64);
    videoDiv.appendChild(video);
    li.appendChild(videoDiv);
    messageList.appendChild(li);
    messageDiv.scrollTop = messageDiv.scrollHeight;
}

async function pushAudioMessage(name, base64, colorName){
    const li = document.createElement('li');
    const nameSpan = document.createElement('span');
    nameSpan.className = 'message';
    nameSpan.style.color = colorName;
    nameSpan.innerText = name + ': ';
    li.appendChild(nameSpan);
    const audioSpan = document.createElement('span');
    const audio = document.createElement('audio');
    audio.className = 'audioMessage';
    audio.controls = true;
    audio.src = await base64ToBlobUrl(base64);
    audioSpan.appendChild(audio);
    li.appendChild(audioSpan);
    messageList.appendChild(li);
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
}

function isSending(){
    return messageButton.enabled;
}

function setSending(sending){
    messageButton.disabled = sending;
    mediaInput.disabled = sending;
    if(sending){
        messageButton.innerText = '...';
        imageLabel.innerText = '...';
    }else{
        messageButton.innerText = dictionary.Send;
        imageLabel.innerText = dictionary.Media;
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

createRoomCheckbox.onclick = () => {
    const create = createRoomCheckbox.checked;
    if(create){
        createRoomDiv.style.display = 'block';
        loginRoomDiv.style.display = 'none';
    }else{
        createRoomDiv.style.display = 'none';
        loginRoomDiv.style.display = 'block';
    }
}

roomIdCopyButton.onclick = () => {
    navigator.clipboard.writeText(roomId);
}

clearChatButton.onclick = () => {
    messageList.innerText = '';
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

}());