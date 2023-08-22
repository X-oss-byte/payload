"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLatestCollectionVersion = void 0;
const types_1 = require("../types");
const getLatestCollectionVersion = async ({ payload, config, query, id, req, }) => {
    var _a;
    let latestVersion;
    if ((_a = config.versions) === null || _a === void 0 ? void 0 : _a.drafts) {
        const { docs } = await payload.db.findVersions({
            collection: config.slug,
            where: { parent: { equals: id } },
            sort: '-updatedAt',
            req,
        });
        [latestVersion] = docs;
    }
    const doc = await payload.db.findOne({ ...query, req });
    if (!latestVersion
        || ((0, types_1.docHasTimestamps)(doc) && latestVersion.updatedAt < doc.updatedAt)) {
        return doc;
    }
    return {
        ...latestVersion.version,
        id,
        updatedAt: latestVersion.updatedAt,
        createdAt: latestVersion.createdAt,
    };
};
exports.getLatestCollectionVersion = getLatestCollectionVersion;
//# sourceMappingURL=getLatestCollectionVersion.js.map