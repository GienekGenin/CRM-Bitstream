const apiBase = 'http://localhost:5000/api/';

const getAll = () => {
    const token = JSON.parse(localStorage.getItem('user')).tokenSecret;
    const requestOptions = {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        }
    };

    return fetch(`${apiBase}firms`, requestOptions)
        .then(handleResponse)
        .then(meters => {
            // store user details and jwt token in local storage to keep user logged in between page refreshes
            return meters;
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

export const firmService = {
    getAll
};
