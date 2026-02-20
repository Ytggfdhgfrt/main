'use strict';

const Moralis = require('moralis').default;

let _started = false;

/**
 * Initialises Moralis once per process.
 */
async function startMoralis() {
  if (_started) return;
  const apiKey = process.env.MORALIS_API_KEY;
  if (!apiKey) {
    throw new Error('MORALIS_API_KEY environment variable is not set.');
  }
  await Moralis.start({ apiKey });
  _started = true;
}

/**
 * Returns the native-token (e.g. ETH) balance of an address.
 *
 * @param {string} address  EVM address to query
 * @param {string} chain    Moralis chain identifier (default from CHAIN env or "eth")
 * @returns {Promise<{balance: string, balanceFormatted: string}>}
 */
async function getNativeBalance(address, chain) {
  await startMoralis();
  const targetChain = chain || process.env.CHAIN || 'eth';
  const response = await Moralis.EvmApi.balance.getNativeBalance({
    address,
    chain: targetChain,
  });
  const wei = response.raw.balance;
  const { ethers } = require('ethers');
  const formatted = ethers.formatEther(wei);
  return { balance: wei, balanceFormatted: formatted };
}

/**
 * Returns ERC-20 token balances held by an address.
 *
 * @param {string} address
 * @param {string} chain
 * @returns {Promise<Array<{token: string, symbol: string, decimals: number, balance: string, balanceFormatted: string}>>}
 */
async function getTokenBalances(address, chain) {
  await startMoralis();
  const targetChain = chain || process.env.CHAIN || 'eth';
  const response = await Moralis.EvmApi.token.getWalletTokenBalances({
    address,
    chain: targetChain,
  });
  const { ethers } = require('ethers');
  return response.raw.map((t) => ({
    token: t.token_address,
    symbol: t.symbol,
    decimals: t.decimals,
    balance: t.balance,
    balanceFormatted: ethers.formatUnits(t.balance, t.decimals),
  }));
}

/**
 * Returns the native-currency transaction history for an address.
 *
 * @param {string} address
 * @param {string} chain
 * @param {number} limit    Maximum number of transactions to return (default 20)
 * @returns {Promise<Array<object>>}
 */
async function getTransactionHistory(address, chain, limit = 20) {
  await startMoralis();
  const targetChain = chain || process.env.CHAIN || 'eth';
  const response = await Moralis.EvmApi.transaction.getWalletTransactions({
    address,
    chain: targetChain,
    limit,
  });
  return response.raw.result.map((tx) => ({
    hash: tx.hash,
    from: tx.from_address,
    to: tx.to_address,
    value: tx.value,
    blockNumber: tx.block_number,
    timestamp: tx.block_timestamp,
    status: tx.receipt_status === '1' ? 'success' : 'failed',
  }));
}

module.exports = { getNativeBalance, getTokenBalances, getTransactionHistory };
