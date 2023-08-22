"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
async function findOne(args) {
    const { req: { payload, }, user, key, } = args;
    const where = {
        and: [
            { key: { equals: key } },
            { 'user.value': { equals: user.id } },
            { 'user.relationTo': { equals: user.collection } },
        ],
    };
    const { docs } = await payload.find({
        collection: 'payload-preferences',
        where,
        depth: 0,
        pagination: false,
        user,
    });
    if (docs.length === 0)
        return null;
    return docs[0];
}
exports.default = findOne;
//# sourceMappingURL=findOne.js.map