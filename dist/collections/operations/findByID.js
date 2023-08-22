"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/* eslint-disable no-underscore-dangle */
const micro_memoize_1 = __importDefault(require("micro-memoize"));
const errors_1 = require("../../errors");
const executeAccess_1 = __importDefault(require("../../auth/executeAccess"));
const replaceWithDraftIfAvailable_1 = __importDefault(require("../../versions/drafts/replaceWithDraftIfAvailable"));
const afterRead_1 = require("../../fields/hooks/afterRead");
const combineQueries_1 = require("../../database/combineQueries");
const initTransaction_1 = require("../../utilities/initTransaction");
const killTransaction_1 = require("../../utilities/killTransaction");
const utils_1 = require("./utils");
async function findByID(incomingArgs) {
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
    const { depth, collection: { config: collectionConfig, }, id, req, req: { payload, t, locale, }, disableErrors, currentDepth, overrideAccess = false, showHiddenFields, draft: draftEnabled = false, } = args;
    try {
        const shouldCommit = await (0, initTransaction_1.initTransaction)(req);
        const { transactionID } = req;
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
        const accessResult = !overrideAccess ? await (0, executeAccess_1.default)({ req, disableErrors, id }, collectionConfig.access.read) : true;
        // If errors are disabled, and access returns false, return null
        if (accessResult === false)
            return null;
        const findOneArgs = {
            collection: collectionConfig.slug,
            where: (0, combineQueries_1.combineQueries)({ id: { equals: id } }, accessResult),
            locale,
            req: {
                transactionID: req.transactionID,
            },
        };
        // /////////////////////////////////////
        // Find by ID
        // /////////////////////////////////////
        if (!findOneArgs.where.and[0].id)
            throw new errors_1.NotFound(t);
        if (!req.findByID)
            req.findByID = { [transactionID]: {} };
        if (!req.findByID[transactionID][collectionConfig.slug]) {
            const nonMemoizedFindByID = async (query) => req.payload.db.findOne(query);
            req.findByID[transactionID][collectionConfig.slug] = (0, micro_memoize_1.default)(nonMemoizedFindByID, {
                isPromise: true,
                maxSize: 100,
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore This is straight from their docs, bad typings
                transformKey: JSON.stringify,
            });
        }
        let result = await req.findByID[transactionID][collectionConfig.slug](findOneArgs);
        if (!result) {
            if (!disableErrors) {
                throw new errors_1.NotFound(t);
            }
            return null;
        }
        // Clone the result - it may have come back memoized
        result = JSON.parse(JSON.stringify(result));
        // /////////////////////////////////////
        // Replace document with draft if available
        // /////////////////////////////////////
        if (((_a = collectionConfig.versions) === null || _a === void 0 ? void 0 : _a.drafts) && draftEnabled) {
            result = await (0, replaceWithDraftIfAvailable_1.default)({
                entity: collectionConfig,
                entityType: 'collection',
                doc: result,
                accessResult,
                req,
                overrideAccess,
            });
        }
        // /////////////////////////////////////
        // beforeRead - Collection
        // /////////////////////////////////////
        await collectionConfig.hooks.beforeRead.reduce(async (priorHook, hook) => {
            await priorHook;
            result = await hook({
                req,
                query: findOneArgs.where,
                doc: result,
                context: req.context,
            }) || result;
        }, Promise.resolve());
        // /////////////////////////////////////
        // afterRead - Fields
        // /////////////////////////////////////
        result = await (0, afterRead_1.afterRead)({
            currentDepth,
            doc: result,
            depth,
            entityConfig: collectionConfig,
            overrideAccess,
            req,
            showHiddenFields,
            context: req.context,
        });
        // /////////////////////////////////////
        // afterRead - Collection
        // /////////////////////////////////////
        await collectionConfig.hooks.afterRead.reduce(async (priorHook, hook) => {
            await priorHook;
            result = await hook({
                req,
                query: findOneArgs.where,
                doc: result,
                context: req.context,
            }) || result;
        }, Promise.resolve());
        // /////////////////////////////////////
        // afterOperation - Collection
        // /////////////////////////////////////
        result = await (0, utils_1.buildAfterOperation)({
            operation: 'findByID',
            args,
            result: result,
        }); // TODO: fix this typing
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
exports.default = findByID;
//# sourceMappingURL=findByID.js.map