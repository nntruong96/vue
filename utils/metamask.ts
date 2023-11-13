import {
  BaseAccount,
  ChainRestAuthApi,
  ChainRestTendermintApi,
  MsgSend,
  SIGN_AMINO,
  TxRestClient,
  createTransaction,
  createTxRawEIP712,
  createWeb3Extension,
  getEip712TypedData,
  getEthereumAddress,
  hexToBase64,
  hexToBuff,
  recoverTypedSignaturePubKey,
} from '@injectivelabs/sdk-ts';
import {
  BigNumberInBase,
  DEFAULT_BLOCK_TIMEOUT_HEIGHT,
  DEFAULT_STD_FEE,
} from '@injectivelabs/utils';
import { Network, getNetworkEndpoints } from '@injectivelabs/networks';

import { ChainId } from '@injectivelabs/ts-types';
import { ETHEREUM_CHAIN_ID } from '@/app/utils/constants';

const chainId = ChainId.Testnet;
const restEndpoint = getNetworkEndpoints(Network.Testnet).rest;
const amount = {
  amount: new BigNumberInBase(0.01).toWei().toFixed(),
  denom: 'inj',
};
const ethereumChainId = ETHEREUM_CHAIN_ID;
export async function prepareSignAndBroadcastMetaMask(injectiveAddress: any) {
  /** Account Details **/
  const chainRestAuthApi = new ChainRestAuthApi(restEndpoint);
  const accountDetailsResponse = await chainRestAuthApi.fetchAccount(
    injectiveAddress
  );
  const baseAccount = BaseAccount.fromRestApi(accountDetailsResponse);
  const accountDetails = baseAccount.toAccountDetails();
  const ethereumAddress = await getEthereumAddress(injectiveAddress);
  /** Block Details */
  const chainRestTendermintApi = new ChainRestTendermintApi(restEndpoint);
  const latestBlock = await chainRestTendermintApi.fetchLatestBlock();
  const latestHeight = latestBlock.header.height;
  const timeoutHeight = new BigNumberInBase(latestHeight).plus(
    DEFAULT_BLOCK_TIMEOUT_HEIGHT
  );

  /** Preparing the transaction */
  const msg = MsgSend.fromJSON({
    amount,
    srcInjectiveAddress: injectiveAddress,
    dstInjectiveAddress: injectiveAddress,
  });

  /** EIP712 for signing on Ethereum wallets */
  const eip712TypedData = getEip712TypedData({
    msgs: [msg],
    tx: {
      accountNumber: accountDetails.accountNumber.toString(),
      sequence: accountDetails.sequence.toString(),
      timeoutHeight: timeoutHeight.toFixed(),
      chainId: chainId,
    },
    ethereumChainId: ethereumChainId,
  });

  /** Use your preferred approach to sign EIP712 TypedData, example with Metamask */
  const signature = await window.ethereum.request({
    method: 'eth_signTypedData_v4',
    params: [ethereumAddress, JSON.stringify(eip712TypedData)],
  });
  console.log('signature', signature);
  /** Get Public Key of the signer */
  const publicKeyHex = recoverTypedSignaturePubKey(eip712TypedData, signature);
  const publicKeyBase64 = hexToBase64(publicKeyHex);

  const { txRaw } = createTransaction({
    message: msg,
    memo: '',
    signMode: SIGN_AMINO,
    fee: DEFAULT_STD_FEE,
    pubKey: publicKeyBase64,
    sequence: baseAccount.sequence,
    timeoutHeight: timeoutHeight.toNumber(),
    accountNumber: baseAccount.accountNumber,
    chainId: chainId,
  });
  const web3Extension = createWeb3Extension({
    ethereumChainId,
  });
  const txRawEip712 = createTxRawEIP712(txRaw, web3Extension);

  /** Append Signatures */
  const signatureBuff = hexToBuff(signature);
  txRawEip712.signatures = [signatureBuff];

  /** Broadcast the Transaction */
  const txRestClient = new TxRestClient(restEndpoint);

  const txHash: any = await txRestClient.broadcast(txRawEip712);
  //   const response = await txRestClient.fetchTxPoll(txHash);
  return { txHash };
}
