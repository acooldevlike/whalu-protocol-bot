# WHALU Protocol Bot 🐋

Three ocean currents flowing as one.

## 📋 Overview

WHALU Protocol is a sophisticated Telegram bot that manages three interconnected systems on the Solana blockchain, rewarding token holders through automated buybacks, wave rider scoring, and collective milestone multipliers.

## Systems

### **海流 KAIRYU FLOW (50%)** - Automated buybacks
- Automated SOL → WHALU token buybacks using Jupiter
- Continuous market support through strategic purchases
- Transparent transaction tracking

### **波 NAMI SCORE (30%)** - Wave rider rewards  
- Track holder entry timing and diamond hands
- Score = Entry Quality + Diamond Hands
- Weekly fee distribution: (Nami Score × Holdings)
- Rewards early believers and loyal holders

### **淵 FUCHI POOL (20%)** - Collective multipliers
- Collective milestone multipliers
- Milestones unlock as community grows
- All holders benefit from multipliers
- Shared success through unified growth

## 🛠️ Tech Stack

- **Node.js** with TypeScript
- **telegraf** - Telegram bot framework
- **@solana/web3.js** - Solana blockchain interaction
- **@solana/spl-token** - Token operations
- **PostgreSQL** with pg - Database
- **axios** - HTTP requests
- **node-cron** - Scheduled tasks
- **winston** - Logging
- **Jupiter API** - DEX aggregation

## 📦 Setup

### Prerequisites

- Node.js 18+ and npm
- Solana wallet with SOL for operations
- Telegram Bot Token (from @BotFather)

### Installation

1. Clone repository
2. Install dependencies: `npm install` 
3. Configure `.env` file
4. Build: `npm run build`
5. Run: `npm start`

For development: `npm run dev`

## ⚙️ Configuration

### Environment Variables

Create a `.env` file in the root directory:

```env
# WHALU Protocol Configuration
TELEGRAM_BOT_TOKEN=[YOUR_NEW_BOT_TOKEN]
SOLANA_RPC_URL=https://api.mainnet-beta.solana.com
SOLANA_WALLET_PRIVATE_KEY=[YOUR_WALLET_KEY]

# Token Settings
TOKEN_MINT_ADDRESS=[WHALU_TOKEN_ADDRESS]
CREATOR_WALLET_ADDRESS=[YOUR_WALLET]

# System Allocations (Creator Fees)
KAIRYU_PERCENTAGE=50
NAMI_PERCENTAGE=30
FUCHI_PERCENTAGE=20

# Admin
ADMIN_TELEGRAM_IDS=[YOUR_TELEGRAM_ID]

# Database
DATABASE_PATH=./data/whalu_protocol.db

# Website
WEBSITE_URL=https://yourwebsite.com

# Bot
BOT_USERNAME=@whalu_protocol_bot
```

### Getting Your Bot Token

1. Open Telegram and search for @BotFather
2. Send `/newbot` and follow the instructions
3. Copy the bot token provided
4. Paste it into `TELEGRAM_BOT_TOKEN` in your `.env` file

### Getting Your Admin Telegram ID

1. Open Telegram and search for @userinfobot
2. Send `/start` to the bot
3. Copy your ID
4. Paste it into `ADMIN_TELEGRAM_ID` in your `.env` file

### Solana Wallet Setup

**⚠️ IMPORTANT: Use a dedicated wallet for the bot. Never use your main wallet!**

```bash
# Generate a new keypair
solana-keygen new -o bot-keypair.json

# Get the base58 private key
# Use a tool to convert the JSON keypair to base58 format
# Or use: cat bot-keypair.json | jq -r '.[0:32] | @base64'

# Fund the wallet with SOL
solana transfer <BOT_WALLET_ADDRESS> <AMOUNT> --from <YOUR_WALLET>
```

## 📱 Commands

See `/help` in Telegram bot for complete command list:

- `/start` - Welcome message
- `/help` - Command list
- `/link_wallet` - Link Solana wallet
- `/balance` - Check balance
- `/kairyu` - Buyback status
- `/nami` - Your wave score
- `/fuchi` - Milestone progress
- `/depths` - Complete metrics
- `/claim` - Collect rewards

And many more commands for managing your WHALU Protocol experience.

## 🗄️ Database Schema

### NAMI Score Tables

**nami_scores**
- `wallet` - Wallet address (primary key)
- `entry_score` - Entry quality score
- `diamond_score` - Diamond hands score
- `total_score` - Combined score
- `last_updated` - Last update timestamp

