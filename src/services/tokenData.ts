// Real API services for token data

import { Connection, PublicKey } from '@solana/web3.js'

// Use require for node-fetch to avoid type issues
const fetch = require('node-fetch')

export interface MarketData {
  price: number
  mcap: number
  liquidity: number
  volume24h: number
  priceChange24h: number
}

// Get real holder count directly from Solana blockchain
export async function getRealHolderCount(tokenCA: string): Promise<number> {
  try {
    console.log('Getting holder count for:', tokenCA)
    
    // Connect to Solana
    const connection = new Connection('https://api.mainnet-beta.solana.com', 'confirmed')
    
    // SPL Token Program ID
    const TOKEN_PROGRAM_ID = new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA')
    const mintPubkey = new PublicKey(tokenCA)
    
    // Get all token accounts for this mint
    const accounts = await connection.getProgramAccounts(
      TOKEN_PROGRAM_ID,
      {
        filters: [
          { dataSize: 165 }, // Size of token account
          {
            memcmp: { // Filter by mint address (at offset 0)
              offset: 0,
              bytes: mintPubkey.toBase58()
            }
          }
        ]
      }
    )
    
    console.log(`Found ${accounts.length} token accounts`)
    
    // Count accounts with balance > 0
    let holderCount = 0
    
    for (const account of accounts) {
      try {
        // Read amount (u64 at offset 64)
        const data = account.account.data
        const amount = data.readBigUInt64LE(64)
        if (amount > 0n) {
          holderCount++
        }
      } catch (e) {
        // Skip invalid accounts
        continue
      }
    }
    
    console.log(`✅ Holder count: ${holderCount}`)
    return holderCount
    
  } catch (error: any) {
    console.error('❌ getRealHolderCount error:', error.message)
    return 0
  }
}

// Get real market data from DexScreener API
export async function getRealMarketData(tokenCA: string): Promise<MarketData> {
  console.log('=== FETCHING MARKET DATA ===')
  console.log('Token CA:', tokenCA)
  
  try {
    const url = `https://api.dexscreener.com/latest/dex/tokens/${tokenCA}`
    console.log('DexScreener URL:', url)
    
    const response = await fetch(url)
    console.log('DexScreener status:', response.status)
    
    const text = await response.text()
    console.log('DexScreener raw response:', text.substring(0, 500))
    
    if (!response.ok) {
      console.error(`❌ DexScreener API error: ${response.status}`)
      throw new Error(`DexScreener API error: ${response.status}`)
    }
    
    const data = JSON.parse(text)
    console.log('DexScreener pairs:', data.pairs?.length || 0)
    
    if (!data.pairs || data.pairs.length === 0) {
      console.log('⚠️ No pairs found on DexScreener')
      return { price: 0, mcap: 0, liquidity: 0, volume24h: 0, priceChange24h: 0 }
    }
    
    const pair = data.pairs[0]
    console.log('Pair data:', {
      dexId: pair.dexId,
      baseToken: pair.baseToken?.symbol,
      quoteToken: pair.quoteToken?.symbol,
      priceUsd: pair.priceUsd,
      marketCap: pair.marketCap,
      fdv: pair.fdv,
      liquidity: pair.liquidity?.usd
    })
    
    const marketData = {
      price: parseFloat(pair.priceUsd || '0'),
      mcap: parseFloat(pair.marketCap || pair.fdv || '0'),
      liquidity: parseFloat(pair.liquidity?.usd || '0'),
      volume24h: parseFloat(pair.volume?.h24 || '0'),
      priceChange24h: parseFloat(pair.priceChange?.h24 || '0')
    }
    
    console.log('✅ Parsed market data:', marketData)
    
    return marketData
    
  } catch (error: any) {
    console.error('❌ getRealMarketData error:', error.message)
    console.error('Error stack:', error.stack)
    throw error
  }
}

// Get cached metrics from database
export function getCachedMetrics(db: any, tokenCA: string) {
  return db.prepare('SELECT * FROM token_metrics WHERE token_ca = ?').get(tokenCA) as any
}

// Update metrics in database
export function updateCachedMetrics(
  db: any,
  tokenCA: string,
  holderCount: number,
  marketData: MarketData
) {
  db.prepare(`
    INSERT OR REPLACE INTO token_metrics 
    (token_ca, holder_count, market_cap, price, volume_24h, price_change_24h, last_updated) 
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(
    tokenCA,
    holderCount,
    marketData.mcap,
    marketData.price,
    marketData.volume24h,
    marketData.priceChange24h,
    Math.floor(Date.now() / 1000)
  )
}
