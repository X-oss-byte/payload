"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLatestGlobalVersion = void 0;
const types_1 = require("../types");
const getLatestGlobalVersion = async ({ payload, config, slug, where, locale, req, }) => {
    var _a;
    let latestVersion;
    if ((_a = config.versions) === null || _a === void 0 ? void 0 : _a.drafts) {
        // eslint-disable-next-line prefer-destructuring
        latestVersion = (await payload.db.findGlobalVersions({
            global: slug,
            limit: 1,
            sort: '-updatedAt',
            locale,
            req,
        })).docs[0];
    }
    const global = await payload.db.findGlobal({
        slug,
        where,
        locale,
        req,
    });
    const globalExists = Boolean(global);
    if (!latestVersion || ((0, types_1.docHasTimestamps)(global) && latestVersion.updatedAt < global.updatedAt)) {
        return {
            global,
            globalExists,
        };
    }
    return {
        global: {
            ...latestVersion.version,
            updatedAt: latestVersion.updatedAt,
            createdAt: latestVersion.createdAt,
        },
        globalExists,
    };
};
exports.getLatestGlobalVersion = getLatestGlobalVersion;
//# sourceMappingURL=getLatestGlobalVersion.js.map