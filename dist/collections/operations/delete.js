"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const http_status_1 = __importDefault(require("http-status"));
const errors_1 = require("../../errors");
const executeAccess_1 = __importDefault(require("../../auth/executeAccess"));
const afterRead_1 = require("../../fields/hooks/afterRead");
const deleteCollectionVersions_1 = require("../../versions/deleteCollectionVersions");
const deleteAssociatedFiles_1 = require("../../uploads/deleteAssociatedFiles");
const deleteUserPreferences_1 = require("../../preferences/deleteUserPreferences");
const validateQueryPaths_1 = require("../../database/queryValidation/validateQueryPaths");
const combineQueries_1 = require("../../database/combineQueries");
const initTransaction_1 = require("../../utilities/initTransaction");
const killTransaction_1 = require("../../utilities/killTransaction");
const utils_1 = require("./utils");
async function deleteOperation(incomingArgs) {
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
    const { depth, collection: { config: collectionConfig, }, where, req, req: { t, payload, locale, payload: { config, }, }, overrideAccess, showHiddenFields, } = args;
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
        if (!where) {
            throw new errors_1.APIError('Missing \'where\' query of documents to delete.', http_status_1.default.BAD_REQUEST);
        }
        // /////////////////////////////////////
        // Access
        // /////////////////////////////////////
        let accessResult;
        if (!overrideAccess) {
            accessResult = await (0, executeAccess_1.default)({ req }, collectionConfig.access.delete);
        }
        await (0, validateQueryPaths_1.validateQueryPaths)({
            collectionConfig,
            where,
            req,
            overrideAccess,
        });
        const fullWhere = (0, combineQueries_1.combineQueries)(where, accessResult);
        // /////////////////////////////////////
        // Retrieve documents
        // /////////////////////////////////////
        const { docs } = await payload.db.find({
            locale,
            where: fullWhere,
            collection: collectionConfig.slug,
            req,
        });
        const errors = [];
        /* eslint-disable no-param-reassign */
        const promises = docs.map(async (doc) => {
            let result;
            const { id } = doc;
            try {
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
                await (0, deleteAssociatedFiles_1.deleteAssociatedFiles)({
                    config,
                    collectionConfig,
                    doc,
                    t,
                    overrideDelete: true,
                });
                // /////////////////////////////////////
                // Delete document
                // /////////////////////////////////////
                await payload.db.deleteOne({
                    collection: collectionConfig.slug,
                    where: {
                        id: {
                            equals: id,
                        },
                    },
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
                    doc: result || doc,
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
                        doc: result || doc,
                        context: req.context,
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
                // 8. Return results
                // /////////////////////////////////////
                return result;
            }
            catch (error) {
                errors.push({
                    message: error.message,
                    id: doc.id,
                });
            }
            return null;
        });
        const awaitedDocs = await Promise.all(promises);
        // /////////////////////////////////////
        // Delete Preferences
        // /////////////////////////////////////
        (0, deleteUserPreferences_1.deleteUserPreferences)({
            payload,
            collectionConfig,
            ids: docs.map(({ id }) => id),
            req,
        });
        let result = {
            docs: awaitedDocs.filter(Boolean),
            errors,
        };
        // /////////////////////////////////////
        // afterOperation - Collection
        // /////////////////////////////////////
        result = await (0, utils_1.buildAfterOperation)({
            operation: 'delete',
            args,
            result,
        });
        if (shouldCommit)
            await payload.db.commitTransaction(req.transactionID);
        return result;
    }
    catch (error) {
        await (0, killTransaction_1.killTransaction)(req);
        throw error;
    }
}
exports.default = deleteOperation;
//# sourceMappingURL=delete.js.map