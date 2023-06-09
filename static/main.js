import { SetupScreen } from "/screens/setup.js"
import { ChatScreen } from "/screens/chat.js";
import { LoadingPanel } from "/panels/loading-panel.js";
import { DialogPanel } from "/panels/dialog.js";
import { AudioRecorderPanel } from "/panels/audio-recorder.js";
import { ImagePanel } from "/panels/image.js";

const [h1] = document.getElementsByTagName('h1');

async function fetchDictionary(){
    const dictionaryResponse = await fetch('/api/lang');
    if(!dictionaryResponse.ok){
        throw await dictionaryResponse.text();
    }
    return await dictionaryResponse.json();
}

async function main(){

    try{
        const dictionary = await fetchDictionary();

        const dialogPanel = new DialogPanel({
            div: document.getElementById('dialogPanelDiv'),
            dictionary: dictionary
        });

        const loadingPanel = new LoadingPanel({
            div: document.getElementById('loadingPanelDiv')
        });
        loadingPanel.hide();

        const audioRecorderPanel = new AudioRecorderPanel({
            div: document.getElementById('audioRecorderPanelDiv'),
            dictionary: dictionary,
            dialogPanel: dialogPanel
        });

        const imagePanel = new ImagePanel({
            div: document.getElementById('imagePanelDiv')
        });

        const chatScreen = new ChatScreen({
            div: document.getElementById('chatDiv'),
            h1: h1,
            loadingPanel: loadingPanel,
            dialogPanel: dialogPanel,
            dictionary: dictionary,
            audioRecorderPanel: audioRecorderPanel,
            imagePanel: imagePanel
        });

        const setupScreen = new SetupScreen({
            div: document.getElementById('setupDiv'),
            h1: h1,
            loadingPanel: loadingPanel,
            dictionary: dictionary,
            nextPage: chatScreen
        });

        setupScreen.show();
    } catch (e) {
        alert(e);
    }
}

main();