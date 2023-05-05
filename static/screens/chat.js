import { MediaManager } from '/network/media-manager.js';
import { Time } from "/utils/time.js";

function percent(current, max){
    return Math.floor(current * 100 / max) + '%';
}

class ChatScreen{
    constructor({div, dictionary, h1, loadingPanel, dialogPanel, audioRecorderPanel}){
        this.div = div;
        this.dictionary = dictionary;

        this.loadingPanel = loadingPanel;
        this.dialogPanel = dialogPanel;
        this.audioRecorderPanel = audioRecorderPanel;
        this.messageList = div.querySelector('#messageList');
        this.messageDiv = div.querySelector('#messageDiv');
        this.messageInput = div.querySelector('#messageInput');
        this.messageButton = div.querySelector('#messageButton');
        this.clearChatButton = div.querySelector('#clearChatButton');
        this.mediaInput = div.querySelector('#imageInput');
        this.mediaButton = div.querySelector('#mediaButton');
        this.roomLinkCopyButtom = div.querySelector('#roomLinkCopyButtom');
        this.h1 = h1;
        this.profileNameLabel = div.querySelector('#profileNameLabel');
        this.roomNameLabel = div.querySelector('#roomNameLabel');
        this.mediaElements = new Map();
    }

    show({socket, userName}){
        this.div.style.display = 'block';

        this.h1.innerText = 'Node Chat';
        this.profileNameLabel.innerText = this.dictionary.Profile + ': ' + userName;
        this.roomLinkCopyButtom.innerText = this.dictionary.roomLinkCopy;
        this.messageButton.innerText = this.dictionary.Audio;
        this.clearChatButton.innerText = this.dictionary.clearChat;
        this.mediaButton.innerText = this.dictionary.Media;

        const mediaManager = new MediaManager(socket,
            (data) => this.#onMediaReceive(data), 
            (data) => this.#onMediaSend(data), 
            (data) => this.#onMediaComplete(data),
            (userId) => this.#onMediaCancel(userId));

        socket.on('room-info', (room) => {
            this.#setRoomId(room.id);
            this.roomLinkCopyButtom.disabled = false;
            this.roomNameLabel.innerText = this.dictionary.Room + ': ' + room.title;
            this.loadingPanel.hide();
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

        socket.on('connect_error', async (error) => {
            await this.dialogPanel.showMessage(error);
            location.replace(location.origin);
        });

        this.messageInput.onkeydown = (e) => {
            if(e.key == 'Enter'){
                e.preventDefault();
                this.#sendMessage(socket, mediaManager);
            }
        }

        this.messageInput.onkeydown = () => {
            this.messageButton.innerText = this.messageInput.value ? this.dictionary.Send : this.dictionary.Audio;
        }
        
        this.messageButton.onclick = () =>{
            this.#sendMessage(socket, mediaManager);
        };

        this.mediaInput.onchange = async () => {
            this.#sendMedia(mediaManager);
        }

        this.mediaButton.onclick = async () => {
            if(mediaManager.isSending()){
                if(await this.dialogPanel.showConfirmMessage(this.dictionary.confirmMediaCancel)){
                    mediaManager.cancel();
                }
            }else{
                this.mediaInput.click();
            }
        }

        this.clearChatButton.onclick = async () => {
            if(await this.dialogPanel.showConfirmMessage(this.dictionary.confirmMessageClearChat)){
                this.messageList.innerText = '';
                mediaManager.clearUrls();
            }
        }

        this.roomLinkCopyButtom.onclick = async () => {
            navigator.clipboard.writeText(window.location.href);
            this.roomLinkCopyButtom.disabled = true;
            this.roomLinkCopyButtom.innerText = this.dictionary.roomLinkCopied;
            await Time.delay(3000);
            this.roomLinkCopyButtom.disabled = false;
            this.roomLinkCopyButtom.innerText = this.dictionary.roomLinkCopy;
        }
    }

    async #sendMessage(socket, mediaManager){
        if(!this.messageInput.value){//audio messgae
            const blob = await this.audioRecorderPanel.show();
            if(blob){
                mediaManager.send(blob);
            }
        }else{//text message
            socket.emit('message', {content: this.messageInput.value});
            this.messageInput.value = '';
        }
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
        if(sending){
            this.mediaButton.innerText = '. . .';
        }else{
            this.mediaButton.innerText = this.dictionary.Media;
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
        this.mediaButton.innerText = percent(dataIndex, dataLength);
        if(dataIndex == dataLength){
            this.#setSending(false);
            this.mediaButton.innerText = this.dictionary.Media;
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

    #onMediaCancel(userId){
        if(this.mediaElements.has(userId)){
            this.mediaElements.get(userId).remove();
            this.mediaElements.delete(userId);
        }
        this.mediaButton.innerText = this.dictionary.Media;
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

export { ChatScreen }