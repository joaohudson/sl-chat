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
        this.audioButton = div.querySelector('#audioButton');
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
        this.messageButton.innerText = this.dictionary.Send;
        this.audioButton.innerText = this.dictionary.Audio;
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
            this.#pushTextMessage(msg.name, msg.content, userColor, 'orange');
        });

        socket.on('disconnect', () => {
            this.#setSending(false);
        });
        
        socket.on('enterer', (user) => {
            const name = user.id == socket.id ? this.dictionary.You : user.name;
            this.#pushTextMessage(name, ' ' + this.dictionary.enteredRoom, 'gray', 'gray');
        });

        socket.on('exit', (user) => {
            this.#pushTextMessage(user.name, ' ' + this.dictionary.hasLeftRoom, 'gray', 'gray');
        });

        socket.on('connect_error', async (error) => {
            await this.dialogPanel.showMessage(error);
            location.replace(location.origin);
        });

        this.messageInput.onkeydown = (e) => {
            if(e.key == 'Enter' && this.messageInput.value){
                e.preventDefault();
                this.#sendMessage(socket);
            }
        }

        this.messageInput.oninput = () => this.#updateSendButtton();
        
        this.messageButton.onclick = () => this.#sendMessage(socket);

        this.audioButton.onclick = () => this.#sendAudio(mediaManager);

        this.mediaInput.onchange = async () => this.#sendMedia(mediaManager);

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

    #updateSendButtton(){
        if(this.messageInput.value) {
            this.messageButton.style.display = '';
            this.audioButton.style.display = 'none';
        } else{
            this.messageButton.style.display = 'none';
            this.audioButton.style.display = '';
        }
    }

    #clearMessageInput(){
        this.messageInput.value = '';
        this.#updateSendButtton();
    }

    async #sendAudio(mediaManager){
        const blob = await this.audioRecorderPanel.show();
        if(blob){
            mediaManager.send(blob);
        }
    }

    async #sendMessage(socket){
        socket.emit('message', {content: this.messageInput.value});
        this.#clearMessageInput();
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
            const li = this.#pushTextMessage(userName, message, userColor, userColor);
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
        const userColor = mySelf ? 'darkturquoise' : 'white';
        const li = this.mediaElements.get(userId);
        li.innerText = '';
        this.#pushMediaMessage(li, userName, url, userColor, type);
    }

    #onMediaCancel(userId){
        if(this.mediaElements.has(userId)){
            this.mediaElements.get(userId).remove();
            this.mediaElements.delete(userId);
        }
        this.mediaButton.innerText = this.dictionary.Media;
    }

    #pushMediaMessage(li, name, src, colorName, type){
        const nameSpan = document.createElement('span');
        nameSpan.classList.add('message');
        nameSpan.style.color = colorName;
        nameSpan.innerText = name + ': ';
        li.appendChild(nameSpan);
        const mediaDiv = document.createElement('div');
        const media = this.#buildMediaElement(type, src);
        mediaDiv.appendChild(media);
        li.appendChild(mediaDiv);
        this.messageDiv.scrollTop = this.messageDiv.scrollHeight;
    }
    
    #pushTextMessage(name, message, colorName, colorMessage){
        const li = document.createElement('li');
        const nameSpan = document.createElement('span');
        nameSpan.classList.add('message');
        nameSpan.style.color = colorName;
        nameSpan.innerText = name + ': ';
        li.appendChild(nameSpan);
        const messageSpan = document.createElement('span');
        messageSpan.classList.add('message');
        messageSpan.style.color = colorMessage;
        messageSpan.innerText = message;
        li.appendChild(messageSpan);
        this.messageList.appendChild(li);
        this.messageDiv.scrollTop = messageDiv.scrollHeight;
        return li;
    }

    #buildMediaElement(type, src){
        const [shortType] = type.split('/');
        switch(shortType){
            case 'audio':
                return this.#buildAudioElement(src);
            case 'video':
                return this.#buildVideoElement(src);
            case 'image':
                return this.#buildImageElement(src);
            default:
                return this.#buildFileElement(src, type);
        }
    }

    #buildAudioElement(src){
        const audio = document.createElement('audio');
        audio.volume = 1;
        audio.classList.add('audioMessage');
        audio.controls = true;
        audio.src = src;
        return audio;
    }

    #buildVideoElement(src){
        const video = document.createElement('video');
        video.classList.add('imageMessage');
        video.controls = true;
        video.src = src;
        return video;
    }

    #buildImageElement(src){
        const img = document.createElement('img');
        img.classList.add('imageMessage');
        img.src = src;
        return img;
    }

    #buildFileElement(src){
        const a = document.createElement('a');
        a.classList.add('fileMessage');
        a.href = src;
        a.download = Date.now();
        a.innerText = this.dictionary.DownloadFile;
        return a;
    }
}

export { ChatScreen }