class LoadingPanel{
    constructor({div}){
        this.div = div;
    }

    show(){
        this.div.style.display = 'flex';
    }

    hide(){
        this.div.style.display = 'none';
    }
}

export { LoadingPanel }