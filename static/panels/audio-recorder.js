import { AudioRecorder } from '/record/audio-recorder.js';

function formatTime(nanoSeconds){
    const seconds = Math.floor(nanoSeconds / 1000);
    const minutes = Math.floor(seconds / 60);
    return (minutes % 60).toString().padStart(2, '0') + ' : ' + (seconds % 60).toString().padStart(2, '0');
}

class AudioRecorderPanel{
    constructor({div, dictionary}){
        this.div = div;
        this.dictionary = dictionary;
        this.showing = false;
        this.audioRecorder = new AudioRecorder();
        this.displayAudioRecorder = div.querySelector('#displayAudioRecorder');
        this.audioRecorderSendButton = div.querySelector('#audioRecorderSendButton');
        this.audioRecorderCancelButton = div.querySelector('#audioRecorderCancelButton');
        this.timeAudioRecorder = div.querySelector('#timeAudioRecorder');
    }

    async show(){
        try{
            return await this.#show();
        }catch(e){
            this.#stop();
            throw e;
        }
    }

    async #show(){
        if(this.showing){
            return;
        }
        this.showing = true;
        this.div.style.display = '';
        
        this.displayAudioRecorder.innerText = this.dictionary.Recording;
        this.audioRecorderSendButton.innerText = this.dictionary.Send;
        this.audioRecorderCancelButton.innerText = this.dictionary.Cancel;

        this.#resetTime();

        const promise = new Promise((res) => {
            this.audioRecorderSendButton.onclick = async () => {
                this.#stop();
                res(await this.audioRecorder.complete());
            };
            this.audioRecorderCancelButton.onclick = () => {
                this.audioRecorder.cancel();
                this.#stop();
                res(null);
            };
        });

        await this.audioRecorder.record();
        this.#start();
        return promise;
    }

    #start(){
        this.#runTime();
    }

    #stop(){
        clearInterval(this.timeInterval);
        this.#hide();
        this.#resetTime();
        this.showing = false;
    }

    #resetTime(){
        this.timeAudioRecorder.innerText = '00 : 00';
    }

    #runTime(){
        this.timeInterval = setInterval(() => {
            this.timeAudioRecorder.innerText = formatTime(this.audioRecorder.getTime());
        }, 1000);
    }

    #hide(){
        this.div.style.display = 'none';
    }
}

export { AudioRecorderPanel }