import { MediaManager } from '/network/media-manager.js';

function percent(current, max){
    return Math.floor(current * 100 / max) + '%';
}

class ChatComponent{
    constructor({div, dictionary, h1}){
        this.div = div;
        this.dictionary = dictionary;

        this.messageList = div.querySelector('#messageList');
        this.messageDiv = div.querySelector('#messageDiv');
        this.messageInput = div.querySelector('#messageInput');
        this.messageButton = div.querySelector('#messageButton');
        this.clearChatButton = div.querySelector('#clearChatButton');
        this.mediaInput = div.querySelector('#imageInput');
        this.mediaLabel = div.querySelector('#imageLabel');
        this.roomIdCopyButton = div.querySelector('#roomIdCopyButton');
        this.h1 = h1;
        this.profileNameLabel = div.querySelector('#profileNameLabel');
        this.roomNameLabel = div.querySelector('#roomNameLabel');
        this.mediaElements = new Map();
    }

    show({socket, userName}){
        this.div.style.display = 'block';

        this.h1.innerText = 'Node Chat';
        this.profileNameLabel.innerText = this.dictionary.Profile + ': ' + userName;
        this.roomIdCopyButton.innerText = this.dictionary.roomIdCopy;
        this.messageButton.innerText = this.dictionary.Send;
        this.clearChatButton.innerText = this.dictionary.clearChat;
        this.mediaLabel.innerText = this.dictionary.Media;

        const mediaManager = new MediaManager(socket,
            (data) => this.#onMediaReceive(data), 
            (data) => this.#onMediaSend(data), 
            (data) => this.#onMediaComplete(data));

        socket.on('room-info', (room) => {
            this.#setRoomId(room.id);
            this.roomIdCopyButton.disabled = false;
            this.roomNameLabel.innerText = this.dictionary.Room + ': ' + room.title;
        });

        socket.on('message', async (msg) => {
            const mySocket = msg.id == socket.id; 
            const userColor =  mySocket ? 'darkturquoise' : 'white';
            this.#pushScreenMessage(msg.name, msg.content, userColor, 'orange');
        });

        socket.on('disconnect', () => {
            this.#setSending(false);
        });
        
        socket.on('enterer', (user) => {
            const name = user.id == socket.id ? this.dictionary.You : user.name;
            this.#pushScreenMessage(name, ' ' + this.dictionary.enteredRoom, 'gray', 'gray');
        });

        socket.on('exit', (user) => {
            this.#pushScreenMessage(user.name, ' ' + this.dictionary.hasLeftRoom, 'gray', 'gray');
        });

        socket.on('connect_error', (error) => {
            alert(error);
            location.replace(location.origin);
        });

        this.messageInput.onkeydown = (e) => {
            if(e.key == 'Enter'){
                e.preventDefault();
                this.#sendMessage(socket);
            }
        }
        
        this.messageButton.onclick = () =>{
            this.#sendMessage(socket);
        };

        this.mediaInput.onchange = async () => {
            this.#sendMedia(mediaManager);
        }

        this.clearChatButton.onclick = () => {
            this.messageList.innerText = '';
            mediaManager.clearUrls();
        }

        this.roomIdCopyButton.onclick = () => {
            navigator.clipboard.writeText(window.location.href);
        }
    }

    #sendMessage(socket){
        if(!this.messageInput.value){
            return;
        }
        socket.emit('message', {content: this.messageInput.value});
        this.messageInput.value = '';
    }

    #sendMedia(mediaManager){
        if(!this.mediaInput.files.length){
            return;
        }
        this.#setSending(true);
        const [file] = this.mediaInput.files;
        mediaManager.send(file);
        this.mediaInput.value = '';
    }

    #setSending(sending){
        this.mediaInput.disabled = sending;
        if(sending){
            this.mediaLabel.innerText = '. . .';
        }else{
            this.mediaLabel.innerText = this.dictionary.Media;
        }
    }

    #setRoomId(roomId){
        if(!window.location.href.includes('#')){
            window.location.href += '#' + roomId;
        }
    }

    #onMediaReceive(data){
        const {userId, userName, dataIndex, dataLength, type, mySelf} = data;
        const userColor = mySelf ? 'darkturquoise' : 'white';
        if(dataIndex == 0){
            const message = type + '[0%]';
            const li = this.#pushScreenMessage(userName, message, userColor, userColor);
            this.mediaElements.set(userId, li);
        }else{
            if(!this.mediaElements.has(userId)){
                return;
            }
            const span = this.mediaElements.get(userId).getElementsByTagName('span')[1];
            span.innerText = type + '['+percent(dataIndex, dataLength)+']';
        }
    }

    #onMediaSend(data){
        const {dataIndex, dataLength} = data;
        this.mediaLabel.innerText = percent(dataIndex, dataLength);
        if(dataIndex == dataLength){
            this.#setSending(false);
            this.mediaLabel.innerText = this.dictionary.Media;
        }
    }

    #onMediaComplete(data){
        const {mySelf, userId, userName, url, type} = data;
        const shortType = type.split('/')[0];
        const userColor = mySelf ? 'darkturquoise' : 'white';
        const li = this.mediaElements.get(userId);
        li.innerText = '';
        switch(shortType){
            case 'audio':
                this.#pushAudioMessage(li, userName, url, userColor);
                break;

            case 'image':
                this.#pushImageMessage(li, userName, url, userColor);
                break;

            case 'video':
                this.#pushVideoMessage(li, userName, url, userColor);
                break;
        }
    }

    #pushImageMessage(li, name, url, colorName){
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
        this.messageDiv.scrollTop = this.messageDiv.scrollHeight;
    }
    
    #pushVideoMessage(li, name, url, colorName){
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
        this.messageDiv.scrollTop = messageDiv.scrollHeight;
    }
    
    #pushAudioMessage(li, name, url, colorName){
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
        this.messageDiv.scrollTop = this.messageDiv.scrollHeight;
    }
    
    #pushScreenMessage(name, message, colorName, colorMessage){
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
        this.messageList.appendChild(li);
        this.messageDiv.scrollTop = messageDiv.scrollHeight;
        return li;
    }
}

export { ChatComponent }