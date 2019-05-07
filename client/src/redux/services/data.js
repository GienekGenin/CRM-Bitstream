const apiBase = process.env.REACT_APP_API_BASE;

const getMinMaxDataTime = (deviceIds) => {
    const token = localStorage.getItem('token');
    const requestOptions = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(deviceIds)
    };

    return fetch(`${apiBase}data/time`, requestOptions)
        .then(handleResponse)
        .then(dates => {
            // store user details and jwt token in local storage to keep user logged in between page refreshes
            return dates;
        })
};

const getData  = (body) => {
    const token = localStorage.getItem('token');
    const requestOptions = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(body)
    };

    return fetch(`${apiBase}data/selected`, requestOptions)
        .then(handleResponse)
        .then(data => {
            // store user details and jwt token in local storage to keep user logged in between page refreshes
            return data;
        })
};

const getDevicesWithData  = (body) => {
    const token = localStorage.getItem('token');
    const requestOptions = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(body)
    };

    return fetch(`${apiBase}data/selected/withData`, requestOptions)
        .then(handleResponse)
        .then(data => {
            // store user details and jwt token in local storage to keep user logged in between page refreshes
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

export const dataService = {
    getMinMaxDataTime,
    getData,
    getDevicesWithData
};
