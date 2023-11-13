import {
  CHAIN_ID,
  ETHEREUM_CHAIN_ID,
  alchemyRpcEndpoint,
} from '@/app/utils/constants';
import { Wallet, WalletStrategy } from '@injectivelabs/wallet-ts';

import { Web3Exception } from '@injectivelabs/exceptions';

export const walletStrategy = new WalletStrategy({
  chainId: CHAIN_ID,
  ethereumOptions: {
    ethereumChainId: ETHEREUM_CHAIN_ID,
    rpcUrl: alchemyRpcEndpoint,
  },
});

export const getAddresses = async (): Promise<string[]> => {
  const addresses = await walletStrategy.getAddresses();

  if (addresses.length === 0) {
    throw new Web3Exception(
      new Error('There are no addresses linked in this wallet.')
    );
  }
  return addresses;
};
export const getPubKey = async (): Promise<string> => {
  const pubKey = await walletStrategy.getPubKey();

  if (!pubKey) {
    throw new Web3Exception(
      new Error('There is no public key in this wallet.')
    );
  }
  return pubKey;
};
