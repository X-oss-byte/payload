"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const errors_1 = require("../../errors");
const executeAccess_1 = __importDefault(require("../../auth/executeAccess"));
const afterRead_1 = require("../../fields/hooks/afterRead");
const combineQueries_1 = require("../../database/combineQueries");
const killTransaction_1 = require("../../utilities/killTransaction");
const initTransaction_1 = require("../../utilities/initTransaction");
async function findVersionByID(args) {
    const { depth, globalConfig, id, req, req: { t, payload, locale, }, disableErrors, currentDepth, overrideAccess, showHiddenFields, } = args;
    try {
        const shouldCommit = await (0, initTransaction_1.initTransaction)(req);
        // /////////////////////////////////////
        // Access
        // /////////////////////////////////////
        const accessResults = !overrideAccess ? await (0, executeAccess_1.default)({ req, disableErrors, id }, globalConfig.access.readVersions) : true;
        // If errors are disabled, and access returns false, return null
        if (accessResults === false)
            return null;
        const hasWhereAccess = typeof accessResults === 'object';
        const findGlobalVersionsArgs = {
            global: globalConfig.slug,
            where: (0, combineQueries_1.combineQueries)({ id: { equals: id } }, accessResults),
            locale,
            limit: 1,
            req,
        };
        // /////////////////////////////////////
        // Find by ID
        // /////////////////////////////////////
        if (!findGlobalVersionsArgs.where.and[0].id)
            throw new errors_1.NotFound(t);
        const { docs: results } = await payload.db.findGlobalVersions(findGlobalVersionsArgs);
        if (!results || (results === null || results === void 0 ? void 0 : results.length) === 0) {
            if (!disableErrors) {
                if (!hasWhereAccess)
                    throw new errors_1.NotFound(t);
                if (hasWhereAccess)
                    throw new errors_1.Forbidden(t);
            }
            return null;
        }
        // Clone the result - it may have come back memoized
        let result = JSON.parse(JSON.stringify(results[0]));
        // /////////////////////////////////////
        // beforeRead - Collection
        // /////////////////////////////////////
        await globalConfig.hooks.beforeRead.reduce(async (priorHook, hook) => {
            await priorHook;
            result = await hook({
                req,
                doc: result.version,
            }) || result.version;
        }, Promise.resolve());
        // /////////////////////////////////////
        // afterRead - Fields
        // /////////////////////////////////////
        result.version = await (0, afterRead_1.afterRead)({
            currentDepth,
            depth,
            doc: result.version,
            entityConfig: globalConfig,
            req,
            overrideAccess,
            showHiddenFields,
            context: req.context,
        });
        // /////////////////////////////////////
        // afterRead - Global
        // /////////////////////////////////////
        await globalConfig.hooks.afterRead.reduce(async (priorHook, hook) => {
            await priorHook;
            result.version = await hook({
                req,
                query: findGlobalVersionsArgs.where,
                doc: result.version,
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