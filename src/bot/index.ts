import { Telegraf, Markup } from 'telegraf'
import db from '../database/db'
import { getBalance, getWalletAddress } from '../services/solana'
import { 
  linkWalletCommand, 
  handleWalletLinkMessage, 
  myWalletCommand, 
  unlinkWalletCommand 
} from './commands/linkWallet'
import { buybackCommand, confirmBuyback, cancelBuyback } from './commands/buyback'
import { startCommand } from './commands/start'
import { helpCommand } from './commands/help'
import { lotteryCommand } from './commands/lottery'
import { lotteryHistoryCommand } from './commands/lotteryHistory'
import { nextMilestoneCommand } from './commands/nextMilestone'
import { autoBuybackCommand } from './commands/autoBuyback'
import { cancelTriggerCommand, handleCancelTrigger } from './commands/cancelTrigger'
import { freezeStatusCommand } from './commands/freezeStatus'
import { executeFreezeCommand, handleFreezeConfirmation } from './commands/executeFreeze'
import { cancelCommand } from './commands/cancel'
import { namiCommand } from './commands/nami'
import { entryCommand } from './commands/entry'
import { diamondCommand } from './commands/diamond'
import { reefCommand } from './commands/reef'
import { fuchiCommand } from './commands/fuchi'
import { milestonesCommand } from './commands/milestones'
import { unlockedCommand } from './commands/unlocked'
import { depthsCommand } from './commands/depths'
import { tidesCommand } from './commands/tides'
import { setupCACommand, handleSetupMessage } from './commands/setupCA'
import { resetCACommand, handleResetConfirmation } from './commands/resetCA'
import { debugConfigCommand } from './commands/debugConfig'
import { testApiCommand } from './commands/testApi'
import { verifyTokenCommand } from './commands/verifyToken'
import { requireConfiguration } from './middleware/requireConfiguration'

const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN!)

// Global error handler
bot.catch((err: any, ctx) => {
  console.error('❌ BOT ERROR:', err)
  console.error('Error details:', err.message)
  console.error('Update:', JSON.stringify(ctx.update, null, 2))
  
  try {
    ctx.reply('⚠️ An error occurred. Please try again or use /cancel to reset.').catch(console.error)
  } catch (e) {
    console.error('Failed to send error message:', e)
  }
})

// Log all incoming messages
bot.use((ctx, next) => {
  const text = (ctx.message as any)?.text || (ctx.callbackQuery as any)?.data
  if (text) {
    console.log('📨 Incoming:', text, 'from user:', ctx.from?.id)
  }
  return next()
})

// Rate limiting
const userCooldown = new Map<number, number>()
bot.use(async (ctx, next) => {
  const userId = ctx.from?.id
  if (!userId) return next()
  
  const now = Date.now()
  const last = userCooldown.get(userId) || 0
  if (now - last < 1000) return
  
  userCooldown.set(userId, now)
  
  return next()
})

// Text message handler for conversation flows (AFTER commands are registered)
bot.on('text', async (ctx, next) => {
  // Only process text if it's not a command
  const messageText = ctx.message.text
  if (messageText.startsWith('/')) {
    return next() // Let command handlers deal with it
  }
  
  // Check if user is in wallet linking flow
  const walletHandled = await handleWalletLinkMessage(ctx)
  if (walletHandled) return
  
  // Check if user is in setup flow
  const setupHandled = await handleSetupMessage(ctx)
  if (setupHandled) return
  
  // Check if user is in reset confirmation flow
  const resetHandled = await handleResetConfirmation(ctx)
  if (resetHandled) return
  
  // Check if user is in freeze confirmation flow
  const freezeHandled = await handleFreezeConfirmation(ctx)
  if (freezeHandled) return
  
  // If no handler processed it, continue
  return next()
})

// Command handlers (registered BEFORE text handlers)
bot.command('start', startCommand)
bot.command('help', helpCommand)
bot.command('cancel', cancelCommand)
bot.command('setup_ca', setupCACommand)
bot.command('reset_ca', resetCACommand)
bot.command('debug_config', debugConfigCommand)
bot.command('test_api', testApiCommand)
bot.command('verify_token', verifyTokenCommand)

bot.command('lottery', lotteryCommand)
bot.command('lottery_history', lotteryHistoryCommand)
bot.command('next_milestone', nextMilestoneCommand)
bot.command('auto_buyback', autoBuybackCommand)
bot.command('cancel_trigger', cancelTriggerCommand)

// Freeze protocol commands
bot.command('freeze_status', freezeStatusCommand)
bot.command('execute_freeze', executeFreezeCommand)

