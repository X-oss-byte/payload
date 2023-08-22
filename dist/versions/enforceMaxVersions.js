"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.enforceMaxVersions = void 0;
const enforceMaxVersions = async ({ payload, max, collection, global, id, req, }) => {
    const entityType = collection ? 'collection' : 'global';
    const slug = collection ? collection.slug : global === null || global === void 0 ? void 0 : global.slug;
    try {
        const where = {};
        let oldestAllowedDoc;
        if (collection) {
            where.parent = {
                equals: id,
            };
            const query = await payload.db.findVersions({
                where,
                collection: collection.slug,
                skip: max,
                sort: '-updatedAt',
                pagination: false,
                req,
            });
            [oldestAllowedDoc] = query.docs;
        }
        else if (global) {
            const query = await payload.db.findGlobalVersions({
                where,
                global: global.slug,
                skip: max,
                sort: '-updatedAt',
                req,
            });
            [oldestAllowedDoc] = query.docs;
        }
        if (oldestAllowedDoc === null || oldestAllowedDoc === void 0 ? void 0 : oldestAllowedDoc.updatedAt) {
            const deleteQuery = {
                updatedAt: {
                    less_than_equal: oldestAllowedDoc.updatedAt,
                },
            };
            if (collection) {
                deleteQuery.parent = {
                    equals: id,
                };
            }
            await payload.db.deleteVersions({
                collection: collection === null || collection === void 0 ? void 0 : collection.slug,
                where: deleteQuery,
                req,
            });
        }
    }
    catch (err) {
        payload.logger.error(`There was an error cleaning up old versions for the ${entityType} ${slug}`);
    }
};
exports.enforceMaxVersions = enforceMaxVersions;
//# sourceMappingURL=enforceMaxVersions.js.map