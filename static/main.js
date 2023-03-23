const messageList = document.getElementById('messageList');
const messageInput = document.getElementById('messageInput');
const messageButton = document.getElementById('messageButton');

const socket = io();
socket.on('message', (msg) => {
    const li = document.createElement('li');
    li.innerText = msg;
    messageList.appendChild(li);
});


messageInput.onkeydown = (e) => {
    if(e.key == 'Enter'){
        e.preventDefault();
        socket.emit('message', messageInput.value);
    }
}

messageButton.onclick = () =>{
    socket.emit('message', messageInput.value);
};