"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const docWithFilenameExists = async (payload, collectionSlug, path, filename) => {
    const doc = await payload.db.findOne({
        collection: collectionSlug,
        where: {
            filename: {
                equals: filename,
            },
        },
    });
    if (doc)
        return true;
    return false;
};
exports.default = docWithFilenameExists;
//# sourceMappingURL=docWithFilenameExists.js.map