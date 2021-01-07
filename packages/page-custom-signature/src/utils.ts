// Copyright 2017-2020 @polkadot/app-custom-signature authors & contributors
// SPDX-License-Identifier: Apache-2.0

import * as ethUtils from 'ethereumjs-util';

import { hexToU8a, isHex } from '@polkadot/util';
import { blake2AsU8a, encodeAddress, isEthereumAddress } from '@polkadot/util-crypto';

/**
 * Converts ECDSA public key into a valid ss58 address for Substrate.
 * Note that this is different from the EVM-mapped Ethereum addresses.
 * @param publicKey a 33-byte compressed ECDSA public key in hex string
 * @param networkPrefix the ss58 format used to encode the resulting address
 */
export const ecdsaToSs58 = (publicKey: string, networkPrefix: number): string => {
  if (!isHex(publicKey)) {
    throw new Error('Public key is not 0x-prefixed');
  }

  const ss58PubKey = blake2AsU8a(hexToU8a(publicKey), 256);
  const ss58Address = encodeAddress(ss58PubKey, networkPrefix);

  return ss58Address;
};

export const recoverPublicKeyFromSig = (address: string, msgString: string, rpcSig: string): string => {
  // todo: There is an error with ethereumjs-util package for webpack. Either configure a polyfill or implement everything from scratch

  // check if the message is hex encoded or not
  const encodingType = isHex(msgString) ? 'hex' : 'utf8';
  // message hashing is done here, which includes the message prefix
  const msgHash = ethUtils.hashPersonalMessage(Buffer.from(msgString, encodingType));

  const signature = ethUtils.fromRpcSig(rpcSig);

  if (!ethUtils.isValidSignature(signature.v, signature.r, signature.s)) {
    throw new Error('Invalid signature provided');
  }

  if (!isEthereumAddress(address)) {
    throw new Error('Invalid address provided');
  }

  const publicKey = ethUtils.ecrecover(msgHash, signature.v, signature.r, signature.s);
  // const recoveredAddress = ethUtils.addHexPrefix(ethUtils.bufferToHex(ethUtils.pubToAddress(publicKey)));

  return ethUtils.bufferToHex(publicKey);
};
