import { Context } from 'telegraf'
import db from '../../database/db'

export async function debugConfigCommand(ctx: Context) {
  try {
    const config = db.prepare('SELECT * FROM bot_config WHERE id = 1').get() as any
    
    await ctx.reply(
      `🔍 DEBUG CONFIG\n\n` +
      `Exists: ${!!config}\n` +
      `Configured: ${config?.configured}\n` +
      `Token CA: ${config?.token_ca || 'none'}\n` +
      `Setup Date: ${config?.setup_date || 'none'}\n\n` +
      `Raw data:\n${JSON.stringify(config, null, 2)}`
    )
  } catch (error) {
    console.error('Debug config error:', error)
    await ctx.reply(`❌ Error: ${error}`)
  }
}
