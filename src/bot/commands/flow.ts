import { Context } from 'telegraf'
import db from '../../database/db'

export async function flowCommand(ctx: Context) {
  try {
    const recentTxs = db.prepare(
      'SELECT * FROM buyback_transactions ORDER BY created_at DESC LIMIT 10'
    ).all() as any[]
    
    if (recentTxs.length === 0) {
      await ctx.reply(
        `🌊 *KAIRYU FLOW*\n\n` +
        `No buyback waves yet.\n\n` +
        `The current flows when conditions align. 🐋`,
        { parse_mode: 'Markdown' }
      )
      return
    }
    
    let message = `🌊 *RECENT KAIRYU WAVES*\n\n`
    
    for (const tx of recentTxs) {
      const date = new Date(tx.created_at * 1000).toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
      
      const shortSig = tx.tx_signature ? `${tx.tx_signature.slice(0, 4)}...${tx.tx_signature.slice(-4)}` : 'N/A'
      
      message += `📊 ${date}\n`
      message += `   ${tx.amount_sol.toFixed(2)} SOL → ${tx.amount_tokens.toFixed(0)} WHALU\n`
      message += `   Price: ${tx.price.toFixed(6)}\n`
      message += `   Tx: \`${shortSig}\`\n\n`
    }
    
    const totalVolume = db.prepare('SELECT total_volume FROM buyback_volume WHERE id = 1').get() as any
    message += `Total flow: ${totalVolume?.total_volume?.toFixed(2) || 0} SOL\n\n`
    message += `The current strengthens. 🐋`
    
    await ctx.reply(message, { parse_mode: 'Markdown' })
  } catch (error) {
    console.error('❌ Flow command error:', error)
    await ctx.reply('❌ Failed to load flow data.')
  }
}
