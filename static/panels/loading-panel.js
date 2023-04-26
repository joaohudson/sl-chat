class LoadingPanel{
    constructor({div}){
        this.div = div;
    }

    show(){
        this.div.style.display = 'block';
    }

    hide(){
        this.div.style.display = 'none';
    }
}

export { LoadingPanel }