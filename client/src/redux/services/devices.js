const apiBase = 'http://10.0.0.118:5000/api/';

const getUserDevices = (userId) => {
    const token = localStorage.getItem('token');
    const requestOptions = {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        }
    };

    return fetch(`${apiBase}users/devices/${userId}`, requestOptions)
        .then(handleResponse)
        .then(devices => {
            // store user details and jwt token in local storage to keep user logged in between page refreshes
            return devices;
        })
};

const getFirmDevices = (firmId) => {
    const token = localStorage.getItem('token');
    const requestOptions = {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        }
    };

    return fetch(`${apiBase}firms/devices/${firmId}`, requestOptions)
        .then(handleResponse)
        .then(devices => {
            // store user details and jwt token in local storage to keep user logged in between page refreshes
            return devices;
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

export const devicesService = {
    getUserDevices,
    getFirmDevices
};
