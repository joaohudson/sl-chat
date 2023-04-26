class BinaryStringParser{
    #btos
    #stob
    constructor(){
        this.#btos = '!#$%&()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[]^_`abcdefghijklmnopqrstuvwxyz{|}~ͽ¨©®°±´¸º¼½¾¿×ØÞßàáâãäåæçèéêëìíîïðñòóôõö÷øùúûüýþÿĀāĂăĄąĆćĈĉĊċČčĎďĐđĒēĔĕĖėĘęĚěĜĝĞğĠġĢģĤĥĦħĨĩĪīĬĭĮįİıĴĵĶķĸĹĺĻļĽľĿŀŁłŃńŅņŇňŉŌōŎŏŐőŒœŔŕŖŗŘřŚśŜŝŞşŠšŢţŤťŦŧŨũŪūŬŭŮůŰűŲųŴŵŶŷ';
        this.#stob = new Map();
        for(let i = 0; i < this.#btos.length; i++){
            this.#stob.set(this.#btos.charAt(i), i);
        }
    }

    binaryToString(binary){
        const builder = [];
        for(const byte of binary){
            builder.push(this.#btos.charAt(byte));
        }
        return builder.join('');
    }

    stringToBinary(str){
        const bytes = [];
        for(let i = 0; i < str.length; i++){
            bytes.push(this.#stob.get(str.charAt(i)));
        }
        return new Uint8Array(bytes);
    }
}

export { BinaryStringParser }