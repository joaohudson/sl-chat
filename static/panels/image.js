class ImagePanel{
    constructor({div}){
        this.div = div;
        this.image = div.querySelector('#contentImagePanel');
    }

    show(url){
        this.div.style.display = '';
        this.image.src = url;
        this.image.onclick = () => this.#hide();
        if(this.image.width > this.image.height){
            this.image.style.width = '100%';
            this.image.style.height = 'auto';
        }else{
            this.image.style.width = 'auto';
            this.image.style.height = '100%';
        }
    }

    #hide(){
        this.div.style.display = 'none';
    }
}

export { ImagePanel }