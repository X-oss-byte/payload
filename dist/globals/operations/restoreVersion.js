"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const executeAccess_1 = __importDefault(require("../../auth/executeAccess"));
const errors_1 = require("../../errors");
const afterChange_1 = require("../../fields/hooks/afterChange");
const afterRead_1 = require("../../fields/hooks/afterRead");
const initTransaction_1 = require("../../utilities/initTransaction");
const killTransaction_1 = require("../../utilities/killTransaction");
async function restoreVersion(args) {
    const { id, depth, globalConfig, req, req: { t, payload, }, overrideAccess, showHiddenFields, } = args;
    try {
        const shouldCommit = await (0, initTransaction_1.initTransaction)(req);
        // /////////////////////////////////////
        // Access
        // /////////////////////////////////////
        if (!overrideAccess) {
            await (0, executeAccess_1.default)({ req }, globalConfig.access.update);
        }
        // /////////////////////////////////////
        // Retrieve original raw version
        // /////////////////////////////////////
        const { docs: versionDocs } = await payload.db.findGlobalVersions({
            global: globalConfig.slug,
            where: { id: { equals: id } },
            limit: 1,
            req,
        });
        if (!versionDocs || versionDocs.length === 0) {
            throw new errors_1.NotFound(t);
        }
        const rawVersion = versionDocs[0];
        // /////////////////////////////////////
        // fetch previousDoc
        // /////////////////////////////////////
        const previousDoc = await payload.findGlobal({
            slug: globalConfig.slug,
            depth,
            req,
        });
        // /////////////////////////////////////
        // Update global
        // /////////////////////////////////////
        const global = await payload.db.findGlobal({
            slug: globalConfig.slug,
        });
        let result = rawVersion.version;
        if (global) {
            result = await payload.db.updateGlobal({
                slug: globalConfig.slug,
                data: result,
            });
        }
        else {
            result = await payload.db.createGlobal({
                slug: globalConfig.slug,
                data: result,
            });
        }
        // /////////////////////////////////////
        // afterRead - Fields
        // /////////////////////////////////////
        result = await (0, afterRead_1.afterRead)({
            depth,
            doc: result,
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
            result = await hook({
                doc: result,
                req,
            }) || result;
        }, Promise.resolve());
        // /////////////////////////////////////
        // afterChange - Fields
        // /////////////////////////////////////
        result = await (0, afterChange_1.afterChange)({
            data: result,
            doc: result,
            previousDoc,
            entityConfig: globalConfig,
            operation: 'update',
            req,
            context: req.context,
        });
        // /////////////////////////////////////
        // afterChange - Global
        // /////////////////////////////////////
        await globalConfig.hooks.afterChange.reduce(async (priorHook, hook) => {
            await priorHook;
            result = await hook({
                doc: result,
                previousDoc,
                req,
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