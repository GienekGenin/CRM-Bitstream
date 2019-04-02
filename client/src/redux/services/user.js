const apiBase = 'http://localhost:5000/api/';

const getAllByFirmId = (firmId) => {
    const token = localStorage.getItem('token');
    const requestOptions = {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        }
    };

    return fetch(`${apiBase}users/${firmId}`, requestOptions)
        .then(handleResponse)
        .then(users => {
            // store user details and jwt token in local storage to keep user logged in between page refreshes
            return users;
        })
};

const addUser = (user) => {
    const token = localStorage.getItem('token');
    const requestOptions = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(user)
    };


    return fetch(`${apiBase}users/`, requestOptions)
        .then(handleResponse)
        .then(user => {
            return user;
        })
};

const deleteUser = (email) => {
    const token = localStorage.getItem('token');
    const requestOptions = {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({email})
    };
    return fetch(`${apiBase}users`, requestOptions)
        .then(handleResponse)
        .then(() => {
            return email;
        })
};

const updateUser = (payload) => {
    const token = localStorage.getItem('token');
    const requestOptions = {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
    };

    return fetch(`${apiBase}users`, requestOptions)
        .then(handleResponse)
        .then(user => {
            return user;
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

export const userService = {
    getAllByFirmId,
    addUser,
    deleteUser,
    updateUser
};