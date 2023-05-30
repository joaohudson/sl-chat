class Timer{
    #runners
    constructor(){
        this.#runners = new Map();
    }

    run(id, time, call){
        if(this.#runners.has(id)){
            clearTimeout(this.#runners.get(id));
        }
        const runner = setTimeout(() => {
            call();
            this.#runners.delete(id);
        }, time);
        this.#runners.set(id, runner);
    }
}

module.exports = {
    Timer
}