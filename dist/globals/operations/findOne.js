"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const executeAccess_1 = __importDefault(require("../../auth/executeAccess"));
const replaceWithDraftIfAvailable_1 = __importDefault(require("../../versions/drafts/replaceWithDraftIfAvailable"));
const afterRead_1 = require("../../fields/hooks/afterRead");
const initTransaction_1 = require("../../utilities/initTransaction");
const killTransaction_1 = require("../../utilities/killTransaction");
async function findOne(args) {
    var _a;
    const { globalConfig, req, req: { payload, locale, }, slug, depth, showHiddenFields, draft: draftEnabled = false, overrideAccess = false, } = args;
    try {
        const shouldCommit = await (0, initTransaction_1.initTransaction)(req);
        // /////////////////////////////////////
        // Retrieve and execute access
        // /////////////////////////////////////
        let accessResult;
        if (!overrideAccess) {
            accessResult = await (0, executeAccess_1.default)({ req }, globalConfig.access.read);
        }
        // /////////////////////////////////////
        // Perform database operation
        // /////////////////////////////////////
        let doc = await req.payload.db.findGlobal({
            slug,
            locale,
            where: overrideAccess ? undefined : accessResult,
            req,
        });
        if (!doc) {
            doc = {};
        }
        // /////////////////////////////////////
        // Replace document with draft if available
        // /////////////////////////////////////
        if (((_a = globalConfig.versions) === null || _a === void 0 ? void 0 : _a.drafts) && draftEnabled) {
            doc = await (0, replaceWithDraftIfAvailable_1.default)({
                entity: globalConfig,
                entityType: 'global',
                doc,
                req,
                overrideAccess,
                accessResult,
            });
        }
        // /////////////////////////////////////
        // Execute before global hook
        // /////////////////////////////////////
        await globalConfig.hooks.beforeRead.reduce(async (priorHook, hook) => {
            await priorHook;
            doc = await hook({
                req,
                doc,
            }) || doc;
        }, Promise.resolve());
        // /////////////////////////////////////
        // Execute field-level hooks and access
        // /////////////////////////////////////
        doc = await (0, afterRead_1.afterRead)({
            depth,
            doc,
            entityConfig: globalConfig,
            req,
            overrideAccess,
            showHiddenFields,
            context: req.context,
        });
        // /////////////////////////////////////
        // Execute after global hook
        // /////////////////////////////////////
        await globalConfig.hooks.afterRead.reduce(async (priorHook, hook) => {
            await priorHook;
            doc = await hook({
                req,
                doc,
            }) || doc;
        }, Promise.resolve());
        // /////////////////////////////////////
        // Return results
        // /////////////////////////////////////
        if (shouldCommit)
            await payload.db.commitTransaction(req.transactionID);
        // /////////////////////////////////////
        // Return results
        // /////////////////////////////////////
        return doc;
    }
    catch (error) {
        await (0, killTransaction_1.killTransaction)(req);
        throw error;
    }
}
exports.default = findOne;
//# sourceMappingURL=findOne.js.map