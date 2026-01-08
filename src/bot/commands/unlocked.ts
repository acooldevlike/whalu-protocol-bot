import { Context } from 'telegraf'
import { getUnlockedMilestones, getTotalMultiplier } from '../../services/fuchi/fuchiPool'

export async function unlockedCommand(ctx: Context) {
  try {
    const unlocked = getUnlockedMilestones()
    const totalMultiplier = getTotalMultiplier()
    
    if (unlocked.length === 0) {
      await ctx.reply(
        `✅ *ACTIVE FUCHI MULTIPLIERS*\n\n` +
        `No milestones unlocked yet.\n\n` +
        `Grow the community to unlock multipliers!`,
        { parse_mode: 'Markdown' }
      )
      return
    }
    
    let message = `✅ *ACTIVE FUCHI MULTIPLIERS*\n\n`
    
    for (const m of unlocked) {
      const daysAgo = Math.floor((Date.now() / 1000 - m.unlocked_at) / 86400)
      const label = m.milestone_type === 'holders' 
        ? `${m.threshold} holders` 
        : `$${m.threshold >= 1000000 ? (m.threshold / 1000000).toFixed(1) + 'M' : (m.threshold / 1000).toFixed(0) + 'k'} mcap`
      
      message += `${label}: ${m.multiplier}x (Unlocked ${daysAgo} days ago)\n`
    }
    
    message += `\nTotal: *${totalMultiplier.toFixed(2)}x*\n\n`
    
    // Example calculation
    const baseEarnings = 2.4
    const boostedEarnings = baseEarnings * totalMultiplier
    const boost = boostedEarnings - baseEarnings
    
    message += `Your boosted earnings:\n`
    message += `Base: ${baseEarnings.toFixed(1)} SOL/week\n`
    message += `With Fuchi: ${boostedEarnings.toFixed(2)} SOL/week (+${boost.toFixed(2)} SOL)\n\n`
    message += `Everyone benefits from growth.`
    
    await ctx.reply(message, { parse_mode: 'Markdown' })
  } catch (error) {
    console.error('❌ Unlocked command error:', error)
    await ctx.reply('❌ Failed to load unlocked milestones.')
  }
}
