import { Context } from 'telegraf'
import { getAllMilestones, getMaxMultiplier } from '../../services/fuchi/fuchiPool'

export async function milestonesCommand(ctx: Context) {
  try {
    const milestones = getAllMilestones()
    const maxMultiplier = getMaxMultiplier()
    
    // Mock current values
    const holderCount = 753
    const mcap = 266000
    
    let message = `📊 *FUCHI MILESTONES*\n\n`
    
    // Holder goals
    message += `*HOLDER GOALS:*\n`
    const holderMilestones = milestones.filter(m => m.milestone_type === 'holders')
    for (const m of holderMilestones) {
      const emoji = m.unlocked ? '✅' : holderCount >= m.threshold ? '⏳' : '🔒'
      const status = m.unlocked 
        ? `(Unlocked ${new Date(m.unlocked_at * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })})`
        : holderCount >= m.threshold 
        ? `(${holderCount}/${m.threshold})`
        : ''
      
      message += `${emoji} ${m.threshold}: ${m.multiplier}x ${status}\n`
    }
    
    // Mcap goals
    message += `\n*MCAP GOALS:*\n`
    const mcapMilestones = milestones.filter(m => m.milestone_type === 'mcap')
    for (const m of mcapMilestones) {
      const emoji = m.unlocked ? '✅' : mcap >= m.threshold ? '⏳' : '🔒'
      const displayThreshold = m.threshold >= 1000000 ? `$${(m.threshold / 1000000).toFixed(1)}M` : `$${(m.threshold / 1000).toFixed(0)}k`
      const status = m.unlocked 
        ? `(Unlocked ${new Date(m.unlocked_at * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })})`
        : mcap >= m.threshold 
        ? `($${(mcap / 1000).toFixed(0)}k/$${(m.threshold / 1000).toFixed(0)}k)`
        : ''
      
      message += `${emoji} ${displayThreshold}: ${m.multiplier}x ${status}\n`
    }
    
    message += `\nMultipliers stack!\n`
    message += `Max possible: *${maxMultiplier.toFixed(1)}x*`
    
    await ctx.reply(message, { parse_mode: 'Markdown' })
  } catch (error) {
    console.error('❌ Milestones command error:', error)
    await ctx.reply('❌ Failed to load milestones.')
  }
}
