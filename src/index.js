#!/usr/bin/env node
'use strict';

require('dotenv').config();

const { getAddress } = require('./wallet');
const { getNativeBalance, getTokenBalances, getTransactionHistory } = require('./tracker');
const { transferNative, transferToken } = require('./transfer');

const USAGE = `
Crypto Tracker & Transfer CLI
==============================

Commands:
  address                              Show wallet address derived from PRIVATE_KEY
  balance [address]                    Show native + ERC-20 token balances
  history [address] [--limit N]        Show transaction history  (default limit: 20)
  transfer --to <addr> --amount <amt>  Transfer native token (ETH, MATIC …)
           [--token <contract>]         Optionally transfer an ERC-20 token instead
           [--chain <chain>]            Override chain (eth | polygon | bsc | …)

Environment variables (copy .env.example → .env and fill in):
  PRIVATE_KEY       MetaMask / EOA private key (keep secret!)
  MORALIS_API_KEY   Your Moralis Web3 API key
  CHAIN             Default chain (default: eth)
`;

function parseArgs(argv) {
  const args = argv.slice(2);
  const command = args[0];
  const flags = {};
  const positional = [];

  for (let i = 1; i < args.length; i++) {
    if (args[i].startsWith('--')) {
      const key = args[i].slice(2);
      flags[key] = args[i + 1] && !args[i + 1].startsWith('--') ? args[++i] : true;
    } else {
      positional.push(args[i]);
    }
  }
  return { command, flags, positional };
}

async function run() {
  const { command, flags, positional } = parseArgs(process.argv);

  switch (command) {
    case 'address': {
      console.log('Wallet address:', getAddress());
      break;
    }

    case 'balance': {
      const address = positional[0] || getAddress();
      const chain = flags.chain || process.env.CHAIN || 'eth';
      console.log(`\nFetching balances for ${address} on ${chain}…\n`);

      const native = await getNativeBalance(address, chain);
      console.log(`Native balance : ${native.balanceFormatted}`);

      const tokens = await getTokenBalances(address, chain);
      if (tokens.length === 0) {
        console.log('No ERC-20 tokens found.');
      } else {
        console.log('\nERC-20 tokens:');
        tokens.forEach((t) =>
          console.log(`  ${t.symbol.padEnd(10)} ${t.balanceFormatted}  (${t.token})`)
        );
      }
      break;
    }

    case 'history': {
      const address = positional[0] || getAddress();
      const chain = flags.chain || process.env.CHAIN || 'eth';
      const limit = flags.limit ? parseInt(flags.limit, 10) : 20;
      console.log(`\nFetching last ${limit} transactions for ${address} on ${chain}…\n`);

      const txs = await getTransactionHistory(address, chain, limit);
      if (txs.length === 0) {
        console.log('No transactions found.');
      } else {
        txs.forEach((tx) => {
          console.log(`[${tx.timestamp}] ${tx.status.toUpperCase()}`);
          console.log(`  Hash  : ${tx.hash}`);
          console.log(`  From  : ${tx.from}`);
          console.log(`  To    : ${tx.to}`);
          console.log(`  Value : ${tx.value} wei\n`);
        });
      }
      break;
    }

    case 'transfer': {
      const { to, amount, token: tokenAddress, chain } = flags;
      if (!to || !amount) {
        console.error('Error: --to and --amount are required for transfer.');
        process.exit(1);
      }

      if (tokenAddress) {
        console.log(`\nTransferring ${amount} of token ${tokenAddress} to ${to}…`);
        const result = await transferToken(to, amount, tokenAddress, chain);
        console.log('\nTransfer successful!');
        console.log('  TX hash :', result.hash);
        console.log('  From    :', result.from);
        console.log('  To      :', result.to);
        console.log('  Amount  :', result.amount, result.token);
      } else {
        console.log(`\nTransferring ${amount} native token to ${to}…`);
        const result = await transferNative(to, amount, chain);
        console.log('\nTransfer successful!');
        console.log('  TX hash :', result.hash);
        console.log('  From    :', result.from);
        console.log('  To      :', result.to);
        console.log('  Amount  :', result.amount);
      }
      break;
    }

    default:
      console.log(USAGE);
  }
}

run().catch((err) => {
  console.error('Error:', err.message);
  process.exit(1);
});
