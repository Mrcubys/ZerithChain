import { getPublicKey, etc as secpEtc } from "@noble/secp256k1";
import { hmac } from "@noble/hashes/hmac.js";
import { sha256, sha512 } from "@noble/hashes/sha2.js";
import { keccak_256 } from "@noble/hashes/sha3.js";
import { pbkdf2 } from "@noble/hashes/pbkdf2.js";
import nacl from "tweetnacl";

secpEtc.hmacSha256Sync = (k: Uint8Array, ...msgs: Uint8Array[]) => {
  const data = new Uint8Array(msgs.reduce((a, m) => a + m.length, 0));
  let offset = 0;
  for (const m of msgs) { data.set(m, offset); offset += m.length; }
  return hmac(sha256, k, data);
};

const enc = new TextEncoder();

function pbkdf2Bip39(mnemonic: string): Uint8Array {
  return pbkdf2(sha512, enc.encode(mnemonic), enc.encode("mnemonic"), { c: 2048, dkLen: 64 });
}

interface HDKey {
  privateKey: Uint8Array;
  chainCode: Uint8Array;
}

function masterKeyBip32(seed: Uint8Array): HDKey {
  const I = hmac(sha512, enc.encode("Bitcoin seed"), seed);
  return { privateKey: I.slice(0, 32), chainCode: I.slice(32) };
}

function masterKeySlip10(seed: Uint8Array): HDKey {
  const I = hmac(sha512, enc.encode("ed25519 seed"), seed);
  return { privateKey: I.slice(0, 32), chainCode: I.slice(32) };
}

function uint32BE(index: number): Uint8Array {
  const b = new Uint8Array(4);
  b[0] = (index >>> 24) & 0xff;
  b[1] = (index >>> 16) & 0xff;
  b[2] = (index >>> 8) & 0xff;
  b[3] = index & 0xff;
  return b;
}

const SECP256K1_N = BigInt("0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEBAAEDCE6AF48A03BBFD25E8CD0364141");

function deriveChildBip32(parent: HDKey, index: number, hardened: boolean): HDKey {
  const idx = hardened ? (index | 0x80000000) >>> 0 : index;
  let data: Uint8Array;
  if (hardened) {
    data = new Uint8Array(37);
    data[0] = 0x00;
    data.set(parent.privateKey, 1);
    data.set(uint32BE(idx), 33);
  } else {
    const compPub = getPublicKey(parent.privateKey, true);
    data = new Uint8Array(37);
    data.set(compPub, 0);
    data.set(uint32BE(idx), 33);
  }
  const I = hmac(sha512, parent.chainCode, data);
  const IL = I.slice(0, 32);
  const IR = I.slice(32);

  const tweak = BigInt("0x" + Array.from(IL).map(b => b.toString(16).padStart(2, "0")).join(""));
  const parentK = BigInt("0x" + Array.from(parent.privateKey).map(b => b.toString(16).padStart(2, "0")).join(""));
  const childK = (tweak + parentK) % SECP256K1_N;
  const hex = childK.toString(16).padStart(64, "0");
  const childKey = new Uint8Array(32);
  for (let i = 0; i < 32; i++) childKey[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);

  return { privateKey: childKey, chainCode: IR };
}

function deriveChildSlip10(parent: HDKey, index: number): HDKey {
  const idx = (index | 0x80000000) >>> 0;
  const data = new Uint8Array(37);
  data[0] = 0x00;
  data.set(parent.privateKey, 1);
  data.set(uint32BE(idx), 33);
  const I = hmac(sha512, parent.chainCode, data);
  return { privateKey: I.slice(0, 32), chainCode: I.slice(32) };
}

function parseSegment(seg: string): [number, boolean] {
  const hardened = seg.endsWith("'");
  return [parseInt(hardened ? seg.slice(0, -1) : seg), hardened];
}

function deriveEthPrivKey(seed: Uint8Array): Uint8Array {
  let key = masterKeyBip32(seed);
  for (const seg of ["44'", "60'", "0'", "0", "0"]) {
    const [index, hardened] = parseSegment(seg);
    key = deriveChildBip32(key, index, hardened);
  }
  return key.privateKey;
}

function deriveSolPrivKey(seed: Uint8Array): Uint8Array {
  let key = masterKeySlip10(seed);
  for (const seg of ["44'", "501'", "0'", "0'"]) {
    const [index] = parseSegment(seg);
    key = deriveChildSlip10(key, index);
  }
  return key.privateKey;
}

function toChecksumAddress(address: string): string {
  const lower = address.slice(2).toLowerCase();
  const hash = keccak_256(enc.encode(lower));
  let result = "0x";
  for (let i = 0; i < 40; i++) {
    const nibble = (hash[Math.floor(i / 2)] >> (i % 2 === 0 ? 4 : 0)) & 0xf;
    result += nibble >= 8 ? lower[i].toUpperCase() : lower[i];
  }
  return result;
}

const B58 = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
function base58(bytes: Uint8Array): string {
  let leading = 0;
  for (const b of bytes) { if (b !== 0) break; leading++; }
  const digits: number[] = [0];
  for (const byte of bytes) {
    let carry = byte;
    for (let j = 0; j < digits.length; j++) {
      carry += digits[j] << 8;
      digits[j] = carry % 58;
      carry = Math.floor(carry / 58);
    }
    while (carry > 0) { digits.push(carry % 58); carry = Math.floor(carry / 58); }
  }
  return "1".repeat(leading) + digits.reverse().map(d => B58[d]).join("");
}

export function deriveEvmFromSeed(mnemonic: string): string {
  try {
    const seed = pbkdf2Bip39(mnemonic.trim().normalize("NFKD"));
    const privKey = deriveEthPrivKey(seed);
    const uncompressedPub = getPublicKey(privKey, false);
    const pubKeyBytes = uncompressedPub.slice(1);
    const hash = keccak_256(pubKeyBytes);
    const addr = "0x" + Array.from(hash.slice(12)).map(b => b.toString(16).padStart(2, "0")).join("");
    return toChecksumAddress(addr);
  } catch {
    return "";
  }
}

export function deriveSolanaFromSeed(mnemonic: string): string {
  try {
    const seed = pbkdf2Bip39(mnemonic.trim().normalize("NFKD"));
    const privKey = deriveSolPrivKey(seed);
    const keyPair = nacl.sign.keyPair.fromSeed(privKey);
    return base58(keyPair.publicKey);
  } catch {
    return "";
  }
}
