import { Context } from 'telegraf'
import db from '../../database/db'
import { getNamiScore, getWalletRank, calculateWeeklyShare } from '../../services/nami/namiScore'

export async function namiCommand(ctx: Context) {
  try {
    const telegramId = ctx.from!.id
    
    // Get user's wallet from database
    const user = db.prepare('SELECT wallet_address FROM users WHERE telegram_id = ?').get(telegramId) as any
    
    if (!user || !user.wallet_address) {
      await ctx.reply(
        `波 *NAMI SCORE*\n\n` +
        `Link your wallet first to track your wave score.\n\n` +
        `/link_wallet to get started`,
        { parse_mode: 'Markdown' }
      )
      return
    }
    
    try {
      const score = getNamiScore(user.wallet_address)
      
      if (!score) {
        await ctx.reply(
          `波 *YOUR NAMI SCORE*\n\n` +
          `No score yet. Start buying to earn points!\n\n` +
          `✅ Buy during dips = more points\n` +
          `💎 Hold through volatility = bonus points\n\n` +
          `Higher scores = bigger fee share`,
          { parse_mode: 'Markdown' }
        )
        return
      }
      
      const { rank, total } = getWalletRank(user.wallet_address)
      const weeklyShare = calculateWeeklyShare(user.wallet_address)
      
      await ctx.reply(
        `📊 *YOUR NAMI SCORE*\n\n` +
        `Total Score: *${score.total_score > 0 ? '+' : ''}${score.total_score}* points\n` +
        `Rank: *#${rank}* / ${total} holders\n\n` +
        `🎯 Entry Quality: ${score.entry_score > 0 ? '+' : ''}${score.entry_score}\n` +
        `💎 Diamond Hands: ${score.diamond_score > 0 ? '+' : ''}${score.diamond_score}\n\n` +
        `Holdings: ${score.holdings.toFixed(0)} WHALU\n` +
        `Weighted Score: ${score.weighted_score.toFixed(0)}\n\n` +
        `Weekly fee share: ~${weeklyShare.toFixed(1)}%\n\n` +
        `/entry for entry details\n` +
        `/diamond for volatility history`,
        { parse_mode: 'Markdown' }
      )
    } catch (scoreError: any) {
      console.error('❌ Nami score calculation error:', scoreError)
      await ctx.reply(
        `波 *NAMI SCORE*\n\n` +
        `Score system is initializing.\n\n` +
        `The Nami Score tracks:\n` +
        `✅ Entry timing (buy during dips)\n` +
        `💎 Diamond hands (hold through volatility)\n\n` +
        `Start buying to earn points!`,
        { parse_mode: 'Markdown' }
      )
    }
  } catch (error: any) {
    console.error('❌ Nami command error:', error)
    await ctx.reply('❌ Failed to load Nami score. Please try again later.')
  }
}
