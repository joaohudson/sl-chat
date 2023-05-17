import { errorToTextKey } from "./errors-table.js";

function decode(dictionary, error){
    return dictionary[errorToTextKey[error]] || dictionary.unespectedError;
}

export {decode}