import {historyService} from '../../services/history.service';
import {postRequest, putRequest} from '../../services/http.service';

const apiBase = process.env.REACT_APP_API_BASE;

const login = (email, password) => {
    const url = `${apiBase}users/login`;
    return postRequest(url, {email, password});
};

const changePass = (payload) => {
    const url = `${apiBase}users/changePass`;
    return putRequest(url, payload);
};

const logout = () => {
    historyService.push('/login');
    localStorage.removeItem('token.service.js');
};

export const userService = {
    login,
    logout,
    changePass
};
