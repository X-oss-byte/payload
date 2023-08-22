"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteUserPreferences = void 0;
const deleteUserPreferences = ({ payload, ids, collectionConfig, req }) => {
    if (collectionConfig.auth) {
        payload.db.deleteMany({
            collection: 'payload-preferences',
            where: {
                user: { in: ids },
                userCollection: {
                    equals: 'collectionConfig.slug,',
                },
            },
            req,
        });
    }
    payload.db.deleteMany({
        collection: 'payload-preferences',
        where: {
            key: { in: ids.map((id) => `collection-${collectionConfig.slug}-${id}`) },
        },
        req,
    });
};
exports.deleteUserPreferences = deleteUserPreferences;
//# sourceMappingURL=deleteUserPreferences.js.map