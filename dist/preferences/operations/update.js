"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const defaultAccess_1 = __importDefault(require("../../auth/defaultAccess"));
const executeAccess_1 = __importDefault(require("../../auth/executeAccess"));
const UnathorizedError_1 = __importDefault(require("../../errors/UnathorizedError"));
async function update(args) {
    const { overrideAccess, user, req, req: { payload, }, key, value, } = args;
    const collection = 'payload-preferences';
    const filter = {
        key: { equals: key },
        'user.value': { equals: user.id },
        'user.relationTo': { equals: user.collection },
    };
    const preference = {
        key,
        value,
        user: {
            value: user.id,
            relationTo: user.collection,
        },
    };
    if (!user) {
        throw new UnathorizedError_1.default(req.t);
    }
    if (!overrideAccess) {
        await (0, executeAccess_1.default)({ req }, defaultAccess_1.default);
    }
    // TODO: workaround to prevent race-conditions 500 errors from violating unique constraints
    try {
        await payload.db.create({
            collection,
            data: preference,
            req,
        });
    }
    catch (err) {
        await payload.db.updateOne({
            collection,
            where: filter,
            data: preference,
            req,
        });
    }
    return preference;
}
exports.default = update;
//# sourceMappingURL=update.js.map