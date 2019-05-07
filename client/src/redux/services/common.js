export const errorParser = (err) => {
    let errorPayload = '';
    if(typeof err === 'string'){
        errorPayload = err;
    } else if (err[0]) {
        err.forEach((e, i) => errorPayload += `${i + 1}) ${e.message}.\n`)
    } else errorPayload = err.message;
    return errorPayload;
};
