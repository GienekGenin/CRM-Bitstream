export const errorParser = (err) => {
    let errorPayload = '';
    if (typeof err === 'string') {
        errorPayload = err;
    }
    else if (err[0]) {
        err.forEach((e, i) => errorPayload += `${i + 1}) ${e.message}.\n`)
    }
    else errorPayload = err.message;
    return errorPayload;
};

export const postRequest = (url, body) => {
    const token = localStorage.getItem('token.service.js');
    const requestOptions = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(body)
    };

    return customFetch(url, requestOptions);
};

export const getRequest = (url) => {
    const token = localStorage.getItem('token.service.js');
    const requestOptions = {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        }
    };
    return customFetch(url, requestOptions)
};

export const putRequest = (url, body) => {
    const token = localStorage.getItem('token.service.js');
    const requestOptions = {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(body)
    };
    return customFetch(url, requestOptions)
};

export const deleteRequest = (url, body) => {
    const token = localStorage.getItem('token.service.js');
    const requestOptions = {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(body)
    };
    return customFetch(url, requestOptions)
};

const customFetch = (url, requestOptions) => {
    return fetch(url, requestOptions)
        .then(handleResponse)
        .then(data => {
            return data;
        })
};

const handleResponse = (response) => {
    return response.text().then(text => {
        const data = text && JSON.parse(text);
        if (!data.isSuccess) {
            if (response.status === 401) {
                // auto logout if 401 response returned from api
                window.location.reload(true);
            }
            const error = data.errors;
            return Promise.reject(error);
        }
        return data.payload;
    });
};
