import * as jwt from 'jsonwebtoken';

class TokenService {
    tokenSecret;

    constructor() {
        this.tokenSecret = null;
    }

    /**
     * @return Object: name,email,iat,exp
     */
    verifyToken() {
        this.tokenSecret = process.env.REACT_APP_JWT;
        const userData = localStorage.getItem('user');
        if (userData) {
            return jwt.verify(JSON.parse(userData).tokenSecret, this.tokenSecret, (err) => {
                if (err) {
                    return false;
                }
                return true;
            });
        } else return false;
    }
}

export const tokenService = new TokenService();

