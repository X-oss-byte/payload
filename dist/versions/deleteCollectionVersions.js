"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteCollectionVersions = void 0;
const deleteCollectionVersions = async ({ payload, slug, id, req, }) => {
    try {
        await payload.db.deleteVersions({
            collection: slug,
            where: {
                parent: {
                    equals: id,
                },
            },
            req,
        });
    }
    catch (err) {
        payload.logger.error(`There was an error removing versions for the deleted ${slug} document with ID ${id}.`);
    }
};
exports.deleteCollectionVersions = deleteCollectionVersions;
//# sourceMappingURL=deleteCollectionVersions.js.map