import db from '../../database/db'

// Calculate entry points based on buy timing
export function calculateEntryPoints(buyPrice: number, currentAvgPrice: number): { points: number; context: string } {
  const priceRatio = ((buyPrice - currentAvgPrice) / currentAvgPrice) * 100
  
  if (priceRatio <= -20) return { points: 5, context: 'major_dip' }
  if (priceRatio <= -10) return { points: 3, context: 'dip' }
  if (priceRatio <= 10) return { points: 1, context: 'neutral' }
  if (priceRatio <= 20) return { points: -1, context: 'pump' }
  return { points: -3, context: 'major_pump' }
}

// Record a buy entry for Nami scoring
export async function recordNamiEntry(
  wallet: string,
  buyPrice: number,
  buyAmount: number,
  currentAvgPrice: number
) {
  const { points, context } = calculateEntryPoints(buyPrice, currentAvgPrice)
  
  // Record the entry
  db.prepare(`
    INSERT INTO nami_entries (wallet, buy_timestamp, buy_price, buy_amount, price_context, points_earned)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(wallet, Math.floor(Date.now() / 1000), buyPrice, buyAmount, context, points)
  
  // Update or create nami_scores record
  const existing = db.prepare('SELECT * FROM nami_scores WHERE wallet = ?').get(wallet) as any
  
  if (existing) {
    const newEntryScore = existing.entry_score + points
    const newTotalScore = newEntryScore + existing.diamond_score
    
    db.prepare(`
      UPDATE nami_scores 
      SET entry_score = ?, total_score = ?, holdings = holdings + ?, last_updated = ?
      WHERE wallet = ?
    `).run(newEntryScore, newTotalScore, buyAmount, Math.floor(Date.now() / 1000), wallet)
  } else {
    db.prepare(`
      INSERT INTO nami_scores (wallet, entry_score, diamond_score, total_score, holdings, last_updated)
      VALUES (?, ?, 0, ?, ?, ?)
    `).run(wallet, points, points, buyAmount, Math.floor(Date.now() / 1000))
  }
  
  // Update weighted score
  updateWeightedScore(wallet)
}

// Update weighted score (score * holdings)
export function updateWeightedScore(wallet: string) {
  const score = db.prepare('SELECT * FROM nami_scores WHERE wallet = ?').get(wallet) as any
  if (score && score.total_score > 0) {
    const weighted = score.total_score * score.holdings
    db.prepare('UPDATE nami_scores SET weighted_score = ? WHERE wallet = ?').run(weighted, wallet)
  }
}

// Get Nami score for a wallet
export function getNamiScore(wallet: string) {
  return db.prepare('SELECT * FROM nami_scores WHERE wallet = ?').get(wallet) as any
}

// Get all entries for a wallet
export function getNamiEntries(wallet: string) {
  return db.prepare(`
    SELECT * FROM nami_entries 
    WHERE wallet = ? 
    ORDER BY buy_timestamp DESC 
    LIMIT 10
  `).all(wallet) as any[]
}

// Get wallet rank
export function getWalletRank(wallet: string): { rank: number; total: number } {
  const allScores = db.prepare(`
    SELECT wallet, weighted_score 
    FROM nami_scores 
    WHERE total_score > 0
    ORDER BY weighted_score DESC
  `).all() as any[]
  
  const rank = allScores.findIndex(s => s.wallet === wallet) + 1
  return { rank, total: allScores.length }
}

// Get leaderboard
export function getNamiLeaderboard(limit: number = 10) {
  return db.prepare(`
    SELECT * FROM nami_scores 
    WHERE total_score > 0
    ORDER BY weighted_score DESC 
    LIMIT ?
  `).all(limit) as any[]
}

// Record volatility event
export async function recordVolatilityEvent(
  eventType: string,
  priceBefore: number,
  priceAfter: number,
  changePercent: number
) {
  const timestamp = Math.floor(Date.now() / 1000)
  
  db.prepare(`
    INSERT INTO nami_events (event_type, timestamp, price_before, price_after, price_change_percent)
    VALUES (?, ?, ?, ?, ?)
  `).run(eventType, timestamp, priceBefore, priceAfter, changePercent)
  
  return timestamp
}

// Award diamond hands points to holders who held through volatility
export async function awardDiamondPoints(eventType: string, points: number) {
  // Get all holders with positive scores
  const holders = db.prepare('SELECT wallet FROM nami_scores WHERE total_score > 0').all() as any[]
  
  for (const holder of holders) {
    const score = db.prepare('SELECT * FROM nami_scores WHERE wallet = ?').get(holder.wallet) as any
    
    if (score) {
      const newDiamondScore = score.diamond_score + points
      const newTotalScore = score.entry_score + newDiamondScore
      
      db.prepare(`
        UPDATE nami_scores 
        SET diamond_score = ?, total_score = ?, last_updated = ?
        WHERE wallet = ?
      `).run(newDiamondScore, newTotalScore, Math.floor(Date.now() / 1000), holder.wallet)
      
      updateWeightedScore(holder.wallet)
    }
  }
}

// Get recent volatility events
export function getRecentVolatilityEvents(limit: number = 10) {
  return db.prepare(`
    SELECT * FROM nami_events 
    ORDER BY timestamp DESC 
    LIMIT ?
  `).all(limit) as any[]
}

// Calculate weekly fee share percentage
export function calculateWeeklyShare(wallet: string): number {
  const score = getNamiScore(wallet)
  if (!score || score.weighted_score <= 0) return 0
  
  const totalWeighted = db.prepare(`
    SELECT SUM(weighted_score) as total 
    FROM nami_scores 
    WHERE total_score > 0
  `).get() as any
  
  if (!totalWeighted || totalWeighted.total <= 0) return 0
  
  return (score.weighted_score / totalWeighted.total) * 100
}
