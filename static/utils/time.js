class Time{
    static async delay(time){
        return new Promise((res) => setTimeout(res, time));
    }
}

export { Time }