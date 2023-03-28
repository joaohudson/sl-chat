(async function(){

const messageList = document.getElementById('messageList');
const messageInput = document.getElementById('messageInput');
const messageButton = document.getElementById('messageButton');
const nameInput = document.getElementById('nameInput');
const nameButton = document.getElementById('nameButton');
const roomIdInput = document.getElementById('roomIdInput');
const roomTitleInput = document.getElementById('roomTitleInput');
const setupDiv = document.getElementById('setupDiv');
const chatDiv = document.getElementById('chatDiv');
const [h1] = document.getElementsByTagName('h1');
const [h2] = document.getElementsByTagName('h2');
const [h3] = document.getElementsByTagName('h3');
const roomIdLabel = document.getElementById('roomIdLabel');
const createRoomCheckbox = document.getElementById('createRoomCheckbox');
const createRoomDiv = document.getElementById('createRoomDiv');
const loginRoomDiv = document.getElementById('loginRoomDiv');
const createRoomLabel = document.getElementById('createRoomLabel');
const roomTitleLabel = document.getElementById('roomTitleLabel');
const userNameLabel = document.getElementById('userNameLabel');
const roomIdInputLabel = document.getElementById('roomIdInputLabel');

const dictionaryResponse = await fetch('/api/lang');
if(!dictionaryResponse.ok){
    alert(await dictionaryResponse.text());
    return;
}
const dictionary = await dictionaryResponse.json();

//setup page
h1.innerText = dictionary.Setup;
roomIdLabel.title = dictionary.roomIdTooltip;
createRoomLabel.innerText = dictionary.CreateRoom;
roomTitleLabel.innerText = dictionary.RoomTitle;
userNameLabel.innerText = dictionary.UserName;
roomIdInputLabel.innerText = dictionary.RoomId;
messageButton.innerText = dictionary.Send;

//state
let roomId;

function sendMessage(socket){
    if(!messageInput.value){
        return;
    }
    socket.emit('message', messageInput.value);
    messageInput.value = '';
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
    h2.innerText = dictionary.Profile + ': ' + nameInput.value;
    nameInput.value = '';
    setupDiv.style.display = 'none';
    chatDiv.style.display = 'block';

    socket.on('room-info', (room) => {
        roomId = room.id;
        roomIdLabel.innerText = 'ID: ' + room.id;
        h3.innerText = dictionary.Room + ': ' + room.title;
    });

    socket.on('message', (msg) => {
        const userColor =  msg.id == socket.id ? 'darkturquoise' : 'white';
        pushScreenMessage(msg.name, msg.content, userColor, 'orange');
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
}

function pushScreenMessage(name, message, colorName, colorMessage){
    const li = document.createElement('li');
    const nameSpan = document.createElement('span');
    nameSpan.style.color = colorName;
    nameSpan.innerText = name + ': ';
    li.appendChild(nameSpan);
    const messageSpan = document.createElement('span');
    messageSpan.style.color = colorMessage;
    messageSpan.innerText = message;
    li.appendChild(messageSpan);
    messageList.appendChild(li);
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

roomIdLabel.onclick = () => {
    navigator.clipboard.writeText(roomId);
}

}());