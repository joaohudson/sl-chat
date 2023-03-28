const languages = require('./lang/index.json');

class Dictionary{
    constructor(){
        this.languages = {};
        for(const lang of languages){
            this.languages[lang.name] = require('./lang/' + lang.path);
        }
    }

    get(langs){
        for(const {code} of langs){
            if(this.languages[code]){
                return this.languages[code];
            }
        }

        return this.languages[languages[0].name];
    }
}

module.exports = {
    Dictionary
}