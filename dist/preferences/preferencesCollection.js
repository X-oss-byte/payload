"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const findOne_1 = __importDefault(require("./requestHandlers/findOne"));
const update_1 = __importDefault(require("./requestHandlers/update"));
const delete_1 = __importDefault(require("./requestHandlers/delete"));
const preferenceAccess = ({ req }) => {
    var _a;
    return ({
        'user.value': {
            equals: (_a = req === null || req === void 0 ? void 0 : req.user) === null || _a === void 0 ? void 0 : _a.id,
        },
    });
};
const getPreferencesCollection = (config) => ({
    slug: 'payload-preferences',
    admin: {
        hidden: true,
    },
    access: {
        read: preferenceAccess,
        delete: preferenceAccess,
    },
    fields: [
        {
            name: 'user',
            type: 'relationship',
            relationTo: config.collections
                .filter((collectionConfig) => collectionConfig.auth)
                .map((collectionConfig) => collectionConfig.slug),
            required: true,
            hooks: {
                beforeValidate: [
                    (({ req }) => {
                        if (!(req === null || req === void 0 ? void 0 : req.user)) {
                            return null;
                        }
                        return {
                            value: req === null || req === void 0 ? void 0 : req.user.id,
                            relationTo: req === null || req === void 0 ? void 0 : req.user.collection,
                        };
                    }),
                ],
            },
        },
        {
            name: 'key',
            type: 'text',
        },
        {
            name: 'value',
            type: 'json',
        },
    ],
    indexes: [
        {
            fields: {
                'user.value': 1,
                'user.relationTo': 1,
                key: 1,
            },
            options: {
                unique: true,
            },
        },
    ],
    endpoints: [
        {
            method: 'get',
            path: '/:key',
            handler: findOne_1.default,
        },
        {
            method: 'delete',
            path: '/:key',
            handler: delete_1.default,
        },
        {
            method: 'post',
            path: '/:key',
            handler: update_1.default,
        },
    ],
});
exports.default = getPreferencesCollection;
//# sourceMappingURL=preferencesCollection.js.map