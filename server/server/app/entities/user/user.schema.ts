class UsersSchema {
    /* tslint:disable */
    emailPattern = /^((([a-z]|\d|[!#$%&'*+\-/=?^_`{|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#$%&'*+\-/=?^_`{|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))$/i;
    /* tslint:enable */
    namePattern = /^[a-zA-Z0-9_ ]{1,100}$/i;

    passwordPattern = /^(((?=.*[a-z])(?=.*[A-Z]))|((?=.*[a-z])(?=.*[0-9]))|((?=.*[A-Z])(?=.*[0-9])))(?=.{6,})/;

    userSchema = {
        type: 'object',
        additionalProperties: true,
        required: ['name','surname','role_id','firm_id', 'email', 'password', 'tel'],
        properties: {
            name: {
                type: 'string',
                maxLength: 100,
                pattern: this.namePattern.source
            },
            surname: {
                type: 'string',
                maxLength: 100,
                pattern: this.namePattern.source
            },
            role_id: {
                type: 'string',
                maxLength: 24
            },
            firm_id: {
                type: 'string',
                maxLength: 24
            },
            email: {
                type: 'string',
                pattern: this.emailPattern.source
            },
            password: {
                type: 'string',
                minLength: 5,
                pattern: this.passwordPattern.source
            },
            tel: {
                type: 'string'
            },
        },
        errorMessage: 'Incorrect email or password'
    };

    loginSchema = {
        type: 'object',
        additionalProperties: true,
        required: ['email', 'password'],
        properties: {
            email: {
                type: 'string',
                pattern: this.emailPattern.source
            },
            password: {
                type: 'string',
                minLength: 5
            }
        },
        errorMessage: 'Incorrect email or password'
    };

    changePassSchema = {
        type: 'object',
        additionalProperties: true,
        required: ['email', 'password'],
        properties: {
            email: {
                type: 'string',
                pattern: this.emailPattern.source
            },
            password: {
                type: 'string',
                minLength: 5
            },
            newPassword: {
                type: 'string',
                minLength: 5,
                pattern: this.passwordPattern.source
            }
        },
        errorMessage: 'Incorrect email or password'
    };
}

export const userSchemaService = new UsersSchema();
