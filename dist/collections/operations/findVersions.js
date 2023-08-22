"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const executeAccess_1 = __importDefault(require("../../auth/executeAccess"));
const sanitizeInternalFields_1 = __importDefault(require("../../utilities/sanitizeInternalFields"));
const afterRead_1 = require("../../fields/hooks/afterRead");
const buildCollectionFields_1 = require("../../versions/buildCollectionFields");
const validateQueryPaths_1 = require("../../database/queryValidation/validateQueryPaths");
const combineQueries_1 = require("../../database/combineQueries");
const initTransaction_1 = require("../../utilities/initTransaction");
const killTransaction_1 = require("../../utilities/killTransaction");
async function findVersions(args) {
    const { where, page, limit, depth, collection: { config: collectionConfig, }, sort, req, req: { locale, payload, }, overrideAccess, showHiddenFields, } = args;
    try {
        const shouldCommit = await (0, initTransaction_1.initTransaction)(req);
        // /////////////////////////////////////
        // Access
        // /////////////////////////////////////
        let accessResults;
        if (!overrideAccess) {
            accessResults = await (0, executeAccess_1.default)({ req }, collectionConfig.access.readVersions);
        }
        const versionFields = (0, buildCollectionFields_1.buildVersionCollectionFields)(collectionConfig);
        await (0, validateQueryPaths_1.validateQueryPaths)({
            collectionConfig,
            versionFields,
            where,
            req,
            overrideAccess,
        });
        const fullWhere = (0, combineQueries_1.combineQueries)(where, accessResults);
        // /////////////////////////////////////
        // Find
        // /////////////////////////////////////
        const paginatedDocs = await payload.db.findVersions({
            where: fullWhere,
            page: page || 1,
            limit: limit !== null && limit !== void 0 ? limit : 10,
            collection: collectionConfig.slug,
            sort,
            locale,
            req,
        });
        // /////////////////////////////////////
        // beforeRead - Collection
        // /////////////////////////////////////
        let result = {
            ...paginatedDocs,
            docs: await Promise.all(paginatedDocs.docs.map(async (doc) => {
                const docRef = doc;
                await collectionConfig.hooks.beforeRead.reduce(async (priorHook, hook) => {
                    await priorHook;
                    docRef.version = await hook({
                        req,
                        query: fullWhere,
                        doc: docRef.version,
                        context: req.context,
                    }) || docRef.version;
                }, Promise.resolve());
                return docRef;
            })),
        };
        // /////////////////////////////////////
        // afterRead - Fields
        // /////////////////////////////////////
        result = {
            ...result,
            docs: await Promise.all(result.docs.map(async (data) => ({
                ...data,
                version: await (0, afterRead_1.afterRead)({
                    depth,
                    doc: data.version,
                    entityConfig: collectionConfig,
                    overrideAccess,
                    req,
                    showHiddenFields,
                    findMany: true,
                    context: req.context,
                }),
            }))),
        };
        // /////////////////////////////////////
        // afterRead - Collection
        // /////////////////////////////////////
        result = {
            ...result,
            docs: await Promise.all(result.docs.map(async (doc) => {
                const docRef = doc;
                await collectionConfig.hooks.afterRead.reduce(async (priorHook, hook) => {
                    await priorHook;
                    docRef.version = await hook({
                        req,
                        query: fullWhere,
                        doc: doc.version,
                        findMany: true,
                        context: req.context,
                    }) || doc.version;
                }, Promise.resolve());
                return docRef;
            })),
        };
        // /////////////////////////////////////
        // Return results
        // /////////////////////////////////////
        result = {
            ...result,
            docs: result.docs.map((doc) => (0, sanitizeInternalFields_1.default)(doc)),
        };
        if (shouldCommit)
            await payload.db.commitTransaction(req.transactionID);
        return result;
    }
    catch (error) {
        await (0, killTransaction_1.killTransaction)(req);
        throw error;
    }
}
exports.default = findVersions;
//# sourceMappingURL=findVersions.js.map