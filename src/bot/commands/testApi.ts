import { Context } from 'telegraf'
import db from '../../database/db'
import { getRealHolderCount, getRealMarketData } from '../../services/tokenData'

export async function testApiCommand(ctx: Context) {
  try {
    const row = db.prepare('SELECT token_ca FROM bot_config WHERE id = 1').get() as any
    
    if (!row || !row.token_ca) {
      await ctx.reply('No token configured')
      return
    }
    
    await ctx.reply(`Testing APIs for: ${row.token_ca}\n\nCheck console logs...`)
    
    console.log('\n\n=== MANUAL API TEST ===')
    console.log('Testing token:', row.token_ca)
    
    const holders = await getRealHolderCount(row.token_ca)
    const market = await getRealMarketData(row.token_ca)
    
    await ctx.reply(
      `Results:\n` +
      `Holders: ${holders}\n` +
      `Price: $${market.price}\n` +
      `MCap: $${market.mcap.toLocaleString()}\n` +
      `Liquidity: $${market.liquidity.toLocaleString()}\n` +
      `Volume 24h: $${market.volume24h.toLocaleString()}\n\n` +
      `Check console for detailed logs.`
    )
  } catch (error: any) {
    console.error('Test API error:', error)
    await ctx.reply(`❌ Error: ${error.message}`)
  }
}
