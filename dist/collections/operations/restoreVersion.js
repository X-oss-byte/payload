"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/* eslint-disable no-underscore-dangle */
const http_status_1 = __importDefault(require("http-status"));
const errors_1 = require("../../errors");
const executeAccess_1 = __importDefault(require("../../auth/executeAccess"));
const types_1 = require("../../auth/types");
const afterChange_1 = require("../../fields/hooks/afterChange");
const afterRead_1 = require("../../fields/hooks/afterRead");
const getLatestCollectionVersion_1 = require("../../versions/getLatestCollectionVersion");
const combineQueries_1 = require("../../database/combineQueries");
const initTransaction_1 = require("../../utilities/initTransaction");
const killTransaction_1 = require("../../utilities/killTransaction");
async function restoreVersion(args) {
    const { collection: { config: collectionConfig, }, id, overrideAccess = false, showHiddenFields, depth, req: { t, payload, locale, }, req, } = args;
    try {
        const shouldCommit = await (0, initTransaction_1.initTransaction)(req);
        if (!id) {
            throw new errors_1.APIError('Missing ID of version to restore.', http_status_1.default.BAD_REQUEST);
        }
        // /////////////////////////////////////
        // Retrieve original raw version
        // /////////////////////////////////////
        const { docs: versionDocs } = await req.payload.db.findVersions({
            collection: collectionConfig.slug,
            where: { id: { equals: id } },
            locale,
            limit: 1,
            req,
        });
        const [rawVersion] = versionDocs;
        if (!rawVersion) {
            throw new errors_1.NotFound(t);
        }
        const parentDocID = rawVersion.parent;
        // /////////////////////////////////////
        // Access
        // /////////////////////////////////////
        const accessResults = !overrideAccess ? await (0, executeAccess_1.default)({ req, id: parentDocID }, collectionConfig.access.update) : true;
        const hasWherePolicy = (0, types_1.hasWhereAccessResult)(accessResults);
        // /////////////////////////////////////
        // Retrieve document
        // /////////////////////////////////////
        const findOneArgs = {
            collection: collectionConfig.slug,
            where: (0, combineQueries_1.combineQueries)({ id: { equals: parentDocID } }, accessResults),
            locale,
            req,
        };
        const doc = await req.payload.db.findOne(findOneArgs);
        if (!doc && !hasWherePolicy)
            throw new errors_1.NotFound(t);
        if (!doc && hasWherePolicy)
            throw new errors_1.Forbidden(t);
        // /////////////////////////////////////
        // fetch previousDoc
        // /////////////////////////////////////
        const prevDocWithLocales = await (0, getLatestCollectionVersion_1.getLatestCollectionVersion)({
            payload,
            id: parentDocID,
            query: findOneArgs,
            config: collectionConfig,
            req,
        });
        // /////////////////////////////////////
        // Update
        // /////////////////////////////////////
        let result = await req.payload.db.updateOne({
            collection: collectionConfig.slug,
            id: parentDocID,
            data: rawVersion.version,
            req,
        });
        // /////////////////////////////////////
        // Save `previousDoc` as a version after restoring
        // /////////////////////////////////////
        const prevVersion = { ...prevDocWithLocales };
        delete prevVersion.id;
        await payload.db.createVersion({
            collectionSlug: collectionConfig.slug,
            parent: parentDocID,
            versionData: rawVersion.version,
            autosave: false,
            createdAt: prevVersion.createdAt,
            updatedAt: new Date().toISOString(),
            req,
        });
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
            data: result,
            doc: result,
            previousDoc: prevDocWithLocales,
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
                req,
                previousDoc: prevDocWithLocales,
                operation: 'update',
                context: req.context,
            }) || result;
        }, Promise.resolve());
        if (shouldCommit)
            await payload.db.commitTransaction(req.transactionID);
        return result;
    }
    catch (error) {
        await (0, killTransaction_1.killTransaction)(req);
        throw error;
    }
}
exports.default = restoreVersion;
//# sourceMappingURL=restoreVersion.js.map