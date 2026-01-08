import { Context } from 'telegraf'
import db from '../../database/db'
import { getNamiLeaderboard, getWalletRank } from '../../services/nami/namiScore'

export async function reefCommand(ctx: Context) {
  try {
    const telegramId = ctx.from!.id
    
    const user = db.prepare('SELECT wallet_address FROM users WHERE telegram_id = ?').get(telegramId) as any
    const leaderboard = getNamiLeaderboard(10)
    
    if (leaderboard.length === 0) {
      await ctx.reply(
        `🏆 *NAMI SCORE LEADERBOARD*\n\n` +
        `No scores yet. Be the first!\n\n` +
        `Buy during dips and hold through volatility to climb the reef.`,
        { parse_mode: 'Markdown' }
      )
      return
    }
    
    let message = `🏆 *NAMI SCORE LEADERBOARD*\n\n`
    
    leaderboard.forEach((holder, index) => {
      const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}.`
      const shortWallet = `${holder.wallet.slice(0, 4)}...${holder.wallet.slice(-4)}`
      
      message += `${medal} ${shortWallet}: +${holder.total_score} (${(holder.weighted_score / 1000).toFixed(0)}k weighted)\n`
    })
    
    if (user && user.wallet_address) {
      const { rank, total } = getWalletRank(user.wallet_address)
      const userScore = db.prepare('SELECT * FROM nami_scores WHERE wallet = ?').get(user.wallet_address) as any
      
      if (userScore) {
        message += `\n━━━━━━━━━━━━━━━━━━\n`
        message += `Your rank: #${rank}\n`
        message += `Your weighted: ${userScore.weighted_score.toFixed(0)}\n`
      }
    }
    
    message += `\nTop scores earn more fees.`
    
    await ctx.reply(message, { parse_mode: 'Markdown' })
  } catch (error) {
    console.error('❌ Reef command error:', error)
    await ctx.reply('❌ Failed to load leaderboard.')
  }
}
