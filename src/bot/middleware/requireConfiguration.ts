import { Context } from 'telegraf'
import { isBotConfigured } from '../../services/botConfig'

export async function requireConfiguration(ctx: Context, next: () => Promise<void>) {
  const configured = isBotConfigured()
  
  if (!configured) {
    await ctx.reply(
      `⚠️ *Bot Not Configured*\n\n` +
      `Admin must run /setup\\_ca first to configure the token.`,
      { parse_mode: 'Markdown' }
    )
    return
  }
  
  await next()
}
