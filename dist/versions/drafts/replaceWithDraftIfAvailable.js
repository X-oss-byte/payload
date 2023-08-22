"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const types_1 = require("../../types");
const auth_1 = require("../../auth");
const sanitizeInternalFields_1 = __importDefault(require("../../utilities/sanitizeInternalFields"));
const appendVersionToQueryKey_1 = require("./appendVersionToQueryKey");
const combineQueries_1 = require("../../database/combineQueries");
const replaceWithDraftIfAvailable = async ({ entity, entityType, doc, req, accessResult, }) => {
    const { locale, } = req;
    const queryToBuild = {
        and: [
            {
                'version._status': {
                    equals: 'draft',
                },
            },
        ],
    };
    if (entityType === 'collection') {
        queryToBuild.and.push({
            parent: {
                equals: doc.id,
            },
        });
    }
    if ((0, types_1.docHasTimestamps)(doc)) {
        queryToBuild.and.push({
            updatedAt: {
                greater_than: doc.updatedAt,
            },
        });
    }
    let versionAccessResult;
    if ((0, auth_1.hasWhereAccessResult)(accessResult)) {
        versionAccessResult = (0, appendVersionToQueryKey_1.appendVersionToQueryKey)(accessResult);
    }
    const findVersionsArgs = {
        locale,
        where: (0, combineQueries_1.combineQueries)(queryToBuild, versionAccessResult),
        collection: entity.slug,
        global: entity.slug,
        limit: 1,
        sort: '-updatedAt',
        req,
    };
    let versionDocs;
    if (entityType === 'global') {
        versionDocs = (await req.payload.db.findGlobalVersions(findVersionsArgs)).docs;
    }
    else {
        versionDocs = (await req.payload.db.findVersions(findVersionsArgs)).docs;
    }
    let draft = versionDocs[0];
    if (!draft) {
        return doc;
    }
    draft = JSON.parse(JSON.stringify(draft));
    draft = (0, sanitizeInternalFields_1.default)(draft);
    // Disregard all other draft content at this point,
    // Only interested in the version itself.
    // Operations will handle firing hooks, etc.
    return {
        id: doc.id,
        ...draft.version,
        createdAt: draft.createdAt,
        updatedAt: draft.updatedAt,
    };
};
exports.default = replaceWithDraftIfAvailable;
//# sourceMappingURL=replaceWithDraftIfAvailable.js.map