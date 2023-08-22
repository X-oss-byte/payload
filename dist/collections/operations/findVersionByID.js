"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/* eslint-disable no-underscore-dangle */
const http_status_1 = __importDefault(require("http-status"));
const errors_1 = require("../../errors");
const executeAccess_1 = __importDefault(require("../../auth/executeAccess"));
const afterRead_1 = require("../../fields/hooks/afterRead");
const combineQueries_1 = require("../../database/combineQueries");
const initTransaction_1 = require("../../utilities/initTransaction");
const killTransaction_1 = require("../../utilities/killTransaction");
async function findVersionByID(args) {
    const { depth, collection: { config: collectionConfig, }, id, req, req: { t, payload, locale, }, disableErrors, currentDepth, overrideAccess, showHiddenFields, } = args;
    if (!id) {
        throw new errors_1.APIError('Missing ID of version.', http_status_1.default.BAD_REQUEST);
    }
    try {
        const shouldCommit = await (0, initTransaction_1.initTransaction)(req);
        // /////////////////////////////////////
        // Access
        // /////////////////////////////////////
        const accessResults = !overrideAccess ? await (0, executeAccess_1.default)({ req, disableErrors, id }, collectionConfig.access.readVersions) : true;
        // If errors are disabled, and access returns false, return null
        if (accessResults === false)
            return null;
        const hasWhereAccess = typeof accessResults === 'object';
        const fullWhere = (0, combineQueries_1.combineQueries)({ _id: { equals: id } }, accessResults);
        // /////////////////////////////////////
        // Find by ID
        // /////////////////////////////////////
        const versionsQuery = await payload.db.findVersions({
            locale,
            collection: collectionConfig.slug,
            limit: 1,
            pagination: false,
            where: fullWhere,
            req,
        });
        const result = versionsQuery.docs[0];
        if (!result) {
            if (!disableErrors) {
                if (!hasWhereAccess)
                    throw new errors_1.NotFound(t);
                if (hasWhereAccess)
                    throw new errors_1.Forbidden(t);
            }
            return null;
        }
        // /////////////////////////////////////
        // beforeRead - Collection
        // /////////////////////////////////////
        await collectionConfig.hooks.beforeRead.reduce(async (priorHook, hook) => {
            await priorHook;
            result.version = await hook({
                req,
                query: fullWhere,
                doc: result.version,
                context: req.context,
            }) || result.version;
        }, Promise.resolve());
        // /////////////////////////////////////
        // afterRead - Fields
        // /////////////////////////////////////
        result.version = await (0, afterRead_1.afterRead)({
            currentDepth,
            depth,
            doc: result.version,
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
            result.version = await hook({
                req,
                query: fullWhere,
                doc: result.version,
                context: req.context,
            }) || result.version;
        }, Promise.resolve());
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
exports.default = findVersionByID;
//# sourceMappingURL=findVersionByID.js.map