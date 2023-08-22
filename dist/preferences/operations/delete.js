"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const executeAccess_1 = __importDefault(require("../../auth/executeAccess"));
const defaultAccess_1 = __importDefault(require("../../auth/defaultAccess"));
const UnathorizedError_1 = __importDefault(require("../../errors/UnathorizedError"));
const NotFound_1 = __importDefault(require("../../errors/NotFound"));
async function deleteOperation(args) {
    const { overrideAccess, req, req: { payload, }, user, key, } = args;
    if (!user) {
        throw new UnathorizedError_1.default(req.t);
    }
    if (!overrideAccess) {
        await (0, executeAccess_1.default)({ req }, defaultAccess_1.default);
    }
    const where = {
        and: [
            { key: { equals: key } },
            { 'user.value': { equals: user.id } },
            { 'user.relationTo': { equals: user.collection } },
        ],
    };
    const result = await payload.delete({
        collection: 'payload-preferences',
        where,
        depth: 0,
        user,
    });
    if (result.docs.length === 1) {
        return result.docs[0];
    }
    throw new NotFound_1.default();
}
exports.default = deleteOperation;
//# sourceMappingURL=delete.js.map