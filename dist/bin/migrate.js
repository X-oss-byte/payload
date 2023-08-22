"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.migrate = void 0;
const __1 = __importDefault(require(".."));
const migrate = async (args) => {
    // Barebones instance to access database adapter
    await __1.default.init({
        secret: '--unused--',
        local: true,
    });
    const adapter = __1.default.db;
    if (!adapter) {
        throw new Error('No database adapter found');
    }
    switch (args[0]) {
        case 'migrate':
            await adapter.migrate();
            break;
        case 'migrate:status':
            await adapter.migrateStatus();
            break;
        case 'migrate:down':
            await adapter.migrateDown();
            break;
        case 'migrate:refresh':
            await adapter.migrateRefresh();
            break;
        case 'migrate:reset':
            await adapter.migrateReset();
            break;
        case 'migrate:fresh':
            await adapter.migrateFresh();
            break;
        case 'migrate:create':
            try {
                await adapter.createMigration(__1.default, '.migrations', args[1]);
            }
            catch (err) {
                throw new Error(`Error creating migration: ${err.message}`);
            }
            break;
        default:
            throw new Error(`Unknown migration command: ${args[0]}`);
    }
};
exports.migrate = migrate;
// When launched directly call migrate
if (module.id === require.main.id) {
    const args = process.argv.slice(2);
    (0, exports.migrate)(args).then(() => {
        process.exit(0);
    });
}
//# sourceMappingURL=migrate.js.map