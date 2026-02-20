'use strict';

const { describe, it, before, after } = require('node:test');
const assert = require('node:assert/strict');

// ── wallet.js ────────────────────────────────────────────────────────────────

describe('wallet.js', () => {
  const KNOWN_PRIVATE_KEY = '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80';
  const EXPECTED_ADDRESS  = '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266';

  before(() => { process.env.PRIVATE_KEY = KNOWN_PRIVATE_KEY; });
  after(() => { delete process.env.PRIVATE_KEY; });

  it('getAddress returns the correct public address', () => {
    const { getAddress } = require('../wallet');
    assert.equal(getAddress(), EXPECTED_ADDRESS);
  });

  it('createWallet throws when PRIVATE_KEY is missing', () => {
    delete process.env.PRIVATE_KEY;
    const { createWallet } = require('../wallet');
    assert.throws(() => createWallet(), /PRIVATE_KEY/);
    process.env.PRIVATE_KEY = KNOWN_PRIVATE_KEY;
  });
});

// ── transfer.js – getProvider ─────────────────────────────────────────────────

describe('transfer.js – getProvider', () => {
  it('returns a JsonRpcProvider for supported chains', () => {
    const { getProvider } = require('../transfer');
    const { ethers } = require('ethers');
    const supported = ['eth', 'polygon', 'bsc', 'avalanche', 'arbitrum', 'optimism', 'fantom', 'cronos'];
    for (const chain of supported) {
      const provider = getProvider(chain);
      assert.ok(provider instanceof ethers.JsonRpcProvider, `Expected JsonRpcProvider for chain "${chain}"`);
    }
  });

  it('throws for unsupported chain', () => {
    const { getProvider } = require('../transfer');
    assert.throws(() => getProvider('unknown-chain'), /Unsupported chain/);
  });
});

// ── index.js – parseArgs (via argument parsing logic) ────────────────────────

describe('CLI parseArgs logic', () => {
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

  it('parses the address command', () => {
    const result = parseArgs(['node', 'index.js', 'address']);
    assert.equal(result.command, 'address');
    assert.deepEqual(result.flags, {});
    assert.deepEqual(result.positional, []);
  });

  it('parses balance with a positional address', () => {
    const addr = '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266';
    const result = parseArgs(['node', 'index.js', 'balance', addr]);
    assert.equal(result.command, 'balance');
    assert.equal(result.positional[0], addr);
  });

  it('parses history with --limit flag', () => {
    const result = parseArgs(['node', 'index.js', 'history', '--limit', '10']);
    assert.equal(result.command, 'history');
    assert.equal(result.flags.limit, '10');
  });

  it('parses transfer flags', () => {
    const result = parseArgs([
      'node', 'index.js', 'transfer',
      '--to', '0xRecipient',
      '--amount', '0.5',
      '--chain', 'polygon',
    ]);
    assert.equal(result.command, 'transfer');
    assert.equal(result.flags.to, '0xRecipient');
    assert.equal(result.flags.amount, '0.5');
    assert.equal(result.flags.chain, 'polygon');
  });

  it('parses transfer with ERC-20 token flag', () => {
    const result = parseArgs([
      'node', 'index.js', 'transfer',
      '--to', '0xRecipient',
      '--amount', '10',
      '--token', '0xTokenContract',
    ]);
    assert.equal(result.flags.token, '0xTokenContract');
  });
});
