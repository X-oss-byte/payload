"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const http_status_1 = __importDefault(require("http-status"));
const executeAccess_1 = __importDefault(require("../../auth/executeAccess"));
const errors_1 = require("../../errors");
const saveVersion_1 = require("../../versions/saveVersion");
const uploadFiles_1 = require("../../uploads/uploadFiles");
const beforeChange_1 = require("../../fields/hooks/beforeChange");
const beforeValidate_1 = require("../../fields/hooks/beforeValidate");
const afterChange_1 = require("../../fields/hooks/afterChange");
const afterRead_1 = require("../../fields/hooks/afterRead");
const generateFileData_1 = require("../../uploads/generateFileData");
const deleteAssociatedFiles_1 = require("../../uploads/deleteAssociatedFiles");
const unlinkTempFiles_1 = require("../../uploads/unlinkTempFiles");
const validateQueryPaths_1 = require("../../database/queryValidation/validateQueryPaths");
const combineQueries_1 = require("../../database/combineQueries");
const appendVersionToQueryKey_1 = require("../../versions/drafts/appendVersionToQueryKey");
const buildCollectionFields_1 = require("../../versions/buildCollectionFields");
const initTransaction_1 = require("../../utilities/initTransaction");
const killTransaction_1 = require("../../utilities/killTransaction");
const utils_1 = require("./utils");
async function update(incomingArgs) {
    var _a;
    let args = incomingArgs;
    // /////////////////////////////////////
    // beforeOperation - Collection
    // /////////////////////////////////////
    await args.collection.config.hooks.beforeOperation.reduce(async (priorHook, hook) => {
        await priorHook;
        args = (await hook({
            args,
            operation: 'update',
            context: args.req.context,
        })) || args;
    }, Promise.resolve());
    const { depth, collection, collection: { config: collectionConfig, }, where, req, req: { t, locale, payload, payload: { config, }, }, overrideAccess, showHiddenFields, overwriteExistingFiles = false, draft: draftArg = false, } = args;
    try {
        const shouldCommit = await (0, initTransaction_1.initTransaction)(req);
        // /////////////////////////////////////
        // beforeOperation - Collection
        // /////////////////////////////////////
        await args.collection.config.hooks.beforeOperation.reduce(async (priorHook, hook) => {
            await priorHook;
            args = (await hook({
                args,
                operation: 'update',
                context: req.context,
            })) || args;
        }, Promise.resolve());
        if (!where) {
            throw new errors_1.APIError('Missing \'where\' query of documents to update.', http_status_1.default.BAD_REQUEST);
        }
        const { data: bulkUpdateData } = args;
        const shouldSaveDraft = Boolean(draftArg && collectionConfig.versions.drafts);
        // /////////////////////////////////////
        // Access
        // /////////////////////////////////////
        let accessResult;
        if (!overrideAccess) {
            accessResult = await (0, executeAccess_1.default)({ req }, collectionConfig.access.update);
        }
        await (0, validateQueryPaths_1.validateQueryPaths)({
            collectionConfig,
            where,
            req,
            overrideAccess,
        });
        // /////////////////////////////////////
        // Retrieve documents
        // /////////////////////////////////////
        const fullWhere = (0, combineQueries_1.combineQueries)(where, accessResult);
        let docs;
        if (((_a = collectionConfig.versions) === null || _a === void 0 ? void 0 : _a.drafts) && shouldSaveDraft) {
            const versionsWhere = (0, appendVersionToQueryKey_1.appendVersionToQueryKey)(fullWhere);
            await (0, validateQueryPaths_1.validateQueryPaths)({
                collectionConfig: collection.config,
                where: versionsWhere,
                req,
                overrideAccess,
                versionFields: (0, buildCollectionFields_1.buildVersionCollectionFields)(collection.config),
            });
            const query = await payload.db.queryDrafts({
                collection: collectionConfig.slug,
                where: versionsWhere,
                locale,
                req,
            });
            docs = query.docs;
        }
        else {
            const query = await payload.db.find({
                locale,
                collection: collectionConfig.slug,
                where: fullWhere,
                pagination: false,
                limit: 0,
                req,
            });
            docs = query.docs;
        }
        // /////////////////////////////////////
        // Generate data for all files and sizes
        // /////////////////////////////////////
        const { data: newFileData, files: filesToUpload, } = await (0, generateFileData_1.generateFileData)({
            config,
            collection,
            req,
            data: bulkUpdateData,
            throwOnMissingFile: false,
            overwriteExistingFiles,
        });
        const errors = [];
        const promises = docs.map(async (doc) => {
            const { id } = doc;
            let data = {
                ...newFileData,
                ...bulkUpdateData,
            };
            try {
                const originalDoc = await (0, afterRead_1.afterRead)({
                    depth: 0,
                    doc,
                    entityConfig: collectionConfig,
                    req,
                    overrideAccess: true,
                    showHiddenFields: true,
                    context: req.context,
                });
                await (0, deleteAssociatedFiles_1.deleteAssociatedFiles)({ config, collectionConfig, files: filesToUpload, doc, t, overrideDelete: false });
                // /////////////////////////////////////
                // beforeValidate - Fields
                // /////////////////////////////////////
                data = await (0, beforeValidate_1.beforeValidate)({
                    data,
                    doc: originalDoc,
                    entityConfig: collectionConfig,
                    id,
                    operation: 'update',
                    overrideAccess,
                    req,
                    context: req.context,
                });
                // /////////////////////////////////////
                // beforeValidate - Collection
                // /////////////////////////////////////
                await collectionConfig.hooks.beforeValidate.reduce(async (priorHook, hook) => {
                    await priorHook;
                    data = (await hook({
                        data,
                        req,
                        operation: 'update',
                        originalDoc,
                        context: req.context,
                    })) || data;
                }, Promise.resolve());
                // /////////////////////////////////////
                // Write files to local storage
                // /////////////////////////////////////
                if (!collectionConfig.upload.disableLocalStorage) {
                    await (0, uploadFiles_1.uploadFiles)(payload, filesToUpload, t);
                }
                // /////////////////////////////////////
                // beforeChange - Collection
                // /////////////////////////////////////
                await collectionConfig.hooks.beforeChange.reduce(async (priorHook, hook) => {
                    await priorHook;
                    data = (await hook({
                        data,
                        req,
                        originalDoc,
                        operation: 'update',
                        context: req.context,
                    })) || data;
                }, Promise.resolve());
                // /////////////////////////////////////
                // beforeChange - Fields
                // /////////////////////////////////////
                let result = await (0, beforeChange_1.beforeChange)({
                    data,
                    doc: originalDoc,
                    docWithLocales: doc,
                    entityConfig: collectionConfig,
                    id,
                    operation: 'update',
                    req,
                    skipValidation: shouldSaveDraft || data._status === 'draft',
                    context: req.context,
                });
                // /////////////////////////////////////
                // Update
                // /////////////////////////////////////
                if (!shouldSaveDraft) {
                    result = await req.payload.db.updateOne({
                        collection: collectionConfig.slug,
                        locale,
                        id,
                        data: result,
                        req,
                    });
                }
                // /////////////////////////////////////
                // Create version
                // /////////////////////////////////////
                if (collectionConfig.versions) {
                    result = await (0, saveVersion_1.saveVersion)({
                        payload,
                        collection: collectionConfig,
                        req,
                        docWithLocales: {
                            ...result,
                            createdAt: doc.createdAt,
                        },
                        id,
                        draft: shouldSaveDraft,
                    });
                }
                // /////////////////////////////////////
                // afterRead - Fields
                // /////////////////////////////////////
                result = await (0, afterRead_1.afterRead)({
                    depth,
                    doc: result,
                    entityConfig: collectionConfig,
                    req,
                    overrideAccess,
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
                        doc: result,
                        context: req.context,
                    }) || result;
                }, Promise.resolve());
                // /////////////////////////////////////
                // afterChange - Fields
                // /////////////////////////////////////
                result = await (0, afterChange_1.afterChange)({
                    data,
                    doc: result,
                    previousDoc: originalDoc,
                    entityConfig: collectionConfig,
                    operation: 'update',
                    context: req.context,
                    req,
                });
                // /////////////////////////////////////
                // afterChange - Collection
                // /////////////////////////////////////
                await collectionConfig.hooks.afterChange.reduce(async (priorHook, hook) => {
                    await priorHook;
                    result = await hook({
                        doc: result,
                        previousDoc: originalDoc,
                        req,
                        operation: 'update',
                        context: req.context,
                    }) || result;
                }, Promise.resolve());
                await (0, unlinkTempFiles_1.unlinkTempFiles)({
                    req,
                    config,
                    collectionConfig,
                });
                // /////////////////////////////////////
                // Return results
                // /////////////////////////////////////
                return result;
            }
            catch (error) {
                errors.push({
                    message: error.message,
                    id,
                });
            }
            return null;
        });
        const awaitedDocs = await Promise.all(promises);
        let result = {
            docs: awaitedDocs.filter(Boolean),
            errors,
        };
        // /////////////////////////////////////
        // afterOperation - Collection
        // /////////////////////////////////////
        result = await (0, utils_1.buildAfterOperation)({
            operation: 'update',
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
exports.default = update;
//# sourceMappingURL=update.js.map