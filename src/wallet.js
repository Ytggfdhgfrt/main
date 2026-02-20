'use strict';

const { ethers } = require('ethers');

/**
 * Creates an ethers Wallet from the PRIVATE_KEY env variable.
 * If a provider is supplied the wallet is connected to it so it can
 * sign and broadcast transactions on-chain.
 *
 * @param {ethers.JsonRpcProvider|null} provider
 * @returns {ethers.Wallet}
 */
function createWallet(provider = null) {
  const privateKey = process.env.PRIVATE_KEY;
  if (!privateKey) {
    throw new Error('PRIVATE_KEY environment variable is not set.');
  }
  const wallet = new ethers.Wallet(privateKey);
  return provider ? wallet.connect(provider) : wallet;
}

/**
 * Returns the public address derived from the configured private key,
 * without ever exposing the key itself.
 *
 * @returns {string}
 */
function getAddress() {
  return createWallet().address;
}

module.exports = { createWallet, getAddress };
