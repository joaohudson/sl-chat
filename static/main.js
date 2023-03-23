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
socket.on('message', (msg) => {
    const li = document.createElement('li');
    li.innerText = msg.name + ' - ' + msg.content;
    messageList.appendChild(li);
});

messageInput.onkeydown = (e) => {
    if(e.key == 'Enter'){
        e.preventDefault();
        socket.emit('message', messageInput.value);
        messageInput.value = '';
    }
}

messageButton.onclick = () =>{
    socket.emit('message', messageInput.value);
    messageInput.value = '';
};

nameButton.onclick = () => {
    socket.emit('setup', {name: nameInput.value});
    h1.innerText = 'Node Chat';
    h2.innerText = 'Profile: ' + nameInput.value;
    nameInput.value = '';
    setupDiv.style.display = 'none';
    chatDiv.style.display = 'block';
}

nameInput.onkeydown = (e) => {
    if(e.key == 'Enter'){
        e.preventDefault();
        socket.emit('setup', {name: nameInput.value});
        h1.innerText = 'Node Chat';
        h2.innerText = 'Profile: ' + nameInput.value;
        nameInput.value = '';
        setupDiv.style.display = 'none';
        chatDiv.style.display = 'block';
    }
}