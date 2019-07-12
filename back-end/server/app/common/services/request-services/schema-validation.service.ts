import * as Ajv from 'ajv';

/**
 * @param obj: Object - object to validate
 * @param schema: Object - object schema
 * @return Array: errors || null
 */
export const validate = (obj, schema) => {
    const ajv = new Ajv({allErrors: true});
    const testObj = ajv.compile(schema);
    testObj(obj);
    return testObj.errors;
};
