'use strict';

const { ethers } = require('ethers');
const { createWallet } = require('./wallet');

// Minimal ERC-20 ABI — only transfer and decimals are needed.
const ERC20_ABI = [
  'function transfer(address to, uint256 amount) returns (bool)',
  'function decimals() view returns (uint8)',
];

/**
 * Builds an ethers JsonRpcProvider for the requested chain using the
 * public Moralis RPC endpoints (no additional credentials required).
 *
 * @param {string} chain  "eth" | "polygon" | "bsc" | "avalanche" | "arbitrum" | "optimism" | "fantom" | "cronos"
 * @returns {ethers.JsonRpcProvider}
 */
function getProvider(chain) {
  const rpcUrls = {
    eth: 'https://site1.moralis-nodes.com/eth',
    polygon: 'https://site1.moralis-nodes.com/polygon',
    bsc: 'https://site1.moralis-nodes.com/bsc',
    avalanche: 'https://site1.moralis-nodes.com/avalanche',
    arbitrum: 'https://site1.moralis-nodes.com/arbitrum',
    optimism: 'https://site1.moralis-nodes.com/optimism',
    fantom: 'https://site1.moralis-nodes.com/fantom',
    cronos: 'https://site1.moralis-nodes.com/cronos',
  };
  const url = rpcUrls[chain];
  if (!url) {
    throw new Error(`Unsupported chain "${chain}". Choose from: ${Object.keys(rpcUrls).join(', ')}`);
  }
  return new ethers.JsonRpcProvider(url);
}

/**
 * Transfers the native token (e.g. ETH) to a recipient.
 *
 * @param {string} to       Recipient address
 * @param {string} amount   Amount in ether (e.g. "0.01")
 * @param {string} chain    Chain identifier (default: CHAIN env or "eth")
 * @returns {Promise<{hash: string, from: string, to: string, amount: string}>}
 */
async function transferNative(to, amount, chain) {
  if (!ethers.isAddress(to)) {
    throw new Error(`Invalid recipient address: ${to}`);
  }
  const targetChain = chain || process.env.CHAIN || 'eth';
  const provider = getProvider(targetChain);
  const wallet = createWallet(provider);

  const value = ethers.parseEther(amount);
  const tx = await wallet.sendTransaction({ to, value });
  await tx.wait();

  return {
    hash: tx.hash,
    from: wallet.address,
    to,
    amount: `${amount} (native)`,
  };
}

/**
 * Transfers an ERC-20 token to a recipient.
 *
 * @param {string} to             Recipient address
 * @param {string} amount         Human-readable amount (e.g. "10.5")
 * @param {string} tokenAddress   ERC-20 contract address
 * @param {string} chain          Chain identifier (default: CHAIN env or "eth")
 * @returns {Promise<{hash: string, from: string, to: string, amount: string, token: string}>}
 */
async function transferToken(to, amount, tokenAddress, chain) {
  if (!ethers.isAddress(to)) {
    throw new Error(`Invalid recipient address: ${to}`);
  }
  if (!ethers.isAddress(tokenAddress)) {
    throw new Error(`Invalid token contract address: ${tokenAddress}`);
  }
  const targetChain = chain || process.env.CHAIN || 'eth';
  const provider = getProvider(targetChain);
  const wallet = createWallet(provider);

  const contract = new ethers.Contract(tokenAddress, ERC20_ABI, wallet);
  const decimals = await contract.decimals();
  const parsedAmount = ethers.parseUnits(amount, decimals);

  const tx = await contract.transfer(to, parsedAmount);
  await tx.wait();

  return {
    hash: tx.hash,
    from: wallet.address,
    to,
    amount,
    token: tokenAddress,
  };
}

module.exports = { transferNative, transferToken, getProvider };
