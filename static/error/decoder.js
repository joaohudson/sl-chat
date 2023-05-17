import { errorToTextKey } from "./errors-table.js";

function decode(dictionary, error){
    return dictionary[errorToTextKey[error.message]] || dictionary.unespectedError;
}

export {decode}