import { Context } from 'telegraf'
import db from '../../database/db'
import { calculateWeeklyShare } from '../../services/nami/namiScore'
import { getTotalMultiplier } from '../../services/fuchi/fuchiPool'

export async function tidesCommand(ctx: Context) {
  try {
    console.log('🌊 /tides command started')
    const telegramId = ctx.from!.id
    
    // Mock accumulated fees
    const accumulatedFees = 124.6
    const daysUntilDistribution = 4
    
    const kairyuShare = accumulatedFees * 0.50
    const namiShare = accumulatedFees * 0.30
    const fuchiShare = accumulatedFees * 0.20
    
    let message = `📊 *FEE DISTRIBUTION*\n\n`
    message += `Next distribution: *${daysUntilDistribution} days*\n`
    message += `Accumulated: *${accumulatedFees.toFixed(1)} SOL*\n\n`
    
    message += `Allocation:\n`
    message += `🌊 Kairyu (50%): ${kairyuShare.toFixed(1)} SOL → Buybacks\n`
    message += `波 Nami (30%): ${namiShare.toFixed(1)} SOL → Score rewards\n`
    message += `淵 Fuchi (20%): ${fuchiShare.toFixed(1)} SOL → All holders\n\n`
    
    // Get user's estimated share
    const user = db.prepare('SELECT wallet_address FROM users WHERE telegram_id = ?').get(telegramId) as any
    
    if (user && user.wallet_address) {
      const weeklyShare = calculateWeeklyShare(user.wallet_address)
      const fuchiMultiplier = getTotalMultiplier()
      
      const namiEarnings = namiShare * (weeklyShare / 100)
      const fuchiBoost = namiEarnings * (fuchiMultiplier - 1)
      const totalEarnings = namiEarnings + fuchiBoost
      
      message += `Your estimated:\n`
      message += `Nami share: ${weeklyShare.toFixed(1)}% = ${namiEarnings.toFixed(2)} SOL\n`
      message += `Fuchi boost: ${fuchiMultiplier.toFixed(2)}x = +${fuchiBoost.toFixed(2)} SOL\n`
      message += `Total: ~${totalEarnings.toFixed(2)} SOL\n\n`
      message += `/claim when ready`
    } else {
      message += `Link wallet to see your share\n`
      message += `/link_wallet`
    }
    
    await ctx.reply(message, { parse_mode: 'Markdown' })
  } catch (error) {
    console.error('❌ Tides command error:', error)
    await ctx.reply('❌ Failed to load distribution data.')
  }
}
