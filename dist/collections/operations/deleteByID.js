"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const errors_1 = require("../../errors");
const executeAccess_1 = __importDefault(require("../../auth/executeAccess"));
const types_1 = require("../../auth/types");
const afterRead_1 = require("../../fields/hooks/afterRead");
const deleteCollectionVersions_1 = require("../../versions/deleteCollectionVersions");
const deleteAssociatedFiles_1 = require("../../uploads/deleteAssociatedFiles");
const combineQueries_1 = require("../../database/combineQueries");
const deleteUserPreferences_1 = require("../../preferences/deleteUserPreferences");
const killTransaction_1 = require("../../utilities/killTransaction");
const initTransaction_1 = require("../../utilities/initTransaction");
const utils_1 = require("./utils");
async function deleteByID(incomingArgs) {
    let args = incomingArgs;
    // /////////////////////////////////////
    // beforeOperation - Collection
    // /////////////////////////////////////
    await args.collection.config.hooks.beforeOperation.reduce(async (priorHook, hook) => {
        await priorHook;
        args = (await hook({
            args,
            operation: 'delete',
            context: args.req.context,
        })) || args;
    }, Promise.resolve());
    const { depth, collection: { config: collectionConfig, }, id, req, req: { t, payload, payload: { config, }, }, overrideAccess, showHiddenFields, } = args;
    try {
        const shouldCommit = await (0, initTransaction_1.initTransaction)(req);
        // /////////////////////////////////////
        // beforeOperation - Collection
        // /////////////////////////////////////
        await args.collection.config.hooks.beforeOperation.reduce(async (priorHook, hook) => {
            await priorHook;
            args = (await hook({
                args,
                operation: 'delete',
                context: req.context,
            })) || args;
        }, Promise.resolve());
        // /////////////////////////////////////
        // Access
        // /////////////////////////////////////
        const accessResults = !overrideAccess ? await (0, executeAccess_1.default)({ req, id }, collectionConfig.access.delete) : true;
        const hasWhereAccess = (0, types_1.hasWhereAccessResult)(accessResults);
        // /////////////////////////////////////
        // beforeDelete - Collection
        // /////////////////////////////////////
        await collectionConfig.hooks.beforeDelete.reduce(async (priorHook, hook) => {
            await priorHook;
            return hook({
                req,
                id,
                context: req.context,
            });
        }, Promise.resolve());
        // /////////////////////////////////////
        // Retrieve document
        // /////////////////////////////////////
        const docToDelete = await req.payload.db.findOne({
            collection: collectionConfig.slug,
            where: (0, combineQueries_1.combineQueries)({ id: { equals: id } }, accessResults),
            locale: req.locale,
            req,
        });
        if (!docToDelete && !hasWhereAccess)
            throw new errors_1.NotFound(t);
        if (!docToDelete && hasWhereAccess)
            throw new errors_1.Forbidden(t);
        await (0, deleteAssociatedFiles_1.deleteAssociatedFiles)({ config, collectionConfig, doc: docToDelete, t, overrideDelete: true });
        // /////////////////////////////////////
        // Delete document
        // /////////////////////////////////////
        let result = await req.payload.db.deleteOne({
            collection: collectionConfig.slug,
            where: { id: { equals: id } },
            req,
        });
        // /////////////////////////////////////
        // Delete Preferences
        // /////////////////////////////////////
        (0, deleteUserPreferences_1.deleteUserPreferences)({
            payload,
            collectionConfig,
            ids: [id],
            req,
        });
        // /////////////////////////////////////
        // Delete versions
        // /////////////////////////////////////
        if (collectionConfig.versions) {
            (0, deleteCollectionVersions_1.deleteCollectionVersions)({
                payload,
                id,
                slug: collectionConfig.slug,
                req,
            });
        }
        // /////////////////////////////////////
        // afterRead - Fields
        // /////////////////////////////////////
        result = await (0, afterRead_1.afterRead)({
            depth,
            doc: result,
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
                context: req.context,
                doc: result,
            }) || result;
        }, Promise.resolve());
        // /////////////////////////////////////
        // afterDelete - Collection
        // /////////////////////////////////////
        await collectionConfig.hooks.afterDelete.reduce(async (priorHook, hook) => {
            await priorHook;
            result = await hook({
                req,
                id,
                doc: result,
                context: req.context,
            }) || result;
        }, Promise.resolve());
        // /////////////////////////////////////
        // afterOperation - Collection
        // /////////////////////////////////////
        result = await (0, utils_1.buildAfterOperation)({
            operation: 'deleteByID',
            args,
            result,
        });
        // /////////////////////////////////////
        // 8. Return results
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
exports.default = deleteByID;
//# sourceMappingURL=deleteByID.js.map