// Wallet commands
bot.command('link_wallet', linkWalletCommand)
bot.command('my_wallet', myWalletCommand)
bot.command('unlink_wallet', unlinkWalletCommand)

// Kairyu Flow commands (require configuration)
bot.command('kairyu', requireConfiguration, buybackCommand)
bot.command('buyback', requireConfiguration, buybackCommand) // Keep alias for compatibility

// Nami Score commands (require configuration)
bot.command('nami', requireConfiguration, namiCommand)
bot.command('entry', requireConfiguration, entryCommand)
bot.command('diamond', requireConfiguration, diamondCommand)
bot.command('reef', requireConfiguration, reefCommand)

// Fuchi Pool commands (require configuration)
bot.command('fuchi', requireConfiguration, fuchiCommand)
bot.command('milestones', requireConfiguration, milestonesCommand)
bot.command('unlocked', requireConfiguration, unlockedCommand)

// Core metrics commands (require configuration)
bot.command('depths', requireConfiguration, depthsCommand)
bot.command('tides', requireConfiguration, tidesCommand)

// Handle button callbacks
bot.action('help', async (ctx) => {
  try {
    await ctx.answerCbQuery()
  } catch (e) {
    // Ignore old callback query errors
  }
  try {
    await ctx.editMessageText(
    `🐋 *WHALU PROTOCOL Commands*

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

The ocean rewards patience. 🐋`,
    { parse_mode: 'Markdown' }
  )
  } catch (e) {
    console.error('Help callback error:', e)
  }
})

bot.action('fuchi', async (ctx) => {
  try {
    await ctx.answerCbQuery()
  } catch (e) {
    // Ignore old callback query errors
  }
  try {
    await fuchiCommand(ctx as any)
  } catch (e) {
    console.error('Fuchi callback error:', e)
  }
})

bot.action('lottery', async (ctx) => {
  try {
    await ctx.answerCbQuery()
  } catch (e) {
    // Ignore old callback query errors
  }
  try {
  const pool = db.prepare('SELECT * FROM lottery_pool WHERE id = 1').get() as any
  
  const currentMC = pool.current_market_cap || 0
  const nextMilestone = pool.next_milestone_market_cap || 30000
  const progress = Math.min((currentMC / nextMilestone) * 100, 100)
  const progressBar = '▓'.repeat(Math.floor(progress / 10)) + '░'.repeat(10 - Math.floor(progress / 10))
  
  const formatMC = (mc: number): string => {
    if (mc >= 1000000) return `${(mc / 1000000).toFixed(1)}M`
    if (mc >= 1000) return `${(mc / 1000).toFixed(0)}k`
    return mc.toFixed(0)
  }
  
  await ctx.editMessageText(
    `🌀 *FUCHI POOL*

Current Pool: *${pool.current_amount.toFixed(2)} SOL* 💰

Next Milestone: *$${formatMC(nextMilestone)} Market Cap*
Current Market Cap: *$${formatMC(currentMC)}*
Progress: [${progressBar}] ${progress.toFixed(1)}%

The ocean rewards patience. 🐋`,
    { parse_mode: 'Markdown' }
  )
  } catch (e) {
    console.error('Lottery callback error:', e)
  }
})

bot.action('buyback', async (ctx) => {
  try {
    await ctx.answerCbQuery()
  } catch (e) {
    // Ignore old callback query errors
  }
  try {
  await ctx.editMessageText(
    `💰 *Execute Buyback*

Use /buyback <amount> to execute a buyback.

Example: /buyback 1.5`,
    { parse_mode: 'Markdown' }
  )
  } catch (e) {
    console.error('Buyback callback error:', e)
  }
})

bot.action('auto_buyback', async (ctx) => {
  try {
    await ctx.answerCbQuery()
  } catch (e) {
    // Ignore old callback query errors
  }
  try {
  await ctx.editMessageText(
    `🎯 *Set Price Trigger*

Use /auto\_buyback <price> <amount> to set a trigger.

Example: /auto\_buyback 0.05 2

The bot will execute when price reaches your target! 🐋`,
    { parse_mode: 'Markdown' }
  )
  } catch (e) {
    console.error('Auto buyback callback error:', e)
  }
})

// Buyback confirmation callbacks
bot.action(/^confirm_buyback_(\d+)$/, async (ctx) => {
  await confirmBuyback(ctx, bot)
})

bot.action(/^cancel_buyback_(\d+)$/, async (ctx) => {
  await cancelBuyback(ctx)
})

// Cancel trigger callback
bot.action(/^cancel_trigger_(\d+)$/, async (ctx) => {
  await handleCancelTrigger(ctx)
})

export default bot
