class Timer{
    #runner
    constructor(){
        this.#runner = null;
    }

    run(time, call){
        if(this.#runner){
            clearTimeout(this.#runner);
        }
        this.#runner = setTimeout(() => {
            call();
            this.#runner = null;
        }, time);
    }
}

module.exports = {
    Timer
}