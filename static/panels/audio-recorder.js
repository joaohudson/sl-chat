import { AudioRecorder } from '/record/audio-recorder.js';
import { decode } from '/error/decoder.js';

function formatTime(nanoSeconds){
    const seconds = Math.floor(nanoSeconds / 1000);
    const minutes = Math.floor(seconds / 60);
    return (minutes % 60).toString().padStart(2, '0') + ' : ' + (seconds % 60).toString().padStart(2, '0');
}

class AudioRecorderPanel{
    constructor({div, dictionary, dialogPanel}){
        this.div = div;
        this.dictionary = dictionary;
        this.dialogPanel = dialogPanel;
        this.showing = false;
        this.audioRecorder = new AudioRecorder();
        this.displayAudioRecorder = div.querySelector('#displayAudioRecorder');
        this.audioRecorderSendButton = div.querySelector('#audioRecorderSendButton');
        this.audioRecorderCancelButton = div.querySelector('#audioRecorderCancelButton');
        this.timeAudioRecorder = div.querySelector('#timeAudioRecorder');
    }

    async show(){
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
                this.#onStop();
                res(await this.audioRecorder.complete());
            };
            this.audioRecorderCancelButton.onclick = () => {
                this.audioRecorder.cancel();
                this.#onStop();
                res(null);
            };
        });

        try{
            await this.audioRecorder.record();
            this.#onStart();
            return promise;
        }catch(e){
            const errorMessage = decode(this.dictionary, e);
            await this.dialogPanel.showMessage(errorMessage);
            this.#onStop();
            return null;
        }
    }

    #onStart(){
        this.#runTime();
    }

    #onStop(){
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