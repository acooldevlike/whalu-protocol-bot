import { Context } from 'telegraf'
import { Connection, PublicKey } from '@solana/web3.js'
import db from '../../database/db'

export async function verifyTokenCommand(ctx: Context) {
  try {
    const row = db.prepare('SELECT token_ca FROM bot_config WHERE id = 1').get() as any
    
    if (!row || !row.token_ca) {
      await ctx.reply('No token configured')
      return
    }
    
    const tokenCA = row.token_ca
    
    await ctx.reply('Verifying token on Solana...')
    
    console.log('\n=== TOKEN VERIFICATION ===')
    console.log('Token CA:', tokenCA)
    
    const connection = new Connection('https://api.mainnet-beta.solana.com')
    const pubkey = new PublicKey(tokenCA)
    
    console.log('Checking account info...')
    const accountInfo = await connection.getAccountInfo(pubkey)
    
    if (!accountInfo) {
      await ctx.reply(
        `❌ Token account not found!\n\n` +
        `CA: ${tokenCA}\n\n` +
        `This address does not exist on Solana mainnet.\n` +
        `Please verify the CA is correct.`
      )
      return
    }
    
    console.log('Account info:', {
      owner: accountInfo.owner.toString(),
      lamports: accountInfo.lamports,
      dataLength: accountInfo.data.length,
      executable: accountInfo.executable
    })
    
    await ctx.reply(
      `✅ Token verified on chain!\n\n` +
      `Owner: ${accountInfo.owner.toString().slice(0, 8)}...\n` +
      `Data length: ${accountInfo.data.length}\n` +
      `Lamports: ${accountInfo.lamports}\n\n` +
      `Token exists. APIs may just be slow to index.`
    )
    
  } catch (error: any) {
    console.error('Verify token error:', error)
    await ctx.reply(`❌ Error: ${error.message}`)
  }
}
