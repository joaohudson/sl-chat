import { SetupScreen } from "/screens/setup.js"
import { ChatScreen } from "/screens/chat.js";

const [h1] = document.getElementsByTagName('h1');

async function main(){
    
    const dictionaryResponse = await fetch('/api/lang');
    if(!dictionaryResponse.ok){
        alert(await dictionaryResponse.text());
        return;
    }
    const dictionary = await dictionaryResponse.json();

    const chatScreen = new ChatScreen({
        div: document.getElementById('chatDiv'),
        h1: h1,
        dictionary: dictionary
    });

    const setupScreen = new SetupScreen({
        div: document.getElementById('setupDiv'),
        h1: h1,
        dictionary: dictionary,
        nextPage: chatScreen
    });

    setupScreen.show();
}

main();