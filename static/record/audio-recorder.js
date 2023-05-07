class AudioRecorder{
    #chunks
    #recorder
    #initTime
    constructor(){
        this.#initTime = 0;
        this.#chunks = [];
        this.#recorder = null;
    }

    async complete(){
        if(!this.#recorder){
            throw new Error('Mutiples completes');
        }
        return new Promise((res) => {
            this.#recorder.onstop = () => {
                res(this.#getData());
                this.#dispose();
            }
            this.#recorder.stop();
        });
    }

    cancel(){
        if(!this.#recorder){
            throw new Error('Mutiples audio recorder!');
        }
        this.#recorder.onstop = () => this.#dispose();
        this.#recorder.stop();
    }

    async record(){
        if(this.#recorder){
            throw new Error('Mutiples audio recorder!');
        }
        this.#recorder = await this.#newAudioRecorder();
        this.#recorder.ondataavailable = ({data}) => this.#receiveData(data);
        this.#recorder.start();
        this.#onStart();
    }

    getTime(){
        if(!this.#recorder){
            throw new Error('Recorder dont playing!');
        }
        return Date.now() - this.#initTime;
    }

    #getData(){
        return new Blob(this.#chunks, {type: 'audio/mp3'});
    }

    #receiveData(data){
        this.#chunks.push(data);
    }

    #onStart(){
        this.#initTime = Date.now();
    }

    #dispose(){
        this.#chunks = [];
        this.#recorder = null;
    }

    async #newAudioRecorder(){
        const stream = await navigator.mediaDevices.getUserMedia({audio: true});
        const recorder = new MediaRecorder(stream);
        return recorder;
    }
}

export { AudioRecorder }