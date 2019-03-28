import {firmConstants} from "../constants/index";

export const firmRequest = () => {
    return { type: firmConstants.FIRMS_GET_REQUEST }
};
