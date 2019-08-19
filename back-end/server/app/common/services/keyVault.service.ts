/* tslint:disable */
const keyVault = require('azure-keyvault');
const AuthenticationContext = require('adal-node').AuthenticationContext;
import {config} from '../../../config';

class EnvVarService {
    private static clientId: string = config.keyVault.config.clientId;
    private static clientSecret: string = config.keyVault.config.clientSecret;
    private static keyVaultURL: string = config.keyVault.config.keyVaultURL;

    authenticatorParams(challenge, callback) {
        // Create a new authentication context.
        const context = new AuthenticationContext(challenge.authorization);
        // Use the context to acquire an authentication token.
        return context.acquireTokenWithClientCredentials(
            challenge.resource,
            EnvVarService.clientId, EnvVarService.clientSecret,
            (err, tokenResponse) => {
                if (err) throw err;
                // Calculate the value to be set in the request's Authorization header and resume the call.
                // tslint:disable-next-line:prefer-template
                const authorizationValue = `${tokenResponse.tokenType} ${tokenResponse.accessToken}`;
                return callback(null, authorizationValue);
            });
    }

    setUpEnvVars() {
        return new Promise((async (resolve, reject) => {
            const authenticator = this.authenticatorParams;

            const credentials = new keyVault.KeyVaultCredentials(authenticator);
            const client = new keyVault.KeyVaultClient(credentials);

            const keyVaultURL = EnvVarService.keyVaultURL;

            const keyNames = config.keyVault.keyNames.db;

            let secretName = keyNames.cs;
            let secretVersion = '';
            await client.getSecret(keyVaultURL, secretName, secretVersion).then((result) => {
                process.env.DB_CS = result.value;
            }).catch(e => reject(e));

            secretName = keyNames.user;
            secretVersion = '';
            await client.getSecret(keyVaultURL, secretName, secretVersion).then((result) => {
                process.env.DB_USER = result.value;
            }).catch(e => reject(e));

            secretName = keyNames.pass;
            secretVersion = '';
            await client.getSecret(keyVaultURL, secretName, secretVersion).then((result) => {
                process.env.DB_PASS = result.value;
            }).catch(e => reject(e));

            resolve(true);
        }))
    }

    setUpIoTHubCS() {
        return new Promise((async (resolve, reject) => {
            const authenticator = this.authenticatorParams;

            const credentials = new keyVault.KeyVaultCredentials(authenticator);
            const client = new keyVault.KeyVaultClient(credentials);

            const keyVaultURL = EnvVarService.keyVaultURL;

            const secretName = config.keyVault.keyNames.iothub.cs;
            const secretVersion = '';
            await client.getSecret(keyVaultURL, secretName, secretVersion).then((result) => {
                process.env.IOTHUB_CONNECTION_STRING = result.value;
                resolve(process.env.IOTHUB_CONNECTION_STRING);
            }).catch(e => reject(e));
        }));
    }

    setUpIoTHubHost() {
        return new Promise((async (resolve, reject) => {
            const authenticator = this.authenticatorParams;

            const credentials = new keyVault.KeyVaultCredentials(authenticator);
            const client = new keyVault.KeyVaultClient(credentials);

            const keyVaultURL = EnvVarService.keyVaultURL;

            const secretName = config.keyVault.keyNames.iothub.host;
            const secretVersion = '';
            await client.getSecret(keyVaultURL, secretName, secretVersion).then((result) => {
                process.env.IOTHUB_HOST_NAME = result.value;
                resolve(process.env.IOTHUB_HOST_NAME);
            }).catch(e => reject(e));
        }));
    }
}

export const envVarService = new EnvVarService();
