class AudioRecorder{
    #chunks
    #recorder
    constructor(){
        this.#chunks = [];
        this.#recorder = null;
    }

    async complete(){
        if(!this.#recorder){
            console.error('Mutiples completes');
            return;
        }
        this.#recorder.addEventListener('dataavailable', ({data}) => {
            this.#onData(data);
        });
        this.#recorder.stop();
        return new Promise((res) => {
            this.#recorder.addEventListener('stop', () => {
                res(this.#onStop());
            });
        });
    }

    cancel(){
        if(!this.#recorder){
            console.error('Mutiples stops');
            return;
        }
        this.#recorder.stop();
        this.#recorder = null;
    }

    async record(){
        if(this.#recorder){
            console.error('Mutiples audio recorder!');
            return;
        }
        this.#recorder = await this.#newAudioRecorder();
        this.#recorder.start();
    }

    #onData(data){
        this.#chunks.push(data);
    }

    #onStop(){
        const blob = new Blob(this.#chunks, {type: 'audio/mp3'});
        this.#chunks = [];
        this.#recorder = null;
        return blob;
    }

    async #newAudioRecorder(){
        const stream = await navigator.mediaDevices.getUserMedia({audio: true});
        const recorder = new MediaRecorder(stream);
        return recorder;
    }
}

export { AudioRecorder }