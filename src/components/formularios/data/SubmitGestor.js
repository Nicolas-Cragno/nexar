import { submitFinViaje } from "./Submits";

const submits = {
    submitFinViaje,
}

export const getSubmitFunction = (firma) => {
    return submits[firma] || null;
};