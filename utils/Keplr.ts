import {
  BaseAccount,
  ChainRestAuthApi,
  ChainRestTendermintApi,
  CosmosTxV1Beta1Tx,
  MsgSend,
  TxRestClient,
  createTransaction,
  getTxRawFromTxRawOrDirectSignResponse,
} from '@injectivelabs/sdk-ts';
import {
  BigNumberInBase,
  DEFAULT_BLOCK_TIMEOUT_HEIGHT,
  DEFAULT_STD_FEE,
} from '@injectivelabs/utils';
import { Network, getNetworkEndpoints } from '@injectivelabs/networks';

import { ChainId } from '@injectivelabs/ts-types';
import { getPubKey } from '@/app/services/wallet';

export const getKeplr = async (chainId: ChainId) => {
  await window.keplr.enable(chainId);
  const offlineSigner = window.keplr.getOfflineSigner(chainId);
  const accounts = await offlineSigner.getAccounts();
  const key = await window.keplr.getKey(chainId);
  return { offlineSigner, accounts, key, keplr: window.keplr };
};

export const broadcastTx = async (chainId: ChainId, txRaw: any) => {
  const { keplr } = await getKeplr(ChainId.Testnet);
  let result;
  result = await keplr.sendTx(
    chainId,
    CosmosTxV1Beta1Tx.TxRaw.encode(txRaw).finish(),
    'sync'
  );
  if (!result || result.length === 0) {
    throw new Error('Transaction failed to be broadcasted');
  }

  return Buffer.from(result).toString('hex');
};

export async function prepareSignAndBroadcastKeplr(address: any) {
  try {
    const injectiveAddress = address;
    const chainId = ChainId.Testnet;
    const restEndpoint = getNetworkEndpoints(Network.Testnet).rest;
    const amount = {
      amount: new BigNumberInBase(0.01).toWei().toFixed(),
      denom: 'inj',
    };

    /** Account Details **/
    const chainRestAuthApi = new ChainRestAuthApi(restEndpoint);
    const accountDetailsResponse = await chainRestAuthApi.fetchAccount(
      injectiveAddress
    );
    const baseAccount = BaseAccount.fromRestApi(accountDetailsResponse);
    // const accountDetails = baseAccount.toAccountDetails();

    /** Block Details */
    const chainRestTendermintApi = new ChainRestTendermintApi(restEndpoint);
    const latestBlock = await chainRestTendermintApi.fetchLatestBlock();
    const latestHeight = latestBlock.header.height;
    const timeoutHeight = new BigNumberInBase(latestHeight).plus(
      DEFAULT_BLOCK_TIMEOUT_HEIGHT
    );
    const pubKey = await getPubKey();
    /** Preparing the transaction */
    const msg = MsgSend.fromJSON({
      amount,
      srcInjectiveAddress: injectiveAddress,
      dstInjectiveAddress: injectiveAddress,
    });

    /** Prepare the Transaction **/
    const { signDoc } = createTransaction({
      pubKey,
      chainId,
      fee: DEFAULT_STD_FEE,
      message: msg,
      sequence: baseAccount.sequence,
      timeoutHeight: timeoutHeight.toNumber(),
      accountNumber: baseAccount.accountNumber,
    });

    /* Sign the Transaction */
    const { directSignResponse } = await signTransaction(
      signDoc,
      injectiveAddress
    );
    return broadcast(directSignResponse);
  } catch (err) {
    console.log(err);
    throw err;
  }
}
export const broadcast = async (directSignResponse: any) => {
  const txRaw = getTxRawFromTxRawOrDirectSignResponse(directSignResponse);

  const txHash = await broadcastTx(ChainId.Testnet, txRaw);
  const restEndpoint = getNetworkEndpoints(Network.Testnet).rest;
  const txRestClient = new TxRestClient(restEndpoint);

  /** This will poll querying the transaction and await for it's inclusion in the block */
  const response = await txRestClient.fetchTxPoll(txHash);
  return response;
};

const signTransaction = async (signDoc: any, address: string) => {
  const { offlineSigner } = await getKeplr(ChainId.Testnet);
  const directSignResponse = await offlineSigner.signDirect(address, signDoc);
  return { directSignResponse };
};
