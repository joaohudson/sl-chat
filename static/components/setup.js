function getRoomId(){
    return window.location.hash.substr(1);
}

class SetupComponent{
    constructor({div, dictionary, onSetup}){
        this.div = div;
        this.onSetup = onSetup;

        const roomTitleLabel = div.querySelector('#roomTitleLabel');
        roomTitleLabel.innerText = dictionary.RoomTitle;
        const userNameLabel = div.querySelector('#userNameLabel');
        userNameLabel.innerText = dictionary.UserName;

        const roomTitleInput = div.querySelector('#roomTitleInput');
        const nameInput = div.querySelector('#nameInput');
        nameInput.onkeydown = (e) => {
            if(e.key == 'Enter'){
                this.#onLogin(nameInput, roomTitleInput);
            }
        };
        const nameButton = div.querySelector('#nameButton');
        nameButton.onclick = () => {
            this.#onLogin(nameInput, roomTitleInput);
        };

    }

    show(visible){
        this.div.style.display = visible ? 'block' : 'none'; 
    }

    #onLogin(nameInput, roomTitleInput){
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
        this.onSetup(socket);
    }
}

export { SetupComponent }