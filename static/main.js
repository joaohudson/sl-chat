const messageList = document.getElementById('messageList');
const messageInput = document.getElementById('messageInput');
const messageButton = document.getElementById('messageButton');

const socket = io();
socket.on('message', (msg) => {
    const li = document.createElement('li');
    li.innerText = msg;
    messageList.appendChild(li);
});

messageButton.onclick = () =>{
    socket.emit('message', messageInput.value);
};