**nami_entries**
- `id` - Entry ID
- `wallet` - Wallet address
- `buy_timestamp` - Purchase time
- `buy_price` - Purchase price
- `amount` - Token amount
- `price_context` - Market context
- `points_earned` - Points awarded

**nami_rewards**
- `wallet` - Wallet address
- `week_number` - Week identifier
- `nami_score` - Score for week
- `holdings` - Token holdings
- `weighted_score` - Score × Holdings
- `reward_amount` - Reward earned
- `claimed` - Claim status

### FUCHI Pool Tables

**fuchi_milestones**
- `milestone_type` - Type of milestone
- `threshold` - Unlock threshold
- `multiplier` - Multiplier value
- `unlocked` - Unlock status
- `unlocked_at` - Unlock timestamp

**fuchi_multiplier_history**
- `timestamp` - Record time
- `total_multiplier` - Active multiplier
- `holders_count` - Number of holders
- `mcap_value` - Market cap value

## 🔄 How It Works

### KAIRYU Flow (Automated Buybacks)
1. Creator fees collected (50% allocation)
2. Automated SOL → WHALU swaps via Jupiter
3. Continuous market support
4. Transaction tracking and reporting

### NAMI Score System
1. Track holder entry timing and quality
2. Monitor diamond hands behavior
3. Calculate weekly scores: Entry + Diamond
4. Distribute 30% of fees based on (Score × Holdings)
5. Weekly reward claims available

### FUCHI Pool System
1. Community milestones tracked (holders, mcap, volume)
2. Milestones unlock multipliers
3. All holders benefit from active multipliers
4. Collective growth rewards entire community

## 🔐 Security Best Practices

1. **Never commit `.env` file** - It contains sensitive keys
2. **Use dedicated wallet** - Don't use your main wallet for the bot
3. **Secure your server** - Use firewall, SSH keys, and regular updates
4. **Monitor logs** - Check logs regularly for suspicious activity
5. **Backup database** - Regular automated backups
6. **Rate limiting** - Built-in protection against spam
7. **Input validation** - All user inputs are validated
8. **Error handling** - Comprehensive error handling prevents crashes

## 📊 Monitoring

### Logs

Logs are stored in the `logs/` directory:
- `combined.log` - All logs
- `error.log` - Error logs only

### Log Levels

- `error` - Critical errors
- `warn` - Warnings
- `info` - General information
- `debug` - Detailed debugging (set LOG_LEVEL=debug)

### Health Checks

Monitor these metrics:
- Bot uptime
- Database connection
- Wallet balance
- Transaction success rate
- Lottery execution

## 🧪 Testing

### Test on Devnet First

Before deploying to mainnet:

1. Change `SOLANA_RPC_URL` to devnet:
```env
SOLANA_RPC_URL=https://api.devnet.solana.com
```

2. Use devnet SOL (get from faucet)
3. Test all commands thoroughly
4. Verify transactions on Solana Explorer (devnet)

### Test Checklist

- [ ] Bot starts without errors
- [ ] All commands respond correctly
- [ ] Manual buyback executes successfully
- [ ] Price triggers activate correctly
- [ ] Lottery triggers at milestone
- [ ] Winner selection works
- [ ] Database records all transactions
- [ ] Error handling works properly

## 🚀 Deployment

### Production Deployment

1. Use a VPS or cloud server
2. Clone repository and install dependencies
3. Configure `.env` with production values
4. Build and start: `npm run build && npm start`

Use PM2 for process management:
```bash
npm install -g pm2
pm2 start dist/index.js --name whalu-protocol-bot
pm2 save
pm2 startup
```

## 🐛 Troubleshooting

### Bot won't start

- Check `.env` file is configured correctly
- Verify database is running and accessible
- Check bot token is valid
- Review logs in `logs/error.log`

### Transactions failing

- Check wallet has sufficient SOL balance
- Verify RPC endpoint is responsive
- Check Solana network status
- Review transaction logs

### Database errors

- Check database path in `.env`
- Verify database file exists
- Run migrations if tables are missing
- Check file permissions

## 📄 License

MIT

## ⚠️ Disclaimer

This bot interacts with real cryptocurrency and blockchain transactions. Use at your own risk. Always test thoroughly before deploying to mainnet.

---

🐋 The ocean rewards patience. 鯨
