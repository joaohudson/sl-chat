import { ILLEGAL_STATE_ERROR, MICROPHONE_ACCESS_ERROR } from "/error/errors.js";

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
            throw new Error(ILLEGAL_STATE_ERROR);
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
            return;
        }
        this.#recorder.onstop = () => this.#dispose();
        this.#recorder.stop();
    }

    async record(){
        if(this.#recorder){
            throw new Error(ILLEGAL_STATE_ERROR);
        }
        this.#recorder = await this.#newAudioRecorder();
        this.#recorder.ondataavailable = ({data}) => this.#receiveData(data);
        this.#recorder.start();
        this.#onStart();
    }

    getTime(){
        if(!this.#recorder){
            throw new Error(ILLEGAL_STATE_ERROR);
        }
        return Date.now() - this.#initTime;
    }

    #getData(){
        const type = this.#chunks.length ? this.#chunks[0].type : 'audio/mp3';
        return new Blob(this.#chunks, {type});
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
        try{
            const stream = await navigator.mediaDevices.getUserMedia({audio: true});
            const recorder = new MediaRecorder(stream);
            return recorder;
        }catch(e){
            throw new Error(MICROPHONE_ACCESS_ERROR);
        }
    }
}

export { AudioRecorder }