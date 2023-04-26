class SetupComponent{
    constructor({div, dictionary, roomId, nextPage}){
        this.div = div;
        this.roomId = roomId;
        this.nextPage = nextPage;
        this.dictionary = dictionary;

        this.roomTitleLabel = div.querySelector('#roomTitleLabel');
        this.userNameLabel = div.querySelector('#userNameLabel');
        this.roomTitleInput = div.querySelector('#roomTitleInput');
        this.nameInput = div.querySelector('#nameInput');
        this.nameButton = div.querySelector('#nameButton');
        this.createRoomDiv = document.getElementById('createRoomDiv');
    }

    show(){
        this.div.style.display = 'block';

        this.nameButton.onclick = () => {
            this.#onLogin(this.nameInput, this.roomTitleInput);
        };
        this.roomTitleLabel.innerText = this.dictionary.RoomTitle;
        this.userNameLabel.innerText = this.dictionary.UserName;
        this.nameInput.onkeydown = (e) => {
            if(e.key == 'Enter'){
                this.#onLogin(this.nameInput, this.roomTitleInput);
            }
        };
        this.createRoomDiv.hidden = this.roomId;
    }

    #hide(){
        this.div.style.display = 'none';
    }

    #onLogin(nameInput, roomTitleInput){
        if(!nameInput.value){
            return;
        }
        const createRoom = !this.roomId;
        const loginRequest = {userName: nameInput.value};
        if(createRoom){
            if(!roomTitleInput.value){
                return;
            }
            loginRequest.roomTitle = roomTitleInput.value;
        }else{
            loginRequest.roomId = this.roomId;
        }
        const socket = io({auth: loginRequest});
        this.#hide();
        this.nextPage.show({socket, userName: this.nameInput.value});
    }
}

export { SetupComponent }