import { Context } from 'telegraf'
import { getTokenCA } from '../../services/botConfig'
import { getRealHolderCount, getRealMarketData } from '../../services/tokenData'
import db from '../../database/db'

export async function depthsCommand(ctx: Context) {
  try {
    const tokenCA = getTokenCA()
    if (!tokenCA) {
      await ctx.reply(' Bot not configured')
      return
    }
    
    const holderCount = await getRealHolderCount(tokenCA)
    const marketData = await getRealMarketData(tokenCA)
    
    const txCount = db.prepare('SELECT COUNT(*) as count FROM buyback_transactions').get() as any
    const volume = db.prepare('SELECT total_volume FROM buyback_volume WHERE id = 1').get() as any
    const avgPrice = db.prepare('SELECT AVG(price) as avg FROM buyback_transactions WHERE price > 0').get() as any
    const totalBuybacks = volume?.total_volume || 0
    
    let message = ' *WHALU PROTOCOL DEPTHS*\n\n'
    message += ' *PROTOCOL STATISTICS*\n'
    message += 'Market Cap: $' + marketData.mcap.toLocaleString() + '\n'
    message += 'Price: $' + marketData.price + '\n'
    message += '24h Change: ' + marketData.priceChange24h.toFixed(2) + '%\n'
    message += 'Holders: ' + holderCount.toLocaleString() + '\n'
    message += '24h Volume: $' + marketData.volume24h.toLocaleString() + '\n'
    message += 'Liquidity: $' + marketData.liquidity.toLocaleString() + '\n\n'
    message += 'Total Buybacks: ' + (txCount?.count || 0) + '\n'
    message += 'SOL Spent: ' + totalBuybacks.toFixed(2) + ' SOL\n'
    message += 'Avg Price: ' + (avgPrice?.avg ? avgPrice.avg.toFixed(6) : 'N/A') + '\n\n'
    message += 'The ocean rewards patience. '
    
    await ctx.reply(message, { parse_mode: 'Markdown' })
  } catch (error) {
    console.error(' Depths command error:', error)
    await ctx.reply(' Failed to load complete metrics.')
  }
}
