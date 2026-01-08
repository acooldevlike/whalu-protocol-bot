"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.startCommand = startCommand;
const telegraf_1 = require("telegraf");
const db_1 = __importDefault(require("../../database/db"));
async function startCommand(ctx) {
    try {
        const telegramId = ctx.from.id;
        const username = ctx.from.username || 'Unknown';
        db_1.default.prepare('INSERT OR IGNORE INTO users (telegram_id, username) VALUES (?, ?)').run(telegramId, username);
        // Check if token is configured
        const row = db_1.default.prepare('SELECT token_ca FROM bot_config WHERE id = 1').get();
        const isConfigured = row && row.token_ca;
        // Build welcome message
        let message = `🐋 Welcome to WHALU Protocol!\n\n`;
        message += `鯨 = Whale in Japanese\n\n`;
        message += `Coordinate community SOL buybacks with ocean precision.\n\n`;
        message += `🌊 Three currents flowing as one\n`;
        message += `🔒 Automated buybacks with transparency\n`;
        message += `💎 Wave rider scoring system\n`;
        message += `📊 Track all your protocol activity\n\n`;
        message += `Type /help to see all available commands.\n\n`;
        message += `Ocean precision. Global coordination. 鯨`;
        // Create inline keyboard buttons
        const keyboard = telegraf_1.Markup.inlineKeyboard([
            [
                telegraf_1.Markup.button.callback('📊 View Commands', 'help'),
                telegraf_1.Markup.button.callback('🌀 Check Fuchi', 'fuchi')
            ],
            [
                telegraf_1.Markup.button.url('💰 Buy Now', `https://pump.fun/${isConfigured ? row.token_ca : ''}`)
            ]
        ]);
        await ctx.reply(message, keyboard);
    }
    catch (error) {
        console.error('/start error:', error);
        await ctx.reply("❌ Error: " + error.message);
    }
}
//# sourceMappingURL=start.js.map