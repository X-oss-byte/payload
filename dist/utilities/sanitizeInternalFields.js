"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const internalFields = ['__v'];
const sanitizeInternalFields = (incomingDoc) => Object.entries(incomingDoc).reduce((newDoc, [key, val]) => {
    if (key === '_id') {
        return {
            ...newDoc,
            id: val,
        };
    }
    if (internalFields.indexOf(key) > -1) {
        return newDoc;
    }
    return {
        ...newDoc,
        [key]: val,
    };
}, {});
exports.default = sanitizeInternalFields;
//# sourceMappingURL=sanitizeInternalFields.js.map