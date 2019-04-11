const apiBase = process.env.REACT_APP_API_BASE;

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

const addDevice = (device) => {
    const token = localStorage.getItem('token');
    const requestOptions = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(device)
    };


    return fetch(`${apiBase}devices/`, requestOptions)
        .then(handleResponse)
        .then(user => {
            return user;
        })
};

const deleteDevice = (deviceId) => {
    const token = localStorage.getItem('token');
    const requestOptions = {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({sid: deviceId})
    };
    return fetch(`${apiBase}devices`, requestOptions)
        .then(handleResponse)
        .then(() => {
            return deviceId;
        })
};

const updateDeviceUsers = (payload) => {
    const token = localStorage.getItem('token');
    const requestOptions = {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
    };
    return fetch(`${apiBase}devices/users`, requestOptions)
        .then(handleResponse)
        .then(devices => {
            return devices;
        })
};

const updateDevice = (payload) => {
    const token = localStorage.getItem('token');
    const requestOptions = {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
    };
    return fetch(`${apiBase}devices`, requestOptions)
        .then(handleResponse)
        .then(device => {
            return device;
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
    getFirmDevices,
    addDevice,
    deleteDevice,
    updateDeviceUsers,
    updateDevice
};
