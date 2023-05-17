class ImagePanel{
    constructor({div}){
        this.div = div;
        this.image = div.querySelector('#contentImagePanel');
    }

    show(url){
        this.div.style.display = '';
        this.image.src = url;
        this.image.onclick = () => this.#hide();
    }

    #hide(){
        this.div.style.display = 'none';
    }
}

export { ImagePanel }