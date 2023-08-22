"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
async function init(args) {
    const { req: { payload }, collection: slug, } = args;
    const doc = await payload.db.findOne({
        collection: slug,
    });
    return !!doc;
}
exports.default = init;
//# sourceMappingURL=init.js.map