import {history} from "./history";
import {postRequest} from "./common";

const apiBase = process.env.REACT_APP_API_BASE;

const login = (email, password) => {
    const url = `${apiBase}users/login`;
    return postRequest(url, {email, password});
};

const changePass = (payload) => {
    const url = `${apiBase}users/changePass`;
    return postRequest(url, payload);
};

const logout = () => {
    history.push('/login');
    localStorage.removeItem('token');
};

export const userService = {
    login,
    logout,
    changePass
};
