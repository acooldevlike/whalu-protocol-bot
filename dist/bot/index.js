"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const telegraf_1 = require("telegraf");
const db_1 = __importDefault(require("../database/db"));
const linkWallet_1 = require("./commands/linkWallet");
const buyback_1 = require("./commands/buyback");
const start_1 = require("./commands/start");
const help_1 = require("./commands/help");
const lottery_1 = require("./commands/lottery");
const lotteryHistory_1 = require("./commands/lotteryHistory");
const nextMilestone_1 = require("./commands/nextMilestone");
const autoBuyback_1 = require("./commands/autoBuyback");
const cancelTrigger_1 = require("./commands/cancelTrigger");
const freezeStatus_1 = require("./commands/freezeStatus");
const executeFreeze_1 = require("./commands/executeFreeze");
const cancel_1 = require("./commands/cancel");
const nami_1 = require("./commands/nami");
const entry_1 = require("./commands/entry");
const diamond_1 = require("./commands/diamond");
const reef_1 = require("./commands/reef");
const fuchi_1 = require("./commands/fuchi");
const milestones_1 = require("./commands/milestones");
const unlocked_1 = require("./commands/unlocked");
const depths_1 = require("./commands/depths");
const tides_1 = require("./commands/tides");
const setupCA_1 = require("./commands/setupCA");
const resetCA_1 = require("./commands/resetCA");
const debugConfig_1 = require("./commands/debugConfig");
const testApi_1 = require("./commands/testApi");
const verifyToken_1 = require("./commands/verifyToken");
const requireConfiguration_1 = require("./middleware/requireConfiguration");
const bot = new telegraf_1.Telegraf(process.env.TELEGRAM_BOT_TOKEN);
// Global error handler
bot.catch((err, ctx) => {
    console.error('❌ BOT ERROR:', err);
    console.error('Error details:', err.message);
    console.error('Update:', JSON.stringify(ctx.update, null, 2));
    try {
        ctx.reply('⚠️ An error occurred. Please try again or use /cancel to reset.').catch(console.error);
    }
    catch (e) {
        console.error('Failed to send error message:', e);
    }
});
// Log all incoming messages
bot.use((ctx, next) => {
    const text = ctx.message?.text || ctx.callbackQuery?.data;
    if (text) {
        console.log('📨 Incoming:', text, 'from user:', ctx.from?.id);
    }
    return next();
});
// Rate limiting
const userCooldown = new Map();
bot.use(async (ctx, next) => {
    const userId = ctx.from?.id;
    if (!userId)
        return next();
    const now = Date.now();
    const last = userCooldown.get(userId) || 0;
    if (now - last < 1000)
        return;
    userCooldown.set(userId, now);
    return next();
});
// Text message handler for conversation flows (AFTER commands are registered)
bot.on('text', async (ctx, next) => {
    // Only process text if it's not a command
    const messageText = ctx.message.text;
    if (messageText.startsWith('/')) {
        return next(); // Let command handlers deal with it
    }
    // Check if user is in wallet linking flow
    const walletHandled = await (0, linkWallet_1.handleWalletLinkMessage)(ctx);
    if (walletHandled)
        return;
    // Check if user is in setup flow
    const setupHandled = await (0, setupCA_1.handleSetupMessage)(ctx);
    if (setupHandled)
        return;
    // Check if user is in reset confirmation flow
    const resetHandled = await (0, resetCA_1.handleResetConfirmation)(ctx);
    if (resetHandled)
        return;
    // Check if user is in freeze confirmation flow
    const freezeHandled = await (0, executeFreeze_1.handleFreezeConfirmation)(ctx);
    if (freezeHandled)
        return;
    // If no handler processed it, continue
    return next();
});
// Command handlers (registered BEFORE text handlers)
bot.command('start', start_1.startCommand);
bot.command('help', help_1.helpCommand);
bot.command('cancel', cancel_1.cancelCommand);
bot.command('setup_ca', setupCA_1.setupCACommand);
bot.command('reset_ca', resetCA_1.resetCACommand);
bot.command('debug_config', debugConfig_1.debugConfigCommand);
bot.command('test_api', testApi_1.testApiCommand);
bot.command('verify_token', verifyToken_1.verifyTokenCommand);
bot.command('lottery', lottery_1.lotteryCommand);
bot.command('lottery_history', lotteryHistory_1.lotteryHistoryCommand);
bot.command('next_milestone', nextMilestone_1.nextMilestoneCommand);
bot.command('auto_buyback', autoBuyback_1.autoBuybackCommand);
bot.command('cancel_trigger', cancelTrigger_1.cancelTriggerCommand);
// Freeze protocol commands
bot.command('freeze_status', freezeStatus_1.freezeStatusCommand);
bot.command('execute_freeze', executeFreeze_1.executeFreezeCommand);
// Wallet commands
bot.command('link_wallet', linkWallet_1.linkWalletCommand);
bot.command('my_wallet', linkWallet_1.myWalletCommand);
bot.command('unlink_wallet', linkWallet_1.unlinkWalletCommand);
// Kairyu Flow commands (require configuration)
bot.command('kairyu', requireConfiguration_1.requireConfiguration, buyback_1.buybackCommand);
bot.command('buyback', requireConfiguration_1.requireConfiguration, buyback_1.buybackCommand); // Keep alias for compatibility
// Nami Score commands (require configuration)
bot.command('nami', requireConfiguration_1.requireConfiguration, nami_1.namiCommand);
bot.command('entry', requireConfiguration_1.requireConfiguration, entry_1.entryCommand);
bot.command('diamond', requireConfiguration_1.requireConfiguration, diamond_1.diamondCommand);
bot.command('reef', requireConfiguration_1.requireConfiguration, reef_1.reefCommand);
// Fuchi Pool commands (require configuration)
bot.command('fuchi', requireConfiguration_1.requireConfiguration, fuchi_1.fuchiCommand);
bot.command('milestones', requireConfiguration_1.requireConfiguration, milestones_1.milestonesCommand);
bot.command('unlocked', requireConfiguration_1.requireConfiguration, unlocked_1.unlockedCommand);
// Core metrics commands (require configuration)
bot.command('depths', requireConfiguration_1.requireConfiguration, depths_1.depthsCommand);
bot.command('tides', requireConfiguration_1.requireConfiguration, tides_1.tidesCommand);
// Handle button callbacks
bot.action('help', async (ctx) => {
    try {
        await ctx.answerCbQuery();
    }
    catch (e) {
        // Ignore old callback query errors
    }
    try {
        await ctx.editMessageText(`🐋 *WHALU PROTOCOL Commands*

🔑 *WALLET:*
/link\_wallet - Link Solana wallet
/my\_wallet - View wallet
/unlink\_wallet - Disconnect

💰 *BALANCE:*
/balance - Check balance

🌊 *KAIRYU FLOW (50%):*
/kairyu - Buyback status

🏄 *NAMI SCORE (30%):*
/nami - Your wave score
/entry - Entry quality
/diamond - Diamond hands
/reef - Score leaderboard

🌀 *FUCHI POOL (20%):*
/fuchi - Milestone progress
/milestones - All milestones
/unlocked - Active multipliers

📊 *METRICS:*
/depths - Complete metrics
/stats - Protocol stats

The ocean rewards patience. 🐋`, { parse_mode: 'Markdown' });
    }
    catch (e) {
        console.error('Help callback error:', e);
    }
});
bot.action('fuchi', async (ctx) => {
    try {
        await ctx.answerCbQuery();
    }
    catch (e) {
        // Ignore old callback query errors
    }
    try {
        await (0, fuchi_1.fuchiCommand)(ctx);
    }
    catch (e) {
        console.error('Fuchi callback error:', e);
    }
});
bot.action('lottery', async (ctx) => {
    try {
        await ctx.answerCbQuery();
    }
    catch (e) {
        // Ignore old callback query errors
    }
    try {
        const pool = db_1.default.prepare('SELECT * FROM lottery_pool WHERE id = 1').get();
        const currentMC = pool.current_market_cap || 0;
        const nextMilestone = pool.next_milestone_market_cap || 30000;
        const progress = Math.min((currentMC / nextMilestone) * 100, 100);
        const progressBar = '▓'.repeat(Math.floor(progress / 10)) + '░'.repeat(10 - Math.floor(progress / 10));
        const formatMC = (mc) => {
            if (mc >= 1000000)
                return `${(mc / 1000000).toFixed(1)}M`;
            if (mc >= 1000)
                return `${(mc / 1000).toFixed(0)}k`;
            return mc.toFixed(0);
        };
        await ctx.editMessageText(`🌀 *FUCHI POOL*

Current Pool: *${pool.current_amount.toFixed(2)} SOL* 💰

Next Milestone: *$${formatMC(nextMilestone)} Market Cap*
Current Market Cap: *$${formatMC(currentMC)}*
Progress: [${progressBar}] ${progress.toFixed(1)}%

The ocean rewards patience. 🐋`, { parse_mode: 'Markdown' });
    }
    catch (e) {
        console.error('Lottery callback error:', e);
    }
});
bot.action('buyback', async (ctx) => {
    try {
        await ctx.answerCbQuery();
    }
    catch (e) {
        // Ignore old callback query errors
    }
    try {
        await ctx.editMessageText(`💰 *Execute Buyback*

Use /buyback <amount> to execute a buyback.

Example: /buyback 1.5`, { parse_mode: 'Markdown' });
    }
    catch (e) {
        console.error('Buyback callback error:', e);
    }
});
bot.action('auto_buyback', async (ctx) => {
    try {
        await ctx.answerCbQuery();
    }
    catch (e) {
        // Ignore old callback query errors
    }
    try {
        await ctx.editMessageText(`🎯 *Set Price Trigger*

Use /auto\_buyback <price> <amount> to set a trigger.

Example: /auto\_buyback 0.05 2

The bot will execute when price reaches your target! 🐋`, { parse_mode: 'Markdown' });
    }
    catch (e) {
        console.error('Auto buyback callback error:', e);
    }
});
// Buyback confirmation callbacks
bot.action(/^confirm_buyback_(\d+)$/, async (ctx) => {
    await (0, buyback_1.confirmBuyback)(ctx, bot);
});
bot.action(/^cancel_buyback_(\d+)$/, async (ctx) => {
    await (0, buyback_1.cancelBuyback)(ctx);
});
// Cancel trigger callback
bot.action(/^cancel_trigger_(\d+)$/, async (ctx) => {
    await (0, cancelTrigger_1.handleCancelTrigger)(ctx);
});
exports.default = bot;
//# sourceMappingURL=index.js.map