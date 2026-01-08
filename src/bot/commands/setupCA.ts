import { Context } from 'telegraf'
import { isValidSolanaAddress, saveBotConfig, isBotConfigured } from '../../services/botConfig'
import db from '../../database/db'

// Track setup state - only need to track if waiting for CA
const setupState = new Map<number, boolean>()

export async function setupCACommand(ctx: Context) {
  const telegramId = ctx.from!.id
  
  // NO admin check - anyone can configure on first deployment
  
  // Check if already configured
  const configured = isBotConfigured()
  if (configured) {
    const config = db.prepare('SELECT * FROM bot_config WHERE id = 1').get() as any
    await ctx.reply(
      `⚠️ *Bot Already Configured*\n\n` +
      `CA: \`${config.token_ca.slice(0, 8)}...${config.token_ca.slice(-8)}\`\n\n` +
      `To reconfigure, contact bot admin.\n` +
      `(This prevents accidental resets)`,
      { parse_mode: 'Markdown' }
    )
    return
  }
  
  // Start setup - anyone can configure on first run
  setupState.set(telegramId, true)
  
  await ctx.reply(
    `🔧 *TOKEN CONFIGURATION*\n\n` +
    `Send your token CA (Solana mint address):\n\n` +
    `Type /cancel to abort.`,
    { parse_mode: 'Markdown' }
  )
}

export async function handleSetupMessage(ctx: Context) {
  const telegramId = ctx.from!.id
  const isWaitingForCA = setupState.get(telegramId)
  
  if (!isWaitingForCA) {
    return false // Not in setup mode
  }
  
  const messageText = (ctx.message as any)?.text
  
  if (!messageText) {
    return false
  }
  
  // Handle cancel
  if (messageText.startsWith('/cancel')) {
    setupState.delete(telegramId)
    await ctx.reply('❌ Setup cancelled.')
    return true
  }
  
  // Single step: Token CA input
  const tokenCA = messageText.trim()
  
  // Validate CA format only (no blockchain checks)
  if (!isValidSolanaAddress(tokenCA)) {
    await ctx.reply(
      `❌ *Invalid Address Format*\n\n` +
      `Please send a valid Solana address.\n\n` +
      `Try again or type /cancel to abort.`,
      { parse_mode: 'Markdown' }
    )
    return true
  }
  
  // Save configuration immediately - no name/symbol needed
  console.log('💾 Saving configuration:', tokenCA)
  saveBotConfig(tokenCA)
  
  // Verify it saved
  const saved = db.prepare('SELECT * FROM bot_config WHERE id = 1').get() as any
  console.log('✅ Verified saved config:', saved)
  
  setupState.delete(telegramId)
  
  await ctx.reply(
    `✅ *CONFIGURATION COMPLETE*\n\n` +
    `Token CA: \`${tokenCA.slice(0, 8)}...${tokenCA.slice(-8)}\`\n\n` +
    `Bot is now tracking:\n` +
    `🔍 Holder count\n` +
    `💰 Market cap\n` +
    `📊 Price data\n\n` +
    `All systems active!\n\n` +
    `🌊 Kairyu Flow\n` +
    `波 Nami Score\n` +
    `淵 Fuchi Pool\n\n` +
    `Users can now interact with the bot!`,
    { parse_mode: 'Markdown' }
  )
  
  return true
}
