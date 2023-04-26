class SetupScreen{
    constructor({div, h1, loadingPanel, dictionary, nextPage}){
        this.div = div;
        this.roomId = window.location.hash.substr(1);;
        this.nextPage = nextPage;
        this.dictionary = dictionary;

        this.h1 = h1;
        this.loadingPanel = loadingPanel;
        this.roomTitleLabel = div.querySelector('#roomTitleLabel');
        this.userNameLabel = div.querySelector('#userNameLabel');
        this.roomTitleInput = div.querySelector('#roomTitleInput');
        this.nameInput = div.querySelector('#nameInput');
        this.nameButton = div.querySelector('#nameButton');
        this.createRoomDiv = div.querySelector('#createRoomDiv');
    }

    show(){
        this.div.style.display = 'block';

        this.h1.innerText = this.dictionary.Setup;

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
        this.loadingPanel.show();
        this.nextPage.show({socket, userName: this.nameInput.value});
    }
}

export { SetupScreen }