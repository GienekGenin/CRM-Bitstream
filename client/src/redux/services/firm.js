const apiBase = 'http://10.0.0.118:5000/api/';

const getAll = () => {
    const token = localStorage.getItem('token');
    const requestOptions = {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        }
    };

    return fetch(`${apiBase}firms`, requestOptions)
        .then(handleResponse)
        .then(firms => {
            // store user details and jwt token in local storage to keep user logged in between page refreshes
            return firms;
        })
};

const addFirm = (firm) => {
    const token = localStorage.getItem('token');
    const requestOptions = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(firm)
    };


    return fetch(`${apiBase}firms/`, requestOptions)
        .then(handleResponse)
        .then(firm => {
            return firm;
        })
};

const deleteFirm = (firmId) => {
    const token = localStorage.getItem('token');
    const requestOptions = {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        }
    };
    return fetch(`${apiBase}firms/${firmId}`, requestOptions)
        .then(handleResponse)
        .then(() => {
            return firmId;
        })
};

const updateFirm = (payload) => {
    const token = localStorage.getItem('token');
    const requestOptions = {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
    };

    return fetch(`${apiBase}firms`, requestOptions)
        .then(handleResponse)
        .then(firm => {
            return firm;
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
    getAll,
    addFirm,
    deleteFirm,
    updateFirm
};
