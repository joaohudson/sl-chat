import { AudioRecorder } from '/record/audio-recorder.js';

class AudioRecorderPanel{
    constructor({div, dictionary}){
        this.div = div;
        this.dictionary = dictionary;
        this.audioRecorder = new AudioRecorder();
        this.displayAudioRecorder = div.querySelector('#displayAudioRecorder');
        this.audioRecorderSendButton = div.querySelector('#audioRecorderSendButton');
        this.audioRecorderCancelButton = div.querySelector('#audioRecorderCancelButton');
    }

    async show(){
        this.div.style.display = '';
        
        this.displayAudioRecorder.innerText = this.dictionary.Recording;
        this.audioRecorderSendButton.innerText = this.dictionary.Send;
        this.audioRecorderCancelButton.innerText = this.dictionary.Cancel;

        const promise = new Promise((res) => {
            this.audioRecorderSendButton.onclick = async () => {
                this.#hide();
                res(await this.audioRecorder.complete());
            };
            this.audioRecorderCancelButton.onclick = () => {
                this.audioRecorder.cancel();
                this.#hide();
                res(null);
            };
        });

        await this.audioRecorder.record();

        return promise;
    }

    #hide(){
        this.div.style.display = 'none';
    }
}

export { AudioRecorderPanel }