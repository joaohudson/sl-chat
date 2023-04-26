import { SetupComponent } from "/components/setup.js"
import { ChatComponent } from "/components/chat.js";

(async function(){
    
const [h1] = document.getElementsByTagName('h1');

const dictionaryResponse = await fetch('/api/lang');
if(!dictionaryResponse.ok){
    alert(await dictionaryResponse.text());
    return;
}
const dictionary = await dictionaryResponse.json();

const chatComponent = new ChatComponent({
    div: document.getElementById('chatDiv'),
    h1: h1,
    dictionary: dictionary
});

const setupComponent = new SetupComponent({
    div: document.getElementById('setupDiv'),
    h1: h1,
    dictionary: dictionary,
    nextPage: chatComponent
});

setupComponent.show();

}());
