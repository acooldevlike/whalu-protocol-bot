"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.startCommand = startCommand;
const db_1 = __importDefault(require("../../database/db"));
async function startCommand(ctx) {
    try {
        const telegramId = ctx.from.id;
        const username = ctx.from.username || 'Unknown';
        db_1.default.prepare('INSERT OR IGNORE INTO users (telegram_id, username) VALUES (?, ?)').run(telegramId, username);
        // Direct simple query
        const row = db_1.default.prepare('SELECT token_ca FROM bot_config WHERE id = 1').get();
        console.log('/start - Database result:', row);
        if (!row || !row.token_ca) {
            await ctx.reply("🐋 Welcome to WHALU Protocol\n\n" +
                "⚠️ Bot not configured yet.\n\n" +
                "Run /setup_ca to configure your token first.");
            return;
        }
        // CONFIGURED - Show welcome
        const tokenShort = `${row.token_ca.slice(0, 8)}...${row.token_ca.slice(-8)}`;
        await ctx.reply("🐋 Welcome to WHALU Protocol\n\n" +
            "Three currents flow as one:\n\n" +
            "海流 KAIRYU (50%) - Automated buybacks\n" +
            "波 NAMI (30%) - Wave rider rewards\n" +
            "淵 FUCHI (20%) - Collective multipliers\n\n" +
            "━━━━━━━━━━━━━━━\n\n" +
            "/link_wallet - Connect\n" +
            "/kairyu - Buyback status\n" +
            "/nami - Your wave score\n" +
            "/fuchi - Pool progress\n" +
            "/help - All commands\n\n" +
            "The ocean rewards patience.\n\n" +
            `🪙 Token: ${tokenShort}\n` +
            "鯨");
    }
    catch (error) {
        console.error('/start error:', error);
        await ctx.reply("❌ Error: " + error.message);
    }
}
//# sourceMappingURL=start.js.map