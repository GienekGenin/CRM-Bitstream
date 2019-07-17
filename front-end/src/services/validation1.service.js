
export const validateField = (fieldName, value, _this) => {

    let isValid = false;

    switch (fieldName) {
        case 'email':
            const pattern = new RegExp(/^(([^<>()\]\\.,;:\s@"]+(\.[^<>()\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3})|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/);
            isValid =  pattern.test(value);
            break;
        case 'password':
            isValid = value.length >= 5;
            break;
        case 'tel':
            isValid = value.length >= 3;
            break;
        case 'address':
            isValid = value.length >= 5;
            break;
        case 'nip':
            isValid = value.length >= 6;
            break;
        default:
            break;
    }

    _this.setState({[`${fieldName}Valid`]: isValid}, () => _this.validateForm());

};
