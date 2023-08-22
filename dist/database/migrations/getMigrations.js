"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMigrations = void 0;
async function getMigrations({ payload, }) {
    var _a;
    const migrationQuery = await payload.find({
        collection: 'payload-migrations',
        sort: '-name',
        where: {
            and: [
                {
                    batch: {
                        not_equals: '-1',
                    },
                },
                {
                    batch: {
                        not_equals: -1,
                    },
                },
            ],
        },
    });
    const existingMigrations = migrationQuery.docs;
    // Get the highest batch number from existing migrations
    const latestBatch = Number((_a = existingMigrations === null || existingMigrations === void 0 ? void 0 : existingMigrations[0]) === null || _a === void 0 ? void 0 : _a.batch) || 0;
    return {
        existingMigrations: existingMigrations.map((m) => {
            return {
                ...m,
                // Cast to number to accomodate postgres numeric field type. Stores as string.
                batch: Number(m.batch),
            };
        }),
        latestBatch: Number(latestBatch),
    };
}
exports.getMigrations = getMigrations;
//# sourceMappingURL=getMigrations.js.map