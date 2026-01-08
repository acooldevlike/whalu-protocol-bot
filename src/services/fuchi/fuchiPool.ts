import db from '../../database/db'

// Get total active multiplier
export function getTotalMultiplier(): number {
  const unlockedMilestones = db.prepare(`
    SELECT multiplier FROM fuchi_milestones WHERE unlocked = 1
  `).all() as any[]
  
  let total = 1.0
  for (const milestone of unlockedMilestones) {
    total *= milestone.multiplier
  }
  
  return total
}

// Check and unlock milestones
export async function checkAndUnlockMilestone(type: string, currentValue: number) {
  const milestone = db.prepare(`
    SELECT * FROM fuchi_milestones 
    WHERE milestone_type = ? 
    AND threshold <= ? 
    AND unlocked = 0 
    ORDER BY threshold DESC LIMIT 1
  `).get(type, currentValue) as any
  
  if (milestone) {
    db.prepare(`
      UPDATE fuchi_milestones 
      SET unlocked = 1, unlocked_at = ? 
      WHERE id = ?
    `).run(Math.floor(Date.now() / 1000), milestone.id)
    
    console.log(`🌀 Fuchi milestone unlocked: ${type} ${milestone.threshold} (${milestone.multiplier}x)`)
    
    return milestone
  }
  
  return null
}

// Check all milestones
export async function checkMilestones(holderCount: number, mcap: number) {
  await checkAndUnlockMilestone('holders', holderCount)
  await checkAndUnlockMilestone('mcap', mcap)
  
  const totalMultiplier = getTotalMultiplier()
  
  // Record snapshot
  db.prepare(`
    INSERT INTO fuchi_history (timestamp, total_multiplier, holders_count, mcap_value, event_type)
    VALUES (?, ?, ?, ?, 'daily_snapshot')
  `).run(Math.floor(Date.now() / 1000), totalMultiplier, holderCount, mcap)
  
  return totalMultiplier
}

// Get all milestones with status
export function getAllMilestones() {
  return db.prepare(`
    SELECT * FROM fuchi_milestones ORDER BY milestone_type, threshold
  `).all() as any[]
}

// Get unlocked milestones
export function getUnlockedMilestones() {
  return db.prepare(`
    SELECT * FROM fuchi_milestones WHERE unlocked = 1 ORDER BY unlocked_at DESC
  `).all() as any[]
}

// Get next milestone for a type
export function getNextMilestone(type: string, currentValue: number) {
  return db.prepare(`
    SELECT * FROM fuchi_milestones 
    WHERE milestone_type = ? 
    AND threshold > ? 
    AND unlocked = 0 
    ORDER BY threshold ASC LIMIT 1
  `).get(type, currentValue) as any
}

// Get current progress
export function getFuchiProgress(holderCount: number, mcap: number) {
  const nextHolderMilestone = getNextMilestone('holders', holderCount)
  const nextMcapMilestone = getNextMilestone('mcap', mcap)
  const totalMultiplier = getTotalMultiplier()
  const unlockedCount = db.prepare('SELECT COUNT(*) as count FROM fuchi_milestones WHERE unlocked = 1').get() as any
  
  return {
    totalMultiplier,
    unlockedCount: unlockedCount.count,
    holderCount,
    mcap,
    nextHolderMilestone,
    nextMcapMilestone
  }
}

// Calculate max possible multiplier
export function getMaxMultiplier(): number {
  const allMilestones = db.prepare('SELECT multiplier FROM fuchi_milestones').all() as any[]
  
  let max = 1.0
  for (const milestone of allMilestones) {
    max *= milestone.multiplier
  }
  
  return max
}

// Record milestone unlock event
export function recordMilestoneUnlock(milestone: any) {
  const totalMultiplier = getTotalMultiplier()
  
  db.prepare(`
    INSERT INTO fuchi_history (timestamp, total_multiplier, holders_count, mcap_value, event_type)
    VALUES (?, ?, ?, ?, 'milestone_unlocked')
  `).run(Math.floor(Date.now() / 1000), totalMultiplier, 0, 0)
}
