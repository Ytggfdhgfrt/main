# Crypto Tracker & Transfer Tool

A command-line tool to **track** and **transfer** cryptocurrency using a MetaMask private key and the [Moralis Web3 API](https://moralis.io).

## Features

- 🔍 **View balances** – native token (ETH, MATIC, BNB …) + ERC-20 tokens for any address
- 📜 **Transaction history** – recent on-chain transactions for any address
- 💸 **Transfer native tokens** – send ETH/MATIC/BNB directly from your wallet
- 🪙 **Transfer ERC-20 tokens** – send any ERC-20 token by contract address
- 🔗 **Multi-chain** – Ethereum, Polygon, BSC, Avalanche, Arbitrum, Optimism, Fantom, Cronos

---

## Requirements

- [Node.js](https://nodejs.org) ≥ 18
- A free [Moralis API key](https://moralis.io)
- Your MetaMask (or any EOA) **private key**

---

## Quick start

```bash
# 1. Clone the repo and install dependencies
npm install

# 2. Copy the environment template and fill in your credentials
cp .env.example .env
# Edit .env and set PRIVATE_KEY and MORALIS_API_KEY

# 3. Run any command
node src/index.js address
```

---

## Environment variables

| Variable          | Description                                      |
|-------------------|--------------------------------------------------|
| `PRIVATE_KEY`     | Your MetaMask / EOA private key (**keep secret**)|
| `MORALIS_API_KEY` | Web3 API key from [moralis.io](https://moralis.io)|
| `CHAIN`           | Default chain (default: `eth`)                   |

> ⚠️ **Never commit your `.env` file.** It is already listed in `.gitignore`.

---

## Commands

### Show wallet address

```bash
node src/index.js address
```

### Check balances

```bash
# Own wallet
node src/index.js balance

# Any address
node src/index.js balance 0xABCD...

# On a specific chain
node src/index.js balance 0xABCD... --chain polygon
```

### Transaction history

```bash
node src/index.js history

# With custom address and limit
node src/index.js history 0xABCD... --limit 50
```

### Transfer native token (ETH, MATIC …)

```bash
node src/index.js transfer --to 0xRecipient --amount 0.01
```

### Transfer an ERC-20 token

```bash
node src/index.js transfer \
  --to 0xRecipient \
  --amount 100 \
  --token 0xTokenContractAddress \
  --chain polygon
```

---

## Supported chains

`eth` · `polygon` · `bsc` · `avalanche` · `arbitrum` · `optimism` · `fantom` · `cronos`

---

## Running tests

```bash
npm test
```

---

## Security notes

- Your **private key is read exclusively from the `PRIVATE_KEY` environment variable** and is never logged or stored.
- All network calls to Moralis use HTTPS.
- Transaction signing is performed locally using [ethers v6](https://docs.ethers.org/v6/) before broadcasting.
