import * as dotenv from 'dotenv';

dotenv.config();

export const config = {
    server: {
        port: process.env.PORT
    },

    keyVault: {
        keyNames: {
            db: {
                user: process.env.DB_USER_KEY,
                pass: process.env.DB_PASS_KEY,
                cs: process.env.DB_CS_KEY
            },
            iothub: {
                cs: process.env.IOTHUB_CS_KEY,
                host: process.env.IOTHUB_HOST_KEY
            },
            token: {
                key: process.env.JWT_KEY
            }
        },
        config: {
            clientId: process.env.clientId,
            clientSecret: process.env.clientSecret,
            keyVaultURL: process.env.keyVaultURL
        }
    }
};

