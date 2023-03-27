const messageList = document.getElementById('messageList');
const messageInput = document.getElementById('messageInput');
const messageButton = document.getElementById('messageButton');
const nameInput = document.getElementById('nameInput');
const nameButton = document.getElementById('nameButton');
const setupDiv = document.getElementById('setupDiv');
const chatDiv = document.getElementById('chatDiv');
const [h1] = document.getElementsByTagName('h1');
const [h2] = document.getElementsByTagName('h2');

const socket = io();

function sendMessage(){
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
    socket.emit('setup', {name: nameInput.value});
    h1.innerText = 'Node Chat';
    h2.innerText = 'Profile: ' + nameInput.value;
    nameInput.value = '';
    setupDiv.style.display = 'none';
    chatDiv.style.display = 'block';
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

socket.on('message', (msg) => {
    const userColor =  msg.id == socket.id ? 'darkturquoise' : 'white';
    pushScreenMessage(msg.name, msg.content, userColor, 'orange');
});

socket.on('exit', (userName) => {
    pushScreenMessage(userName, ' has left room!', 'gray', 'gray');
});

messageInput.onkeydown = (e) => {
    if(e.key == 'Enter'){
        e.preventDefault();
        sendMessage();
    }
}

messageButton.onclick = () =>{
    sendMessage();
};

nameButton.onclick = () => {
    setup();
}

nameInput.onkeydown = (e) => {
    if(e.key == 'Enter'){
        setup();
    }
}