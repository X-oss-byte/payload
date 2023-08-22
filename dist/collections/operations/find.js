"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const executeAccess_1 = __importDefault(require("../../auth/executeAccess"));
const afterRead_1 = require("../../fields/hooks/afterRead");
const validateQueryPaths_1 = require("../../database/queryValidation/validateQueryPaths");
const appendVersionToQueryKey_1 = require("../../versions/drafts/appendVersionToQueryKey");
const buildCollectionFields_1 = require("../../versions/buildCollectionFields");
const combineQueries_1 = require("../../database/combineQueries");
const initTransaction_1 = require("../../utilities/initTransaction");
const killTransaction_1 = require("../../utilities/killTransaction");
const utils_1 = require("./utils");
async function find(incomingArgs) {
    var _a;
    let args = incomingArgs;
    // /////////////////////////////////////
    // beforeOperation - Collection
    // /////////////////////////////////////
    await args.collection.config.hooks.beforeOperation.reduce(async (priorHook, hook) => {
        await priorHook;
        args = (await hook({
            args,
            operation: 'read',
            context: args.req.context,
        })) || args;
    }, Promise.resolve());
    const { where, page, limit, depth, currentDepth, draft: draftsEnabled, collection, collection: { config: collectionConfig, }, sort, req, req: { locale, payload, }, overrideAccess, disableErrors, showHiddenFields, pagination = true, } = args;
    try {
        const shouldCommit = await (0, initTransaction_1.initTransaction)(req);
        // /////////////////////////////////////
        // beforeOperation - Collection
        // /////////////////////////////////////
        await args.collection.config.hooks.beforeOperation.reduce(async (priorHook, hook) => {
            await priorHook;
            args = (await hook({
                args,
                operation: 'read',
                context: req.context,
            })) || args;
        }, Promise.resolve());
        // /////////////////////////////////////
        // Access
        // /////////////////////////////////////
        let accessResult;
        if (!overrideAccess) {
            accessResult = await (0, executeAccess_1.default)({ req, disableErrors }, collectionConfig.access.read);
            // If errors are disabled, and access returns false, return empty results
            if (accessResult === false) {
                return {
                    docs: [],
                    totalDocs: 0,
                    totalPages: 1,
                    page: 1,
                    pagingCounter: 1,
                    hasPrevPage: false,
                    hasNextPage: false,
                    prevPage: null,
                    nextPage: null,
                    limit,
                };
            }
        }
        // /////////////////////////////////////
        // Find
        // /////////////////////////////////////
        const usePagination = pagination && limit !== 0;
        const sanitizedLimit = limit !== null && limit !== void 0 ? limit : (usePagination ? 10 : 0);
        const sanitizedPage = page || 1;
        let result;
        let fullWhere = (0, combineQueries_1.combineQueries)(where, accessResult);
        if (((_a = collectionConfig.versions) === null || _a === void 0 ? void 0 : _a.drafts) && draftsEnabled) {
            fullWhere = (0, appendVersionToQueryKey_1.appendVersionToQueryKey)(fullWhere);
            await (0, validateQueryPaths_1.validateQueryPaths)({
                collectionConfig: collection.config,
                where: fullWhere,
                req,
                overrideAccess,
                versionFields: (0, buildCollectionFields_1.buildVersionCollectionFields)(collection.config),
            });
            result = await payload.db.queryDrafts({
                collection: collectionConfig.slug,
                where: fullWhere,
                page: sanitizedPage,
                limit: sanitizedLimit,
                sort,
                pagination: usePagination,
                locale,
                req,
            });
        }
        else {
            await (0, validateQueryPaths_1.validateQueryPaths)({
                collectionConfig,
                where,
                req,
                overrideAccess,
            });
            result = await payload.db.find({
                collection: collectionConfig.slug,
                where: fullWhere,
                page: sanitizedPage,
                limit: sanitizedLimit,
                sort,
                locale,
                pagination,
                req,
            });
        }
        // /////////////////////////////////////
        // beforeRead - Collection
        // /////////////////////////////////////
        result = {
            ...result,
            docs: await Promise.all(result.docs.map(async (doc) => {
                let docRef = doc;
                await collectionConfig.hooks.beforeRead.reduce(async (priorHook, hook) => {
                    await priorHook;
                    docRef = await hook({
                        req,
                        query: fullWhere,
                        doc: docRef,
                        context: req.context,
                    }) || docRef;
                }, Promise.resolve());
                return docRef;
            })),
        };
        // /////////////////////////////////////
        // afterRead - Fields
        // /////////////////////////////////////
        result = {
            ...result,
            docs: await Promise.all(result.docs.map(async (doc) => (0, afterRead_1.afterRead)({
                depth,
                currentDepth,
                doc,
                entityConfig: collectionConfig,
                overrideAccess,
                req,
                showHiddenFields,
                findMany: true,
                context: req.context,
            }))),
        };
        // /////////////////////////////////////
        // afterRead - Collection
        // /////////////////////////////////////
        result = {
            ...result,
            docs: await Promise.all(result.docs.map(async (doc) => {
                let docRef = doc;
                await collectionConfig.hooks.afterRead.reduce(async (priorHook, hook) => {
                    await priorHook;
                    docRef = await hook({
                        req,
                        query: fullWhere,
                        doc: docRef,
                        findMany: true,
                        context: req.context,
                    }) || doc;
                }, Promise.resolve());
                return docRef;
            })),
        };
        // /////////////////////////////////////
        // afterOperation - Collection
        // /////////////////////////////////////
        result = await (0, utils_1.buildAfterOperation)({
            operation: 'find',
            args,
            result,
        });
        // /////////////////////////////////////
        // Return results
        // /////////////////////////////////////
        if (shouldCommit)
            await payload.db.commitTransaction(req.transactionID);
        return result;
    }
    catch (error) {
        await (0, killTransaction_1.killTransaction)(req);
        throw error;
    }
}
exports.default = find;
//# sourceMappingURL=find.js.map