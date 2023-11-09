<script setup lang="ts">
import { getAddresses, walletStrategy, getPubKey } from '@/app/services/wallet';
import {
  MsgSend,
  ChainRestAuthApi,
  ChainRestTendermintApi,
  BaseAccount,
  createTransaction,
  getTxRawFromTxRawOrDirectSignResponse,
  CosmosTxV1Beta1Tx,
  TxRestClient,
  BroadcastMode,
} from '@injectivelabs/sdk-ts';
import {
  DEFAULT_STD_FEE,
  DEFAULT_BLOCK_TIMEOUT_HEIGHT,
  BigNumberInBase,
} from '@injectivelabs/utils';
import { ChainId } from '@injectivelabs/ts-types';
import { Network, getNetworkEndpoints } from '@injectivelabs/networks';
import { onMounted } from 'vue';
const address = ref('');
onMounted(async () => {
  await handleConnectWallet();
});
const getKeplr = async (chainId: ChainId) => {
  await window.keplr.enable(chainId);
  const offlineSigner = window.keplr.getOfflineSigner(chainId);
  const accounts = await offlineSigner.getAccounts();
  const key = await window.keplr.getKey(chainId);
  return { offlineSigner, accounts, key, keplr: window.keplr };
};
const broadcastTx = async (chainId: ChainId, txRaw: any) => {
  const { keplr } = await getKeplr(ChainId.Testnet);
  console.log('1');
  let result;
  result = await keplr.sendTx(
    chainId,
    CosmosTxV1Beta1Tx.TxRaw.encode(txRaw).finish(),
    BroadcastMode.Sync
  );

  console.log('2', result);
  if (!result || result.length === 0) {
    throw new Error('Transaction failed to be broadcasted');
  }

  return Buffer.from(result).toString('hex');
};
async function handleConnectWallet() {
  if (!address.value) {
    let _address = await getAddresses();
    address.value = _address[0];
  }
}
async function prepare() {
  try {
    const injectiveAddress = address.value;
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
    console.log('signDoc', signDoc);
    const { directSignResponse } = await signTransaction(signDoc);
    console.log('directSignResponse', directSignResponse);
    await broadcast(directSignResponse);
  } catch (err) {
    console.log(err);
  }
}
const broadcast = async (directSignResponse: any) => {
  const txRaw = getTxRawFromTxRawOrDirectSignResponse(directSignResponse);

  const txHash = await broadcastTx(ChainId.Testnet, txRaw);
  const restEndpoint = getNetworkEndpoints(Network.Testnet).rest;
  const txRestClient = new TxRestClient(restEndpoint);

  /** This will poll querying the transaction and await for it's inclusion in the block */
  const response = await txRestClient.fetchTxPoll(txHash);
  console.log('response', response);
};

const signTransaction = async (signDoc: any) => {
  const { offlineSigner } = await getKeplr(ChainId.Testnet);
  const directSignResponse = await offlineSigner.signDirect(
    address.value,
    signDoc
  );
  return { directSignResponse };
};

const disconnect = async () => {
  await walletStrategy.disconnectWallet();
  address.value = '';
};
</script>

<template>
  <div class="flex">
    <AppButton @click="handleConnectWallet">{{
      address
        ? `${address.slice(0, 4)}...${address.slice(-5)}`
        : 'Connect Wallet'
    }}</AppButton>
    <br />
    <br />
    <button v-if="address" @click="prepare">Prepare</button>
    <br />
    <br />
    <button v-if="address" @click="disconnect">Disconnect</button>
  </div>
</template>
