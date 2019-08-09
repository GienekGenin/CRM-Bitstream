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
        const token = localStorage.getItem('token.service.js');
        if (token) {
            return jwt.verify(token, this.tokenSecret, (err, decoded) => {
                if (err) {
                    return false;
                }
                return decoded;
            });
        }
        else return false;
    }
}

export const tokenService = new TokenService();

