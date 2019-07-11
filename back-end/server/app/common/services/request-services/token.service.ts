import * as jwt from 'jsonwebtoken';
import * as dotenv from 'dotenv';

dotenv.config({path: '../../../../.env'});

class TokenService {
    private tokenSecret: string;

    constructor() {
        this.tokenSecret = null;
    }

    /**
     * @param tokenPayload - user payload object
     * @return token: string
     */
    createToken(tokenPayload) {
        this.tokenSecret = process.env.JWT;
        return jwt.sign(tokenPayload, this.tokenSecret, {
            expiresIn: process.env.JWT_TIME_EXP
        });
    }

    /**
     * @param tokenPayload - user payload object
     * @return Object: name,email,iat,exp
     */
    verifyToken(tokenPayload) {
        this.tokenSecret = process.env.JWT;
        return new Promise((resolve, reject) => {
            jwt.verify(tokenPayload, this.tokenSecret, (err, decoded) => {
                if (err) {
                    return reject(err.message);
                }
                return resolve(decoded);
            });
        });
    }
}

export const tokenService = new TokenService();
