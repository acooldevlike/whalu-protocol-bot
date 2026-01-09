import { Context } from 'telegraf'
import { isBotConfigured, getBotConfig } from '../../services/botConfig'

export async function requireConfiguration(ctx: Context, next: () => Promise<void>) {
  const configured = isBotConfigured()
  const config = getBotConfig()
  
  console.log('🔍 Configuration check:', {
    configured,
    hasConfig: !!config,
    configData: config
  })
  
  if (!configured) {
    console.log('❌ Bot not configured - blocking command')
    await ctx.reply(
      `⚠️ *Bot Not Configured*\n\n` +
      `Admin must run /setup\\_ca first to configure the token.`,
      { parse_mode: 'Markdown' }
    )
    return
  }
  
  console.log('✅ Bot configured - allowing command')
  await next()
}
