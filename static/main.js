import { SetupComponent } from "/components/setup.js"
import { ChatComponent } from "/components/chat.js";

(async function(){

const messageButton = document.getElementById('messageButton');
const [h1] = document.getElementsByTagName('h1');
const roomIdCopyButton = document.getElementById('roomIdCopyButton');
const clearChatButton = document.getElementById('clearChatButton');
const mediaLabel = document.getElementById('imageLabel');

const dictionaryResponse = await fetch('/api/lang');
if(!dictionaryResponse.ok){
    alert(await dictionaryResponse.text());
    return;
}
const dictionary = await dictionaryResponse.json();

const chatComponent = new ChatComponent({
    div: document.getElementById('chatDiv'),
    dictionary: dictionary
});

const setupComponent = new SetupComponent({
    div: document.getElementById('setupDiv'),
    dictionary: dictionary,
    nextPage: chatComponent
});

//setup page
h1.innerText = dictionary.Setup;
roomIdCopyButton.innerText = dictionary.roomIdCopy;
messageButton.innerText = dictionary.Send;
clearChatButton.innerText = dictionary.clearChat;
mediaLabel.innerText = dictionary.Media;

setupComponent.show();

}());
