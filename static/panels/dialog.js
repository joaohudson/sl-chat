class DialogPanel{
    constructor({div, dictionary}){
        this.div = div;
        this.dialogMessageDiv = div.querySelector('#dialogMessageDiv');
        this.dialogButtonDiv = div.querySelector('#dialogButtonDiv');
        this.dictionary = dictionary;
    }

    async showMessage(message){
        this.#showPanel();
        this.#clearPanel();

        this.#buildTextMessage(message);
        const button = this.#buildButton(this.dictionary.Ok);

        return new Promise((res) => {
            button.onclick = () => {
                this.#hidePanel();
                res();
            };
        });
    }

    async showConfirmMessage(message){
        this.#showPanel();
        this.#clearPanel();

        this.#buildTextMessage(message);
        const yesButton = this.#buildButton(this.dictionary.Yes);
        const noButton = this.#buildButton(this.dictionary.No);

        return new Promise((res) => {
            yesButton.onclick = () => {
                this.#hidePanel();
                res(true);
            };
            noButton.onclick = () => {
                this.#hidePanel();
                res(false);
            }
        });
    }

    #buildTextMessage(message){
        const p = document.createElement('p');
        p.classList.add('dialogMessage');
        p.innerText = message;
        this.dialogMessageDiv.appendChild(p);
    }

    #buildButton(buttonText){
        const button = document.createElement('button');
        button.classList.add('dialogButtom');
        button.innerText = buttonText;
        this.dialogButtonDiv.appendChild(button);
        return button;
    }

    #showPanel(){
        this.div.style.display = '';
    }

    #hidePanel(){
        this.div.style.display = 'none';
    }

    #clearPanel(){
        this.dialogButtonDiv.innerText = '';
        this.dialogMessageDiv.innerText = '';
    }
}

export { DialogPanel }