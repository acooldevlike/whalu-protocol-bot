import { Context } from 'telegraf'
import db from '../../database/db'
import { getBotConfig } from '../../services/botConfig'

const resetConfirmationState = new Map<number, boolean>()

export async function resetCACommand(ctx: Context) {
  try {
    const config = getBotConfig()
    
    if (!config || !config.configured) {
      await ctx.reply('⚠️ No configuration found. Use /setup_ca to configure.')
      return
    }
    
    const userId = ctx.from!.id
    resetConfirmationState.set(userId, true)
    
    await ctx.reply(
      `🔧 *RESET CONFIGURATION*\n\n` +
      `Current CA: \`${config.token_ca}\`\n\n` +
      `⚠️ This will delete current configuration and all cached metrics\\.\n\n` +
      `Reply with *CONFIRM* to reset, or anything else to cancel\\.`,
      { parse_mode: 'Markdown' }
    )
    
  } catch (error) {
    console.error('❌ Reset CA command error:', error)
    await ctx.reply('❌ Failed to initiate reset.')
  }
}

export async function handleResetConfirmation(ctx: Context): Promise<boolean> {
  const userId = ctx.from!.id
  
  if (!resetConfirmationState.has(userId)) {
    return false
  }
  
  const messageText = ctx.message && 'text' in ctx.message ? ctx.message.text : ''
  
  if (messageText.toUpperCase() === 'CONFIRM') {
    try {
      console.log('🔄 Resetting configuration...')
      
      // Delete configuration
      const deleteConfig = db.prepare('DELETE FROM bot_config WHERE id = 1')
      deleteConfig.run()
      console.log('✅ Deleted bot_config')
      
      // Delete metrics (if table exists)
      try {
        const deleteMetrics = db.prepare('DELETE FROM token_metrics')
        deleteMetrics.run()
        console.log('✅ Deleted token_metrics')
      } catch (metricsError) {
        console.log('⚠️ token_metrics table does not exist or is empty')
      }
      
      resetConfirmationState.delete(userId)
      
      await ctx.reply(
        `✅ *Configuration reset\\!*\n\n` +
        `Use /setup\\_ca to configure a new token\\.`,
        { parse_mode: 'Markdown' }
      )
      
      return true
      
    } catch (error: any) {
      console.error('❌ Reset confirmation error:', error)
      console.error('Error details:', error.message)
      await ctx.reply('❌ Failed to reset configuration\\.')
      resetConfirmationState.delete(userId)
      return true
    }
  } else {
    resetConfirmationState.delete(userId)
    await ctx.reply('❌ Reset cancelled.')
    return true
  }
}
