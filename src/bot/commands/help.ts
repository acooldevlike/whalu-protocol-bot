import { Context } from 'telegraf'

export async function helpCommand(ctx: Context) {
  await ctx.reply(
    `🐋 *WHALU PROTOCOL Commands*

🔑 *WALLET:*
/link\\_wallet - Link Solana wallet
/my\\_wallet - View wallet
/unlink\\_wallet - Disconnect

💰 *BALANCE:*
/balance - Check balance

🌊 *KAIRYU FLOW (50%):*
/kairyu - Buyback status
/flow - Recent waves

🏄 *NAMI SCORE (30%):*
/nami - Your wave score
/entry - Entry quality
/diamond - Diamond hands
/reef - Score leaderboard

🌀 *FUCHI POOL (20%):*
/fuchi - Milestone progress
/milestones - All milestones
/unlocked - Active multipliers

📊 *METRICS:*
/depths - Complete metrics
/tides - Fee schedule
/stats - Protocol stats

💎 *REWARDS:*
/claim - Collect rewards
/voyage - Earning history

⚙️ *ADMIN:*
/pause - Pause automation
/resume - Resume automation
/stop - Stop and withdraw

The ocean rewards patience. 🐋`,
    { parse_mode: 'Markdown' }
  )
}
