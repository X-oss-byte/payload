"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const executeAccess_1 = __importDefault(require("../../auth/executeAccess"));
const sanitizeInternalFields_1 = __importDefault(require("../../utilities/sanitizeInternalFields"));
const afterRead_1 = require("../../fields/hooks/afterRead");
const buildGlobalFields_1 = require("../../versions/buildGlobalFields");
const validateQueryPaths_1 = require("../../database/queryValidation/validateQueryPaths");
const combineQueries_1 = require("../../database/combineQueries");
const killTransaction_1 = require("../../utilities/killTransaction");
const initTransaction_1 = require("../../utilities/initTransaction");
async function findVersions(args) {
    const { where, page, limit, depth, globalConfig, sort, req, req: { locale, payload, }, overrideAccess, showHiddenFields, } = args;
    const versionFields = (0, buildGlobalFields_1.buildVersionGlobalFields)(globalConfig);
    try {
        const shouldCommit = await (0, initTransaction_1.initTransaction)(req);
        // /////////////////////////////////////
        // Access
        // /////////////////////////////////////
        const accessResults = !overrideAccess ? await (0, executeAccess_1.default)({ req }, globalConfig.access.readVersions) : true;
        await (0, validateQueryPaths_1.validateQueryPaths)({
            globalConfig,
            versionFields,
            where,
            req,
            overrideAccess,
        });
        const fullWhere = (0, combineQueries_1.combineQueries)(where, accessResults);
        // /////////////////////////////////////
        // Find
        // /////////////////////////////////////
        const paginatedDocs = await payload.db.findGlobalVersions({
            where: fullWhere,
            page: page || 1,
            limit: limit !== null && limit !== void 0 ? limit : 10,
            sort,
            global: globalConfig.slug,
            locale,
            req,
        });
        // /////////////////////////////////////
        // afterRead - Fields
        // /////////////////////////////////////
        let result = {
            ...paginatedDocs,
            docs: await Promise.all(paginatedDocs.docs.map(async (data) => ({
                ...data,
                version: await (0, afterRead_1.afterRead)({
                    depth,
                    doc: data.version,
                    entityConfig: globalConfig,
                    req,
                    overrideAccess,
                    showHiddenFields,
                    findMany: true,
                    context: req.context,
                }),
            }))),
        };
        // /////////////////////////////////////
        // afterRead - Global
        // /////////////////////////////////////
        result = {
            ...result,
            docs: await Promise.all(result.docs.map(async (doc) => {
                const docRef = doc;
                await globalConfig.hooks.afterRead.reduce(async (priorHook, hook) => {
                    await priorHook;
                    docRef.version = await hook({ req, query: fullWhere, doc: doc.version, findMany: true }) || doc.version;
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